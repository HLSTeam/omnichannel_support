#!/usr/bin/env node

/**
 * Script đổi mật khẩu cho user admin
 * 
 * Chạy: node change-admin-password.js
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function changeAdminPassword() {
  try {
    console.log('🔐 Đang tìm user admin...');
    
    // Tìm admin user
    const admin = await prisma.agent.findFirst({
      where: { email: 'admin@hls.vn' },
      select: { id: true, email: true, name: true, role: true }
    });
    
    if (!admin) {
      console.log('❌ Không tìm thấy admin với email admin@hls.vn');
      console.log('📋 Danh sách users hiện có:');
      
      const allUsers = await prisma.agent.findMany({
        select: { id: true, email: true, name: true, role: true }
      });
      
      allUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.name}) - Role: ${user.role}`);
      });
      
      return;
    }
    
    console.log('✅ Tìm thấy admin:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    });
    
    // Tạo mật khẩu mới
    const newPassword = 'admin123'; // Mật khẩu mặc định
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log('🔑 Đang đổi mật khẩu...');
    
    // Cập nhật mật khẩu
    await prisma.agent.update({
      where: { id: admin.id },
      data: { 
        password: hashedPassword
      }
    });
    
    console.log('✅ Đã đổi mật khẩu thành công!');
    console.log('📋 Thông tin đăng nhập mới:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Mật khẩu: ${newPassword}`);
    console.log('\n⚠️  Lưu ý: Hãy đổi mật khẩu này sau khi đăng nhập!');
    
  } catch (error) {
    console.error('❌ Lỗi khi đổi mật khẩu:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
changeAdminPassword().catch(console.error);
