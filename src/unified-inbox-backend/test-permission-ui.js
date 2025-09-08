#!/usr/bin/env node

/**
 * Test Script: Permission Management UI
 * 
 * Mục đích: Kiểm tra các API endpoints cho permission management
 * 
 * Chạy: node test-permission-ui.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/v1';
const API_KEY = 'your-api-key-here'; // Thay bằng API key thực tế

// Test data
const testGroup = {
  groupName: 'Test Permission Group',
  groupType: 'CUSTOMER',
  chatId: '-1001234567890',
  description: 'Test group for permission management',
  chatTitle: 'Test Group',
  systemId: '25ceca8e-c455-4b86-a54c-69dc9be79ad9' // Thay bằng systemId thực tế
};

const testPermissions = [
  'view_own',
  'transaction_status',
  'create_ticket',
  'view_tickets'
];

async function testPermissionAPIs() {
  console.log('🔐 Testing Permission Management APIs...\n');

  try {
    // 1. Test tạo group mới
    console.log('1️⃣ Testing create group...');
    const createResponse = await fetch(`${BASE_URL}/telegram-groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(testGroup)
    });

    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('✅ Group created:', createResult.data.id);
      
      const groupId = createResult.data.id;
      
      // 2. Test cập nhật permissions
      console.log('\n2️⃣ Testing update permissions...');
      const updateResponse = await fetch(`${BASE_URL}/telegram-groups/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          permissions: testPermissions
        })
      });

      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        console.log('✅ Permissions updated:', updateResult.message);
        console.log('📋 New permissions:', updateResult.data.permissions);
      } else {
        const error = await updateResponse.json();
        console.log('❌ Failed to update permissions:', error);
      }

      // 3. Test lấy permissions theo role
      console.log('\n3️⃣ Testing get permissions by role...');
      const roleResponse = await fetch(`${BASE_URL}/permissions/role/customer`, {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY
        }
      });

      if (roleResponse.ok) {
        const roleResult = await roleResponse.json();
        console.log('✅ Role permissions:', roleResult.data);
      } else {
        const error = await roleResponse.json();
        console.log('❌ Failed to get role permissions:', error);
      }

      // 4. Test check permissions
      console.log('\n4️⃣ Testing check permissions...');
      const checkResponse = await fetch(`${BASE_URL}/permissions/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          systemId: testGroup.systemId,
          chatId: testGroup.chatId,
          action: 'check_logs',
          chatTitle: testGroup.chatTitle,
          username: 'testuser'
        })
      });

      if (checkResponse.ok) {
        const checkResult = await checkResponse.json();
        console.log('✅ Permission check result:', checkResult);
      } else {
        const error = await checkResponse.json();
        console.log('❌ Failed to check permissions:', error);
      }

      // 5. Test xóa group (cleanup)
      console.log('\n5️⃣ Testing delete group (cleanup)...');
      const deleteResponse = await fetch(`${BASE_URL}/telegram-groups/${groupId}?hard=true`, {
        method: 'DELETE',
        headers: {
          'x-api-key': API_KEY
        }
      });

      if (deleteResponse.ok) {
        console.log('✅ Group deleted for cleanup');
      } else {
        console.log('⚠️ Failed to delete group for cleanup');
      }

    } else {
      const error = await createResponse.json();
      console.log('❌ Failed to create group:', error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

async function testPermissionTemplates() {
  console.log('\n📋 Testing Permission Templates...\n');

  try {
    // Test các permission templates
    const templates = [
      { role: 'admin', expected: ['view_all', 'system_logs', 'system_management'] },
      { role: 'supplier', expected: ['view_own', 'transaction_logs', 'create_ticket'] },
      { role: 'customer', expected: ['view_own', 'transaction_status', 'create_ticket'] },
      { role: 'agent', expected: ['view_own', 'view_tickets', 'assign_ticket'] }
    ];

    for (const template of templates) {
      console.log(`Testing ${template.role} template...`);
      
      const response = await fetch(`${BASE_URL}/permissions/role/${template.role}`, {
        method: 'GET',
        headers: {
          'x-api-key': API_KEY
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${template.role}:`, result.data.permissions);
        
        // Check if expected permissions are present
        const hasExpected = template.expected.every(perm => 
          result.data.permissions.includes(perm)
        );
        
        if (hasExpected) {
          console.log(`✅ ${template.role} template validation passed`);
        } else {
          console.log(`⚠️ ${template.role} template missing some expected permissions`);
        }
      } else {
        console.log(`❌ Failed to get ${template.role} template`);
      }
    }

  } catch (error) {
    console.error('❌ Template test failed:', error.message);
  }
}

async function testPermissionValidation() {
  console.log('\n🔍 Testing Permission Validation...\n');

  try {
    const testCases = [
      {
        name: 'Admin accessing system logs',
        data: {
          systemId: testGroup.systemId,
          chatId: '-1001111111111',
          action: 'check_logs',
          chatTitle: 'Admin Group',
          username: 'admin_user'
        },
        expected: 'should have access'
      },
      {
        name: 'Customer accessing system logs',
        data: {
          systemId: testGroup.systemId,
          chatId: '-1002222222222',
          action: 'check_logs',
          chatTitle: 'Customer Group',
          username: 'customer_user'
        },
        expected: 'should be denied'
      },
      {
        name: 'Unregistered group',
        data: {
          systemId: testGroup.systemId,
          chatId: '-1009999999999',
          action: 'check_logs',
          chatTitle: 'Unknown Group',
          username: 'unknown_user'
        },
        expected: 'should return error for unregistered group'
      }
    ];

    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.name} (${testCase.expected})`);
      
      const response = await fetch(`${BASE_URL}/permissions/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (response.ok) {
        if (result.data.hasPermission) {
          console.log(`✅ Access granted: ${result.data.userRole}`);
        } else {
          console.log(`❌ Access denied: ${result.data.userRole}`);
        }
      } else {
        console.log(`⚠️ API error: ${result.error}`);
      }
    }

  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Permission Management UI Tests...\n');
  
  await testPermissionAPIs();
  await testPermissionTemplates();
  await testPermissionValidation();
  
  console.log('\n✨ All tests completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { testPermissionAPIs, testPermissionTemplates, testPermissionValidation };
