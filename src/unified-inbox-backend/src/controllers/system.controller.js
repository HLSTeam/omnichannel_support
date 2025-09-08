import prisma from '../db.js';

// Hàm để tạo một hệ thống mới
const createSystem = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Tên hệ thống (name) là bắt buộc.' });
  }

  try {
    const newSystem = await prisma.system.create({
      data: {
        name: name,
      },
    });
    res.status(201).json(newSystem);
  } catch (error) {
    res.status(500).json({ error: 'Không thể tạo hệ thống.' });
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
  const { channels, name } = req.body;

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
  if (channelsData) updateData.channels = channelsData;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'Không có dữ liệu để cập nhật.' });
  }

  try {
    const updatedSystem = await prisma.system.update({
      where: { id: id },
      data: updateData,
      include: { Channel: true }, // Fix: dùng Channel thay vì channels
    });
    res.status(200).json(updatedSystem);
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Không tìm thấy hoặc không thể cập nhật hệ thống.' });
  }
};

export {
  createSystem,
  getAllSystems,
  updateSystem,
};