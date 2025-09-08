<template>
  <div class="user-declaration-manager">
    <!-- Header -->
    <div class="header mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        👥 User Declaration Management
      </h2>
      <p class="text-gray-600">
        Quản lý việc khai báo user thuộc nhóm nào trong hệ thống
      </p>
    </div>

    <!-- Actions -->
    <div class="actions mb-6">
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
      >
        <span class="mr-2">➕</span>
        Thêm User Declaration
      </button>
    </div>

    <!-- Filters -->
    <div class="filters bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">System</label>
          <select
            v-model="filters.systemId"
            @change="loadUserDeclarations"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả systems</option>
            <option v-for="system in systems" :key="system.id" :value="system.id">
              {{ system.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Group</label>
          <select
            v-model="filters.groupId"
            @change="loadUserDeclarations"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả groups</option>
            <option v-for="group in telegramGroups" :key="group.id" :value="group.id">
              {{ group.groupName }} ({{ group.groupType }})
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search User</label>
          <input
            v-model="filters.userId"
            @input="loadUserDeclarations"
            type="text"
            placeholder="User ID hoặc username..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Đang tải user declarations...</p>
    </div>

    <!-- User Declarations Table -->
    <div v-else-if="userDeclarations.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Info
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                System
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="declaration in userDeclarations" :key="declaration.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ declaration.username }}
                  </div>
                  <div class="text-xs text-gray-500">
                    ID: {{ declaration.userId }}
                  </div>
                </div>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ declaration.group.groupName }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ declaration.group.groupType }}
                  </div>
                </div>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ declaration.system.name }}
                </div>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(declaration.createdAt) }}
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  @click="editDeclaration(declaration)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  ✏️ Edit
                </button>
                <button
                  @click="deleteDeclaration(declaration.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              v-if="pagination.page > 1"
              @click="changePage(pagination.page - 1)"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              v-if="pagination.page < pagination.pages"
              @click="changePage(pagination.page + 1)"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing page <span class="font-medium">{{ pagination.page }}</span> of 
                <span class="font-medium">{{ pagination.pages }}</span> 
                ({{ pagination.total }} total results)
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  v-if="pagination.page > 1"
                  @click="changePage(pagination.page - 1)"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  ←
                </button>
                <button
                  v-if="pagination.page < pagination.pages"
                  @click="changePage(pagination.page + 1)"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  →
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <div class="text-gray-600 text-lg mb-2">📭 Không có user declarations</div>
      <p class="text-gray-600 mb-4">Hãy tạo user declaration đầu tiên để bắt đầu.</p>
      <button
        @click="showCreateModal = true"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Tạo User Declaration
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center mt-6">
      <div class="text-red-600 text-lg mb-2">❌ Lỗi tải user declarations</div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        @click="loadUserDeclarations"
        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Thử lại
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showEditModal ? '✏️ Edit User Declaration' : '➕ Create User Declaration' }}
          </h3>
          
          <form @submit.prevent="saveDeclaration" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">User ID</label>
              <input
                v-model="form.userId"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                v-model="form.username"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Group</label>
              <select
                v-model="form.groupId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn group...</option>
                <option v-for="group in telegramGroups" :key="group.id" :value="group.id">
                  {{ group.groupName }} ({{ group.groupType }})
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">System</label>
              <select
                v-model="form.systemId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn system...</option>
                <option v-for="system in systems" :key="system.id" :value="system.id">
                  {{ system.name }}
                </option>
              </select>
            </div>
            
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {{ showEditModal ? 'Update' : 'Create' }}
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
const loading = ref(true);
const error = ref(null);
const userDeclarations = ref([]);
const systems = ref([]);
const telegramGroups = ref([]);
const pagination = ref(null);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingDeclaration = ref(null);

// Filters
const filters = ref({
  systemId: '',
  groupId: '',
  userId: ''
});

// Form data
const form = ref({
  userId: '',
  username: '',
  groupId: '',
  systemId: ''
});

// Load user declarations
const loadUserDeclarations = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const params = new URLSearchParams();
    if (filters.value.systemId) params.append('systemId', filters.value.systemId);
    if (filters.value.groupId) params.append('groupId', filters.value.groupId);
    if (filters.value.userId) params.append('userId', filters.value.userId);
    params.append('page', '1');
    params.append('limit', '10');
    
    const response = await api.get(`/user-declarations?${params.toString()}`);
    
    if (response.data.status === 'success') {
      userDeclarations.value = response.data.data;
      pagination.value = response.data.pagination;
    } else {
      throw new Error(response.data.message || 'Failed to load user declarations');
    }
  } catch (err) {
    console.error('Error loading user declarations:', err);
    error.value = err.message || 'Lỗi không xác định';
  } finally {
    loading.value = false;
  }
};

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

// Load telegram groups
const loadTelegramGroups = async () => {
  try {
    const response = await api.get('/telegram-groups');
    if (response.data.success === true) {
      telegramGroups.value = response.data.data;
    }
  } catch (err) {
    console.error('Error loading telegram groups:', err);
  }
};

// Change page
const changePage = (page) => {
  // Update pagination logic here
  loadUserDeclarations();
};

// Edit declaration
const editDeclaration = (declaration) => {
  editingDeclaration.value = declaration;
  form.value = {
    userId: declaration.userId,
    username: declaration.username,
    groupId: declaration.groupId,
    systemId: declaration.systemId
  };
  showEditModal.value = true;
};

// Save declaration
const saveDeclaration = async () => {
  try {
    if (showEditModal.value) {
      // Update
      await api.put(`/user-declarations/${editingDeclaration.value.id}`, form.value);
    } else {
      // Create
      await api.post('/user-declarations', form.value);
    }
    
    closeModal();
    loadUserDeclarations();
  } catch (err) {
    console.error('Error saving declaration:', err);
    error.value = err.message || 'Lỗi không xác định';
  }
};

// Delete declaration
const deleteDeclaration = async (id) => {
  if (!confirm('Bạn có chắc chắn muốn xóa user declaration này?')) return;
  
  try {
    await api.delete(`/user-declarations/${id}`);
    loadUserDeclarations();
  } catch (err) {
    console.error('Error deleting declaration:', err);
    error.value = err.message || 'Lỗi không xác định';
  }
};

// Close modal
const closeModal = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingDeclaration.value = null;
  form.value = {
    userId: '',
    username: '',
    groupId: '',
    systemId: ''
  };
};

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

// Lifecycle
onMounted(() => {
  loadSystems();
  loadTelegramGroups();
  loadUserDeclarations();
});
</script>

<style scoped>
.user-declaration-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 1rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.filters {
  background: #f9fafb;
}

table th {
  font-weight: 600;
  color: #374151;
}

table td {
  vertical-align: top;
}

.modal-overlay {
  backdrop-filter: blur(4px);
}
</style>
