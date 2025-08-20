import jwt from 'jsonwebtoken';
import prisma from '../db.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (e.g., "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get agent from the token and attach it to the request object
      req.agent = await prisma.agent.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true }, // Don't include the password
      });

      next(); // Move to the next step
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

export const adminOnly = (req, res, next) => {
  // Middleware này phải được dùng SAU middleware `protect`
  if (req.agent && req.agent.role === 'ADMIN') {
    next(); // Nếu là admin, cho đi tiếp
  } else {
    res.status(403).json({ error: 'Forbidden: Yêu cầu quyền Admin.' });
  }
};