import express from 'express';
import { getAnalyticsStats } from '../controllers/issueController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin analytics routes
router.get('/stats', protect, adminOnly, getAnalyticsStats);

export default router;
