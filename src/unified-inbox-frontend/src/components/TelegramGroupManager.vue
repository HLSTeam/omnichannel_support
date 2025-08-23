<template>
  <div class="telegram-group-manager">
    <!-- Header -->
    <div class="header">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">
        🚀 Telegram Groups Management
      </h2>
      <p class="text-gray-600 mb-6">
        Quản lý các nhóm Telegram cho Admin, Customer và Supplier
      </p>
    </div>

    <!-- Groups List - ĐƯA LÊN TRÊN -->
    <div class="groups-list bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold text-gray-700">
          📋 Danh Sách Nhóm ({{ filteredGroups.length }})
        </h3>
        
        <!-- Filter Controls -->
        <div class="flex space-x-4">
          <select
            v-model="filterType"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại</option>
            <option value="ADMIN">👑 Admin</option>
            <option value="CUSTOMER">👥 Customer</option>
            <option value="SUPPLIER">🚚 Supplier</option>
          </select>
          
          <select
            v-model="filterStatus"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">🟢 Hoạt động</option>
            <option value="false">🔴 Không hoạt động</option>
          </select>
        </div>
      </div>


      
      <!-- Groups Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhóm
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chat ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>

              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="group in filteredGroups" :key="group.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">
                    {{ group.groupName }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ group.description || 'Không có mô tả' }}
                  </div>
                </div>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getGroupTypeBadgeClass(group.groupType)">
                  {{ getGroupTypeLabel(group.groupType) }}
                </span>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 font-mono">
                  {{ group.chatId }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ group.chatTitle || 'Không có tên' }}
                </div>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="group.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ group.isActive ? '🟢 Hoạt động' : '🔴 Không hoạt động' }}
                </span>
              </td>
              
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="editGroup(group)"
                    class="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md text-xs"
                  >
                    ✏️ Sửa
                  </button>
                  
                  <button
                    @click="toggleGroupStatus(group)"
                    :class="group.isActive ? 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100' : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'"
                    class="px-3 py-1 rounded-md text-xs"
                  >
                    {{ group.isActive ? '🔴 Ẩn' : '🟢 Hiện' }}
                  </button>
                  
                  <button
                    @click="deleteGroup(group)"
                    class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-xs"
                  >
                    🗑️ Xóa
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredGroups.length === 0" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">📭</div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Không có nhóm nào</h3>
        <p class="text-gray-500">Hãy thêm nhóm đầu tiên để bắt đầu!</p>
      </div>
    </div>

    <!-- Add New Group Form - ĐƯA XUỐNG DƯỚI -->
    <div class="add-group-section bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">
        ➕ Thêm Nhóm Mới
      </h3>
      
      <form @submit.prevent="addGroup" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tên Nhóm *
            </label>
            <input
              v-model="newGroup.groupName"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Admin Internal, Customer Support"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Loại Nhóm *
            </label>
            <select
              v-model="newGroup.groupType"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn loại nhóm</option>
              <option value="ADMIN">👑 Admin (Quản trị nội bộ)</option>
              <option value="CUSTOMER">👥 Customer (Khách hàng)</option>
              <option value="SUPPLIER">🚚 Supplier (Nhà cung cấp)</option>
            </select>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Chat ID *
            </label>
            <input
              v-model="newGroup.chatId"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: -1001234567890"
            />
            <p class="text-xs text-gray-500 mt-1">
              Chat ID từ Telegram group (bắt đầu bằng -100)
            </p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tên Group trên Telegram
            </label>
            <input
              v-model="newGroup.chatTitle"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Admin - Quản trị hệ thống"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <textarea
            v-model="newGroup.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mô tả chức năng của nhóm này..."
          ></textarea>
        </div>
        
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="isAdding"
            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <span v-if="isAdding" class="animate-spin mr-2">⏳</span>
            {{ isAdding ? 'Đang thêm...' : 'Thêm Nhóm' }}
          </button>
        </div>
      </form>
    </div>



    <!-- Edit Group Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">✏️ Sửa Nhóm</h3>
          
          <form @submit.prevent="updateGroup" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tên Nhóm
              </label>
              <input
                v-model="editingGroup.groupName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Loại Nhóm
              </label>
              <select
                v-model="editingGroup.groupType"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ADMIN">👑 Admin</option>
                <option value="CUSTOMER">👥 Customer</option>
                <option value="SUPPLIER">🚚 Supplier</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Chat ID
              </label>
              <input
                v-model="editingGroup.chatId"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                v-model="editingGroup.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showEditModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                :disabled="isUpdating"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ isUpdating ? 'Đang cập nhật...' : 'Cập nhật' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" :class="messageType === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'" class="fixed top-4 right-4 border px-4 py-3 rounded z-50">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import api from '../api.js';

export default {
  name: 'TelegramGroupManager',
  setup() {
    // Reactive data
    const groups = ref([]);
    const filterType = ref('');
    const filterStatus = ref('');
    const showEditModal = ref(false);
    const editingGroup = ref({});
    const isAdding = ref(false);
    const isUpdating = ref(false);
    const message = ref('');
    const messageType = ref('success');

    // New group form
    const newGroup = ref({
      groupName: '',
      groupType: '',
      chatId: '',
      description: '',
      chatTitle: ''
    });

    // Computed properties
    const filteredGroups = computed(() => {
      let filtered = groups.value;
      
      if (filterType.value) {
        filtered = filtered.filter(group => group.groupType === filterType.value);
      }
      
      if (filterStatus.value !== '') {
        const isActive = filterStatus.value === 'true';
        filtered = filtered.filter(group => group.isActive === isActive);
      }
      
      return filtered;
    });

    // Methods
    const showMessage = (msg, type = 'success') => {
      message.value = msg;
      messageType.value = type;
      setTimeout(() => {
        message.value = '';
      }, 5000);
    };

    const loadGroups = async () => {
      try {
        // Check if we have auth token
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          showMessage('Không tìm thấy token đăng nhập', 'error');
          return;
        }
        
        const response = await api.get('/telegram-groups');
        
        if (response.data && response.data.success) {
          groups.value = response.data.data || [];
        } else {
          groups.value = [];
        }
        
        // Force reactivity update
        groups.value = [...groups.value];
        
      } catch (error) {
        console.error('Error loading groups:', error);
        
        // Check if it's an authentication error
        if (error.response?.status === 401) {
          showMessage('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'error');
          // Clear invalid token and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('agentProfile');
          window.location.href = '/login';
          return;
        }
        

        
        showMessage('Lỗi khi tải danh sách nhóm', 'error');
      }
    };

    const addGroup = async () => {
      try {
        isAdding.value = true;
        const response = await api.post('/telegram-groups', newGroup.value);
        
        // Reset form
        newGroup.value = {
          groupName: '',
          groupType: '',
          chatId: '',
          description: '',
          chatTitle: ''
        };
        
        // Reload groups
        await loadGroups();
        showMessage('Thêm nhóm thành công!', 'success');
      } catch (error) {
        console.error('Error adding group:', error);
        showMessage(error.response?.data?.error || 'Lỗi khi thêm nhóm', 'error');
      } finally {
        isAdding.value = false;
      }
    };

    const editGroup = (group) => {
      editingGroup.value = { ...group };
      showEditModal.value = true;
    };

    const updateGroup = async () => {
      try {
        isUpdating.value = true;
        await api.put(`/telegram-groups/${editingGroup.value.id}`, editingGroup.value);
        
        showEditModal.value = false;
        await loadGroups();
        showMessage('Cập nhật nhóm thành công!', 'success');
      } catch (error) {
        console.error('Error updating group:', error);
        showMessage(error.response?.data?.error || 'Lỗi khi cập nhật nhóm', 'error');
      } finally {
        isUpdating.value = false;
      }
    };

    const toggleGroupStatus = async (group) => {
      try {
        await api.put(`/telegram-groups/${group.id}`, {
          isActive: !group.isActive
        });
        
        await loadGroups();
        showMessage(`${group.isActive ? 'Ẩn' : 'Hiện'} nhóm thành công!`, 'success');
      } catch (error) {
        console.error('Error toggling group status:', error);
        showMessage('Lỗi khi thay đổi trạng thái nhóm', 'error');
      }
    };

    const deleteGroup = async (group) => {
      if (!confirm(`Bạn có chắc muốn xóa nhóm "${group.groupName}"?`)) {
        return;
      }
      
      try {
        await api.delete(`/telegram-groups/${group.id}`);
        await loadGroups();
        showMessage('Xóa nhóm thành công!', 'success');
      } catch (error) {
        console.error('Error deleting group:', error);
        showMessage('Lỗi khi xóa nhóm', 'error');
      }
    };

    const getGroupTypeLabel = (type) => {
      const labels = {
        'ADMIN': '👑 Admin',
        'CUSTOMER': '👥 Customer',
        'SUPPLIER': '🚚 Supplier'
      };
      return labels[type] || type;
    };

    const getGroupTypeBadgeClass = (type) => {
      const classes = {
        'ADMIN': 'bg-purple-100 text-purple-800',
        'CUSTOMER': 'bg-blue-100 text-blue-800',
        'SUPPLIER': 'bg-green-100 text-green-800'
      };
      return `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${classes[type] || 'bg-gray-100 text-gray-800'}`;
    };

    // Lifecycle
    onMounted(() => {
      loadGroups();
    });

    return {
      // Data
      groups,
      filterType,
      filterStatus,
      showEditModal,
      editingGroup,
      isAdding,
      isUpdating,
      message,
      messageType,
      newGroup,
      
      // Computed
      filteredGroups,
      
      // Methods
      showMessage,
      loadGroups,
      addGroup,
      editGroup,
      updateGroup,
      toggleGroupStatus,
      deleteGroup,
      getGroupTypeLabel,
      getGroupTypeBadgeClass
    };
  }
};
</script>

<style scoped>
.telegram-group-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  height: auto !important;
  overflow: visible !important;
  position: static !important;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.add-group-section {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
}

.groups-list {
  min-height: 400px;
  max-height: none !important;
  overflow: visible !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .telegram-group-manager {
    padding: 10px;
  }
  
  .header h2 {
    font-size: 1.5rem;
  }
  
  .add-group-section {
    padding: 1rem;
  }
  
  .groups-list {
    padding: 1rem;
  }
  
  /* Mobile table adjustments */
  .overflow-x-auto {
    font-size: 0.875rem;
  }
  
  .px-6 {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .py-4 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  /* Stack filter controls on mobile */
  .flex.space-x-4 {
    flex-direction: column;
    space-x: 0;
    gap: 0.5rem;
  }
  
  /* Adjust modal width on mobile */
  .w-96 {
    width: 90vw;
    max-width: 400px;
  }
}

@media (max-width: 640px) {
  .telegram-group-manager {
    padding: 5px;
  }
  
  .header h2 {
    font-size: 1.25rem;
  }
  
  .header p {
    font-size: 0.875rem;
  }
  
  /* Hide some table columns on very small screens */
  .hidden-xs {
    display: none;
  }
  
  /* Stack action buttons vertically on mobile */
  .flex.space-x-2 {
    flex-direction: column;
    space-x: 0;
    gap: 0.25rem;
  }
  
  .px-3 {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .py-1 {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .telegram-group-manager {
    background-color: #1f2937;
    color: #f9fafb;
  }
  
  .bg-white {
    background-color: #374151;
  }
  
  .text-gray-800 {
    color: #f9fafb;
  }
  
  .text-gray-600 {
    color: #d1d5db;
  }
  
  .text-gray-700 {
    color: #e5e7eb;
  }
  
  .text-gray-900 {
    color: #f9fafb;
  }
  
  .border-gray-300 {
    border-color: #4b5563;
  }
  
  .bg-gray-50 {
    background-color: #4b5563;
  }
  
  .bg-gray-100 {
    background-color: #6b7280;
  }
}

/* Loading states */
.loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

/* Focus states for accessibility */
button:focus, input:focus, select:focus, textarea:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Hover effects */
.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}

.hover\:bg-red-700:hover {
  background-color: #b91c1c;
}

.hover\:bg-green-700:hover {
  background-color: #15803d;
}

.hover\:bg-purple-700:hover {
  background-color: #7c3aed;
}

.hover\:bg-gray-700:hover {
  background-color: #374151;
}
</style>
