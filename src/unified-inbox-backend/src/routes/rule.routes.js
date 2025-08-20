// src/routes/rule.routes.js
import express from 'express';
import {
  getRulesBySystem,
  createRule,
  deleteRule,
} from '../controllers/rule.controller.js';
import { protect, adminOnly } from '../middleware/protect.middleware.js';

const router = express.Router();

// GET /api/v1/rules?systemId=...
router.get('/', protect, adminOnly, getRulesBySystem);

// POST /api/v1/rules
router.post('/', protect, adminOnly, createRule);

// DELETE /api/v1/rules/:id
router.delete('/:id', protect, adminOnly, deleteRule);

export default router;