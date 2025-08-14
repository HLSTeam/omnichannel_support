import express from 'express';
import { createServer } from 'http'; // <-- Import createServer
import cors from 'cors';
import 'dotenv/config';

import { initIo } from './socket.js';
import systemRoutes from './routes/system.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import messageRoutes from './routes/message.routes.js';

const app = express();
const httpServer = createServer(app); // <-- Tạo một server HTTP
const io = initIo(httpServer); // Khởi tạo Socket.IO từ module riêng

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/systems', systemRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/messages', messageRoutes);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => { // <-- Dùng httpServer.listen thay vì app.listen
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});