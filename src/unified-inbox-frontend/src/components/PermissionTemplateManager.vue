<template>
  <div class="permission-template-manager">
    <!-- Header -->
    <div class="header mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        🔧 Permission Management
      </h2>
      <p class="text-gray-600">
        Quản lý permission templates và xem permissions theo group type
      </p>
    </div>

    <!-- System Selection -->
    <div class="system-selection bg-white rounded-lg shadow-md p-4 mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Chọn System</label>
      <select
        v-model="selectedSystemId"
        @change="loadPermissionTemplates"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Chọn system...</option>
        <option v-for="system in systems" :key="system.id" :value="system.id">
          {{ system.name }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Đang tải permission templates...</p>
    </div>

    <!-- Permission Templates -->
    <div v-else-if="permissionTemplates && selectedSystemId" class="space-y-6">
      <!-- Admin Group -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-700 flex items-center">
            👑 Admin Group
          </h3>
          <div class="flex items-center space-x-2">
            <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              {{ permissionTemplates.ADMIN?.length || 0 }} permissions
            </span>
            <button
              @click="showAddPermissionModal('ADMIN')"
              class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              ➕ Add
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="permission in permissionTemplates.ADMIN"
            :key="permission.name"
            class="bg-gray-50 rounded-lg p-3 border border-gray-200 relative group"
          >
            <div class="font-medium text-gray-900">{{ permission.name }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ permission.description }}</div>
            <button
              @click="deletePermission('ADMIN', permission.name)"
              class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Customer Group -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-700 flex items-center">
            👥 Customer Group
          </h3>
          <div class="flex items-center space-x-2">
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {{ permissionTemplates.CUSTOMER?.length || 0 }} permissions
            </span>
            <button
              @click="showAddPermissionModal('CUSTOMER')"
              class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              ➕ Add
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="permission in permissionTemplates.CUSTOMER"
            :key="permission.name"
            class="bg-gray-50 rounded-lg p-3 border border-gray-200 relative group"
          >
            <div class="font-medium text-gray-900">{{ permission.name }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ permission.description }}</div>
            <button
              @click="deletePermission('CUSTOMER', permission.name)"
              class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- Supplier Group -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-700 flex items-center">
            🚚 Supplier Group
          </h3>
          <div class="flex items-center space-x-2">
            <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {{ permissionTemplates.SUPPLIER?.length || 0 }} permissions
            </span>
            <button
              @click="showAddPermissionModal('SUPPLIER')"
              class="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              ➕ Add
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="permission in permissionTemplates.SUPPLIER"
            :key="permission.name"
            class="bg-gray-50 rounded-lg p-3 border border-gray-200 relative group"
          >
            <div class="font-medium text-gray-900">{{ permission.name }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ permission.description }}</div>
            <button
              @click="deletePermission('SUPPLIER', permission.name)"
              class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!selectedSystemId" class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <div class="text-gray-600 text-lg mb-2">📭 Vui lòng chọn system</div>
      <p class="text-gray-600">Chọn system để xem và quản lý permission templates.</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center mt-6">
      <div class="text-red-600 text-lg mb-2">❌ Lỗi tải permission templates</div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        @click="loadPermissionTemplates"
        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Thử lại
      </button>
    </div>

    <!-- Add Permission Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            ➕ Add Permission to {{ selectedGroupType }} Group
          </h3>
          
          <form @submit.prevent="addPermission" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Permission Name</label>
              <input
                v-model="newPermission.name"
                type="text"
                required
                placeholder="e.g., system_logs"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="newPermission.description"
                required
                placeholder="Mô tả permission..."
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeAddModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Permission
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';

// Reactive data
const loading = ref(false);
const error = ref(null);
const systems = ref([]);
const selectedSystemId = ref('');
const permissionTemplates = ref(null);
const showAddModal = ref(false);
const selectedGroupType = ref('');
const newPermission = ref({
  name: '',
  description: ''
});

// Load systems
const loadSystems = async () => {
  try {
    const response = await api.get('/systems/public');
    if (response.data.status === 'success') {
      systems.value = response.data.data;
    }
  } catch (err) {
    console.error('Error loading systems:', err);
  }
};

// Load permission templates
const loadPermissionTemplates = async () => {
  if (!selectedSystemId.value) return;
  
  try {
    loading.value = true;
    error.value = null;
    
    const response = await api.get(`/permissions/templates?systemId=${selectedSystemId.value}`);
    
    if (response.data.status === 'success') {
      permissionTemplates.value = response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to load permission templates');
    }
  } catch (err) {
    console.error('Error loading permission templates:', err);
    error.value = err.message || 'Lỗi không xác định';
  } finally {
    loading.value = false;
  }
};

// Show add permission modal
const showAddPermissionModal = (groupType) => {
  selectedGroupType.value = groupType;
  showAddModal.value = true;
  newPermission.value = { name: '', description: '' };
};

// Close add modal
const closeAddModal = () => {
  showAddModal.value = false;
  selectedGroupType.value = '';
  newPermission.value = { name: '', description: '' };
};

// Add permission
const addPermission = async () => {
  try {
    // Note: This would require a new backend endpoint to add permissions
    // For now, we'll just show a success message and reload
    console.log('Adding permission:', {
      systemId: selectedSystemId.value,
      groupType: selectedGroupType.value,
      ...newPermission.value
    });
    
    // TODO: Implement backend API call
    // await api.post('/permissions/templates', {
    //   systemId: selectedSystemId.value,
    //   groupType: selectedGroupType.value,
    //   ...newPermission.value
    // });
    
    closeAddModal();
    loadPermissionTemplates();
    
    // Show success message
    alert('Permission added successfully! (Backend API not implemented yet)');
  } catch (err) {
    console.error('Error adding permission:', err);
    error.value = err.message || 'Lỗi không xác định';
  }
};

// Delete permission
const deletePermission = async (groupType, permissionName) => {
  if (!confirm(`Bạn có chắc chắn muốn xóa permission "${permissionName}" khỏi ${groupType} group?`)) return;
  
  try {
    // Note: This would require a new backend endpoint to delete permissions
    // For now, we'll just show a success message and reload
    console.log('Deleting permission:', {
      systemId: selectedSystemId.value,
      groupType,
      permissionName
    });
    
    // TODO: Implement backend API call
    // await api.delete(`/permissions/templates/${selectedSystemId.value}/${groupType}/${permissionName}`);
    
    loadPermissionTemplates();
    
    // Show success message
    alert('Permission deleted successfully! (Backend API not implemented yet)');
  } catch (err) {
    console.error('Error deleting permission:', err);
    error.value = err.message || 'Lỗi không xác định';
  }
};

// Lifecycle
onMounted(() => {
  loadSystems();
});
</script>

<style scoped>
.permission-template-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 1rem;
}

.system-selection {
  background: #f9fafb;
}

.permission-card {
  transition: all 0.2s ease-in-out;
}

.permission-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.delete-button {
  transition: opacity 0.2s ease-in-out;
}
</style>
