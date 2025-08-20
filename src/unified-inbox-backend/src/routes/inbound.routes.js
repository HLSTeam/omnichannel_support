import express from 'express';
import { forwardMessageToAgent } from '../controllers/inbound.controller.js';
import { verifyN8nApiKey } from '../middleware/auth.middleware.js';

const router = express.Router();

// This entire route is protected by our API key middleware.
// Only requests with the correct 'x-api-key' header will be allowed.
router.post('/telegram', verifyN8nApiKey, forwardMessageToAgent);

export default router;