import prisma from '../db.js';
import elasticsearchService from '../services/elasticsearch.service.js';

// Hàm để tạo một hệ thống mới
const createSystem = async (req, res) => {
  const { name, elasticUrl } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Tên hệ thống (name) là bắt buộc.' });
  }

  try {
    const newSystem = await prisma.system.create({
      data: {
        name: name,
        elasticUrl: elasticUrl || null,
      },
    });
    res.status(201).json({
      status: 'success',
      data: newSystem
    });
  } catch (error) {
    console.error('Error creating system:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Không thể tạo hệ thống.',
      message: error.message
    });
  }
};

// Hàm để lấy danh sách tất cả hệ thống
const getAllSystems = async (req, res) => {
  try {
    const allSystems = await prisma.system.findMany({
      include: { Channel: true }, // Fix: dùng Channel thay vì channels
    });
    res.status(200).json({
      status: 'success',
      data: allSystems
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Không thể lấy danh sách hệ thống.',
      error: error.message
    });
  }
};

// Hàm để cập nhật một hệ thống (để thêm kênh)
const updateSystem = async (req, res) => {
  const { id } = req.params;
  const { channels, name, elasticUrl } = req.body;

  // Kiểm tra thông tin kênh Telegram nếu có
  let channelsData = undefined;
  if (channels && channels.telegram && channels.telegram.token) {
    channelsData = {
      upsert: {
        where: { systemId_type: { systemId: id, type: 'TELEGRAM' } },
        update: { token: channels.telegram.token },
        create: { type: 'TELEGRAM', token: channels.telegram.token },
      },
    };
  }

  // Tạo object data để cập nhật
  const updateData = {};
  if (name) updateData.name = name;
  if (elasticUrl !== undefined) updateData.elasticUrl = elasticUrl;
  if (channelsData) updateData.channels = channelsData;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ 
      status: 'error',
      error: 'Không có dữ liệu để cập nhật.' 
    });
  }

  try {
    const updatedSystem = await prisma.system.update({
      where: { id: id },
      data: updateData,
      include: { Channel: true }, // Fix: dùng Channel thay vì channels
    });
    
    // Clear Elasticsearch URL cache if elasticUrl was updated
    if (elasticUrl !== undefined) {
      elasticsearchService.clearUrlCache(id);
      console.log(`🔄 Cleared Elasticsearch URL cache for system ${id}`);
    }
    
    res.status(200).json({
      status: 'success',
      data: updatedSystem
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({ 
      status: 'error',
      error: 'Không tìm thấy hoặc không thể cập nhật hệ thống.',
      message: error.message
    });
  }
};

// Hàm để xóa một hệ thống
const deleteSystem = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if system exists
    const existingSystem = await prisma.system.findUnique({
      where: { id: id },
      include: {
        Channel: true,
        Conversation: true,
        Rule: true,
        telegram_groups: true,
        helpdesk_tickets: true
      }
    });

    if (!existingSystem) {
      return res.status(404).json({ 
        status: 'error',
        error: 'Không tìm thấy hệ thống.' 
      });
    }

    // Check if system has related data
    const hasRelatedData = 
      existingSystem.Channel.length > 0 ||
      existingSystem.Conversation.length > 0 ||
      existingSystem.Rule.length > 0 ||
      existingSystem.telegram_groups.length > 0 ||
      existingSystem.helpdesk_tickets.length > 0;

    if (hasRelatedData) {
      return res.status(400).json({ 
        status: 'error',
        error: 'Không thể xóa hệ thống có dữ liệu liên quan. Vui lòng xóa các dữ liệu liên quan trước.',
        relatedData: {
          channels: existingSystem.Channel.length,
          conversations: existingSystem.Conversation.length,
          rules: existingSystem.Rule.length,
          telegramGroups: existingSystem.telegram_groups.length,
          tickets: existingSystem.helpdesk_tickets.length
        }
      });
    }

    // Delete the system
    await prisma.system.delete({
      where: { id: id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Hệ thống đã được xóa thành công.'
    });
  } catch (error) {
    console.error('Error deleting system:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Không thể xóa hệ thống.',
      message: error.message
    });
  }
};

export {
  createSystem,
  getAllSystems,
  updateSystem,
  deleteSystem,
};