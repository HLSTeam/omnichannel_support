import prisma from '../db.js';
import { getNotificationStats } from '../services/notification.service.js';
import { getQueueStats } from '../services/queue.service.js';

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
 * Get notification statistics
 */
export const getNotificationStatistics = async (req, res) => {
  try {
    const [dbStats, queueStats] = await Promise.all([
      getNotificationStats(),
      getQueueStats()
    ]);
    
    const stats = {
      database: dbStats,
      queues: queueStats,
      summary: {
        totalNotifications: Object.values(dbStats).reduce((sum, count) => sum + count, 0),
        totalJobs: Object.values(queueStats).reduce((sum, queue) => 
          sum + Object.values(queue).reduce((qSum, count) => qSum + count, 0), 0
        )
      }
    };
    
    return sendResponse(res, 200, stats, 'Notification statistics retrieved successfully');
    
  } catch (error) {
    console.error('Error getting notification statistics:', error);
    return sendResponse(res, 500, null, 'Failed to get notification statistics');
  }
};

/**
 * Get notifications list with pagination
 */
export const getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      ticketId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    
    // Build where clause
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (ticketId) {
      where.ticketId = ticketId;
    }
    
    // Validate sort field
    const validSortFields = ['createdAt', 'updatedAt', 'priority', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    
    // Get notifications and total count
    const [notifications, totalCount] = await Promise.all([
      prisma.notificationLog.findMany({
        where,
        include: {
          ticket: {
            select: {
              id: true,
              title: true,
              priority: true,
              status: true
            }
          },
          channelLogs: {
            select: {
              channel: true,
              status: true,
              sentAt: true,
              error: true
            }
          }
        },
        orderBy: { [sortField]: order },
        skip,
        take: limitNum
      }),
      prisma.notificationLog.count({ where })
    ]);
    
    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limitNum);
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total: totalCount,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    };
    
    return sendResponse(res, 200, notifications, 'Notifications retrieved successfully', pagination);
    
  } catch (error) {
    console.error('Error getting notifications:', error);
    return sendResponse(res, 500, null, 'Failed to get notifications');
  }
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await prisma.notificationLog.findUnique({
      where: { id },
      include: {
        ticket: {
          select: {
            id: true,
            title: true,
            description: true,
            priority: true,
            category: true,
            status: true,
            createdAt: true
          }
        },
        channelLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!notification) {
      return sendResponse(res, 404, null, 'Notification not found');
    }
    
    return sendResponse(res, 200, notification, 'Notification retrieved successfully');
    
  } catch (error) {
    console.error('Error getting notification:', error);
    return sendResponse(res, 500, null, 'Failed to get notification');
  }
};

/**
 * Retry failed notification
 */
export const retryNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await prisma.notificationLog.findUnique({
      where: { id },
      include: {
        ticket: true
      }
    });
    
    if (!notification) {
      return sendResponse(res, 404, null, 'Notification not found');
    }
    
    if (notification.status === 'COMPLETED') {
      return sendResponse(res, 400, null, 'Cannot retry completed notification');
    }
    
    // Reset notification status
    await prisma.notificationLog.update({
      where: { id },
      data: {
        status: 'PENDING',
        retryCount: 0,
        error: null
      }
    });
    
    // Clear failed channel logs
    await prisma.notificationChannelLog.deleteMany({
      where: {
        notificationId: id,
        status: 'FAILED'
      }
    });
    
    // TODO: Add retry job to queue
    console.log(`🔄 Retrying notification: ${id}`);
    
    return sendResponse(res, 200, { id }, 'Notification retry initiated successfully');
    
  } catch (error) {
    console.error('Error retrying notification:', error);
    return sendResponse(res, 500, null, 'Failed to retry notification');
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await prisma.notificationLog.findUnique({
      where: { id }
    });
    
    if (!notification) {
      return sendResponse(res, 404, null, 'Notification not found');
    }
    
    // Delete notification and related channel logs
    await prisma.$transaction([
      prisma.notificationChannelLog.deleteMany({
        where: { notificationId: id }
      }),
      prisma.notificationLog.delete({
        where: { id }
      })
    ]);
    
    return sendResponse(res, 200, null, 'Notification deleted successfully');
    
  } catch (error) {
    console.error('Error deleting notification:', error);
    return sendResponse(res, 500, null, 'Failed to delete notification');
  }
};
