import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHelpdeskData() {
  try {
    console.log('🌱 Starting Helpdesk Ticket seed data creation...');

    // Create sample agents if they don't exist
    const adminAgent = await prisma.agent.upsert({
      where: { email: 'admin@helpdesk.com' },
      update: {},
      create: {
        email: 'admin@helpdesk.com',
        name: 'Admin Agent',
        password: 'hashed_password_here', // In real app, hash this
        role: 'ADMIN'
      }
    });

    const supportAgent = await prisma.agent.upsert({
      where: { email: 'support@helpdesk.com' },
      update: {},
      create: {
        email: 'support@helpdesk.com',
        name: 'Support Agent',
        password: 'hashed_password_here', // In real app, hash this
        role: 'AGENT'
      }
    });

    const customerAgent = await prisma.agent.upsert({
      where: { email: 'customer@helpdesk.com' },
      update: {},
      create: {
        email: 'customer@helpdesk.com',
        name: 'Customer Agent',
        password: 'hashed_password_here', // In real app, hash this
        role: 'AGENT'
      }
    });

    console.log('✅ Agents created:', { adminAgent: adminAgent.id, supportAgent: supportAgent.id, customerAgent: customerAgent.id });

    // Create sample system and channel if they don't exist
    let system = await prisma.system.findFirst({
      where: { name: 'Helpdesk System' }
    });

    if (!system) {
      system = await prisma.system.create({
        data: {
          name: 'Helpdesk System'
        }
      });
      console.log('✅ New system created:', system.id);
    } else {
      console.log('✅ Existing system found:', system.id);
    }

    let channel = await prisma.channel.findFirst({
      where: { systemId: system.id, type: 'telegram' }
    });

    if (!channel) {
      channel = await prisma.channel.create({
        data: {
          type: 'telegram',
          token: 'sample_token_here',
          systemId: system.id
        }
      });
      console.log('✅ New channel created:', channel.id);
    } else {
      console.log('✅ Existing channel found:', channel.id);
    }

    console.log('✅ System and channel ready:', { systemId: system.id, channelId: channel.id });

    // Create sample conversations
    let conversation1 = await prisma.conversation.findFirst({
      where: { platformChatId: 'telegram_group_1' }
    });

    if (!conversation1) {
      conversation1 = await prisma.conversation.create({
        data: {
          platformChatId: 'telegram_group_1',
          name: 'General Support Group',
          type: 'group',
          systemId: system.id,
          channelId: channel.id
        }
      });
      console.log('✅ New conversation 1 created:', conversation1.id);
    } else {
      console.log('✅ Existing conversation 1 found:', conversation1.id);
    }

    let conversation2 = await prisma.conversation.findFirst({
      where: { platformChatId: 'telegram_group_2' }
    });

    if (!conversation2) {
      conversation2 = await prisma.conversation.create({
        data: {
          platformChatId: 'telegram_group_2',
          name: 'Technical Issues Group',
          type: 'group',
          systemId: system.id,
          channelId: channel.id
        }
      });
      console.log('✅ New conversation 2 created:', conversation2.id);
    } else {
      console.log('✅ Existing conversation 2 found:', conversation2.id);
    }

    console.log('✅ Conversations ready:', { conv1: conversation1.id, conv2: conversation2.id });

    // Create sample helpdesk tickets
    const tickets = await Promise.all([
      // High priority technical ticket
      prisma.helpdeskTicket.create({
        data: {
          title: 'System Login Issue',
          description: 'Users are unable to login to the system. Getting 500 error on login page.',
          priority: 'HIGH',
          category: 'TECHNICAL',
          status: 'OPEN',
          conversationId: conversation1.id,
          createdBy: adminAgent.id,
          aiAssisted: false
        }
      }),

      // Medium priority billing ticket
      prisma.helpdeskTicket.create({
        data: {
          title: 'Invoice Generation Problem',
          description: 'Monthly invoices are not being generated automatically. Need investigation.',
          priority: 'MEDIUM',
          category: 'BILLING',
          status: 'IN_PROGRESS',
          conversationId: conversation1.id,
          createdBy: supportAgent.id,
          assignedTo: adminAgent.id,
          aiAssisted: true
        }
      }),

      // Low priority general ticket
      prisma.helpdeskTicket.create({
        data: {
          title: 'Documentation Update Request',
          description: 'Need to update user manual with new features added in v2.1',
          priority: 'LOW',
          category: 'GENERAL',
          status: 'OPEN',
          conversationId: conversation2.id,
          createdBy: customerAgent.id,
          aiAssisted: false
        }
      }),

      // Urgent priority bug report
      prisma.helpdeskTicket.create({
        data: {
          title: 'Critical Data Loss Bug',
          description: 'Users are experiencing data loss when switching between tabs. This is affecting production.',
          priority: 'URGENT',
          category: 'BUG_REPORT',
          status: 'OPEN',
          conversationId: conversation2.id,
          createdBy: adminAgent.id,
          aiAssisted: true
        }
      }),

      // Feature request ticket
      prisma.helpdeskTicket.create({
        data: {
          title: 'Dark Mode Feature Request',
          description: 'Users are requesting dark mode theme for better visibility in low-light conditions.',
          priority: 'MEDIUM',
          category: 'FEATURE_REQUEST',
          status: 'REVIEW',
          conversationId: conversation1.id,
          createdBy: customerAgent.id,
          aiAssisted: false
        }
      })
    ]);

    console.log('✅ Helpdesk tickets created:', tickets.length);

    // Create sample ticket comments
    const comments = await Promise.all([
      prisma.ticketComment.create({
        data: {
          content: 'Investigating the login issue. Found some database connection problems.',
          ticketId: tickets[0].id,
          userId: supportAgent.id
        }
      }),

      prisma.ticketComment.create({
        data: {
          content: 'Database connection has been restored. Please test login again.',
          ticketId: tickets[0].id,
          userId: adminAgent.id
        }
      }),

      prisma.ticketComment.create({
        data: {
          content: 'Invoice generation script has been updated and tested.',
          ticketId: tickets[1].id,
          userId: adminAgent.id
        }
      })
    ]);

    console.log('✅ Ticket comments created:', comments.length);

    // Create sample ticket history
    const history = await Promise.all([
      prisma.ticketHistory.create({
        data: {
          ticketId: tickets[1].id,
          field: 'status',
          oldValue: 'OPEN',
          newValue: 'IN_PROGRESS',
          changedBy: adminAgent.id
        }
      }),

      prisma.ticketHistory.create({
        data: {
          ticketId: tickets[1].id,
          field: 'assignedTo',
          oldValue: null,
          newValue: adminAgent.id,
          changedBy: adminAgent.id
        }
      })
    ]);

    console.log('✅ Ticket history created:', history.length);

    // Create sample ticket assignments
    const assignments = await Promise.all([
      prisma.ticketAssignment.create({
        data: {
          ticketId: tickets[1].id,
          agentId: adminAgent.id,
          assignedBy: adminAgent.id
        }
      }),

      prisma.ticketAssignment.create({
        data: {
          ticketId: tickets[0].id,
          agentId: supportAgent.id,
          assignedBy: adminAgent.id
        }
      })
    ]);

    console.log('✅ Ticket assignments created:', assignments.length);

    console.log('🎉 Helpdesk Ticket seed data creation completed successfully!');
    console.log(`📊 Created: ${tickets.length} tickets, ${comments.length} comments, ${history.length} history records, ${assignments.length} assignments`);

  } catch (error) {
    console.error('❌ Error creating seed data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedHelpdeskData()
  .then(() => {
    console.log('✅ Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
