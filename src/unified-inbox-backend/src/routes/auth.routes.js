import express from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { protect, adminOnly } from '../middleware/protect.middleware.js';
const router = express.Router();

// POST /api/v1/auth/register
router.post('/register', protect, adminOnly, register);

// POST /api/v1/auth/login
router.post('/login', login);





export default router;