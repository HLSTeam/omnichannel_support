// src/controllers/rule.controller.js
import prisma from '../db.js';

// Lấy tất cả các luật của một hệ thống
export const getRulesBySystem = async (req, res) => {
  const { systemId } = req.query;
  if (!systemId) {
    return res.status(400).json({ error: 'Thiếu systemId.' });
  }
  try {
    const rules = await prisma.rule.findMany({
      where: { systemId: systemId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(rules);
  } catch (error) {
    res.status(500).json({ error: 'Không thể lấy danh sách luật.' });
  }
};

// Tạo một luật mới
export const createRule = async (req, res) => {
  const { keyword, response, systemId } = req.body;
  if (!keyword || !response || !systemId) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin: keyword, response, systemId.' });
  }
  try {
    const newRule = await prisma.rule.create({
      data: {
        keyword,
        response,
        systemId,
      },
    });
    res.status(201).json(newRule);
  } catch (error) {
    // Bắt lỗi nếu từ khóa đã tồn tại
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Từ khóa này đã tồn tại trong hệ thống.' });
    }
    res.status(500).json({ error: 'Không thể tạo luật mới.' });
  }
};

// Xóa một luật
export const deleteRule = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.rule.delete({
      where: { id: id },
    });
    // Trả về 204 No Content, nghĩa là xóa thành công và không có nội dung gì để trả về
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Không thể xóa luật.' });
  }
};