import express from 'express';
const router = express.Router();
import { protect, adminOnly } from '../middleware/protect.middleware.js';

// Import các hàm controller đã viết ở trên
import { createSystem, getAllSystems, updateSystem, deleteSystem } from '../controllers/system.controller.js';
import { checkLogs, checkTransactions } from '../controllers/systems.controller.js';

// Định nghĩa các endpoints
// Khi có request POST tới '/', nó sẽ được xử lý bởi hàm createSystem
router.post('/', protect, adminOnly, createSystem);

// Khi có request GET tới '/', nó sẽ được xử lý bởi hàm getAllSystems
router.get('/', protect, getAllSystems);

// Public endpoint để lấy basic system info (không cần authentication)
router.get('/public', getAllSystems);


router.put('/:id', protect, adminOnly, updateSystem);

// DELETE a system
router.delete('/:id', protect, adminOnly, deleteSystem);

// 🆕 NEW SYSTEM-AWARE ENDPOINTS
/**
 * @route POST /api/v1/systems/check-logs
 * @desc Check system logs for specific system (System-aware)
 * @access Private (requires systemId for isolation)
 */
router.post('/check-logs', checkLogs);

/**
 * @route POST /api/v1/systems/check-trans  
 * @desc Check transaction status for specific system (System-aware)
 * @access Private (requires systemId for isolation)
 */
router.post('/check-trans', checkTransactions);

export default router;