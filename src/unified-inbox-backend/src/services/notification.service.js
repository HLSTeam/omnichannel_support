import prisma from '../db.js';

/**
 * Notification Service for Helpdesk Tickets
 * Handles admin notifications without blocking ticket creation
 */

// Notification channels configuration
const NOTIFICATION_CHANNELS = {
  TELEGRAM: 'telegram',
  EMAIL: 'email',
  SLACK: 'slack'
};

// Priority-based notification rules
const PRIORITY_NOTIFICATION_RULES = {
  URGENT: {
    channels: [NOTIFICATION_CHANNELS.TELEGRAM, NOTIFICATION_CHANNELS.EMAIL, NOTIFICATION_CHANNELS.SLACK],
    delay: 0, // Immediate
    retryCount: 3
  },
  HIGH: {
    channels: [NOTIFICATION_CHANNELS.TELEGRAM, NOTIFICATION_CHANNELS.EMAIL],
    delay: 1000, // 1 second delay
    retryCount: 2
  },
  MEDIUM: {
    channels: [NOTIFICATION_CHANNELS.TELEGRAM],
    delay: 5000, // 5 seconds delay
    retryCount: 1
  },
  LOW: {
    channels: [NOTIFICATION_CHANNELS.TELEGRAM],
    delay: 10000, // 10 seconds delay
    retryCount: 1
  }
};

/**
 * Generate notification message for admin team
 */
export const generateAdminNotificationMessage = (ticket) => {
  const priority = ticket.priority?.toUpperCase() || 'MEDIUM';
  const priorityEmoji = {
    URGENT: '🚨',
    HIGH: '⚠️',
    MEDIUM: '📋',
    LOW: '📝'
  };

  const message = 
    `${priorityEmoji[priority]} **NEW TICKET CREATED**\n\n` +
    `📋 **Ticket ID:** ${ticket.id}\n` +
    `📝 **Title:** ${ticket.title}\n` +
    `🏷️ **Category:** ${ticket.category}\n` +
    `🚨 **Priority:** ${priority}\n` +
    `👤 **User:** ${ticket.userId || 'N/A'} (${ticket.userRole || 'N/A'})\n` +
    `🔧 **System ID:** ${ticket.systemId || 'N/A'}\n` +
    `💬 **Chat ID:** ${ticket.chatId || 'N/A'}\n` +
    `👨‍💼 **Username:** ${ticket.username || 'N/A'}\n` +
    `🎯 **AI Intent:** ${ticket.intent || 'N/A'}\n` +
    `📊 **AI Confidence:** ${ticket.confidence ? (ticket.confidence * 100).toFixed(1) + '%' : 'N/A'}\n` +
    `⏰ **Created:** ${ticket.createdAt || new Date().toISOString()}\n` +
    `📊 **Status:** ${ticket.status || 'OPEN'}\n\n` +
    `📄 **Description:**\n${ticket.description}\n\n` +
    `🔗 **View Ticket:** http://helpdesk.example.com/tickets/${ticket.id}`;

  return message;
};

/**
 * Send notification to admin team (non-blocking)
 */
export const notifyAdminTeam = async (ticket) => {
  try {
    console.log(`🔔 Starting admin notification for ticket: ${ticket.id}`);
    
    // Generate notification message
    const message = generateAdminNotificationMessage(ticket);
    
    // Get notification rules based on priority
    const priority = (ticket.priority || 'MEDIUM').toUpperCase();
    const rules = PRIORITY_NOTIFICATION_RULES[priority] || PRIORITY_NOTIFICATION_RULES.MEDIUM;
    
    // Create notification record in database using existing model
    // For now, use first active admin telegram group as default
    const adminGroup = await prisma.telegram_groups.findFirst({
      where: { 
        groupType: 'ADMIN',
        isActive: true 
      }
    });
    
    if (!adminGroup) {
      throw new Error('No active admin Telegram group found for notifications');
    }

    const notificationRecord = await prisma.notification_logs.create({
      data: {
        telegramGroupId: adminGroup.id,
        messageContent: message,
        messageType: 'TICKET_CREATED',
        priority: priority.toLowerCase(),
        status: 'pending',
        referenceType: 'TICKET',
        referenceId: ticket.id
      }
    });

    console.log(`📝 Notification record created: ${notificationRecord.id}`);

    // Schedule notification processing (non-blocking)
    setTimeout(async () => {
      await processNotification(notificationRecord.id, ticket, rules);
    }, rules.delay);

    return {
      success: true,
      notificationId: notificationRecord.id,
      message: 'Notification scheduled successfully'
    };

  } catch (error) {
    console.error('❌ Error in notifyAdminTeam:', error);
    
    // Don't block ticket creation if notification fails
    return {
      success: false,
      error: error.message,
      message: 'Notification failed but ticket created successfully'
    };
  }
};

/**
 * Process notification (called asynchronously)
 */
const processNotification = async (notificationId, ticket, rules) => {
  try {
    console.log(`🔄 Processing notification: ${notificationId}`);
    
    // Update status to PROCESSING
    await prisma.notification_logs.update({
      where: { id: notificationId },
      data: { status: 'processing' }
    });

    // Send to each channel
    for (const channel of rules.channels) {
      try {
        await sendNotificationToChannel(channel, ticket, notificationId);
      } catch (channelError) {
        console.error(`❌ Channel ${channel} failed:`, channelError);
        
        // For now, just log the channel failure without creating channel log
        // TODO: Create separate model for channel logs when needed
      }
    }

    // Update notification status to COMPLETED
    await prisma.notification_logs.update({
      where: { id: notificationId },
      data: { 
        status: 'sent',
        sentAt: new Date()
      }
    });

    console.log(`✅ Notification processed: ${notificationId}`);

  } catch (error) {
    console.error(`❌ Error processing notification ${notificationId}:`, error);
    
    // Update status to FAILED
    await prisma.notification_logs.update({
      where: { id: notificationId },
      data: { 
        status: 'failed',
        errorMessage: error.message
      }
    });

    // Get notification for retry logic
    const notification = await prisma.notification_logs.findUnique({
      where: { id: notificationId }
    });

    // For now, skip retry logic since current model doesn't have retryCount field
    // TODO: Implement retry logic when proper notification model is created
  }
};

/**
 * Send notification to specific channel
 */
const sendNotificationToChannel = async (channel, ticket, notificationId) => {
  console.log(`📤 Sending to channel: ${channel}`);
  
  switch (channel) {
    case NOTIFICATION_CHANNELS.TELEGRAM:
      return await sendTelegramNotification(ticket, notificationId);
    
    case NOTIFICATION_CHANNELS.EMAIL:
      return await sendEmailNotification(ticket, notificationId);
    
    case NOTIFICATION_CHANNELS.SLACK:
      return await sendSlackNotification(ticket, notificationId);
    
    default:
      throw new Error(`Unknown channel: ${channel}`);
  }
};

/**
 * Send Telegram notification
 */
const sendTelegramNotification = async (ticket, notificationId) => {
  // TODO: Implement Telegram integration
  // For now, just log the action
  console.log(`📱 Telegram notification for ticket: ${ticket.id}`);
  
  // Just log success without database record for now
  // TODO: Implement proper channel logging when model is available
  
  return { success: true, channel: 'telegram' };
};

/**
 * Send Email notification
 */
const sendEmailNotification = async (ticket, notificationId) => {
  // TODO: Implement Email integration
  console.log(`📧 Email notification for ticket: ${ticket.id}`);
  
  // Just log success without database record for now
  // TODO: Implement proper channel logging when model is available
  
  return { success: true, channel: 'email' };
};

/**
 * Send Slack notification
 */
const sendSlackNotification = async (ticket, notificationId) => {
  // TODO: Implement Slack integration
  console.log(`💬 Slack notification for ticket: ${ticket.id}`);
  
  // Just log success without database record for now
  // TODO: Implement proper channel logging when model is available
  
  return { success: true, channel: 'slack' };
};

/**
 * Get notification statistics
 */
export const getNotificationStats = async () => {
  try {
    const stats = await prisma.notification_logs.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    return stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return {};
  }
};
