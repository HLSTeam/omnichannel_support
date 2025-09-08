import express from 'express';
import { protect } from '../middleware/protect.middleware.js';
import prisma from '../db.js';

const router = express.Router();

// GET /api/v1/agents - Get all agents (for ticket assignment, etc.)
router.get('/', protect, async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    res.json({
      status: 'success',
      data: agents
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch agents'
    });
  }
});

// GET /api/v1/agents/:id - Get single agent
router.get('/:id', protect, async (req, res) => {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    if (!agent) {
      return res.status(404).json({
        status: 'error',
        message: 'Agent not found'
      });
    }
    
    res.json({
      status: 'success',
      data: agent
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch agent'
    });
  }
});

export default router;
