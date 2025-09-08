import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helpdeskRoutes from '../src/routes/helpdesk.routes.js';
import { protect } from '../src/middleware/protect.middleware.js';
import prisma from '../src/db.js';

// Create test app
const app = express();
app.use(cors());
app.use(express.json());

// Mock authentication for testing
app.use((req, res, next) => {
  // Mock authenticated user
  req.agent = {
    id: '5ff857f8-cdc7-45ac-add7-b71ba5029bb8', // Admin agent from seed
    name: 'Admin Agent',
    email: 'admin@helpdesk.com',
    role: 'ADMIN'
  };
  next();
});

app.use('/api/v1/helpdesk', helpdeskRoutes);

describe('Helpdesk API Tests', () => {
  let testTicketId;
  let testConversationId;
  
  // Setup test data
  beforeAll(async () => {
    // Get a conversation from seed data
    const conversation = await prisma.conversation.findFirst();
    testConversationId = conversation.id;
  });
  
  afterAll(async () => {
    // Clean up test tickets
    if (testTicketId) {
      await prisma.helpdeskTicket.deleteMany({
        where: { title: { contains: 'Test Ticket' } }
      });
    }
    await prisma.$disconnect();
  });

  describe('POST /api/v1/helpdesk/tickets', () => {
    test('should create a new ticket successfully with conversation', async () => {
      const ticketData = {
        title: 'Test Ticket - API Test',
        description: 'This is a test ticket created via API',
        priority: 'HIGH',
        category: 'TECHNICAL',
        conversationId: testConversationId
      };

      const response = await request(app)
        .post('/api/v1/helpdesk/tickets')
        .send(ticketData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe(ticketData.title);
      expect(response.body.data.priority).toBe(ticketData.priority);
      expect(response.body.data.status).toBe('OPEN');
      
      testTicketId = response.body.data.id;
    });

    test('should create a new ticket successfully without conversation', async () => {
      const ticketData = {
        title: 'Test Ticket - No Conversation',
        description: 'This is a test ticket created without conversation',
        priority: 'MEDIUM',
        category: 'GENERAL'
        // No conversationId - should be optional now
      };

      const response = await request(app)
        .post('/api/v1/helpdesk/tickets')
        .send(ticketData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe(ticketData.title);
      expect(response.body.data.conversationId).toBeNull();
      
      testTicketId = response.body.data.id;
    });

    test('should fail with validation errors for invalid data', async () => {
      const invalidData = {
        title: '', // Empty title
        description: 'Test description',
        priority: 'INVALID_PRIORITY',
        category: 'TECHNICAL'
      };

      const response = await request(app)
        .post('/api/v1/helpdesk/tickets')
        .send(invalidData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Validation errors');
    });
  });

  describe('GET /api/v1/helpdesk/tickets', () => {
    test('should retrieve tickets with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/helpdesk/tickets')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.currentPage).toBe(1);
    });

    test('should filter tickets by status', async () => {
      const response = await request(app)
        .get('/api/v1/helpdesk/tickets')
        .query({ status: 'OPEN' })
        .expect(200);

      expect(response.body.status).toBe('success');
      response.body.data.forEach(ticket => {
        expect(ticket.status).toBe('OPEN');
      });
    });

    test('should search tickets by title', async () => {
      const response = await request(app)
        .get('/api/v1/helpdesk/tickets')
        .query({ search: 'Test Ticket' })
        .expect(200);

      expect(response.body.status).toBe('success');
      if (response.body.data.length > 0) {
        expect(response.body.data[0].title).toContain('Test Ticket');
      }
    });
  });

  describe('GET /api/v1/helpdesk/tickets/:id', () => {
    test('should retrieve a specific ticket by ID', async () => {
      if (!testTicketId) {
        // Create a ticket first if none exists
        const ticketData = {
          title: 'Test Ticket for GET',
          description: 'Test description',
          priority: 'MEDIUM',
          category: 'GENERAL',
          conversationId: testConversationId
        };

        const createResponse = await request(app)
          .post('/api/v1/helpdesk/tickets')
          .send(ticketData);
        
        testTicketId = createResponse.body.data.id;
      }

      const response = await request(app)
        .get(`/api/v1/helpdesk/tickets/${testTicketId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(testTicketId);
      expect(response.body.data.creator).toBeDefined();
      expect(response.body.data.conversation).toBeDefined();
    });

    test('should return 404 for non-existent ticket', async () => {
      const fakeId = 'non-existent-id';
      
      const response = await request(app)
        .get(`/api/v1/helpdesk/tickets/${fakeId}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Ticket not found');
    });
  });

  describe('PUT /api/v1/helpdesk/tickets/:id', () => {
    test('should update a ticket successfully', async () => {
      if (!testTicketId) return;

      const updateData = {
        title: 'Updated Test Ticket',
        priority: 'URGENT'
      };

      const response = await request(app)
        .put(`/api/v1/helpdesk/tickets/${testTicketId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.priority).toBe(updateData.priority);
    });

    test('should fail with invalid status transition', async () => {
      if (!testTicketId) return;

      const updateData = {
        status: 'RESOLVED' // Invalid transition from OPEN to RESOLVED
      };

      const response = await request(app)
        .put(`/api/v1/helpdesk/tickets/${testTicketId}`)
        .send(updateData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid status transition');
    });
  });

  describe('POST /api/v1/helpdesk/tickets/:id/assign', () => {
    test('should assign ticket to agent', async () => {
      if (!testTicketId) return;

      const supportAgent = await prisma.agent.findFirst({
        where: { email: 'support@helpdesk.com' }
      });

      const assignData = {
        agentId: supportAgent.id
      };

      const response = await request(app)
        .post(`/api/v1/helpdesk/tickets/${testTicketId}/assign`)
        .send(assignData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.assignedTo).toBe(supportAgent.id);
    });

    test('should fail with invalid agent ID', async () => {
      if (!testTicketId) return;

      const assignData = {
        agentId: 'invalid-agent-id'
      };

      const response = await request(app)
        .post(`/api/v1/helpdesk/tickets/${testTicketId}/assign`)
        .send(assignData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid agent ID');
    });
  });

  describe('POST /api/v1/helpdesk/tickets/:id/status', () => {
    test('should change ticket status successfully', async () => {
      if (!testTicketId) return;

      const statusData = {
        status: 'IN_PROGRESS'
      };

      const response = await request(app)
        .post(`/api/v1/helpdesk/tickets/${testTicketId}/status`)
        .send(statusData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.status).toBe('IN_PROGRESS');
    });
  });

  describe('POST /api/v1/helpdesk/tickets/:id/comments', () => {
    test('should add comment to ticket', async () => {
      if (!testTicketId) return;

      const commentData = {
        content: 'This is a test comment via API'
      };

      const response = await request(app)
        .post(`/api/v1/helpdesk/tickets/${testTicketId}/comments`)
        .send(commentData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.content).toBe(commentData.content);
      expect(response.body.data.user).toBeDefined();
    });

    test('should fail with empty comment content', async () => {
      if (!testTicketId) return;

      const commentData = {
        content: ''
      };

      const response = await request(app)
        .post(`/api/v1/helpdesk/tickets/${testTicketId}/comments`)
        .send(commentData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Comment content is required');
    });
  });

  describe('GET /api/v1/helpdesk/tickets/:id/history', () => {
    test('should retrieve ticket history', async () => {
      if (!testTicketId) return;

      const response = await request(app)
        .get(`/api/v1/helpdesk/tickets/${testTicketId}/history`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should have history records from previous updates
      if (response.body.data.length > 0) {
        expect(response.body.data[0].field).toBeDefined();
        expect(response.body.data[0].user).toBeDefined();
      }
    });
  });

  describe('Performance Tests', () => {
    test('should respond to single ticket requests within 200ms', async () => {
      if (!testTicketId) return;

      const startTime = Date.now();
      
      await request(app)
        .get(`/api/v1/helpdesk/tickets/${testTicketId}`)
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200);
    });

    test('should respond to ticket list requests within 500ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/v1/helpdesk/tickets')
        .query({ limit: 50 })
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500);
    });
  });
});
