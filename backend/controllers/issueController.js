import Issue from '../models/Issue.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { findSimilarImage, generatePerceptualHash, getHashFromUrl, calculateSimilarity } from '../utils/imageSimilarity.js';
import axios from 'axios';

/**
 * Call ML API for comprehensive prediction
 * Returns category, duplicate detection, priority, and authenticity
 */
const callMLService = async (imageUrl, description, latitude, longitude) => {
  try {
    const response = await axios.post(process.env.ML_API_URL, {
      imageURL: imageUrl,
      description: description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    return {
      category: response.data.category || 'other',
      confidence: response.data.confidence || 0,
      isDuplicate: response.data.isDuplicate || false,
      duplicateIssueId: response.data.duplicateIssueId || null,
      priority: response.data.priority || 'Medium',
      authentic: response.data.authentic !== false
    };
  } catch (error) {
    console.error('ML API error:', error.message);
    // Return defaults if ML API fails
    return {
      category: 'other',
      confidence: 0,
      isDuplicate: false,
      duplicateIssueId: null,
      priority: 'Medium',
      authentic: true
    };
  }
};

/**
 * @route   POST /api/issues/create
 * @desc    Create new issue with duplicate detection
 * @access  Private
 */
export const createIssue = async (req, res) => {
  try {
    const { description, category, latitude, longitude, address } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!description || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Description, latitude, and longitude are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Step 1: Upload image to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer);

    // Step 2: Call ML API for comprehensive analysis
    let mlResult = {
      category: category || 'other',
      confidence: 0,
      isDuplicate: false,
      duplicateIssueId: null,
      priority: 'Medium',
      authentic: true
    };

    // Call ML service if available
    if (process.env.ML_API_URL) {
      mlResult = await callMLService(
        uploadResult.url,
        description,
        latitude,
        longitude
      );
    }

    // Use provided category or ML predicted category
    const finalCategory = category || mlResult.category;

    // Step 3: Handle duplicate detection from ML
    if (mlResult.isDuplicate && mlResult.duplicateIssueId) {
      // Try to find the duplicate issue in database
      const existingIssue = await Issue.findById(mlResult.duplicateIssueId);
      
      if (existingIssue) {
        // Check if user already supported
        const alreadySupported = existingIssue.supporters.some(
          s => s.userId.toString() === userId.toString()
        );

        if (!alreadySupported) {
          existingIssue.supporters.push({ userId });
          existingIssue.supportCount = existingIssue.supporters.length;
          await existingIssue.save();
        }

        return res.status(200).json({
          success: true,
          duplicate: true,
          message: 'Similar issue found by ML. Your support has been added.',
          data: {
            existingIssueId: existingIssue._id,
            mlConfidence: mlResult.confidence,
            supportCount: existingIssue.supportCount
          }
        });
      }
    }

    // Step 4: Enhanced duplicate detection logic
    const radius = parseInt(process.env.DUPLICATE_RADIUS_METERS) || 80;
    const threshold = parseFloat(process.env.IMAGE_SIMILARITY_THRESHOLD) || 0.85;
    
    // Find nearby issues at same location
    let nearbyIssues = [];
    try {
      nearbyIssues = await Issue.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: radius
          }
        },
        status: { $in: ['pending', 'processing'] }
      }).limit(20); // Increased limit to check more issues
    } catch (geoError) {
      console.warn('Geospatial query failed, skipping duplicate detection:', geoError.message);
      // Continue without duplicate detection if geo query fails
    }

    if (nearbyIssues.length > 0) {
      const newImageHash = await generatePerceptualHash(req.file.buffer);
      
      // Separate issues by same user vs different user
      const sameUserIssues = nearbyIssues.filter(
        issue => issue.reporterId.toString() === userId.toString()
      );
      const differentUserIssues = nearbyIssues.filter(
        issue => issue.reporterId.toString() !== userId.toString()
      );

      // Check same user issues first
      for (const issue of sameUserIssues) {
        try {
          const existingHash = await getHashFromUrl(issue.imageUrl);
          const similarity = calculateSimilarity(newImageHash, existingHash);
          
          // RULE 1 & 3: Same user + same location + photo same → Duplicate (any category)
          if (similarity >= threshold) {
            return res.status(200).json({
              success: false,
              duplicate: true,
              action: 'duplicate',
              message: 'You have already reported this issue with the same image.',
              data: {
                existingIssueId: issue._id,
                similarity,
                reason: 'Same user, same location, same photo'
              }
            });
          }
          
          // RULE 2 & 4: Same user + same location + photo different → Check category
          // If different photo, allow new issue (it may be a new case at same location)
        } catch (error) {
          console.error(`Error comparing with issue ${issue._id}:`, error);
        }
      }

      // Check different user issues - RULE 5: Add as supporter
      const sameCategoryIssues = differentUserIssues.filter(
        issue => issue.category === finalCategory
      );

      if (sameCategoryIssues.length > 0) {
        // Find if there's a similar issue (regardless of photo similarity)
        // Different user reporting same location + same category = Support
        const mostRecentIssue = sameCategoryIssues[0]; // Get closest/most recent
        
        // Check if user already supported
        const alreadySupported = mostRecentIssue.supporters.some(
          s => s.userId.toString() === userId.toString()
        );

        if (alreadySupported) {
          return res.status(200).json({
            success: false,
            duplicate: true,
            action: 'already_supported',
            message: 'You have already supported this issue.',
            data: {
              existingIssueId: mostRecentIssue._id,
              supportCount: mostRecentIssue.supportCount
            }
          });
        }

        // Add user as supporter
        mostRecentIssue.supporters.push({ userId });
        mostRecentIssue.supportCount = mostRecentIssue.supporters.length;
        await mostRecentIssue.save();

        return res.status(200).json({
          success: true,
          duplicate: true,
          action: 'support_added',
          message: 'You supported an existing issue at this location.',
          data: {
            existingIssueId: mostRecentIssue._id,
            supportCount: mostRecentIssue.supportCount,
            reason: 'Different user, same location, same category'
          }
        });
      }
    }

    // Step 5: No duplicate - create new issue with ML insights
    const newIssue = await Issue.create({
      title: description.substring(0, 100),
      category: finalCategory,
      description,
      imageUrl: uploadResult.url,
      imagePublicId: uploadResult.publicId,
      reporterId: userId,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      address,
      supportCount: 1,
      supporters: [{ userId }],
      mlConfidence: mlResult.confidence,
      mlPredictions: {
        priority: mlResult.priority,
        authentic: mlResult.authentic
      }
    });

    await newIssue.populate('reporterId', 'name email');

    res.status(201).json({
      success: true,
      duplicate: false,
      message: 'Issue reported successfully',
      data: {
        issue: newIssue,
        predictedCategory: finalCategory,
        confidence: mlResult.confidence,
        priority: mlResult.priority,
        authentic: mlResult.authentic
      }
    });
  } catch (error) {
    console.error('Create issue error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while creating issue',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/issues/user/:userId
 * @desc    Get all issues by specific user (reported OR supported)
 * @access  Private
 */
export const getUserIssues = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Ensure user can only access their own issues (unless admin)
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these issues'
      });
    }

    // Find issues where user is either reporter OR supporter
    const issues = await Issue.find({
      $or: [
        { reporterId: userId },
        { 'supporters.userId': userId }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('reporterId', 'name email');

    res.status(200).json({
      success: true,
      count: issues.length,
      data: { issues }
    });
  } catch (error) {
    console.error('Get user issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @route   GET /api/issues/nearby
 * @desc    Get nearby issues
 * @access  Public
 */
export const getNearbyIssues = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    })
      .limit(50)
      .populate('reporterId', 'name');

    res.status(200).json({
      success: true,
      count: issues.length,
      data: { issues }
    });
  } catch (error) {
    console.error('Get nearby issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @route   POST /api/issues/support/:id
 * @desc    Support an issue
 * @access  Private
 */
export const supportIssue = async (req, res) => {
  try {
    const issueId = req.params.id;
    const userId = req.user._id;

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user already supported
    const alreadySupported = issue.supporters.some(
      s => s.userId.toString() === userId.toString()
    );

    if (alreadySupported) {
      return res.status(400).json({
        success: false,
        message: 'You have already supported this issue'
      });
    }

    // Add support
    issue.supporters.push({ userId });
    issue.supportCount = issue.supporters.length;
    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Support added successfully',
      data: {
        supportCount: issue.supportCount
      }
    });
  } catch (error) {
    console.error('Support issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @route   GET /api/issues/:id
 * @desc    Get single issue by ID
 * @access  Public
 */
export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporterId', 'name email phone')
      .populate('supporters.userId', 'name');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { issue }
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @route   GET /api/issues
 * @desc    Get all issues (Admin only)
 * @access  Private/Admin
 */
export const getAllIssues = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('reporterId', 'name email');

    const total = await Issue.countDocuments(query);

    res.status(200).json({
      success: true,
      count: issues.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: { issues }
    });
  } catch (error) {
    console.error('Get all issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @route   PUT /api/issues/status/:id
 * @desc    Update issue status (Admin only)
 * @access  Private/Admin
 */
export const updateIssueStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    issue.status = status;
    if (adminNotes) issue.adminNotes = adminNotes;
    
    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Issue status updated successfully',
      data: { issue }
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @route   PUT /api/issues/assign/:id
 * @desc    Assign issue to a worker and move to processing (Admin only)
 * @access  Private/Admin
 */
export const assignIssue = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({ success: false, message: 'assignedTo is required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    issue.assignedTo = assignedTo;
    issue.assignedAt = new Date();
    if (issue.status === 'pending') issue.status = 'processing';
    await issue.save();

    res.status(200).json({ success: true, message: 'Issue assigned successfully', data: { issue } });
  } catch (error) {
    console.error('Assign issue error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @route   PUT /api/issues/category/:id
 * @desc    Update issue category (Admin only)
 * @access  Private/Admin
 */
export const updateIssueCategory = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    issue.category = category;
    await issue.save();

    res.status(200).json({
      success: true,
      message: 'Issue category updated successfully',
      data: { issue }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @route   GET /api/issues/stats/dashboard
 * @desc    Get dashboard statistics
 * @access  Private
 */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? null : req.user._id;

    const query = userId ? { reporterId: userId } : {};

    const [total, pending, processing, resolved, categoryStats] = await Promise.all([
      Issue.countDocuments(query),
      Issue.countDocuments({ ...query, status: 'pending' }),
      Issue.countDocuments({ ...query, status: 'processing' }),
      Issue.countDocuments({ ...query, status: 'resolved' }),
      Issue.aggregate([
        ...(userId ? [{ $match: { reporterId: userId } }] : []),
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        processing,
        resolved,
        rejected: total - pending - processing - resolved,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @route   GET /api/issues/user/:userId/:status
 * @desc    Get user issues by status
 * @access  Private
 */
export const getUserIssuesByStatus = async (req, res) => {
  try {
    const { userId, status } = req.params;

    // Ensure user can only access their own issues (unless admin)
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these issues'
      });
    }

    // Build query to include issues user reported OR supported
    let query = {
      $or: [
        { reporterId: userId },
        { 'supporters.userId': userId }
      ]
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const issues = await Issue.find(query)
      .sort({ createdAt: -1 })
      .populate('reporterId', 'name email');

    res.status(200).json({
      success: true,
      count: issues.length,
      data: { issues }
    });
  } catch (error) {
    console.error('Get user issues by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @route   GET /api/analytics/stats
 * @desc    Get comprehensive analytics (Admin only)
 * @access  Private/Admin
 */
export const getAnalyticsStats = async (req, res) => {
  try {
    // Status distribution
    const statusStats = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Category distribution
    const categoryStats = await Issue.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Issue.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Average resolution time
    const resolvedIssues = await Issue.find({ status: 'resolved', resolvedAt: { $exists: true } });
    let avgResolutionTime = 0;
    if (resolvedIssues.length > 0) {
      const totalTime = resolvedIssues.reduce((sum, issue) => {
        const days = (issue.resolvedAt - issue.createdAt) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      avgResolutionTime = (totalTime / resolvedIssues.length).toFixed(1);
    }

    // Total counts
    const total = await Issue.countDocuments();
    const pending = await Issue.countDocuments({ status: 'pending' });
    const processing = await Issue.countDocuments({ status: 'processing' });
    const resolved = await Issue.countDocuments({ status: 'resolved' });
    const rejected = await Issue.countDocuments({ status: 'rejected' });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          total,
          pending,
          processing,
          resolved,
          rejected,
          avgResolutionTime: `${avgResolutionTime} days`
        },
        statusStats,
        categoryStats,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @route   GET /api/issues/map
 * @desc    Get all issues with coordinates for map view (Admin only)
 * @access  Private/Admin
 */
export const getIssuesForMap = async (req, res) => {
  try {
    const issues = await Issue.find({
      location: { $exists: true }
    })
      .select('title category status location imageUrl createdAt reporterId')
      .populate('reporterId', 'name')
      .limit(1000); // Limit for performance

    res.status(200).json({
      success: true,
      count: issues.length,
      data: { issues }
    });
  } catch (error) {
    console.error('Get map issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @route   GET /api/issues/:id/details
 * @desc    Get detailed issue information with supporters and nearby issues
 * @access  Private
 */
export const getIssueDetails = async (req, res) => {
  try {
    const issueId = req.params.id;

    // Get issue with full details
    const issue = await Issue.findById(issueId)
      .populate('reporterId', 'name email phone profileImage')
      .populate('supporters.userId', 'name email');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Get nearby issues (within 100m radius)
    const nearbyIssues = await Issue.find({
      _id: { $ne: issueId }, // Exclude current issue
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: issue.location.coordinates
          },
          $maxDistance: 100 // 100 meters
        }
      }
    })
      .select('title category status imageUrl createdAt supportCount')
      .limit(10)
      .sort({ createdAt: -1 });

    // Format supporters data
    const supportersDetails = issue.supporters.map(supporter => ({
      name: supporter.userId?.name || 'Unknown User',
      email: supporter.userId?.email || 'N/A',
      supportedAt: supporter.reportedAt
    }));

    res.status(200).json({
      success: true,
      data: {
        issue: {
          _id: issue._id,
          title: issue.title,
          category: issue.category,
          description: issue.description,
          imageUrl: issue.imageUrl,
          status: issue.status,
          location: issue.location,
          address: issue.address,
          supportCount: issue.supportCount,
          mlConfidence: issue.mlConfidence,
          mlPredictions: issue.mlPredictions,
          adminNotes: issue.adminNotes,
          assignedTo: issue.assignedTo,
          assignedAt: issue.assignedAt,
          createdAt: issue.createdAt,
          updatedAt: issue.updatedAt,
          resolvedAt: issue.resolvedAt,
          reporter: {
            _id: issue.reporterId?._id,
            name: issue.reporterId?.name || 'Unknown',
            email: issue.reporterId?.email || 'N/A',
            phone: issue.reporterId?.phone || 'N/A',
            profileImage: issue.reporterId?.profileImage
          }
        },
        supporters: supportersDetails,
        nearbyIssues: nearbyIssues.map(nearby => ({
          _id: nearby._id,
          title: nearby.title,
          category: nearby.category,
          status: nearby.status,
          imageUrl: nearby.imageUrl,
          supportCount: nearby.supportCount,
          createdAt: nearby.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get issue details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
