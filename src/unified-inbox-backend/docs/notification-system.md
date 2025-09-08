# Notification System Documentation

## Overview

The Notification System provides automated admin notifications for helpdesk tickets without blocking ticket creation. It uses a background job queue system with Redis and Bull Queue for reliable, scalable notification processing.

## Architecture

### Components

1. **Notification Service** (`src/services/notification.service.js`)
   - Handles notification logic and message generation
   - Non-blocking execution
   - Priority-based notification rules

2. **Queue Service** (`src/services/queue.service.js`)
   - Background job processing with Bull Queue
   - Redis-based job storage
   - Automatic retry and error handling

3. **Database Models**
   - `NotificationLog`: Main notification records
   - `NotificationChannelLog`: Channel-specific delivery logs

4. **API Endpoints** (`/api/v1/notifications`)
   - Statistics and monitoring
   - Notification management
   - Retry failed notifications

## Features

### Priority-Based Processing

- **URGENT**: Immediate, all channels (Telegram + Email + Slack)
- **HIGH**: 1 second delay, Telegram + Email
- **MEDIUM**: 5 second delay, Telegram only
- **LOW**: 10 second delay, Telegram only

### Notification Channels

- **Telegram**: Primary channel for all priorities
- **Email**: High and urgent tickets
- **Slack**: Urgent tickets only

### Error Handling

- Automatic retry with exponential backoff
- Non-blocking execution
- Comprehensive logging
- Graceful degradation

## Setup

### 1. Install Dependencies

```bash
npm install bull ioredis
```

### 2. Start Redis

```bash
# Using Docker Compose
docker-compose -f docker-compose.redis.yml up -d

# Or manually
docker run -d -p 6379:6379 redis:7-alpine
```

### 3. Environment Variables

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_URL=redis://localhost:6379
```

### 4. Database Migration

```bash
# Apply notification system migration
npx prisma db push

# Or create migration
npx prisma migrate dev --name add_notification_system
```

## Usage

### Basic Notification

```javascript
import { notifyAdminTeam } from '../services/notification.service.js';

// In your controller
const notificationResult = await notifyAdminTeam({
  id: ticket.id,
  title: ticket.title,
  priority: ticket.priority,
  // ... other ticket data
});

if (notificationResult.success) {
  console.log('Notification scheduled:', notificationResult.notificationId);
}
```

### Queue Management

```javascript
import { 
  getQueueStats, 
  cleanupCompletedJobs 
} from '../services/queue.service.js';

// Get queue statistics
const stats = await getQueueStats();

// Clean up old jobs
await cleanupCompletedJobs();
```

## API Endpoints

### GET `/api/v1/notifications/stats`
Get notification and queue statistics.

### GET `/api/v1/notifications`
List notifications with pagination and filtering.

### GET `/api/v1/notifications/:id`
Get notification details by ID.

### POST `/api/v1/notifications/:id/retry`
Retry a failed notification.

### DELETE `/api/v1/notifications/:id`
Delete a notification (admin only).

## Testing

### Run Test Script

```bash
node test-notification-system.js
```

### Manual Testing

1. Create a ticket via API
2. Check notification logs in database
3. Monitor queue processing
4. Verify channel delivery

## Monitoring

### Queue Dashboard

Access Redis Commander at `http://localhost:8081` for queue monitoring.

### Logs

The system provides comprehensive logging:
- 🔔 Notification scheduling
- 📤 Channel delivery
- ❌ Error handling
- 🔄 Retry attempts
- ✅ Success confirmations

### Metrics

- Notification success/failure rates
- Channel delivery statistics
- Queue performance metrics
- Processing times by priority

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis service status
   - Verify connection settings
   - Check firewall/network

2. **Queue Jobs Not Processing**
   - Verify queue workers are running
   - Check Redis memory usage
   - Review job configuration

3. **Notifications Not Sent**
   - Check channel configuration
   - Verify API credentials
   - Review error logs

### Debug Mode

Enable detailed logging by setting environment variables:

```env
DEBUG=notification:*
LOG_LEVEL=debug
```

## Performance

### Optimization Tips

1. **Batch Processing**: Group notifications by priority
2. **Connection Pooling**: Reuse Redis connections
3. **Job Cleanup**: Regular cleanup of completed jobs
4. **Monitoring**: Track queue performance metrics

### Scaling

- Multiple queue workers
- Redis clustering
- Load balancing
- Horizontal scaling

## Security

### Access Control

- Admin-only notification management
- Role-based API access
- Secure Redis configuration
- API key authentication

### Data Protection

- Sensitive data filtering
- Audit logging
- Secure channel communication
- Rate limiting

## Future Enhancements

### Planned Features

1. **Webhook Notifications**: Custom webhook endpoints
2. **Template System**: Customizable notification templates
3. **Scheduling**: Delayed notifications
4. **Analytics**: Advanced reporting and insights
5. **Mobile Push**: Push notification support

### Integration Options

- Slack webhooks
- Microsoft Teams
- Discord
- Custom APIs
- SMS services

## Support

For issues and questions:

1. Check the logs for error details
2. Review this documentation
3. Test with the provided test script
4. Check Redis and queue status
5. Verify database connectivity

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team
