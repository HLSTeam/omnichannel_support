import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Kiểm tra database...\n');

    // 1. Check System
    console.log('1. System:');
    const system = await prisma.system.findFirst();
    console.log('   System:', system ? { id: system.id, name: system.name } : 'Not found');
    console.log('');

    // 2. Check Telegram Groups
    console.log('2. Telegram Groups:');
    const groups = await prisma.telegram_groups.findMany({
      include: {
        group_permissions: true
      }
    });
    console.log(`   Found ${groups.length} groups:`);
    groups.forEach(group => {
      console.log(`   - ${group.groupName} (${group.groupType}): ${group.group_permissions.length} permissions`);
      group.group_permissions.forEach(perm => {
        console.log(`     * ${perm.permissionName}: ${perm.description}`);
      });
    });
    console.log('');

    // 3. Check Group Permissions
    console.log('3. Group Permissions:');
    const permissions = await prisma.group_permissions.findMany();
    console.log(`   Found ${permissions.length} permissions:`);
    permissions.forEach(perm => {
      console.log(`   - ${perm.groupType}: ${perm.permissionName}`);
    });
    console.log('');

    // 4. Check User Declarations
    console.log('4. User Declarations:');
    const userDeclarations = await prisma.userDeclaration.findMany({
      include: {
        group: true,
        system: true
      }
    });
    console.log(`   Found ${userDeclarations.length} user declarations:`);
    userDeclarations.forEach(decl => {
      console.log(`   - User ${decl.username} (${decl.userId}) in group ${decl.group.groupName}`);
    });
    console.log('');

    // 5. Test specific permission check
    console.log('5. Test Permission Check:');
    const testGroup = await prisma.telegram_groups.findFirst({
      where: { chatId: '-1001234567890' },
      include: {
        group_permissions: true
      }
    });
    
    if (testGroup) {
      console.log(`   Group: ${testGroup.groupName} (${testGroup.groupType})`);
      console.log(`   Permissions: ${testGroup.group_permissions.length}`);
      testGroup.group_permissions.forEach(perm => {
        console.log(`     - ${perm.permissionName}: ${perm.description}`);
      });
    } else {
      console.log('   Test group not found');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
