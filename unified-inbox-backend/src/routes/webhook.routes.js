import express from 'express';
const router = express.Router();
import { handleTelegramWebhook } from '../controllers/webhook.controller.js';

// URL giờ đây sẽ có dạng /api/v1/webhooks/telegram/some-uuid-string
router.post('/telegram/:systemId', handleTelegramWebhook);

export default router;