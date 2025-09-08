import express from 'express';
import {
    getAllGroups,
    getGroupsByType,
    detectGroupInfo,
    createGroup,
    updateGroup,
    deleteGroup,
    getChatIdsByType
} from '../controllers/telegram-groups.controller.js';

// Middleware để bảo vệ routes (sử dụng existing auth middleware)
import { protect, adminOnly } from '../middleware/protect.middleware.js';

const router = express.Router();

// Routes công khai (cho n8n workflows)
router.post('/detect', detectGroupInfo); // POST /api/telegram-groups/detect
router.get('/chat-ids', getChatIdsByType); // GET /api/telegram-groups/chat-ids

// Routes bảo vệ (cho admin interface)
router.use(protect); // Require authentication for all routes below

// GET /api/telegram-groups
router.get('/', getAllGroups);

// GET /api/telegram-groups/:type (admin/customer/supplier)
router.get('/:type', getGroupsByType);

// POST /api/telegram-groups (Admin only)
router.post('/', adminOnly, createGroup);

// PUT /api/telegram-groups/:id (Admin only)
router.put('/:id', adminOnly, updateGroup);

// DELETE /api/telegram-groups/:id (Admin only)
router.delete('/:id', adminOnly, deleteGroup);

export default router;
