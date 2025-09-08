import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Bắt đầu tạo admin user...');

  try {
    // Tạo admin user
    const adminUser = await prisma.agent.upsert({
      where: { email: 'admin@hls.vn' },
      update: {
        password: await bcrypt.hash('admin123', 10)
      },
      create: {
        id: 'admin-001',
        email: 'admin@hls.vn',
        name: 'Admin User',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user đã được tạo/cập nhật:');
    console.log('   Email:', adminUser.email);
    console.log('   Password: admin123');
    console.log('   Role:', adminUser.role);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
