import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed permission templates...');

  // 1. Tạo hoặc lấy default system
  const defaultSystem = await prisma.system.upsert({
    where: { id: '25ceca8e-c455-4b86-a54c-69dc9be79ad9' },
    update: { name: 'HLS System' },
    create: {
      id: '25ceca8e-c455-4b86-a54c-69dc9be79ad9',
      name: 'HLS System'
    }
  });
  console.log('✅ Created default system:', defaultSystem.name);

  // 2. Tạo ADMIN permissions
  const adminPermissions = [
    { name: 'general_access', description: 'Quyền truy cập chung' },
    { name: 'system_logs', description: 'Xem system logs' },
    { name: 'helpdesk_ticket', description: 'Quản lý helpdesk tickets' },
    { name: 'system_notification', description: 'Gửi system notifications' },
    { name: 'user_management', description: 'Quản lý users' },
    { name: 'group_management', description: 'Quản lý groups' },
    { name: 'system_config', description: 'Cấu hình hệ thống' }
  ];

  for (const permission of adminPermissions) {
    await prisma.group_permissions.upsert({
      where: {
        systemId_groupType_permissionName: {
          systemId: defaultSystem.id,
          groupType: 'ADMIN',
          permissionName: permission.name
        }
      },
      update: { description: permission.description },
      create: {
        systemId: defaultSystem.id,
        groupType: 'ADMIN',
        permissionName: permission.name,
        description: permission.description
      }
    });
  }
  console.log('✅ Created ADMIN permissions');

  // 3. Tạo CUSTOMER permissions
  const customerPermissions = [
    { name: 'general_access', description: 'Quyền truy cập chung' },
    { name: 'helpdesk_ticket', description: 'Tạo và quản lý helpdesk tickets' },
    { name: 'view_own_tickets', description: 'Xem tickets của mình' }
  ];

  for (const permission of customerPermissions) {
    await prisma.group_permissions.upsert({
      where: {
        systemId_groupType_permissionName: {
          systemId: defaultSystem.id,
          groupType: 'CUSTOMER',
          permissionName: permission.name
        }
      },
      update: { description: permission.description },
      create: {
        systemId: defaultSystem.id,
        groupType: 'CUSTOMER',
        permissionName: permission.name,
        description: permission.description
      }
    });
  }
  console.log('✅ Created CUSTOMER permissions');

  // 4. Tạo SUPPLIER permissions
  const supplierPermissions = [
    { name: 'general_access', description: 'Quyền truy cập chung' },
    { name: 'helpdesk_ticket', description: 'Tạo và quản lý helpdesk tickets' },
    { name: 'view_own_tickets', description: 'Xem tickets của mình' },
    { name: 'supplier_dashboard', description: 'Truy cập supplier dashboard' }
  ];

  for (const permission of supplierPermissions) {
    await prisma.group_permissions.upsert({
      where: {
        systemId_groupType_permissionName: {
          systemId: defaultSystem.id,
          groupType: 'SUPPLIER',
          permissionName: permission.name
        }
      },
      update: { description: permission.description },
      create: {
        systemId: defaultSystem.id,
        groupType: 'SUPPLIER',
        permissionName: permission.name,
        description: permission.description
      }
    });
  }
  console.log('✅ Created SUPPLIER permissions');

  // 5. Tạo sample telegram groups
  const sampleGroups = [
    {
      groupName: 'Admin Group',
      groupType: 'ADMIN',
      chatId: '-1001234567890',
      description: 'Nhóm quản trị viên',
      chatTitle: 'HLS Admin Team',
      memberCount: 5
    },
    {
      groupName: 'Customer Support',
      groupType: 'CUSTOMER',
      chatId: '-1001234567891',
      description: 'Nhóm hỗ trợ khách hàng',
      chatTitle: 'HLS Customer Support',
      memberCount: 50
    },
    {
      groupName: 'Supplier Network',
      groupType: 'SUPPLIER',
      chatId: '-1001234567892',
      description: 'Nhóm nhà cung cấp',
      chatTitle: 'HLS Supplier Network',
      memberCount: 20
    }
  ];

  for (const group of sampleGroups) {
    await prisma.telegram_groups.upsert({
      where: { chatId: group.chatId },
      update: {
        groupName: group.groupName,
        groupType: group.groupType,
        description: group.description,
        chatTitle: group.chatTitle,
        memberCount: group.memberCount,
        systemId: defaultSystem.id // Đảm bảo systemId đúng
      },
      create: {
        ...group,
        systemId: defaultSystem.id
      }
    });
  }
  console.log('✅ Created sample telegram groups');

  // 6. Tạo sample user declarations
  const sampleUsers = [
    {
      userId: '123456789',
      username: 'admin_user',
      groupId: '-1001234567890', // Admin group
      systemId: defaultSystem.id
    },
    {
      userId: '987654321',
      username: 'customer_user',
      groupId: '-1001234567891', // Customer group
      systemId: defaultSystem.id
    },
    {
      userId: '555666777',
      username: 'supplier_user',
      groupId: '-1001234567892', // Supplier group
      systemId: defaultSystem.id
    }
  ];

  for (const user of sampleUsers) {
    // Tìm group ID thực tế từ chatId
    const group = await prisma.telegram_groups.findFirst({
      where: { chatId: user.groupId }
    });

    if (group) {
      await prisma.userDeclaration.upsert({
        where: {
          userId_groupId_systemId: {
            userId: user.userId,
            groupId: group.id, // Sử dụng group.id thực tế, không phải chatId
            systemId: user.systemId
          }
        },
        update: {
          username: user.username
        },
        create: {
          userId: user.userId,
          username: user.username,
          groupId: group.id, // Sử dụng group.id thực tế
          systemId: user.systemId
        }
      });
    }
  }
  console.log('✅ Created sample user declarations');

  console.log('🎉 Seed permission templates hoàn thành!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
