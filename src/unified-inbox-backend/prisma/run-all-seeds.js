#!/usr/bin/env node

/**
 * Master seed script to run all seed files in the correct order
 * This ensures proper dependency handling between seed scripts
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const seedScripts = [
  'prisma/seed-permission-templates.js',
  'prisma/seed-telegram-groups.js', 
  'prisma/seed-sample-telegram-groups.js',
  'prisma/seed-helpdesk.js'
];

async function runAllSeeds() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  for (let i = 0; i < seedScripts.length; i++) {
    const script = seedScripts[i];
    console.log(`📋 Step ${i + 1}/${seedScripts.length}: Running ${script}`);
    
    try {
      const { stdout, stderr } = await execAsync(`node ${script}`);
      
      if (stdout) {
        console.log(stdout);
      }
      
      if (stderr && !stderr.includes('ExperimentalWarning')) {
        console.warn('⚠️ Warnings:', stderr);
      }
      
      console.log(`✅ Step ${i + 1} completed successfully\n`);
      
    } catch (error) {
      console.error(`❌ Step ${i + 1} failed:`, error.message);
      console.error('🛑 Stopping seed process due to error');
      process.exit(1);
    }
  }

  console.log('🎉 All seed scripts completed successfully!');
  console.log('📊 Database is now populated with:');
  console.log('   - Default system and permissions');
  console.log('   - Telegram groups and permissions');
  console.log('   - Sample agents and helpdesk tickets');
  console.log('   - Comments, history, and assignments');
}

runAllSeeds().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});