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
 * Create new user declaration
 * @route POST /api/v1/user-declarations
 * @body { userId, username, groupId, systemId }
 */
export const createUserDeclaration = async (req, res) => {
  try {
    const { userId, username, groupId, systemId } = req.body;
    
    // Validate required fields
    if (!userId || !username || !groupId || !systemId) {
      return sendResponse(res, 400, null, 'Missing required fields: userId, username, groupId, systemId');
    }
    
    // Check if user declaration already exists
    const existingDeclaration = await prisma.userDeclaration.findFirst({
      where: {
        userId: userId.toString(),
        groupId,
        systemId
      }
    });
    
    if (existingDeclaration) {
      return sendResponse(res, 400, null, 'User declaration already exists for this user in this group');
    }
    
    // Validate group exists
    const group = await prisma.telegram_groups.findUnique({
      where: { id: groupId }
    });
    
    if (!group) {
      return sendResponse(res, 400, null, 'Telegram group not found');
    }
    
    // Validate system exists
    const system = await prisma.system.findUnique({
      where: { id: systemId }
    });
    
    if (!system) {
      return sendResponse(res, 400, null, 'System not found');
    }
    
    // Create user declaration
    const userDeclaration = await prisma.userDeclaration.create({
      data: {
        userId: userId.toString(),
        username,
        groupId,
        systemId
      },
      include: {
        group: {
          select: {
            id: true,
            groupName: true,
            groupType: true,
            chatTitle: true
          }
        },
        system: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return sendResponse(res, 201, userDeclaration, 'User declaration created successfully');
    
  } catch (error) {
    console.error('Error creating user declaration:', error);
    return sendResponse(res, 500, null, 'Internal server error');
  }
};

/**
 * Get all user declarations with pagination
 * @route GET /api/v1/user-declarations
 * @query { page, limit, systemId, groupId, userId }
 */
export const getUserDeclarations = async (req, res) => {
  try {
    const { page = 1, limit = 10, systemId, groupId, userId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {};
    if (systemId) where.systemId = systemId;
    if (groupId) where.groupId = groupId;
    if (userId) where.userId = userId.toString();
    
    // Get user declarations with pagination
    const [userDeclarations, total] = await Promise.all([
      prisma.userDeclaration.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          group: {
            select: {
              id: true,
              groupName: true,
              groupType: true,
              chatTitle: true
            }
          },
          system: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userDeclaration.count({ where })
    ]);
    
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };
    
    return sendResponse(res, 200, userDeclarations, 'User declarations retrieved successfully', pagination);
    
  } catch (error) {
    console.error('Error getting user declarations:', error);
    return sendResponse(res, 500, null, 'Internal server error');
  }
};

/**
 * Get user declaration by ID
 * @route GET /api/v1/user-declarations/:id
 */
export const getUserDeclarationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userDeclaration = await prisma.userDeclaration.findUnique({
      where: { id },
      include: {
        group: {
          select: {
            id: true,
            groupName: true,
            groupType: true,
            chatTitle: true
          }
        },
        system: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!userDeclaration) {
      return sendResponse(res, 404, null, 'User declaration not found');
    }
    
    return sendResponse(res, 200, userDeclaration, 'User declaration retrieved successfully');
    
  } catch (error) {
    console.error('Error getting user declaration:', error);
    return sendResponse(res, 500, null, 'Internal server error');
  }
};

/**
 * Update user declaration
 * @route PUT /api/v1/user-declarations/:id
 * @body { username, groupId, systemId }
 */
export const updateUserDeclaration = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, groupId, systemId } = req.body;
    
    // Check if user declaration exists
    const existingDeclaration = await prisma.userDeclaration.findUnique({
      where: { id }
    });
    
    if (!existingDeclaration) {
      return sendResponse(res, 404, null, 'User declaration not found');
    }
    
    // Validate group exists if groupId is provided
    if (groupId) {
      const group = await prisma.telegram_groups.findUnique({
        where: { id: groupId }
      });
      
      if (!group) {
        return sendResponse(res, 400, null, 'Telegram group not found');
      }
    }
    
    // Validate system exists if systemId is provided
    if (systemId) {
      const system = await prisma.system.findUnique({
        where: { id: systemId }
      });
      
      if (!system) {
        return sendResponse(res, 400, null, 'System not found');
      }
    }
    
    // Update user declaration
    const updatedDeclaration = await prisma.userDeclaration.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(groupId && { groupId }),
        ...(systemId && { systemId })
      },
      include: {
        group: {
          select: {
            id: true,
            groupName: true,
            groupType: true,
            chatTitle: true
          }
        },
        system: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return sendResponse(res, 200, updatedDeclaration, 'User declaration updated successfully');
    
  } catch (error) {
    console.error('Error updating user declaration:', error);
    return sendResponse(res, 500, null, 'Internal server error');
  }
};

/**
 * Delete user declaration
 * @route DELETE /api/v1/user-declarations/:id
 */
export const deleteUserDeclaration = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user declaration exists
    const existingDeclaration = await prisma.userDeclaration.findUnique({
      where: { id }
    });
    
    if (!existingDeclaration) {
      return sendResponse(res, 404, null, 'User declaration not found');
    }
    
    // Delete user declaration
    await prisma.userDeclaration.delete({
      where: { id }
    });
    
    return sendResponse(res, 200, null, 'User declaration deleted successfully');
    
  } catch (error) {
    console.error('Error deleting user declaration:', error);
    return sendResponse(res, 500, null, 'Internal server error');
  }
};

/**
 * Get user declarations by group
 * @route GET /api/v1/user-declarations/group/:groupId
 */
export const getUserDeclarationsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Validate group exists
    const group = await prisma.telegram_groups.findUnique({
      where: { id: groupId }
    });
    
    if (!group) {
      return sendResponse(res, 404, null, 'Telegram group not found');
    }
    
    // Get user declarations for this group
    const [userDeclarations, total] = await Promise.all([
      prisma.userDeclaration.findMany({
        where: { groupId },
        skip,
        take: parseInt(limit),
        include: {
          system: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userDeclaration.count({ where: { groupId } })
    ]);
    
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };
    
    return sendResponse(res, 200, {
      group,
      userDeclarations
    }, 'User declarations for group retrieved successfully', pagination);
    
  } catch (error) {
    console.error('Error getting user declarations by group:', error);
    return sendResponse(res, 500, null, 'Internal server error');
  }
};
