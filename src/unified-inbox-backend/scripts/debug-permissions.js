import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugPermissions() {
  try {
    const systemId = '0b8ec35b-6ec3-45cd-994c-730722a5d107';
    const chatId = '-1001234567890';
    const userId = '123456789';
    const username = 'admin_user';
    const permissionName = 'system_logs';

    console.log('🔍 Debug Permission Check...\n');

    // 1. Check System
    console.log('1. Checking System...');
    const system = await prisma.system.findUnique({
      where: { id: systemId }
    });
    console.log('   System:', system ? { id: system.id, name: system.name } : 'Not found');
    console.log('');

    // 2. Check Telegram Group
    console.log('2. Checking Telegram Group...');
    const telegramGroup = await prisma.telegram_groups.findFirst({
      where: { 
        chatId: chatId.toString(),
        systemId: systemId,
        isActive: true
      }
    });
    console.log('   Telegram Group:', telegramGroup ? {
      id: telegramGroup.id,
      groupName: telegramGroup.groupName,
      groupType: telegramGroup.groupType,
      chatId: telegramGroup.chatId,
      systemId: telegramGroup.systemId
    } : 'Not found');
    console.log('');

    // 3. Check User Declaration
    if (telegramGroup) {
      console.log('3. Checking User Declaration...');
      const userDeclaration = await prisma.userDeclaration.findFirst({
        where: {
          userId: userId.toString(),
          groupId: telegramGroup.id,
          systemId: systemId
        }
      });
      console.log('   User Declaration:', userDeclaration ? {
        id: userDeclaration.id,
        userId: userDeclaration.userId,
        username: userDeclaration.username,
        groupId: userDeclaration.groupId,
        systemId: userDeclaration.systemId
      } : 'Not found');
      console.log('');

      // 4. Check Group Permissions
      console.log('4. Checking Group Permissions...');
      const groupPermissions = await prisma.group_permissions.findMany({
        where: {
          systemId: systemId,
          groupType: telegramGroup.groupType
        }
      });
      console.log(`   Found ${groupPermissions.length} permissions for ${telegramGroup.groupType}:`);
      groupPermissions.forEach(perm => {
        console.log(`     - ${perm.permissionName}: ${perm.description}`);
      });
      console.log('');

      // 5. Check specific permission
      console.log('5. Checking Specific Permission...');
      const hasPermission = groupPermissions.some(p => p.permissionName === permissionName);
      console.log(`   Permission '${permissionName}': ${hasPermission ? 'GRANTED' : 'DENIED'}`);
    }

  } catch (error) {
    console.error('❌ Error debugging permissions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugPermissions();
