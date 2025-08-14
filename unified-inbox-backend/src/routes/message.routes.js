import express from 'express';
import { sendAgentMessage } from '../controllers/message.controller.js';

const router = express.Router();

// POST /api/v1/messages
router.post('/', sendAgentMessage);

export default router;