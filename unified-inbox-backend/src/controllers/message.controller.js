import prisma from '../db.js';
import { getIo } from '../socket.js';
import telegramService from '../services/telegram.service.js';

export const sendAgentMessage = async (req, res) => {
  const { conversationId, text } = req.body;
  const io = getIo();

  if (!conversationId || !text) {
    return res.status(400).json({ error: 'Thiếu conversationId hoặc nội dung tin nhắn.' });
  }

  try {
    // 1. Tìm thông tin cuộc trò chuyện và kênh để lấy token và chat id
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { channel: true },
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện.' });
    }

    // 2. Gửi tin nhắn tới Telegram trước
    await telegramService.sendMessage(
      conversation.channel.token,
      conversation.platformChatId,
      text
    );

    // 3. Lưu tin nhắn của nhân viên vào DB
    const newMessage = await prisma.message.create({
      data: {
        text: text,
        sender: 'AGENT', // Người gửi là nhân viên
        conversationId: conversationId,
        // ID tin nhắn từ nền tảng không có vì đây là tin nhắn nội bộ
        platformMessageId: `agent-${Date.now()}` 
      },
      include: {
        conversation: true,
      }
    });

    // 4. Phát sự kiện WebSocket để cập nhật giao diện real-time
    io.emit('new_message', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn từ nhân viên:", error);
    res.status(500).json({ error: 'Không thể gửi tin nhắn.' });
  }
};