import express from 'express';
import {
  createIssue,
  getUserIssues,
  getNearbyIssues,
  supportIssue,
  getIssueById,
  getAllIssues,
  updateIssueStatus,
  updateIssueCategory,
  getDashboardStats,
  assignIssue,
  getUserIssuesByStatus,
  getAnalyticsStats,
  getIssuesForMap,
  getIssueDetails
} from '../controllers/issueController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Public routes
router.get('/nearby', getNearbyIssues);
router.get('/:id', getIssueById);
router.get('/:id/details', protect, getIssueDetails);

// Protected routes (user)
router.post('/create', protect, upload.single('image'), createIssue);
router.get('/user/:userId', protect, getUserIssues);
router.get('/user/:userId/:status', protect, getUserIssuesByStatus);
router.post('/support/:id', protect, supportIssue);
router.get('/stats/dashboard', protect, getDashboardStats);

// Admin routes
router.get('/map', protect, adminOnly, getIssuesForMap);
router.get('/', protect, adminOnly, getAllIssues);
router.put('/status/:id', protect, adminOnly, updateIssueStatus);
router.put('/assign/:id', protect, adminOnly, assignIssue);
router.put('/category/:id', protect, adminOnly, updateIssueCategory);

export default router;
