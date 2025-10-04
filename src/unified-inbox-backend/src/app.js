import express from 'express';
import { createServer } from 'http'; // <-- Import createServer
import cors from 'cors';
import 'dotenv/config';

import { initIo } from './socket.js';
import systemRoutes from './routes/system.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import messageRoutes from './routes/message.routes.js';
import ruleRoutes from './routes/rule.routes.js';
import inboundRoutes from './routes/inbound.routes.js';
import authRoutes from './routes/auth.routes.js';
import broadcastRoutes from './routes/broadcast.routes.js';
import telegramGroupsRoutes from './routes/telegram-groups.routes.js';
import groupTopicsRoutes from './routes/group-topics.routes.js';
import helpdeskRoutes from './routes/helpdesk.routes.js';
import agentsRoutes from './routes/agents.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import permissionRoutes from './routes/permission.routes.js';
import userDeclarationsRoutes from './routes/user-declarations.routes.js';

const app = express();
const httpServer = createServer(app); // <-- Tạo một server HTTP
const io = initIo(httpServer); // Khởi tạo Socket.IO từ module riêng

// Middleware
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/v1/systems', systemRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/rules', ruleRoutes);
app.use('/api/v1/inbound', inboundRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/broadcast', broadcastRoutes);
app.use('/api/v1/telegram-groups', telegramGroupsRoutes);
app.use('/api/v1/group-topics', groupTopicsRoutes);
app.use('/api/v1/helpdesk', helpdeskRoutes);
app.use('/api/v1/agents', agentsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/user-declarations', userDeclarationsRoutes);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => { // <-- Dùng httpServer.listen thay vì app.listen
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});