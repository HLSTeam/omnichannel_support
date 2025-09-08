import prisma from './src/db.js';
import bcrypt from 'bcryptjs';

async function createSystemAgent() {
  try {
    console.log('🔍 Tạo System Agent mặc định...');
    
    // Kiểm tra xem đã có System Agent chưa
    let systemAgent = await prisma.agent.findFirst({
      where: { 
        email: 'system@n8n.integration',
        role: 'AGENT'
      }
    });
    
    if (!systemAgent) {
      // Tạo System Agent mặc định
      const hashedPassword = await bcrypt.hash('system-agent-password', 10);
      
      systemAgent = await prisma.agent.create({
        data: {
          name: 'System Agent (n8n)',
          email: 'system@n8n.integration',
          password: hashedPassword,
          role: 'AGENT'
        }
      });
      
      console.log('✅ System Agent đã được tạo:', systemAgent.name);
      console.log('🆔 Agent ID:', systemAgent.id);
    } else {
      console.log('✅ System Agent đã tồn tại:', systemAgent.name);
      console.log('🆔 Agent ID:', systemAgent.id);
    }
    
    return systemAgent;
    
  } catch (error) {
    console.error('❌ Lỗi tạo System Agent:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSystemAgent();
