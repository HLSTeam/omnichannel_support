import prisma from '../db.js';

// Lấy tất cả cuộc trò chuyện, kèm theo tin nhắn cuối cùng
export const getAllConversations = async (req, res) => {
  const { systemId } = req.query;

  // Xây dựng điều kiện lọc cho Prisma
  const whereClause = {};
  if (systemId) {
    whereClause.systemId = systemId;
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: whereClause, // Áp dụng điều kiện lọc
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    res.status(200).json(conversations);
  } catch (error) {
    console.error("Lỗi khi lấy cuộc trò chuyện:", error);
    res.status(500).json({ error: 'Không thể lấy danh sách cuộc trò chuyện.' });
  }
};

// Lấy toàn bộ tin nhắn của một cuộc trò chuyện
export const getMessagesForConversation = async (req, res) => {
  const { id } = req.params;
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' }, // Sắp xếp để tin nhắn cũ nhất lên đầu
      include: {
        agent: {
          select: { // Chỉ lấy những thông tin cần thiết, không lấy password
            id: true,
            name: true,
          }
        }
      }
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error(`Lỗi khi lấy tin nhắn cho conversation ${id}:`, error);
    res.status(500).json({ error: 'Không thể lấy tin nhắn.' });
  }
};