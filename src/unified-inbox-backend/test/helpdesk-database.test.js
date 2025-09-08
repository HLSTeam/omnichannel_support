import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testHelpdeskDatabase() {
  try {
    console.log('🧪 Starting Helpdesk Ticket database tests...');

    // Test 1: Query all tickets
    console.log('\n📋 Test 1: Query all tickets');
    const allTickets = await prisma.helpdeskTicket.findMany({
      include: {
        conversation: true,
        creator: true,
        assignedAgent: true,
        comments: true,
        history: true,
        assignments: true
      }
    });
    console.log(`✅ Found ${allTickets.length} tickets`);
    
    if (allTickets.length > 0) {
      const firstTicket = allTickets[0];
      console.log(`   First ticket: ${firstTicket.title} (${firstTicket.status})`);
      console.log(`   Priority: ${firstTicket.priority}, Category: ${firstTicket.category}`);
      console.log(`   Creator: ${firstTicket.creator.name} (${firstTicket.creator.role})`);
      console.log(`   Assigned to: ${firstTicket.assignedAgent?.name || 'Unassigned'}`);
      console.log(`   Comments: ${firstTicket.comments.length}, History: ${firstTicket.history.length}`);
    }

    // Test 2: Query tickets by status
    console.log('\n📋 Test 2: Query tickets by status');
    const openTickets = await prisma.helpdeskTicket.findMany({
      where: { status: 'OPEN' },
      include: { creator: true }
    });
    console.log(`✅ Found ${openTickets.length} open tickets`);
    
    const inProgressTickets = await prisma.helpdeskTicket.findMany({
      where: { status: 'IN_PROGRESS' },
      include: { assignedAgent: true }
    });
    console.log(`✅ Found ${inProgressTickets.length} in-progress tickets`);

    // Test 3: Query tickets by priority
    console.log('\n📋 Test 3: Query tickets by priority');
    const highPriorityTickets = await prisma.helpdeskTicket.findMany({
      where: { priority: 'HIGH' },
      include: { conversation: true }
    });
    console.log(`✅ Found ${highPriorityTickets.length} high priority tickets`);
    
    const urgentTickets = await prisma.helpdeskTicket.findMany({
      where: { priority: 'URGENT' }
    });
    console.log(`✅ Found ${urgentTickets.length} urgent tickets`);

    // Test 4: Query tickets by category
    console.log('\n📋 Test 4: Query tickets by category');
    const technicalTickets = await prisma.helpdeskTicket.findMany({
      where: { category: 'TECHNICAL' }
    });
    console.log(`✅ Found ${technicalTickets.length} technical tickets`);
    
    const billingTickets = await prisma.helpdeskTicket.findMany({
      where: { category: 'BILLING' }
    });
    console.log(`✅ Found ${billingTickets.length} billing tickets`);

    // Test 5: Query tickets with AI assistance
    console.log('\n📋 Test 5: Query AI-assisted tickets');
    const aiAssistedTickets = await prisma.helpdeskTicket.findMany({
      where: { aiAssisted: true }
    });
    console.log(`✅ Found ${aiAssistedTickets.length} AI-assisted tickets`);

    // Test 6: Query ticket comments
    console.log('\n📋 Test 6: Query ticket comments');
    const allComments = await prisma.ticketComment.findMany({
      include: {
        ticket: { select: { title: true, status: true } },
        user: { select: { name: true, role: true } }
      }
    });
    console.log(`✅ Found ${allComments.length} ticket comments`);
    
    if (allComments.length > 0) {
      const firstComment = allComments[0];
      console.log(`   First comment: "${firstComment.content.substring(0, 50)}..."`);
      console.log(`   Ticket: ${firstComment.ticket.title} (${firstComment.ticket.status})`);
      console.log(`   User: ${firstComment.user.name} (${firstComment.user.role})`);
    }

    // Test 7: Query ticket history
    console.log('\n📋 Test 7: Query ticket history');
    const allHistory = await prisma.ticketHistory.findMany({
      include: {
        ticket: { select: { title: true } },
        user: { select: { name: true } }
      }
    });
    console.log(`✅ Found ${allHistory.length} history records`);
    
    if (allHistory.length > 0) {
      const firstHistory = allHistory[0];
      console.log(`   First history: ${firstHistory.field} changed from "${firstHistory.oldValue || 'null'}" to "${firstHistory.newValue || 'null'}"`);
      console.log(`   Ticket: ${firstHistory.ticket.title}`);
      console.log(`   Changed by: ${firstHistory.user.name}`);
    }

    // Test 8: Query ticket assignments
    console.log('\n📋 Test 8: Query ticket assignments');
    const allAssignments = await prisma.ticketAssignment.findMany({
      include: {
        ticket: { select: { title: true, status: true } },
        agent: { select: { name: true, role: true } },
        assigner: { select: { name: true, role: true } }
      }
    });
    console.log(`✅ Found ${allAssignments.length} ticket assignments`);
    
    if (allAssignments.length > 0) {
      const firstAssignment = allAssignments[0];
      console.log(`   First assignment: ${firstAssignment.ticket.title} (${firstAssignment.ticket.status})`);
      console.log(`   Assigned to: ${firstAssignment.agent.name} (${firstAssignment.agent.role})`);
      console.log(`   Assigned by: ${firstAssignment.assigner.name} (${firstAssignment.assigner.role})`);
      console.log(`   Assigned at: ${firstAssignment.assignedAt.toISOString()}`);
    }

    // Test 9: Performance test - query with filters
    console.log('\n📋 Test 9: Performance test with filters');
    const startTime = Date.now();
    const filteredTickets = await prisma.helpdeskTicket.findMany({
      where: {
        AND: [
          { status: { in: ['OPEN', 'IN_PROGRESS'] } },
          { priority: { in: ['HIGH', 'URGENT'] } },
          { aiAssisted: false }
        ]
      },
      include: {
        creator: { select: { name: true, role: true } },
        assignedAgent: { select: { name: true } }
      }
    });
    const endTime = Date.now();
    console.log(`✅ Found ${filteredTickets.length} filtered tickets in ${endTime - startTime}ms`);

    // Test 10: Relationship integrity test
    console.log('\n📋 Test 10: Relationship integrity test');
    const ticketWithFullRelations = await prisma.helpdeskTicket.findFirst({
      include: {
        conversation: {
          include: {
            system: { select: { name: true } },
            channel: { select: { type: true } }
          }
        },
        creator: { select: { name: true, role: true } },
        assignedAgent: { select: { name: true, role: true } },
        comments: {
          include: { user: { select: { name: true } } }
        },
        history: {
          include: { user: { select: { name: true } } }
        },
        assignments: {
          include: {
            agent: { select: { name: true } },
            assigner: { select: { name: true } }
          }
        }
      }
    });

    if (ticketWithFullRelations) {
      console.log(`✅ Full relationship test passed for ticket: ${ticketWithFullRelations.title}`);
      console.log(`   System: ${ticketWithFullRelations.conversation.system.name}`);
      console.log(`   Channel: ${ticketWithFullRelations.conversation.channel.type}`);
      console.log(`   Creator: ${ticketWithFullRelations.creator.name} (${ticketWithFullRelations.creator.role})`);
      console.log(`   Comments: ${ticketWithFullRelations.comments.length}`);
      console.log(`   History: ${ticketWithFullRelations.history.length}`);
      console.log(`   Assignments: ${ticketWithFullRelations.assignments.length}`);
    }

    console.log('\n🎉 All database tests completed successfully!');
    console.log(`📊 Summary: ${allTickets.length} tickets, ${allComments.length} comments, ${allHistory.length} history records, ${allAssignments.length} assignments`);

  } catch (error) {
    console.error('❌ Database test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test function
testHelpdeskDatabase()
  .then(() => {
    console.log('✅ Database test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  });
