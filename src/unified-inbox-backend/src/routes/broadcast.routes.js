import express from 'express';
import { createPreview, executeBroadcast } from '../controllers/broadcast.controller.js';
import { protect } from '../middleware/protect.middleware.js';
import { adminOnly } from '../middleware/authorization.middleware.js';

const router = express.Router();

// Cả hai route đều yêu cầu quyền Admin
router.post('/preview', protect, adminOnly, createPreview);
router.post('/execute', protect, adminOnly, executeBroadcast);

export default router;