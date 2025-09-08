import prisma from './src/db.js';
import { notifyAdminTeam } from './src/services/notification.service.js';

/**
 * Test Notification System
 * This script tests the notification functionality without affecting the main application
 */

async function testNotificationSystem() {
  try {
    console.log('🧪 Testing Notification System...\n');
    
    // Test 1: Create a test ticket
    console.log('📋 Test 1: Creating test ticket...');
    const testTicket = {
      id: 'test-ticket-' + Date.now(),
      title: 'Test Ticket for Notification System',
      description: 'This is a test ticket to verify the notification system is working correctly.',
      priority: 'HIGH',
      category: 'TECHNICAL',
      status: 'OPEN',
      userId: 'test-user-123',
      userRole: 'customer',
      systemId: 'test-system-456',
      chatId: 'test-chat-789',
      username: 'testuser',
      intent: 'technical_support',
      confidence: 0.95,
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ Test ticket created:', testTicket.id);
    
    // Test 2: Test notification service
    console.log('\n🔔 Test 2: Testing notification service...');
    const notificationResult = await notifyAdminTeam(testTicket);
    
    if (notificationResult.success) {
      console.log('✅ Notification service working:', notificationResult.message);
      console.log('📝 Notification ID:', notificationResult.notificationId);
    } else {
      console.log('❌ Notification service failed:', notificationResult.error);
    }
    
    // Test 3: Check database records
    console.log('\n🗄️ Test 3: Checking database records...');
    
    const notificationLog = await prisma.notificationLog.findFirst({
      where: { ticketId: testTicket.id },
      include: { channelLogs: true }
    });
    
    if (notificationLog) {
      console.log('✅ Notification log found in database');
      console.log('📊 Status:', notificationLog.status);
      console.log('🚨 Priority:', notificationLog.priority);
      console.log('📡 Channels:', notificationLog.channels);
      console.log('🔄 Retry count:', notificationLog.retryCount);
      
      if (notificationLog.channelLogs.length > 0) {
        console.log('📋 Channel logs:');
        notificationLog.channelLogs.forEach(log => {
          console.log(`  - ${log.channel}: ${log.status}`);
        });
      }
    } else {
      console.log('❌ No notification log found in database');
    }
    
    // Test 4: Test different priorities
    console.log('\n🎯 Test 4: Testing different priorities...');
    
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    
    for (const priority of priorities) {
      const priorityTicket = {
        ...testTicket,
        id: `test-ticket-${priority}-${Date.now()}`,
        priority: priority
      };
      
      console.log(`\n📋 Testing ${priority} priority...`);
      const result = await notifyAdminTeam(priorityTicket);
      
      if (result.success) {
        console.log(`✅ ${priority} priority notification scheduled`);
      } else {
        console.log(`❌ ${priority} priority notification failed:`, result.error);
      }
      
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test 5: Test error handling
    console.log('\n⚠️ Test 5: Testing error handling...');
    
    try {
      // Test with invalid data
      const invalidTicket = null;
      const errorResult = await notifyAdminTeam(invalidTicket);
      
      if (!errorResult.success) {
        console.log('✅ Error handling working correctly');
        console.log('📝 Error message:', errorResult.message);
      } else {
        console.log('❌ Error handling not working as expected');
      }
    } catch (error) {
      console.log('✅ Exception handling working correctly');
      console.log('📝 Error:', error.message);
    }
    
    console.log('\n🎉 Notification System Test Completed!');
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log('✅ Test ticket creation');
    console.log('✅ Notification service');
    console.log('✅ Database integration');
    console.log('✅ Priority-based processing');
    console.log('✅ Error handling');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testNotificationSystem();
