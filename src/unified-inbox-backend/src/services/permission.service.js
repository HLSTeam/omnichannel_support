import prisma from '../db.js';

/**
 * Check user permissions for specific action (ENHANCED)
 * @param {string} systemId - System ID for multi-system isolation
 * @param {string} chatId - Telegram chat ID
 * @param {string} userId - Telegram user ID
 * @param {string} username - Telegram username
 * @param {string} permissionName - Permission to check
 * @returns {Promise<Object>} Permission check result
 */
export const checkUserPermissions = async (systemId, chatId, userId, username, permissionName) => {
  try {
    console.log('🔐 Checking permissions:', { systemId, chatId, userId, username, permissionName });

    // 1. Validate systemId exists
    const system = await prisma.system.findUnique({
      where: { id: systemId }
    });

    if (!system) {
      return {
        success: false,
        error: 'System not found',
        details: `System ID ${systemId} does not exist.`,
        data: {
          isSystemValid: false,
          systemId,
          chatId,
          userId,
          username,
          permissionName
        }
      };
    }

    // 2. Check chatId belongs to systemId
    const telegramGroup = await prisma.telegram_groups.findFirst({
      where: { 
        chatId: chatId.toString(),
        systemId: systemId,
        isActive: true
      },
      include: {
        group_permissions: {
          select: {
            permissionName: true,
            description: true
          }
        }
      }
    });

    if (!telegramGroup) {
      return {
        success: false,
        error: 'Telegram group not registered',
        details: `Chat ID ${chatId} is not registered in system ${systemId}. Please contact administrator to register this group.`,
        data: {
          isSystemValid: true,
          isGroupRegistered: false,
          systemId,
          chatId,
          userId,
          username,
          permissionName
        }
      };
    }

    // 3. Find user declaration in this group
    const userDeclaration = await prisma.userDeclaration.findFirst({
      where: {
        userId: userId.toString(),
        groupId: telegramGroup.id,
        systemId: systemId
      }
    });

    if (!userDeclaration) {
      return {
        success: false,
        error: 'User not declared in group',
        details: `User ${username} (ID: ${userId}) is not declared in group ${telegramGroup.groupName}. Please contact administrator to add user to this group.`,
        data: {
          isSystemValid: true,
          isGroupRegistered: true,
          isUserDeclared: false,
          systemId,
          chatId,
          userId,
          username,
          permissionName,
          groupType: telegramGroup.groupType,
          groupName: telegramGroup.groupName
        }
      };
    }

    // 4. Get group permissions
    const groupPermissions = await prisma.group_permissions.findMany({
      where: {
        systemId: systemId,
        groupType: telegramGroup.groupType
      },
      select: {
        permissionName: true,
        description: true
      }
    });
    
    const permissionNames = groupPermissions.map(p => p.permissionName);
    
    // 5. Check if requested permission exists in group permissions
    const hasPermission = permissionNames.includes(permissionName);

    // 6. Return comprehensive permission check result
    return {
      success: true,
      data: {
        isSystemValid: true,
        isGroupRegistered: true,
        isUserDeclared: true,
        userRole: telegramGroup.groupType.toLowerCase(),
        groupType: telegramGroup.groupType,
        groupName: telegramGroup.groupName,
        declaredPermissions: permissionNames,
        requestedPermission: permissionName,
        hasPermission: hasPermission,
        systemId: systemId,
        groupId: telegramGroup.id,
        userId: userId,
        username: username,
        chatId: chatId,
        groupInfo: {
          id: telegramGroup.id,
          name: telegramGroup.groupName,
          type: telegramGroup.groupType,
          description: telegramGroup.description,
          chatTitle: telegramGroup.chatTitle,
          memberCount: telegramGroup.memberCount
        }
      }
    };

  } catch (error) {
    console.error('Error checking user permissions:', error);
    return {
      success: false,
      error: 'Failed to check user permissions',
      details: error.message
    };
  }
};

/**
 * Check if user has permission for specific action (LEGACY - keep for backward compatibility)
 * @param {string} action - Action to check
 * @param {string[]} permissions - User's permissions
 * @param {string} userRole - User's role
 * @returns {boolean} True if user has permission
 */
const checkActionPermission = (action, permissions, userRole) => {
  // Admin has all permissions
  if (userRole === 'admin') return true;

  // Check specific action permissions
  switch (action) {
    case 'check_logs':
      return permissions.includes('system_logs') || 
             permissions.includes('application_logs') || 
             permissions.includes('view_all');
    
    case 'check_transactions':
      return permissions.includes('transaction_logs') || 
             permissions.includes('transaction_status') || 
             permissions.includes('view_all');
    
    case 'create_ticket':
      return permissions.includes('create_ticket') || 
             permissions.includes('view_all') ||
             userRole === 'supplier' || 
             userRole === 'customer';
    
    case 'view_tickets':
      return permissions.includes('view_tickets') || 
             permissions.includes('view_own') || 
             permissions.includes('view_all');
    
    case 'assign_ticket':
      return permissions.includes('assign_ticket') || 
             permissions.includes('manage_tickets') || 
             permissions.includes('view_all') ||
             userRole === 'agent';
    
    case 'system_management':
      return permissions.includes('system_management') || 
             permissions.includes('view_all');
    
    default:
      return permissions.includes('view_all');
  }
};

/**
 * Get available permissions for role (LEGACY - keep for backward compatibility)
 * @param {string} role - User role
 * @returns {string[]} Array of available permissions
 */
export const getPermissionsForRole = (role) => {
  const rolePermissions = {
    admin: [
      'view_all',
      'system_logs',
      'application_logs', 
      'error_logs',
      'transaction_logs',
      'transaction_status',
      'create_ticket',
      'view_tickets',
      'assign_ticket',
      'manage_tickets',
      'system_management'
    ],
    supplier: [
      'view_own',
      'transaction_logs',
      'transaction_status',
      'create_ticket',
      'view_tickets'
    ],
    customer: [
      'view_own',
      'transaction_status',
      'create_ticket',
      'view_tickets'
    ],
    agent: [
      'view_own',
      'view_tickets',
      'assign_ticket',
      'manage_tickets',
      'create_ticket'
    ]
  };

  return rolePermissions[role.toLowerCase()] || ['view_own'];
};

/**
 * Register new Telegram group with permissions
 * @param {Object} groupData - Group data
 * @returns {Promise<Object>} Registration result
 */
export const registerTelegramGroup = async (groupData) => {
  try {
    const { systemId, chatId, groupName, groupType, chatTitle, description } = groupData;

    // Check if group already exists
    const existingGroup = await prisma.telegram_groups.findFirst({
      where: { chatId, systemId }
    });

    if (existingGroup) {
      return {
        success: false,
        error: 'Telegram group already registered'
      };
    }

    // Create new group
    const newGroup = await prisma.telegram_groups.create({
      data: {
        systemId,
        chatId,
        groupName,
        groupType,
        chatTitle,
        description,
        isActive: true
      }
    });

    // Get default permissions for this group type
    const defaultPermissions = getPermissionsForRole(groupType);

    // Create group permissions
    const permissions = await Promise.all(
      defaultPermissions.map(permissionName =>
        prisma.group_permissions.create({
          data: {
            systemId,
            groupType,
            permissionName,
            description: `Default permission for ${groupType} group`
          }
        })
      )
    );

    return {
      success: true,
      data: {
        group: newGroup,
        permissions: permissions
      }
    };

  } catch (error) {
    console.error('Error registering Telegram group:', error);
    return {
      success: false,
      error: 'Failed to register Telegram group',
      details: error.message
    };
  }
};
