import prisma from './src/db.js';

async function createTestConversation() {
  try {
    console.log('🔍 Tạo test conversation...');
    
    // Tìm system đầu tiên
    const system = await prisma.system.findFirst();
    if (!system) {
      console.log('❌ Không có system nào trong database');
      return;
    }
    console.log('✅ System:', system.name);
    
    // Tạo channel
    const channel = await prisma.channel.create({
      data: {
        type: 'WEB',
        token: 'web-token-' + Date.now(),
        systemId: system.id
      }
    });
    console.log('✅ Channel created:', channel.type);
    
    // Tạo conversation
    const conversation = await prisma.conversation.create({
      data: {
        platformChatId: 'web-chat-' + Date.now(),
        name: 'Web Support Chat',
        type: 'WEB',
        systemId: system.id,
        channelId: channel.id
      }
    });
    console.log('✅ Conversation created:', conversation.name);
    console.log('🎉 Conversation ID:', conversation.id);
    
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestConversation();
