import prisma from './src/db.js';

async function createTestData() {
  try {
    console.log('🔍 Tạo test data...');
    
    // Tạo test system nếu chưa có
    let system = await prisma.system.findFirst({
      where: { name: 'Test System' }
    });
    
    if (!system) {
      system = await prisma.system.create({
        data: {
          name: 'Test System'
        }
      });
    }
    console.log('✅ System:', system.name);
    
    // Tạo test channel trước
    let channel = await prisma.channel.findFirst({
      where: { systemId: system.id }
    });
    
    if (!channel) {
      channel = await prisma.channel.create({
        data: {
          type: 'TEST',
          token: 'test-token',
          systemId: system.id
        }
      });
    }
    
    // Tạo test conversation nếu chưa có
    let conversation = await prisma.conversation.findFirst({
      where: { id: 'test-conversation-001' }
    });
    
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          id: 'test-conversation-001',
          platformChatId: 'test-chat-001',
          name: 'Test Conversation',
          type: 'TEST',
          systemId: system.id,
          channelId: channel.id
        }
      });
    }
    console.log('✅ Conversation:', conversation.name);
    
    // Tạo test ticket
    const ticket = await prisma.helpdeskTicket.create({
      data: {
        title: 'Test Ticket 1',
        description: 'This is a test ticket for testing the helpdesk system',
        priority: 'MEDIUM',
        category: 'GENERAL',
        status: 'OPEN',
        conversationId: conversation.id,
        systemId: system.id,
        createdBy: '3f6923cf-04c8-45cc-9a3e-07c860a98030', // Use existing agent ID
        aiAssisted: false
      }
    });
    console.log('✅ Ticket created:', ticket.title);
    
    // Tạo test comment
    const comment = await prisma.ticketComment.create({
      data: {
        content: 'This is a test comment',
        ticketId: ticket.id,
        userId: '3f6923cf-04c8-45cc-9a3e-07c860a98030' // Use existing agent ID
      }
    });
    console.log('✅ Comment created:', comment.content);
    
    console.log('🎉 Test data created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
