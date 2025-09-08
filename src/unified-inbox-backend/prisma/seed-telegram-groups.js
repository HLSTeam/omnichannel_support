import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTelegramGroups() {
    console.log('🌱 Seeding Telegram Groups permissions...');

    // Seed Group Permissions
    const permissions = [
        // ADMIN permissions
        { groupType: 'ADMIN', permissionName: 'view_all', description: 'View all transactions and data' },
        { groupType: 'ADMIN', permissionName: 'view_sensitive', description: 'View sensitive information' },
        { groupType: 'ADMIN', permissionName: 'modify', description: 'Modify system data' },
        { groupType: 'ADMIN', permissionName: 'manage_groups', description: 'Manage telegram groups' },
        { groupType: 'ADMIN', permissionName: 'system_notifications', description: 'Receive system notifications' },
        
        // CUSTOMER permissions
        { groupType: 'CUSTOMER', permissionName: 'view_own', description: 'View own transactions only' },
        { groupType: 'CUSTOMER', permissionName: 'transaction_status', description: 'Check transaction status' },
        { groupType: 'CUSTOMER', permissionName: 'customer_support', description: 'Access customer support' },
        
        // SUPPLIER permissions
        { groupType: 'SUPPLIER', permissionName: 'view_own', description: 'View own orders only' },
        { groupType: 'SUPPLIER', permissionName: 'update_status', description: 'Update order status' },
        { groupType: 'SUPPLIER', permissionName: 'order_notifications', description: 'Receive new order notifications' },
        { groupType: 'SUPPLIER', permissionName: 'supplier_communication', description: 'Communicate with admin' }
    ];

    for (const permission of permissions) {
        await prisma.group_permissions.upsert({
            where: {
                systemId_groupType_permissionName: {
                    systemId: "25ceca8e-c455-4b86-a54c-69dc9be79ad9", // Default system ID
                    groupType: permission.groupType,
                    permissionName: permission.permissionName
                }
            },
            update: {},
            create: {
                ...permission,
                systemId: "25ceca8e-c455-4b86-a54c-69dc9be79ad9" // Default system ID
            }
        });
    }

    console.log('✅ Group permissions seeded successfully');

    // Seed sample Telegram Groups (optional - commented out for production)
    /*
    const sampleGroups = [
        {
            groupName: 'Admin Internal',
            groupType: 'ADMIN',
            chatId: '-1001234567890',
            description: 'Nhóm quản trị nội bộ',
            chatTitle: 'Admin - Quản trị hệ thống'
        },
        {
            groupName: 'Customer Support',
            groupType: 'CUSTOMER',
            chatId: '-1001234567891',
            description: 'Nhóm hỗ trợ khách hàng',
            chatTitle: 'Customer Support'
        },
        {
            groupName: 'Supplier Network',
            groupType: 'SUPPLIER',
            chatId: '-1001234567892',
            description: 'Nhóm nhà cung cấp',
            chatTitle: 'Supplier - Nhà cung cấp'
        }
    ];

    for (const group of sampleGroups) {
        await prisma.telegramGroup.upsert({
            where: { chatId: group.chatId },
            update: {},
            create: group
        });
    }

    console.log('✅ Sample telegram groups created');
    */
}

seedTelegramGroups()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
