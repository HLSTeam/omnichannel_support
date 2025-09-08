import express from 'express';
import {
  getNotificationStatistics,
  getNotifications,
  getNotificationById,
  retryNotification,
  deleteNotification
} from '../controllers/notification.controller.js';
import { protect, adminOnly } from '../middleware/protect.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get notification statistics (Admin only)
router.get('/stats', adminOnly, getNotificationStatistics);

// Get notifications list with pagination (Admin only)
router.get('/', adminOnly, getNotifications);

// Get notification by ID (Admin only)
router.get('/:id', adminOnly, getNotificationById);

// Retry failed notification (Admin only)
router.post('/:id/retry', adminOnly, retryNotification);

// Delete notification (Admin only)
router.delete('/:id', adminOnly, deleteNotification);

export default router;
