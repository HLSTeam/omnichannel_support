
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

/**
 * Generic authorization middleware that checks if user has required roles
 * @param {string[]} allowedRoles - Array of allowed roles
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.agent) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }
    
    if (allowedRoles.includes(req.agent.role)) {
      next();
    } else {
      res.status(403).json({ 
        error: `Forbidden: Required roles: ${allowedRoles.join(', ')}. User role: ${req.agent.role}` 
      });
    }
  };
};