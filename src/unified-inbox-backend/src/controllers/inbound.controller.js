import prisma from '../db.js';
import { getIo } from '../socket.js';

// This function receives a message forwarded from n8n
export const forwardMessageToAgent = async (req, res) => {
  // We expect n8n to send a clean JSON object with this structure
  const { systemId, chat, message } = req.body;
  const io = getIo();

  if (!systemId || !chat || !message || !message.text) {
    return res.status(400).json({ error: 'Invalid data structure from n8n.' });
  }

  try {
    const existingMessage = await prisma.message.findUnique({
      where: { platformMessageId: message.message_id.toString() }
    });

    // Nếu đã tồn tại, bỏ qua và trả về thành công
    if (existingMessage) {
      console.log(`Tin nhắn ${message.message_id} đã tồn tại. Bỏ qua.`);
      return res.status(200).json({ success: true, message: 'Tin nhắn đã tồn tại, bỏ qua.' });
    }

    const channel = await prisma.channel.findUnique({
      where: { systemId_type: { systemId: systemId, type: 'TELEGRAM' } },
    });

    if (!channel) {
      console.error(`Inbound Error: Channel not found for systemId: ${systemId}`);
      return res.status(404).json({ error: 'Channel configuration not found.' });
    }

    // This logic is nearly identical to the old webhook controller
    const conversation = await prisma.conversation.upsert({
      where: { channelId_platformChatId: { channelId: channel.id, platformChatId: chat.id.toString() } },
      update: { name: chat.title || `${chat.first_name || ''} ${chat.last_name || ''}`.trim() },
      create: {
        platformChatId: chat.id.toString(),
        channelId: channel.id,
        systemId: systemId,
        type: chat.type,
        name: chat.title || `${chat.first_name || ''} ${chat.last_name || ''}`.trim(),
      },
    });

    const savedMessage = await prisma.message.create({
      data: {
        platformMessageId: message.message_id.toString(),
        text: message.text,
        sender: 'USER',
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

    // Push the new message to the agent's UI in real-time
    io.emit('new_message', savedMessage);
    
    res.status(200).json({ success: true, message: 'Message forwarded successfully.' });
  } catch (error) {
    console.error('Error processing message from n8n:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};