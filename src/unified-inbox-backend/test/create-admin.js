// create-admin.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Hàm hỏi người dùng
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('--- Tạo tài khoản Admin đầu tiên ---');

  const email = await question('Nhập email cho Admin: ');
  const name = await question('Nhập tên cho Admin: ');
  const password = await question('Nhập mật khẩu cho Admin: ');

  if (!email || !name || !password) {
    console.error('Email, tên và mật khẩu không được để trống.');
    return;
  }

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.agent.create({
      data: {
        email: email,
        name: name,
        password: hashedPassword,
        role: 'ADMIN', // Gán vai trò là ADMIN
      },
    });
    console.log('✅ Tạo tài khoản Admin thành công!');
    console.log(admin);
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Lỗi: Email này đã tồn tại trong hệ thống.');
    } else {
      console.error('❌ Đã xảy ra lỗi:', error);
    }
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();