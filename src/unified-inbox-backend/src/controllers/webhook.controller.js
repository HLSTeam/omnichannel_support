import prisma from '../db.js';
import telegramService from '../services/telegram.service.js';
import { getIo } from '../socket.js';

const handleTelegramWebhook = async (req, res) => {
  const { systemId } = req.params;
  const telegramUpdate = req.body;
  const io = getIo();

  // Luôn trả về 200 OK ngay lập tức để tránh Telegram gửi lại request
  res.sendStatus(200);

  try {
    // 1. Tìm Channel tương ứng
    const channel = await prisma.channel.findUnique({
      where: {
        systemId_type: { systemId: systemId, type: 'TELEGRAM' },
      },
    });

    if (!channel || !channel.token) {
      console.error(`Webhook Lỗi: Không tìm thấy kênh TELEGRAM hoặc token cho systemId: ${systemId}`);
      return;
    }

    const token = channel.token;
    const message = telegramUpdate.message;

    // Chỉ xử lý tin nhắn văn bản
    if (message && message.text) {
      const platformChatId = message.chat.id.toString();
      const platformMessageId = message.message_id.toString();

      const rules = await prisma.rule.findMany({ where: { systemId: systemId } });
      const incomingText = message.text.toLowerCase();

      for (const rule of rules) {
        if (incomingText.includes(rule.keyword.toLowerCase())) {
          // TÌM THẤY TỪ KHÓA! BOT SẼ TRẢ LỜI
          console.log(`Bot đã kích hoạt bởi từ khóa: "${rule.keyword}" cho systemId: ${systemId}`);

          // Gửi câu trả lời tự động
          await telegramService.sendMessage(token, platformChatId, rule.response);

          // (Nâng cao tùy chọn): Bạn có thể lưu lại tin nhắn của người dùng và câu trả lời của bot
          // vào DB ở đây để nhân viên có thể xem lại lịch sử bot đã hoạt động.

          // Kết thúc sớm, không cần xử lý tiếp
          return; 
        }
      }

      // 2. Tìm hoặc Tạo một Cuộc trò chuyện (Conversation)
      const conversation = await prisma.conversation.upsert({
        where: {
          channelId_platformChatId: {
            channelId: channel.id,
            platformChatId: platformChatId,
          },
        },
        update: { 
        name: message.chat.title || `${message.chat.first_name || ''} ${message.chat.last_name || ''}`.trim()
        },
        create: {
          platformChatId: platformChatId,
          channelId: channel.id,
          systemId: systemId,
          type: message.chat.type,
          name: message.chat.title || `${message.chat.first_name || ''} ${message.chat.last_name || ''}`.trim()  
        },
      });
      
      console.log(`Đã tìm thấy/tạo cuộc trò chuyện ID: ${conversation.id}`);

      // 3. Lưu tin nhắn đến vào Database
      const savedMessage = await prisma.message.create({
        data: {
          platformMessageId: platformMessageId,
          text: message.text,
          sender: 'USER', // Tin nhắn này là từ người dùng
          conversationId: conversation.id,
        },
        include: {
          conversation: true,
          agent: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      console.log(`Đã lưu tin nhắn từ người dùng: "${message.text}"`);

      io.emit('new_message', savedMessage);

      // 4. Gửi tin nhắn trả lời (Logic như cũ)
      const system = await prisma.system.findUnique({ where: { id: systemId }});
      const replyText = `[${system.name}] Đã nhận được: "${message.text}"`;
      await telegramService.sendMessage(token, platformChatId, replyText);

    }
  } catch (error) {
    console.error('Lỗi nghiêm trọng khi xử lý webhook:', error);
  }
};

export {
  handleTelegramWebhook,
};