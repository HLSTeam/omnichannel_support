import express from 'express';
import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  assignTicket,
  changeTicketStatus,
  changeTicketPriority,
  addComment,
  getTicketHistory
} from '../controllers/helpdesk.controller.js';
import { protect, adminOnly } from '../middleware/protect.middleware.js';
import { verifyN8nApiKey } from '../middleware/auth.middleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting middleware
const helpdeskRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Apply rate limiting to all helpdesk routes
router.use(helpdeskRateLimit);

// Note: Authentication is applied per-route, not globally

// Role-based access control middleware
const agentOrAdmin = (req, res, next) => {
  if (req.agent && (req.agent.role === 'AGENT' || req.agent.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ 
      status: 'error',
      message: 'Forbidden: Requires AGENT or ADMIN role.' 
    });
  }
};

// --- TICKET CRUD OPERATIONS ---

// POST /api/helpdesk/tickets - Create new ticket
// Support both JWT token (for web UI) and API key (for n8n)
router.post('/tickets', (req, res, next) => {
  // Check if it's an n8n request (has x-api-key)
  if (req.headers['x-api-key']) {
    return verifyN8nApiKey(req, res, next);
  }
  // Otherwise, use JWT authentication (for web UI)
  return protect(req, res, next);
}, (req, res, next) => {
  // Role check middleware - bypass for n8n requests
  if (req.headers['x-api-key']) {
    // n8n request - skip role check
    return next();
  }
  // Web UI request - check role
  return agentOrAdmin(req, res, next);
}, createTicket);

// GET /api/helpdesk/tickets - List tickets with pagination and filtering
router.get('/tickets', protect, agentOrAdmin, getTickets);

// GET /api/helpdesk/tickets/:id - Get single ticket by ID
router.get('/tickets/:id', protect, agentOrAdmin, getTicketById);

// PUT /api/helpdesk/tickets/:id - Update ticket
router.put('/tickets/:id', protect, agentOrAdmin, updateTicket);

// DELETE /api/helpdesk/tickets/:id - Soft delete ticket (admin only)
router.delete('/tickets/:id', protect, adminOnly, deleteTicket);

// --- ADVANCED TICKET OPERATIONS ---

// POST /api/helpdesk/tickets/:id/assign - Assign ticket to agent
router.post('/tickets/:id/assign', protect, agentOrAdmin, assignTicket);

// POST /api/helpdesk/tickets/:id/status - Change ticket status
router.post('/tickets/:id/status', protect, agentOrAdmin, changeTicketStatus);

// POST /api/helpdesk/tickets/:id/priority - Change ticket priority
router.post('/tickets/:id/priority', protect, agentOrAdmin, changeTicketPriority);

// POST /api/helpdesk/tickets/:id/comments - Add comment to ticket
router.post('/tickets/:id/comments', protect, agentOrAdmin, addComment);

// GET /api/helpdesk/tickets/:id/history - Get ticket change history
router.get('/tickets/:id/history', protect, agentOrAdmin, getTicketHistory);

export default router;
