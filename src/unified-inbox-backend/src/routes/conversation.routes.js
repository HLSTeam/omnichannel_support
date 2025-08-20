import express from 'express';
import {
  getAllConversations,
  getMessagesForConversation,
} from '../controllers/conversation.controller.js';

const router = express.Router();

// GET /api/v1/conversations
router.get('/', getAllConversations);

// GET /api/v1/conversations/:id/messages
router.get('/:id/messages', getMessagesForConversation);

export default router;