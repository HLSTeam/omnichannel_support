import { checkUserPermissions, getPermissionsForRole, registerTelegramGroup } from '../services/permission.service.js';
import prisma from '../db.js';

// Standard response helper
const sendResponse = (res, status, data = null, message = '', pagination = null) => {
  const response = {
    status: status === 200 || status === 201 ? 'success' : 'error',
    message,
    data,
  };
  
  if (pagination) {
    response.pagination = pagination;
  }
  
  return res.status(status).json(response);
};

/**
 * Check user permissions for specific action (ENHANCED)
 * @route POST /api/v1/permissions/check
 * @body { systemId, chatId, userId, username, permissionName }
 */
export const checkPermissions = async (req, res) => {
  try {
    const { systemId, chatId, userId, username, permissionName } = req.body;
    
    // Validate required fields
    if (!systemId || !chatId || !userId || !username || !permissionName) {
      return sendResponse(res, 400, null, 'Missing required fields: systemId, chatId, userId, username, permissionName');
    }
    
    // Check permissions with enhanced logic
    const result = await checkUserPermissions(systemId, chatId, userId, username, permissionName);
    
    if (!result.success) {
      return sendResponse(res, 500, null, 'Failed to check permissions', result.error);
    }
    
    return sendResponse(res, 200, result.data, 'Permissions checked successfully');
    
  } catch (error) {
    console.error('Error checking permissions:', error);
    return sendResponse(res, 500, null, 'Internal server error');
  }
};

/**
 * Get available permissions for specific role
 * @route GET /api/v1/permissions/role/:role
 */
export const getRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!role) {
      return sendResponse(res, 400, null, 'Role parameter is required');
    }
    
    const permissions = getPermissionsForRole(role);
    
    return sendResponse(res, 200, {
      role: role.toLowerCase(),
      permissions: permissions,
      count: permissions.length
    }, `Permissions for role '${role}' retrieved successfully`);
    
  } catch (error) {
    console.error('Error getting role permissions:', error);
    return sendResponse(res, 500, null, 'Internal server error');
  }
};

/**
 * Register new Telegram group with default permissions
 * @route POST /api/v1/permissions/register-group
 */
export const registerGroup = async (req, res) => {
  try {
    const { systemId, chatId, groupName, groupType, chatTitle, description } = req.body;
    
    // Validate required fields
    if (!systemId || !chatId || !groupName || !groupType) {
      return sendResponse(res, 400, null, 'Missing required fields: systemId, chatId, groupName, groupType');
    }
    
    // Validate group type
    const validGroupTypes = ['ADMIN', 'CUSTOMER', 'SUPPLIER'];
    if (!validGroupTypes.includes(groupType.toUpperCase())) {
      return sendResponse(res, 400, null, `Invalid group type. Must be one of: ${validGroupTypes.join(', ')}`);
    }
    
    // Register group
    const result = await registerTelegramGroup({
      systemId,
      chatId,
      groupName,
      groupType: groupType.toUpperCase(),
      chatTitle,
      description
    });
    
    if (!result.success) {
      return sendResponse(res, 400, null, result.error);
    }
    
    return sendResponse(res, 201, result.data, 'Telegram group registered successfully with default permissions');
    
  } catch (error) {
    console.error('Error registering group:', error);
    return sendResponse(res, 500, null, 'Internal server error');
  }
};

/**
 * Get all available permissions
 * @route GET /api/v1/permissions/available
 */
export const getAvailablePermissions = async (req, res) => {
  try {
    const allPermissions = {
      admin: getPermissionsForRole('admin'),
      supplier: getPermissionsForRole('supplier'),
      customer: getPermissionsForRole('customer'),
      agent: getPermissionsForRole('agent')
    };
    
    return sendResponse(res, 200, allPermissions, 'Available permissions retrieved successfully');
    
  } catch (error) {
    console.error('Error getting available permissions:', error);
    return sendResponse(res, 500, null, 'Internal server error');
  }
};

/**
 * Get permission templates for group types
 * @route GET /api/v1/permissions/templates
 */
export const getPermissionTemplates = async (req, res) => {
  try {
    const { systemId } = req.query;
    
    if (!systemId) {
      return sendResponse(res, 400, null, 'systemId query parameter is required');
    }
    
    const templates = await getPermissionTemplatesForSystem(systemId);
    
    return sendResponse(res, 200, templates, 'Permission templates retrieved successfully');
    
  } catch (error) {
    console.error('Error getting permission templates:', error);
    return sendResponse(res, 500, null, 'Internal server error');
  }
};

/**
 * Get permission templates for specific system
 * @param {string} systemId - System ID
 * @returns {Promise<Object>} Permission templates
 */
const getPermissionTemplatesForSystem = async (systemId) => {
  try {
    const templates = await prisma.group_permissions.findMany({
      where: { systemId },
      select: {
        groupType: true,
        permissionName: true,
        description: true
      },
      orderBy: [
        { groupType: 'asc' },
        { permissionName: 'asc' }
      ]
    });
    
    // Group by group type
    const groupedTemplates = templates.reduce((acc, template) => {
      if (!acc[template.groupType]) {
        acc[template.groupType] = [];
      }
      acc[template.groupType].push({
        name: template.permissionName,
        description: template.description
      });
      return acc;
    }, {});
    
    return groupedTemplates;
    
  } catch (error) {
    console.error('Error getting permission templates:', error);
    throw error;
  }
};
