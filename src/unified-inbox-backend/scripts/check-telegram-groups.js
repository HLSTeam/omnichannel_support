import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTelegramGroups() {
  try {
    console.log('🔍 Kiểm tra Telegram Groups...\n');

    // 1. Check all systems
    console.log('1. All Systems:');
    const systems = await prisma.system.findMany();
    systems.forEach(sys => {
      console.log(`   - ${sys.id}: ${sys.name}`);
    });
    console.log('');

    // 2. Check all telegram groups
    console.log('2. All Telegram Groups:');
    const groups = await prisma.telegram_groups.findMany({
      include: {
        System: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    groups.forEach(group => {
      console.log(`   - ${group.groupName} (${group.groupType}):`);
      console.log(`     Chat ID: ${group.chatId}`);
      console.log(`     System: ${group.System.id} (${group.System.name})`);
      console.log(`     Active: ${group.isActive}`);
      console.log('');
    });

    // 3. Check specific chatId
    console.log('3. Checking specific chatId: -1001234567890');
    const specificGroup = await prisma.telegram_groups.findFirst({
      where: { chatId: '-1001234567890' },
      include: {
        System: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (specificGroup) {
      console.log(`   Found: ${specificGroup.groupName} (${specificGroup.groupType})`);
      console.log(`   System: ${specificGroup.System.id} (${specificGroup.System.name})`);
    } else {
      console.log('   Not found');
    }

  } catch (error) {
    console.error('❌ Error checking telegram groups:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTelegramGroups();
