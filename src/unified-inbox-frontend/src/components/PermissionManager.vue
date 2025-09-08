<template>
  <div class="permission-manager">
    <!-- Header -->
    <div class="header">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">
        🔐 Permission Management
      </h2>
      <p class="text-gray-600 mb-6">
        Quản lý permissions cho các nhóm Telegram (Admin, Customer, Supplier)
      </p>
    </div>

    <!-- Permission Matrix -->
    <div class="permission-matrix bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">
        📊 Permission Matrix
      </h3>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permission
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                👑 Admin
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                🚚 Supplier
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                👥 Customer
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                👨‍💼 Agent
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="permission in availablePermissions" :key="permission.name" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ permission.name }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ permission.description }}
                  </div>
                </div>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Có
                </span>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span :class="getPermissionBadgeClass(permission.name, 'supplier')">
                  {{ hasPermission(permission.name, 'supplier') ? '✅ Có' : '❌ Không' }}
                </span>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span :class="getPermissionBadgeClass(permission.name, 'customer')">
                  {{ hasPermission(permission.name, 'customer') ? '✅ Có' : '❌ Không' }}
                </span>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span :class="getPermissionBadgeClass(permission.name, 'agent')">
                  {{ hasPermission(permission.name, 'agent') ? '✅ Có' : '❌ Không' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Group Permissions Management -->
    <div class="group-permissions bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">
        🎯 Quản Lý Permissions Theo Nhóm
      </h3>
      
      <!-- Group Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Chọn Nhóm để Quản Lý Permissions
        </label>
        <select
          v-model="selectedGroupId"
          @change="loadGroupPermissions"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Chọn nhóm...</option>
          <option v-for="group in telegramGroups" :key="group.id" :value="group.id">
            {{ group.groupName }} ({{ getGroupTypeLabel(group.groupType) }})
          </option>
        </select>
        

      </div>

      <!-- Group Permissions -->
      <div v-if="selectedGroupId && selectedGroup" class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-medium text-gray-900 mb-2">
            Permissions cho: {{ selectedGroup.groupName }}
          </h4>
          <p class="text-sm text-gray-600">
            Loại: {{ getGroupTypeLabel(selectedGroup.groupType) }} | 
            Chat ID: {{ selectedGroup.chatId }}
          </p>
        </div>

        <!-- Permissions List -->
        <div class="grid grid-cols-1 gap-4" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
          <div v-for="permission in availablePermissions" :key="permission.name" class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
            <input
              :id="`perm-${permission.name}`"
              type="checkbox"
              :checked="groupPermissions.includes(permission.name)"
              @change="togglePermission(permission.name)"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label :for="`perm-${permission.name}`" class="text-sm font-medium text-gray-700">
              {{ permission.name }}
            </label>
            <span class="text-xs text-gray-500 ml-auto">
              {{ permission.description }}
            </span>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end">
          <button
            @click="saveGroupPermissions"
            :disabled="isSaving"
            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {{ isSaving ? '💾 Đang lưu...' : '💾 Lưu Permissions' }}
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">🔐</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Chọn nhóm để quản lý permissions</h3>
        <p class="text-gray-500">Permissions sẽ được áp dụng cho tất cả users trong nhóm đó</p>
      </div>
    </div>

    <!-- Permission Templates -->
    <div class="permission-templates bg-white rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">
        📋 Permission Templates
      </h3>
      
      <div class="grid grid-cols-1 gap-4" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
        <div v-for="template in permissionTemplates" :key="template.role" class="border border-gray-200 rounded-lg p-4">
          <div class="flex items-center mb-3">
            <span class="text-2xl mr-2">{{ template.icon }}</span>
            <h4 class="font-medium text-gray-900">{{ template.name }}</h4>
          </div>
          
          <div class="space-y-2 mb-4">
            <div v-for="perm in template.permissions" :key="perm" class="text-xs text-gray-600">
              • {{ perm }}
            </div>
          </div>
          
          <button
            @click="applyTemplate(template.role)"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm"
          >
            Áp dụng Template
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';

// Reactive data
const selectedGroupId = ref('');
const selectedGroup = ref(null);
const groupPermissions = ref([]);
const telegramGroups = ref([]);
const isSaving = ref(false);

// Available permissions
const availablePermissions = ref([
  { name: 'view_all', description: 'Xem tất cả dữ liệu' },
  { name: 'system_logs', description: 'Xem system logs' },
  { name: 'application_logs', description: 'Xem application logs' },
  { name: 'error_logs', description: 'Xem error logs' },
  { name: 'transaction_logs', description: 'Xem transaction logs' },
  { name: 'transaction_status', description: 'Xem trạng thái giao dịch' },
  { name: 'create_ticket', description: 'Tạo ticket mới' },
  { name: 'view_tickets', description: 'Xem danh sách tickets' },
  { name: 'assign_ticket', description: 'Assign ticket cho agent' },
  { name: 'manage_tickets', description: 'Quản lý tickets' },
  { name: 'system_management', description: 'Quản lý hệ thống' },
  { name: 'view_own', description: 'Chỉ xem dữ liệu của mình' }
]);

// Permission templates
const permissionTemplates = ref([
  {
    role: 'admin',
    name: '👑 Admin',
    icon: '👑',
    permissions: ['view_all', 'system_logs', 'application_logs', 'error_logs', 'transaction_logs', 'system_management']
  },
  {
    role: 'supplier',
    name: '🚚 Supplier',
    icon: '🚚',
    permissions: ['view_own', 'transaction_logs', 'transaction_status', 'create_ticket', 'view_tickets']
  },
  {
    role: 'customer',
    name: '👥 Customer',
    icon: '👥',
    permissions: ['view_own', 'transaction_status', 'create_ticket', 'view_tickets']
  },
  {
    role: 'agent',
    name: '👨‍💼 Agent',
    icon: '👨‍💼',
    permissions: ['view_own', 'view_tickets', 'assign_ticket', 'manage_tickets', 'create_ticket']
  }
]);

// Methods
const loadTelegramGroups = async () => {
  try {
    const response = await api.get('/telegram-groups');
    telegramGroups.value = response.data.data || [];
  } catch (error) {
    console.error('Error loading telegram groups:', error);
  }
};

const loadGroupPermissions = async () => {
  if (!selectedGroupId.value) {
    selectedGroup.value = null;
    groupPermissions.value = [];
    return;
  }

  try {
    // Find selected group
    selectedGroup.value = telegramGroups.value.find(g => g.id === selectedGroupId.value);
    
    // Load permissions for this group
    const response = await api.get(`/permissions/role/${selectedGroup.value.groupType.toLowerCase()}`);
    if (response.data && response.data.success) {
      groupPermissions.value = response.data.data.permissions || [];
    } else {
      groupPermissions.value = [];
    }
  } catch (error) {
    console.error('Error loading group permissions:', error);
    groupPermissions.value = [];
  }
};

const togglePermission = (permissionName) => {
  const index = groupPermissions.value.indexOf(permissionName);
  if (index > -1) {
    groupPermissions.value.splice(index, 1);
  } else {
    groupPermissions.value.push(permissionName);
  }
};

const saveGroupPermissions = async () => {
  if (!selectedGroupId.value || !selectedGroup.value) return;

  try {
    isSaving.value = true;
    
    // Update group permissions
    await api.put(`/telegram-groups/${selectedGroupId.value}`, {
      permissions: groupPermissions.value
    });
    
    showMessage('Lưu permissions thành công!', 'success');
  } catch (error) {
    console.error('Error saving permissions:', error);
    showMessage('Lỗi khi lưu permissions', 'error');
  } finally {
    isSaving.value = false;
  }
};

const applyTemplate = (role) => {
  if (!selectedGroupId.value) {
    showMessage('Vui lòng chọn nhóm trước khi áp dụng template', 'warning');
    return;
  }

  const template = permissionTemplates.value.find(t => t.role === role);
  if (template) {
    groupPermissions.value = [...template.permissions];
    showMessage(`Đã áp dụng template ${template.name}`, 'success');
  }
};

const hasPermission = (permissionName, role) => {
  const template = permissionTemplates.value.find(t => t.role === role);
  return template ? template.permissions.includes(permissionName) : false;
};

const getPermissionBadgeClass = (permissionName, role) => {
  const hasPerm = hasPermission(permissionName, role);
  return hasPerm 
    ? 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'
    : 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
};

const getGroupTypeLabel = (type) => {
  const labels = {
    'ADMIN': '👑 Admin',
    'CUSTOMER': '👥 Customer',
    'SUPPLIER': '🚚 Supplier'
  };
  return labels[type] || type;
};

const showMessage = (message, type = 'info') => {
  // Simple message display - you can enhance this with a proper notification system
  alert(`${type.toUpperCase()}: ${message}`);
};

// Lifecycle
onMounted(() => {
  loadTelegramGroups();
});
</script>

<style scoped>
.permission-manager {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  margin-bottom: 2rem;
}

.permission-matrix,
.group-permissions,
.permission-templates {
  margin-bottom: 2rem;
}

/* Responsive table */
@media (max-width: 768px) {
  .overflow-x-auto {
    margin-left: -1rem;
    margin-right: -1rem;
  }
}
</style>
