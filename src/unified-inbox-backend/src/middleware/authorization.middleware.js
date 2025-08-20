
// Middleware này kiểm tra xem người dùng đã đăng nhập có phải là Admin hay không.
// LƯU Ý: Nó phải được sử dụng SAU middleware `protect`.
export const adminOnly = (req, res, next) => {
  // Middleware `protect` đã chạy trước và thêm thông tin `agent` vào `req`.
  if (req.agent && req.agent.role === 'ADMIN') {
    // Nếu đúng là Admin, cho phép request đi tiếp.
    next();
  } else {
    // Nếu không, trả về lỗi 403 Forbidden (Cấm truy cập).
    res.status(403).json({ error: 'Forbidden: Yêu cầu quyền Admin.' });
  }
};