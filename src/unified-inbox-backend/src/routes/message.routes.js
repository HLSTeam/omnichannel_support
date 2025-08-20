import express from 'express';
import { sendAgentMessage } from '../controllers/message.controller.js';
import { protect } from '../middleware/protect.middleware.js';

const router = express.Router();

// POST /api/v1/messages
router.post('/', protect, sendAgentMessage);

export default router;