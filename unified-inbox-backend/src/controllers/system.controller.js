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
      include: { channels: true }, // Lấy luôn cả thông tin kênh liên quan
    });
    res.status(200).json(allSystems);
  } catch (error) {
    res.status(500).json({ error: 'Không thể lấy danh sách hệ thống.' });
  }
};

// Hàm để cập nhật một hệ thống (để thêm kênh)
const updateSystem = async (req, res) => {
  const { id } = req.params;
  const { channels } = req.body;

  if (!channels || !channels.telegram || !channels.telegram.token) {
      return res.status(400).json({ error: 'Thông tin kênh Telegram không hợp lệ.' });
  }

  try {
    // Dùng `upsert` để tạo mới nếu kênh chưa có, hoặc cập nhật nếu đã có
    const updatedSystem = await prisma.system.update({
      where: { id: id },
      data: {
        channels: {
          upsert: {
            where: { systemId_type: { systemId: id, type: 'TELEGRAM' } },
            update: { token: channels.telegram.token },
            create: { type: 'TELEGRAM', token: channels.telegram.token },
          },
        },
      },
      include: { channels: true },
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