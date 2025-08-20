import express from 'express';
const router = express.Router();
import { protect, adminOnly } from '../middleware/protect.middleware.js';

// Import các hàm controller đã viết ở trên
import { createSystem, getAllSystems, updateSystem } from '../controllers/system.controller.js';

// Định nghĩa các endpoints
// Khi có request POST tới '/', nó sẽ được xử lý bởi hàm createSystem
router.post('/', protect, adminOnly, createSystem);

// Khi có request GET tới '/', nó sẽ được xử lý bởi hàm getAllSystems
router.get('/', protect, adminOnly, getAllSystems);

router.put('/:id', protect, adminOnly, updateSystem);

export default router;