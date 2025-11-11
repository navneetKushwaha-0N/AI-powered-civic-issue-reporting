import mongoose from 'mongoose';

const supporterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      // Original categories
      'pothole',
      'streetlight',
      'garbage',
      'drainage',
      'water_supply',
      'road_damage',
      'traffic_signal',
      'illegal_parking',
      'graffiti',
      'other',
      // ML service categories
      'Garbage Issue',
      'Road Damage / Pothole',
      'Street Light Failure',
      'Water Leakage',
      'Sewer Overflow',
      'Other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image is required']
  },
  imagePublicId: {
    type: String
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates format. Expected [longitude, latitude]'
      }
    }
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'resolved', 'rejected'],
    default: 'pending'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  assignedAt: {
    type: Date
  },
  supportCount: {
    type: Number,
    default: 1,
    min: 0
  },
  supporters: [supporterSchema],
  mlConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  mlPredictions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  resolvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
issueSchema.index({ location: '2dsphere' });
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ reporterId: 1, createdAt: -1 });
issueSchema.index({ category: 1, status: 1 });

// Middleware to set resolved/rejected dates
issueSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    } else if (this.status === 'rejected' && !this.rejectedAt) {
      this.rejectedAt = new Date();
    }
  }
  next();
});

export default mongoose.model('Issue', issueSchema);
