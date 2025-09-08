import express from 'express';
import {
  checkPermissions,
  getRolePermissions,
  registerGroup,
  getAvailablePermissions,
  getPermissionTemplates
} from '../controllers/permission.controller.js';

const router = express.Router();

/**
 * @route POST /api/v1/permissions/check
 * @desc Check user permissions for specific action
 * @access Public (for Telegram bot integration)
 * @body {
 *   systemId: string (required),
 *   chatId: string (required),
 *   userId: string (required),
 *   username: string (required),
 *   permissionName: string (required)
 * }
 */
router.post('/check', checkPermissions);

/**
 * @route GET /api/v1/permissions/role/:role
 * @desc Get available permissions for specific role
 * @access Public
 * @params role: string (ADMIN|CUSTOMER|SUPPLIER|AGENT)
 */
router.get('/role/:role', getRolePermissions);

/**
 * @route POST /api/v1/permissions/register-group
 * @desc Register new Telegram group with default permissions
 * @access Public (for Telegram bot integration)
 * @body {
 *   systemId: string (required),
 *   chatId: string (required),
 *   groupName: string (required),
 *   groupType: string (required) - ADMIN|CUSTOMER|SUPPLIER,
 *   chatTitle?: string,
 *   description?: string
 * }
 */
router.post('/register-group', registerGroup);

/**
 * @route GET /api/v1/permissions/available
 * @desc Get all available permissions for all roles
 * @access Public
 */
router.get('/available', getAvailablePermissions);

/**
 * @route GET /api/v1/permissions/templates
 * @desc Get permission templates for group types
 * @access Public
 * @query systemId: string (required)
 */
router.get('/templates', getPermissionTemplates);

export default router;
