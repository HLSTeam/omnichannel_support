import express from 'express';
const router = express.Router();

// Import các hàm controller đã viết ở trên
import { createSystem, getAllSystems, updateSystem } from '../controllers/system.controller.js';

// Định nghĩa các endpoints
// Khi có request POST tới '/', nó sẽ được xử lý bởi hàm createSystem
router.post('/', createSystem);

// Khi có request GET tới '/', nó sẽ được xử lý bởi hàm getAllSystems
router.get('/', getAllSystems);

router.put('/:id', updateSystem);

export default router;