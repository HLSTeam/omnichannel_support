import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSampleTelegramGroups() {
    console.log('🌱 Seeding Sample Telegram Groups...');

    const sampleGroups = [
        // ADMIN Groups
        {
            groupName: 'Admin - Quản trị hệ thống',
            groupType: 'ADMIN',
            chatId: '-1001234567890',
            description: 'Nhóm quản trị nội bộ chính',
            chatTitle: 'Admin - Quản trị hệ thống',
            isActive: true
        },
        {
            groupName: 'Admin - Support Team',
            groupType: 'ADMIN',
            chatId: '-1001234567891',
            description: 'Nhóm support và customer service',
            chatTitle: 'Admin - Support Team',
            isActive: true
        },
        {
            groupName: 'Admin - Development',
            groupType: 'ADMIN',
            chatId: '-1001234567892',
            description: 'Nhóm phát triển và kỹ thuật',
            chatTitle: 'Admin - Development',
            isActive: true
        },

        // CUSTOMER Groups
        {
            groupName: 'Customer Support',
            groupType: 'CUSTOMER',
            chatId: '-1001234567893',
            description: 'Nhóm hỗ trợ khách hàng chính',
            chatTitle: 'Customer Support',
            isActive: true
        },
        {
            groupName: 'Khách hàng VIP',
            groupType: 'CUSTOMER',
            chatId: '-1001234567894',
            description: 'Nhóm khách hàng VIP và premium',
            chatTitle: 'Khách hàng VIP',
            isActive: true
        },
        {
            groupName: 'Hướng dẫn sử dụng',
            groupType: 'CUSTOMER',
            chatId: '-1001234567895',
            description: 'Nhóm hướng dẫn và FAQ',
            chatTitle: 'Hướng dẫn sử dụng',
            isActive: true
        },

        // SUPPLIER Groups
        {
            groupName: 'Nhà cung cấp Viettel',
            groupType: 'SUPPLIER',
            chatId: '-1001234567896',
            description: 'Nhóm nhà cung cấp Viettel',
            chatTitle: 'Nhà cung cấp Viettel',
            isActive: true
        },
        {
            groupName: 'Nhà cung cấp Mobifone',
            groupType: 'SUPPLIER',
            chatId: '-1001234567897',
            description: 'Nhóm nhà cung cấp Mobifone',
            chatTitle: 'Nhà cung cấp Mobifone',
            isActive: true
        },
        {
            groupName: 'Nhà cung cấp Vinaphone',
            groupType: 'SUPPLIER',
            chatId: '-1001234567898',
            description: 'Nhóm nhà cung cấp Vinaphone',
            chatTitle: 'Nhà cung cấp Vinaphone',
            isActive: true
        }
    ];

    for (const group of sampleGroups) {
        try {
            await prisma.telegramGroup.upsert({
                where: { chatId: group.chatId },
                update: {
                    groupName: group.groupName,
                    description: group.description,
                    chatTitle: group.chatTitle,
                    isActive: group.isActive
                },
                create: group
            });
            console.log(`✅ Created/Updated: ${group.groupName} (${group.groupType})`);
        } catch (error) {
            console.error(`❌ Error with ${group.groupName}:`, error.message);
        }
    }

    console.log('✅ Sample telegram groups seeded successfully');
}

seedSampleTelegramGroups()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
