import prisma from '../db.js';
import telegramService from '../services/telegram.service.js';

// Hàm tạo bản xem trước và phiên gửi tin
export const createPreview = async (req, res) => {
  const { filters, content } = req.body;
  const agentId = req.agent.id; // Lấy từ middleware `protect`

  if (!filters || !content) {
    return res.status(400).json({ error: 'Thiếu bộ lọc (filters) hoặc nội dung (content).' });
  }

  try {
    // 1. Xây dựng điều kiện lọc dựa trên input từ n8n
    const whereClause = {
      groupType: filters.groupType || undefined,
      // Lọc các conversation có chứa TẤT CẢ các tag được yêu cầu
      tags: filters.tags ? { hasEvery: filters.tags } : undefined,
    };

    // 2. Tìm tất cả các cuộc trò chuyện phù hợp
    const targetConversations = await prisma.conversation.findMany({
      where: whereClause,
    });

    if (targetConversations.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm chat nào phù hợp với bộ lọc.' });
    }

    // 3. Tạo một phiên gửi tin mới với trạng thái PENDING
    const session = await prisma.broadcastSession.create({
      data: {
        content: content,
        filtersJson: filters,
        targetCount: targetConversations.length,
        targetIds: targetConversations.map(c => c.platformChatId),
        createdByAgentId: agentId,
        status: 'PENDING',
      },
    });

    // 4. Trả về bản tóm tắt cho n8n
    res.status(201).json({
      sessionId: session.id,
      message: `Bạn sắp gửi thông báo tới ${session.targetCount} nhóm.`,
      filters: filters,
      content: content,
    });
  } catch (error) {
    console.error("Lỗi khi tạo xem trước:", error);
    res.status(500).json({ error: 'Không thể tạo bản xem trước.' });
  }
};

// Hàm thực thi gửi tin hàng loạt
export const executeBroadcast = async (req, res) => {
    const { sessionId } = req.body;
    const agentId = req.agent.id;

    if (!sessionId) {
        return res.status(400).json({ error: 'Thiếu sessionId.' });
    }

    try {
        const session = await prisma.broadcastSession.findUnique({
            where: { id: sessionId },
        });

        // Kiểm tra xem phiên có tồn tại và đang chờ không
        if (!session || session.status !== 'PENDING') {
            return res.status(404).json({ error: 'Phiên gửi tin không hợp lệ hoặc đã được gửi.' });
        }

        // Lấy thông tin kênh để gửi tin (giả định tất cả các nhóm trong 1 lần broadcast thuộc 1 system)
        // Cần nâng cấp logic này nếu muốn gửi chéo hệ thống
        const firstConversation = await prisma.conversation.findFirst({
            where: { platformChatId: session.targetIds[0] },
            include: { channel: true }
        });

        if (!firstConversation) {
             return res.status(500).json({ error: 'Không thể xác định kênh để gửi tin.' });
        }
        const token = firstConversation.channel.token;


        // Cập nhật trạng thái sang EXECUTING
        await prisma.broadcastSession.update({
            where: { id: sessionId },
            data: { status: 'EXECUTING', executedAt: new Date() },
        });

        res.status(202).json({ message: `Đã bắt đầu gửi tin tới ${session.targetCount} nhóm.` });

        // Bắt đầu gửi tin (chạy ngầm, không để admin phải chờ)
        (async () => {
            let successCount = 0;
            for (const chatId of session.targetIds) {
                try {
                    await telegramService.sendMessage(token, chatId, session.content);
                    successCount++;
                } catch (err) {
                    console.error(`Lỗi khi gửi broadcast tới chat ID ${chatId}:`, err);
                }
            }
            // Sau khi gửi xong, cập nhật trạng thái
            await prisma.broadcastSession.update({
                where: { id: sessionId },
                data: { status: 'SENT' },
            });
            console.log(`✅ Gửi broadcast hoàn tất. Thành công: ${successCount}/${session.targetCount}`);
        })();

    } catch (error) {
        console.error("Lỗi khi thực thi gửi tin:", error);
        // Có thể thêm logic để cập nhật trạng thái FAILED ở đây
        // res.status(500).json({ error: 'Không thể thực thi gửi tin.' });
    }
};