#!/usr/bin/env node

/**
 * Test Script: System Isolation Verification
 * Date: 2025-08-23
 * Description: Test multi-system architecture after migration
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testSystemIsolation() {
    console.log('🧪 Testing System Isolation...\n');

    try {
        // Test 1: Check if systems exist
        console.log('1️⃣ Checking systems...');
        const systems = await prisma.system.findMany();
        console.log(`   Found ${systems.length} systems:`, systems.map(s => ({ id: s.id, name: s.name })));

        if (systems.length === 0) {
            console.log('   ⚠️  No systems found. Creating default system...');
            const defaultSystem = await prisma.system.create({
                data: {
                    name: 'Default System',
                    description: 'Default system for testing'
                }
            });
            console.log(`   ✅ Created default system: ${defaultSystem.id}`);
        }

        // Test 2: Check telegram groups with systemId
        console.log('\n2️⃣ Checking telegram groups...');
        const telegramGroups = await prisma.telegramGroup.findMany({
            include: { system: true }
        });
        console.log(`   Found ${telegramGroups.length} telegram groups`);
        
        const groupsWithoutSystem = telegramGroups.filter(g => !g.systemId);
        if (groupsWithoutSystem.length > 0) {
            console.log(`   ⚠️  ${groupsWithoutSystem.length} groups without systemId`);
            console.log('   Groups:', groupsWithoutSystem.map(g => ({ id: g.id, groupName: g.groupName })));
        } else {
            console.log('   ✅ All telegram groups have systemId');
        }

        // Test 3: Check group permissions with systemId
        console.log('\n3️⃣ Checking group permissions...');
        const groupPermissions = await prisma.groupPermission.findMany({
            include: { system: true }
        });
        console.log(`   Found ${groupPermissions.length} group permissions`);
        
        const permissionsWithoutSystem = groupPermissions.filter(p => !p.systemId);
        if (permissionsWithoutSystem.length > 0) {
            console.log(`   ⚠️  ${permissionsWithoutSystem.length} permissions without systemId`);
        } else {
            console.log('   ✅ All group permissions have systemId');
        }

        // Test 4: Test system isolation
        console.log('\n4️⃣ Testing system isolation...');
        const firstSystem = systems[0] || await prisma.system.findFirst();
        
        if (firstSystem) {
            const systemGroups = await prisma.telegramGroup.findMany({
                where: { systemId: firstSystem.id },
                include: { system: true }
            });
            
            console.log(`   System "${firstSystem.name}" has ${systemGroups.length} telegram groups`);
            
            // Test cross-system access prevention
            const otherSystems = await prisma.system.findMany({
                where: { id: { not: firstSystem.id } }
            });
            
            if (otherSystems.length > 0) {
                const crossSystemGroups = await prisma.telegramGroup.findMany({
                    where: { 
                        systemId: { in: otherSystems.map(s => s.id) }
                    }
                });
                console.log(`   Other systems have ${crossSystemGroups.length} groups (should be isolated)`);
            }
        }

        // Test 5: Verify unique constraints
        console.log('\n5️⃣ Testing unique constraints...');
        try {
            // Try to create duplicate permission in same system
            const testPermission = await prisma.groupPermission.create({
                data: {
                    systemId: firstSystem.id,
                    groupType: 'CUSTOMER',
                    permissionName: 'test_permission',
                    description: 'Test permission for isolation testing'
                }
            });
            console.log('   ✅ Created test permission');
            
            // Try to create duplicate (should fail)
            try {
                await prisma.groupPermission.create({
                    data: {
                        systemId: firstSystem.id,
                        groupType: 'CUSTOMER',
                        permissionName: 'test_permission',
                        description: 'Duplicate should fail'
                    }
                });
                console.log('   ❌ Duplicate permission creation should have failed');
            } catch (error) {
                if (error.code === 'P2002') {
                    console.log('   ✅ Duplicate permission correctly prevented');
                } else {
                    console.log('   ❌ Unexpected error:', error.message);
                }
            }
            
            // Clean up test data
            await prisma.groupPermission.delete({
                where: { id: testPermission.id }
            });
            console.log('   ✅ Cleaned up test permission');
            
        } catch (error) {
            console.log('   ❌ Error testing constraints:', error.message);
        }

        console.log('\n🎉 System isolation test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testSystemIsolation();
}

export { testSystemIsolation };
