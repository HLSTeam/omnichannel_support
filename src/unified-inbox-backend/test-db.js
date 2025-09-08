import prisma from './src/db.js';

async function testDB() {
  try {
    console.log('🔍 Kiểm tra database...');
    
    const agents = await prisma.agent.findMany();
    console.log('📋 Agents trong database:', agents);
    
    if (agents.length === 0) {
      console.log('❌ Không có agent nào trong database!');
    } else {
      console.log('✅ Có', agents.length, 'agents');
    }
    
  } catch (error) {
    console.error('❌ Lỗi database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();
