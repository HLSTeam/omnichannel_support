// src/socket.js (backend)

import { Server } from 'socket.io';

// Khởi tạo một biến io rỗng
let io;

// Tạo một hàm để khởi tạo io và gắn nó vào server
const initIo = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  // Logic xử lý kết nối có thể đặt ở đây
  io.on('connection', (socket) => {
    console.log('✅ Một người dùng đã kết nối:', socket.id);

    socket.on('disconnect', () => {
      console.log('❌ Người dùng đã ngắt kết nối:', socket.id);
    });
  });

  return io;
};

// Tạo một hàm để lấy instance của io đã được khởi tạo
const getIo = () => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo!");
  }
  return io;
};

export { initIo, getIo };