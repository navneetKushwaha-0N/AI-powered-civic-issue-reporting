import express from 'express';
import { makeAdmin } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// PUT /admin/make-admin/:userId
router.put('/make-admin/:userId', protect, adminMiddleware, makeAdmin);

export default router;
