import express from 'express';
import {
  createUserDeclaration,
  getUserDeclarations,
  getUserDeclarationById,
  updateUserDeclaration,
  deleteUserDeclaration,
  getUserDeclarationsByGroup
} from '../controllers/user-declaration.controller.js';
import { protect } from '../middleware/protect.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// User Declaration routes
router.post('/', createUserDeclaration);
router.get('/', getUserDeclarations);
router.get('/group/:groupId', getUserDeclarationsByGroup);
router.get('/:id', getUserDeclarationById);
router.put('/:id', updateUserDeclaration);
router.delete('/:id', deleteUserDeclaration);

export default router;
