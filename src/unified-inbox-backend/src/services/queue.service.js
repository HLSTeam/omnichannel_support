import Queue from 'bull';
import { redisConfig } from '../config/redis.js';

/**
 * Queue Service for Background Jobs
 * Uses Bull Queue with Redis for reliable job processing
 */

// Queue names
export const QUEUE_NAMES = {
  NOTIFICATION: 'notification-queue',
  EMAIL: 'email-queue',
  TELEGRAM: 'telegram-queue',
  SLACK: 'slack-queue'
};

// Job types
export const JOB_TYPES = {
  SEND_NOTIFICATION: 'send-notification',
  SEND_EMAIL: 'send-email',
  SEND_TELEGRAM: 'send-telegram',
  SEND_SLACK: 'send-slack',
  RETRY_NOTIFICATION: 'retry-notification'
};

// Create queues
const createQueue = (name, options = {}) => {
  return new Queue(name, {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 50,      // Keep last 50 failed jobs
      attempts: 3,            // Retry failed jobs 3 times
      backoff: {
        type: 'exponential',
        delay: 2000           // Start with 2 second delay
      }
    },
    ...options
  });
};

// Initialize queues
export const notificationQueue = createQueue(QUEUE_NAMES.NOTIFICATION, {
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

export const emailQueue = createQueue(QUEUE_NAMES.EMAIL);
export const telegramQueue = createQueue(QUEUE_NAMES.TELEGRAM);
export const slackQueue = createQueue(QUEUE_NAMES.SLACK);

/**
 * Add notification job to queue
 */
export const addNotificationJob = async (jobData, options = {}) => {
  try {
    const job = await notificationQueue.add(JOB_TYPES.SEND_NOTIFICATION, jobData, {
      priority: getPriorityLevel(jobData.priority),
      delay: getPriorityDelay(jobData.priority),
      ...options
    });
    
    console.log(`📋 Notification job added to queue: ${job.id}`);
    return job;
    
  } catch (error) {
    console.error('❌ Error adding notification job to queue:', error);
    throw error;
  }
};

/**
 * Add email job to queue
 */
export const addEmailJob = async (jobData, options = {}) => {
  try {
    const job = await emailQueue.add(JOB_TYPES.SEND_EMAIL, jobData, options);
    console.log(`📧 Email job added to queue: ${job.id}`);
    return job;
    
  } catch (error) {
    console.error('❌ Error adding email job to queue:', error);
    throw error;
  }
};

/**
 * Add Telegram job to queue
 */
export const addTelegramJob = async (jobData, options = {}) => {
  try {
    const job = await telegramQueue.add(JOB_TYPES.SEND_TELEGRAM, jobData, options);
    console.log(`📱 Telegram job added to queue: ${job.id}`);
    return job;
    
  } catch (error) {
    console.error('❌ Error adding Telegram job to queue:', error);
    throw error;
  }
};

/**
 * Add Slack job to queue
 */
export const addSlackJob = async (jobData, options = {}) => {
  try {
    const job = await slackQueue.add(JOB_TYPES.SEND_SLACK, jobData, options);
    console.log(`💬 Slack job added to queue: ${job.id}`);
    return job;
    
  } catch (error) {
    console.error('❌ Error adding Slack job to queue:', error);
    throw error;
  }
};

/**
 * Get priority level for job
 */
const getPriorityLevel = (priority) => {
  const priorityMap = {
    URGENT: 1,    // Highest priority
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4        // Lowest priority
  };
  
  return priorityMap[priority?.toUpperCase()] || priorityMap.MEDIUM;
};

/**
 * Get delay based on priority
 */
const getPriorityDelay = (priority) => {
  const delayMap = {
    URGENT: 0,        // No delay
    HIGH: 1000,       // 1 second
    MEDIUM: 5000,     // 5 seconds
    LOW: 10000        // 10 seconds
  };
  
  return delayMap[priority?.toUpperCase()] || delayMap.MEDIUM;
};

/**
 * Process notification jobs
 */
export const processNotificationJobs = () => {
  notificationQueue.process(JOB_TYPES.SEND_NOTIFICATION, async (job) => {
    try {
      console.log(`🔄 Processing notification job: ${job.id}`);
      
      const { ticket, channels, notificationId } = job.data;
      
      // Process each channel
      for (const channel of channels) {
        try {
          switch (channel) {
            case 'telegram':
              await processTelegramNotification(ticket, notificationId);
              break;
            case 'email':
              await processEmailNotification(ticket, notificationId);
              break;
            case 'slack':
              await processSlackNotification(ticket, notificationId);
              break;
            default:
              console.warn(`⚠️ Unknown channel: ${channel}`);
          }
        } catch (channelError) {
          console.error(`❌ Channel ${channel} failed:`, channelError);
          
          // Add retry job for failed channel
          await addRetryJob(channel, ticket, notificationId, channelError.message);
        }
      }
      
      console.log(`✅ Notification job completed: ${job.id}`);
      
    } catch (error) {
      console.error(`❌ Notification job failed: ${job.id}`, error);
      throw error; // This will trigger retry
    }
  });
};

/**
 * Process Telegram notifications
 */
const processTelegramNotification = async (ticket, notificationId) => {
  // TODO: Implement actual Telegram API call
  console.log(`📱 Sending Telegram notification for ticket: ${ticket.id}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update notification status
  await updateNotificationStatus(notificationId, 'telegram', 'SENT');
};

/**
 * Process Email notifications
 */
const processEmailNotification = async (ticket, notificationId) => {
  // TODO: Implement actual Email API call
  console.log(`📧 Sending Email notification for ticket: ${ticket.id}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Update notification status
  await updateNotificationStatus(notificationId, 'email', 'SENT');
};

/**
 * Process Slack notifications
 */
const processSlackNotification = async (ticket, notificationId) => {
  // TODO: Implement actual Slack API call
  console.log(`💬 Sending Slack notification for ticket: ${ticket.id}`);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Update notification status
  await updateNotificationStatus(notificationId, 'slack', 'SENT');
};

/**
 * Add retry job for failed notifications
 */
const addRetryJob = async (channel, ticket, notificationId, error) => {
  try {
    const retryJob = await addNotificationJob({
      ticket,
      channels: [channel],
      notificationId,
      retryCount: 1,
      error
    }, {
      delay: 30000, // 30 second delay before retry
      attempts: 1
    });
    
    console.log(`🔄 Retry job added for channel ${channel}: ${retryJob.id}`);
    
  } catch (retryError) {
    console.error(`❌ Failed to add retry job for channel ${channel}:`, retryError);
  }
};

/**
 * Update notification status in database
 */
const updateNotificationStatus = async (notificationId, channel, status) => {
  try {
    // This would update the database
    // For now, just log the status
    console.log(`📊 Notification ${notificationId} - Channel ${channel}: ${status}`);
    
  } catch (error) {
    console.error(`❌ Error updating notification status:`, error);
  }
};

/**
 * Get queue statistics
 */
export const getQueueStats = async () => {
  try {
    const [notificationStats, emailStats, telegramStats, slackStats] = await Promise.all([
      notificationQueue.getJobCounts(),
      emailQueue.getJobCounts(),
      telegramQueue.getJobCounts(),
      slackQueue.getJobCounts()
    ]);
    
    return {
      notification: notificationStats,
      email: emailStats,
      telegram: telegramStats,
      slack: slackStats
    };
    
  } catch (error) {
    console.error('❌ Error getting queue stats:', error);
    return {};
  }
};

/**
 * Clean up completed jobs
 */
export const cleanupCompletedJobs = async () => {
  try {
    await Promise.all([
      notificationQueue.clean(24 * 60 * 60 * 1000, 'completed'), // 24 hours
      emailQueue.clean(24 * 60 * 60 * 1000, 'completed'),
      telegramQueue.clean(24 * 60 * 60 * 1000, 'completed'),
      slackQueue.clean(24 * 60 * 60 * 1000, 'completed')
    ]);
    
    console.log('🧹 Cleaned up completed jobs');
    
  } catch (error) {
    console.error('❌ Error cleaning up jobs:', error);
  }
};

/**
 * Graceful shutdown
 */
export const shutdownQueues = async () => {
  try {
    await Promise.all([
      notificationQueue.close(),
      emailQueue.close(),
      telegramQueue.close(),
      slackQueue.close()
    ]);
    
    console.log('🔄 All queues closed gracefully');
    
  } catch (error) {
    console.error('❌ Error closing queues:', error);
  }
};

// Initialize job processing
processNotificationJobs();

// Cleanup jobs every hour
setInterval(cleanupCompletedJobs, 60 * 60 * 1000);

// Graceful shutdown on process termination
process.on('SIGTERM', shutdownQueues);
process.on('SIGINT', shutdownQueues);
