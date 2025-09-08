import prisma from '../db.js';
import { notifyAdminTeam } from '../services/notification.service.js';

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

// Validate ticket data
const validateTicketData = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (data.title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }
  }
  
  if (!isUpdate || data.description !== undefined) {
    if (!data.description || data.description.trim().length === 0) {
      errors.push('Description is required');
    }
  }
  
  if (!isUpdate || data.priority !== undefined) {
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (!data.priority || !validPriorities.includes(data.priority)) {
      errors.push('Priority must be one of: LOW, MEDIUM, HIGH, URGENT');
    }
  }
  
  if (!isUpdate || data.category !== undefined) {
    const validCategories = ['TECHNICAL', 'BILLING', 'GENERAL', 'FEATURE_REQUEST', 'BUG_REPORT'];
    if (!data.category || !validCategories.includes(data.category)) {
      errors.push('Category must be one of: TECHNICAL, BILLING, GENERAL, FEATURE_REQUEST, BUG_REPORT');
    }
  }
  
  if (data.status !== undefined) {
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'REVIEW', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(data.status)) {
      errors.push('Status must be one of: OPEN, IN_PROGRESS, REVIEW, RESOLVED, CLOSED');
    }
  }
  
  return errors;
};

// Validate status transitions
const validateStatusTransition = (currentStatus, newStatus) => {
  const allowedTransitions = {
    'OPEN': ['IN_PROGRESS', 'CLOSED'],
    'IN_PROGRESS': ['REVIEW', 'OPEN', 'CLOSED'],
    'REVIEW': ['RESOLVED', 'IN_PROGRESS'],
    'RESOLVED': ['CLOSED', 'IN_PROGRESS'],
    'CLOSED': [] // No transitions from CLOSED
  };
  
  if (!allowedTransitions[currentStatus]) {
    return false;
  }
  
  return allowedTransitions[currentStatus].includes(newStatus);
};

// --- CREATE TICKET ---
export const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category, conversationId, assignedTo, systemId, userId } = req.body;
    
    // Handle createdBy for different auth types
    let createdBy = null;
    if (req.agent && req.agent.id) {
      // Web UI request with JWT token
      createdBy = req.agent.id;
    } else if (req.headers['x-api-key']) {
      // n8n request with API key - use default system agent
      if (userId) {
        // For n8n requests, use the dedicated System Agent
        const systemAgent = await prisma.agent.findFirst({
          where: { 
            email: 'system@n8n.integration',
            role: 'AGENT'
          }
        });
        
        if (!systemAgent) {
          return sendResponse(res, 500, null, 'System Agent not found. Please run create-system-agent.js first');
        }
        
        createdBy = systemAgent.id;
        
        // Log for debugging
        console.log(`🎫 n8n ticket created by System Agent: ${systemAgent.name} (${systemAgent.id})`);
        console.log(`📝 Original userId from n8n: ${userId} (${typeof userId})`);
      } else {
        return sendResponse(res, 400, null, 'Missing required authentication or user information');
      }
    } else {
      return sendResponse(res, 400, null, 'Missing required authentication or user information');
    }
    
    // Validation
    const errors = validateTicketData({ title, description, priority, category });
    if (errors.length > 0) {
      return sendResponse(res, 400, null, `Validation errors: ${errors.join(', ')}`);
    }
    
    // Validate systemId is required
    if (!systemId) {
      return sendResponse(res, 400, null, 'System ID is required');
    }
    
    // Validate system exists
    const system = await prisma.system.findUnique({
      where: { id: systemId }
    });
    if (!system) {
      return sendResponse(res, 400, null, 'Invalid system ID');
    }
    
    // Validate conversation exists if provided
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });
      if (!conversation) {
        return sendResponse(res, 400, null, 'Invalid conversation ID');
      }
    }
    
    // Validate assignee exists if provided
    if (assignedTo) {
      const assignee = await prisma.agent.findUnique({
        where: { id: assignedTo }
      });
      if (!assignee) {
        return sendResponse(res, 400, null, 'Invalid assignee ID');
      }
    }
    
    // Create ticket with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create ticket
      const ticket = await tx.helpdeskTicket.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          priority,
          category,
          status: 'OPEN',
          conversationId,
          assignedTo,
          createdBy,
          aiAssisted: false,
          systemId
        },
        include: {
          creator: { select: { id: true, name: true, email: true, role: true } },
          assignedAgent: { select: { id: true, name: true, email: true, role: true } },
          conversation: { select: { id: true, name: true, type: true } },
          system: { select: { id: true, name: true } }
        }
      });
      
      // Create assignment record if assigned
      if (assignedTo) {
        await tx.ticketAssignment.create({
          data: {
            ticketId: ticket.id,
            agentId: assignedTo,
            assignedBy: createdBy
          }
        });
        
        // Create history record for assignment
        await tx.ticketHistory.create({
          data: {
            ticketId: ticket.id,
            field: 'assignedTo',
            oldValue: null,
            newValue: assignedTo,
            changedBy: createdBy
          }
        });
      }
      
      return ticket;
    });
    
    // Send notification to admin team (non-blocking)
    try {
      const notificationResult = await notifyAdminTeam({
        ...result,
        userId: req.body.userId,
        userRole: req.body.userRole,
        chatId: req.body.chatId,
        username: req.body.username,
        intent: req.body.intent,
        confidence: req.body.confidence
      });
      
      if (notificationResult.success) {
        console.log(`🔔 Admin notification scheduled: ${notificationResult.notificationId}`);
      } else {
        console.log(`⚠️ Admin notification failed: ${notificationResult.error}`);
      }
    } catch (notificationError) {
      console.error('❌ Notification error (non-blocking):', notificationError);
      // Don't fail ticket creation if notification fails
    }
    
    return sendResponse(res, 201, result, 'Ticket created successfully');
    
  } catch (error) {
    console.error('Create ticket error:', error);
    return sendResponse(res, 500, null, 'Failed to create ticket');
  }
};

// --- GET TICKETS LIST ---
export const getTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      category,
      assignee,
      creator,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;
    
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    // Build where clause
    const where = {
      deletedAt: null // Only show non-deleted tickets
    };
    
    // Status filter
    if (status) {
      const statusArray = status.split(',');
      where.status = { in: statusArray };
    }
    
    // Priority filter
    if (priority) {
      const priorityArray = priority.split(',');
      where.priority = { in: priorityArray };
    }
    
    // Category filter
    if (category) {
      const categoryArray = category.split(',');
      where.category = { in: categoryArray };
    }
    
    // Assignee filter
    if (assignee) {
      where.assignedTo = assignee;
    }
    
    // Creator filter
    if (creator) {
      where.createdBy = creator;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Validate sort field
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'priority', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    
    // Get tickets and total count
    const [tickets, totalCount] = await Promise.all([
      prisma.helpdeskTicket.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, email: true, role: true } },
          assignedAgent: { select: { id: true, name: true, email: true, role: true } },
          conversation: { select: { id: true, name: true, type: true } },
          system: { select: { id: true, name: true } },
          comments: {
            include: {
              user: { select: { id: true, name: true, email: true, role: true } }
            },
            orderBy: { createdAt: 'asc' }
          },
          history: {
            include: {
              user: { select: { id: true, name: true, email: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { [sortField]: order },
        skip,
        take: limitNum
      }),
      prisma.helpdeskTicket.count({ where })
    ]);
    
    // Pagination metadata
    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalItems: totalCount,
      itemsPerPage: limitNum,
      hasNextPage: pageNum * limitNum < totalCount,
      hasPrevPage: pageNum > 1
    };
    
    return sendResponse(res, 200, tickets, `Retrieved ${tickets.length} tickets`, pagination);
    
  } catch (error) {
    console.error('Get tickets error:', error);
    return sendResponse(res, 500, null, 'Failed to retrieve tickets');
  }
};

// --- GET SINGLE TICKET ---
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticket = await prisma.helpdeskTicket.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        creator: { select: { id: true, name: true, email: true, role: true } },
        assignedAgent: { select: { id: true, name: true, email: true, role: true } },
        conversation: {
          include: {
            system: { select: { id: true, name: true } },
            channel: { select: { id: true, type: true } }
          }
        },
        comments: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        history: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        assignments: {
          include: {
            agent: { select: { id: true, name: true, email: true, role: true } },
            assigner: { select: { id: true, name: true, email: true, role: true } }
          },
          orderBy: { assignedAt: 'desc' }
        }
      }
    });
    
    if (!ticket) {
      return sendResponse(res, 404, null, 'Ticket not found');
    }
    
    return sendResponse(res, 200, ticket, 'Ticket retrieved successfully');
    
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    return sendResponse(res, 500, null, 'Failed to retrieve ticket');
  }
};

// --- UPDATE TICKET ---
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedBy = req.agent.id;
    
    // Get current ticket
    const currentTicket = await prisma.helpdeskTicket.findFirst({
      where: { id, deletedAt: null }
    });
    
    if (!currentTicket) {
      return sendResponse(res, 404, null, 'Ticket not found');
    }
    
    // Validation
    const errors = validateTicketData(updateData, true);
    if (errors.length > 0) {
      return sendResponse(res, 400, null, `Validation errors: ${errors.join(', ')}`);
    }
    
    // Status transition validation
    if (updateData.status && updateData.status !== currentTicket.status) {
      if (!validateStatusTransition(currentTicket.status, updateData.status)) {
        return sendResponse(res, 400, null, `Invalid status transition from ${currentTicket.status} to ${updateData.status}`);
      }
    }
    
    // Validate assignee if provided
    if (updateData.assignedTo) {
      const assignee = await prisma.agent.findUnique({
        where: { id: updateData.assignedTo }
      });
      if (!assignee) {
        return sendResponse(res, 400, null, 'Invalid assignee ID');
      }
    }
    
    // Update ticket with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Track changes for history
      const changes = {};
      for (const [key, value] of Object.entries(updateData)) {
        if (currentTicket[key] !== value) {
          changes[key] = { old: currentTicket[key], new: value };
        }
      }
      
      // Update resolved timestamp if status changed to RESOLVED
      if (updateData.status === 'RESOLVED' && currentTicket.status !== 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }
      
      // Update ticket
      const ticket = await tx.helpdeskTicket.update({
        where: { id },
        data: updateData,
        include: {
          creator: { select: { id: true, name: true, email: true, role: true } },
          assignedAgent: { select: { id: true, name: true, email: true, role: true } },
          conversation: { select: { id: true, name: true, type: true } },
          system: { select: { id: true, name: true } }
        }
      });
      
      // Create history records
      for (const [field, change] of Object.entries(changes)) {
        await tx.ticketHistory.create({
          data: {
            ticketId: id,
            field,
            oldValue: change.old?.toString() || null,
            newValue: change.new?.toString() || null,
            changedBy: updatedBy
          }
        });
      }
      
      // Create assignment record if assignee changed
      if (changes.assignedTo) {
        await tx.ticketAssignment.create({
          data: {
            ticketId: id,
            agentId: updateData.assignedTo,
            assignedBy: updatedBy
          }
        });
      }
      
      return ticket;
    });
    
    return sendResponse(res, 200, result, 'Ticket updated successfully');
    
  } catch (error) {
    console.error('Update ticket error:', error);
    return sendResponse(res, 500, null, 'Failed to update ticket');
  }
};

// --- SOFT DELETE TICKET ---
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBy = req.agent.id;
    
    const ticket = await prisma.helpdeskTicket.findFirst({
      where: { id, deletedAt: null }
    });
    
    if (!ticket) {
      return sendResponse(res, 404, null, 'Ticket not found');
    }
    
    // Soft delete with history
    await prisma.$transaction(async (tx) => {
      await tx.helpdeskTicket.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      
      await tx.ticketHistory.create({
        data: {
          ticketId: id,
          field: 'deleted',
          oldValue: 'false',
          newValue: 'true',
          changedBy: deletedBy
        }
      });
    });
    
    return sendResponse(res, 200, null, 'Ticket deleted successfully');
    
  } catch (error) {
    console.error('Delete ticket error:', error);
    return sendResponse(res, 500, null, 'Failed to delete ticket');
  }
};

// --- ASSIGN TICKET ---
export const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    const assignedBy = req.agent.id;
    
    if (!agentId) {
      return sendResponse(res, 400, null, 'Agent ID is required');
    }
    
    // Validate agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });
    if (!agent) {
      return sendResponse(res, 400, null, 'Invalid agent ID');
    }
    
    // Get current ticket
    const ticket = await prisma.helpdeskTicket.findFirst({
      where: { id, deletedAt: null }
    });
    
    if (!ticket) {
      return sendResponse(res, 404, null, 'Ticket not found');
    }
    
    // Update with transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedTicket = await tx.helpdeskTicket.update({
        where: { id },
        data: { assignedTo: agentId },
        include: {
          creator: { select: { id: true, name: true, email: true, role: true } },
          assignedAgent: { select: { id: true, name: true, email: true, role: true } }
        }
      });
      
      await tx.ticketAssignment.create({
        data: {
          ticketId: id,
          agentId,
          assignedBy
        }
      });
      
      await tx.ticketHistory.create({
        data: {
          ticketId: id,
          field: 'assignedTo',
          oldValue: ticket.assignedTo,
          newValue: agentId,
          changedBy: assignedBy
        }
      });
      
      return updatedTicket;
    });
    
    return sendResponse(res, 200, result, 'Ticket assigned successfully');
    
  } catch (error) {
    console.error('Assign ticket error:', error);
    return sendResponse(res, 500, null, 'Failed to assign ticket');
  }
};

// --- CHANGE TICKET STATUS ---
export const changeTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const changedBy = req.agent.id;
    
    if (!status) {
      return sendResponse(res, 400, null, 'Status is required');
    }
    
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'REVIEW', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return sendResponse(res, 400, null, 'Invalid status');
    }
    
    const ticket = await prisma.helpdeskTicket.findFirst({
      where: { id, deletedAt: null }
    });
    
    if (!ticket) {
      return sendResponse(res, 404, null, 'Ticket not found');
    }
    
    if (ticket.status === status) {
      return sendResponse(res, 400, null, 'Ticket already has this status');
    }
    
    // Validate status transition
    if (!validateStatusTransition(ticket.status, status)) {
      return sendResponse(res, 400, null, `Invalid status transition from ${ticket.status} to ${status}`);
    }
    
    // Update with transaction
    const result = await prisma.$transaction(async (tx) => {
      const updateData = { status };
      if (status === 'RESOLVED' && ticket.status !== 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }
      
      const updatedTicket = await tx.helpdeskTicket.update({
        where: { id },
        data: updateData,
        include: {
          creator: { select: { id: true, name: true, email: true, role: true } },
          assignedAgent: { select: { id: true, name: true, email: true, role: true } }
        }
      });
      
      await tx.ticketHistory.create({
        data: {
          ticketId: id,
          field: 'status',
          oldValue: ticket.status,
          newValue: status,
          changedBy
        }
      });
      
      return updatedTicket;
    });
    
    return sendResponse(res, 200, result, 'Ticket status updated successfully');
    
  } catch (error) {
    console.error('Change ticket status error:', error);
    return sendResponse(res, 500, null, 'Failed to change ticket status');
  }
};

// --- CHANGE TICKET PRIORITY ---
export const changeTicketPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;
    const changedBy = req.agent.id;
    
    if (!priority) {
      return sendResponse(res, 400, null, 'Priority is required');
    }
    
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (!validPriorities.includes(priority)) {
      return sendResponse(res, 400, null, 'Invalid priority');
    }
    
    const ticket = await prisma.helpdeskTicket.findFirst({
      where: { id, deletedAt: null }
    });
    
    if (!ticket) {
      return sendResponse(res, 404, null, 'Ticket not found');
    }
    
    if (ticket.priority === priority) {
      return sendResponse(res, 400, null, 'Ticket already has this priority');
    }
    
    // Update with transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedTicket = await tx.helpdeskTicket.update({
        where: { id },
        data: { priority },
        include: {
          creator: { select: { id: true, name: true, email: true, role: true } },
          assignedAgent: { select: { id: true, name: true, email: true, role: true } }
        }
      });
      
      await tx.ticketHistory.create({
        data: {
          ticketId: id,
          field: 'priority',
          oldValue: ticket.priority,
          newValue: priority,
          changedBy
        }
      });
      
      return updatedTicket;
    });
    
    return sendResponse(res, 200, result, 'Ticket priority updated successfully');
    
  } catch (error) {
    console.error('Change ticket priority error:', error);
    return sendResponse(res, 500, null, 'Failed to change ticket priority');
  }
};

// --- ADD COMMENT ---
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.agent.id;
    
    if (!content || content.trim().length === 0) {
      return sendResponse(res, 400, null, 'Comment content is required');
    }
    
    const ticket = await prisma.helpdeskTicket.findFirst({
      where: { id, deletedAt: null }
    });
    
    if (!ticket) {
      return sendResponse(res, 404, null, 'Ticket not found');
    }
    
    const comment = await prisma.ticketComment.create({
      data: {
        content: content.trim(),
        ticketId: id,
        userId
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        ticket: { select: { id: true, title: true } }
      }
    });
    
    return sendResponse(res, 201, comment, 'Comment added successfully');
    
  } catch (error) {
    console.error('Add comment error:', error);
    return sendResponse(res, 500, null, 'Failed to add comment');
  }
};

// --- GET TICKET HISTORY ---
export const getTicketHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticket = await prisma.helpdeskTicket.findFirst({
      where: { id, deletedAt: null },
      select: { id: true }
    });
    
    if (!ticket) {
      return sendResponse(res, 404, null, 'Ticket not found');
    }
    
    const history = await prisma.ticketHistory.findMany({
      where: { ticketId: id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return sendResponse(res, 200, history, 'Ticket history retrieved successfully');
    
  } catch (error) {
    console.error('Get ticket history error:', error);
    return sendResponse(res, 500, null, 'Failed to retrieve ticket history');
  }
};
