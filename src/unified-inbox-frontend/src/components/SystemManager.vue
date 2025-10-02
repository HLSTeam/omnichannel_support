<template>
  <div class="system-manager bg-white shadow rounded-lg p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h3 class="text-lg font-medium text-gray-900">
          🖥️ Quản Lý Hệ Thống
        </h3>
        <p class="text-sm text-gray-500 mt-1">
          Tạo và quản lý các hệ thống trong ứng dụng
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        Thêm Hệ Thống Mới
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
      <p class="text-gray-500 mt-2">Đang tải dữ liệu...</p>
    </div>

    <!-- Systems Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên Hệ Thống
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Elasticsearch URL
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số Kênh
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày Tạo
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hành Động
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="systems.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-gray-500">
              Chưa có hệ thống nào. Hãy tạo hệ thống đầu tiên!
            </td>
          </tr>
          <tr v-for="system in systems" :key="system.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-white text-sm font-medium">{{ system.name.charAt(0) }}</span>
                </div>
                <div class="text-sm font-medium text-gray-900">{{ system.name }}</div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div v-if="system.elasticUrl" class="text-sm text-gray-900">
                <a :href="system.elasticUrl" target="_blank" class="text-blue-600 hover:text-blue-800 hover:underline">
                  {{ truncateUrl(system.elasticUrl) }}
                </a>
              </div>
              <div v-else class="text-sm text-gray-400 italic">
                Chưa cấu hình
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ system.Channel?.length || 0 }} kênh
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(system.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="openEditModal(system)"
                class="text-indigo-600 hover:text-indigo-900 mr-4"
                title="Chỉnh sửa"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                @click="confirmDelete(system)"
                class="text-red-600 hover:text-red-900"
                title="Xóa"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <!-- Modal Header -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              {{ isEditing ? '✏️ Chỉnh Sửa Hệ Thống' : '➕ Thêm Hệ Thống Mới' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ errorMessage }}
          </div>

          <!-- Related Data Warning -->
          <div v-if="relatedDataWarning" class="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <p class="font-semibold mb-2">⚠️ Hệ thống này có dữ liệu liên quan:</p>
            <ul class="list-disc list-inside text-sm">
              <li v-if="relatedDataWarning.channels > 0">{{ relatedDataWarning.channels }} kênh</li>
              <li v-if="relatedDataWarning.conversations > 0">{{ relatedDataWarning.conversations }} cuộc trò chuyện</li>
              <li v-if="relatedDataWarning.rules > 0">{{ relatedDataWarning.rules }} quy tắc</li>
              <li v-if="relatedDataWarning.telegramGroups > 0">{{ relatedDataWarning.telegramGroups }} nhóm Telegram</li>
              <li v-if="relatedDataWarning.tickets > 0">{{ relatedDataWarning.tickets }} ticket</li>
            </ul>
            <p class="text-sm mt-2">Vui lòng xóa các dữ liệu này trước khi xóa hệ thống.</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="submitForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Tên Hệ Thống <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên hệ thống"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Elasticsearch URL
              </label>
              <input
                v-model="formData.elasticUrl"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://elasticsearch.example.com:9200"
              />
              <p class="text-xs text-gray-500 mt-1">
                URL kết nối đến Elasticsearch để tìm kiếm logs và transactions
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {{ submitting ? 'Đang xử lý...' : (isEditing ? 'Cập Nhật' : 'Tạo Mới') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-center mb-4">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>
          <h3 class="text-lg font-medium text-center text-gray-900 mb-2">
            Xác Nhận Xóa Hệ Thống
          </h3>
          <p class="text-sm text-gray-500 text-center mb-4">
            Bạn có chắc chắn muốn xóa hệ thống "<strong>{{ systemToDelete?.name }}</strong>"? Hành động này không thể hoàn tác.
          </p>

          <!-- Error Message in Delete Modal -->
          <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {{ errorMessage }}
          </div>

          <!-- Related Data Warning in Delete Modal -->
          <div v-if="relatedDataWarning" class="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <p class="font-semibold mb-2 text-sm">⚠️ Không thể xóa! Hệ thống có dữ liệu liên quan:</p>
            <ul class="list-disc list-inside text-sm">
              <li v-if="relatedDataWarning.channels > 0">{{ relatedDataWarning.channels }} kênh</li>
              <li v-if="relatedDataWarning.conversations > 0">{{ relatedDataWarning.conversations }} cuộc trò chuyện</li>
              <li v-if="relatedDataWarning.rules > 0">{{ relatedDataWarning.rules }} quy tắc</li>
              <li v-if="relatedDataWarning.telegramGroups > 0">{{ relatedDataWarning.telegramGroups }} nhóm Telegram</li>
              <li v-if="relatedDataWarning.tickets > 0">{{ relatedDataWarning.tickets }} ticket</li>
            </ul>
            <p class="text-xs mt-2">Vui lòng xóa các dữ liệu này trước.</p>
          </div>

          <div class="flex justify-center space-x-3 mt-6">
            <button
              @click="closeDeleteModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              @click="deleteSystem"
              :disabled="submitting || relatedDataWarning"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
            >
              {{ submitting ? 'Đang xóa...' : 'Xóa Hệ Thống' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';

// State
const systems = ref([]);
const loading = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const submitting = ref(false);
const errorMessage = ref('');
const relatedDataWarning = ref(null);
const systemToDelete = ref(null);

const formData = ref({
  name: '',
  elasticUrl: ''
});

const currentSystemId = ref(null);

// Methods
const loadSystems = async () => {
  loading.value = true;
  try {
    const response = await api.get('/systems');
    if (response.data && response.data.status === 'success') {
      systems.value = response.data.data;
    } else {
      systems.value = response.data || [];
    }
  } catch (error) {
    console.error('Error loading systems:', error);
    errorMessage.value = 'Không thể tải danh sách hệ thống';
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  formData.value = {
    name: '',
    elasticUrl: ''
  };
  currentSystemId.value = null;
  errorMessage.value = '';
  relatedDataWarning.value = null;
  showModal.value = true;
};

const openEditModal = (system) => {
  isEditing.value = true;
  formData.value = {
    name: system.name,
    elasticUrl: system.elasticUrl || ''
  };
  currentSystemId.value = system.id;
  errorMessage.value = '';
  relatedDataWarning.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  formData.value = {
    name: '',
    elasticUrl: ''
  };
  errorMessage.value = '';
  relatedDataWarning.value = null;
};

const submitForm = async () => {
  submitting.value = true;
  errorMessage.value = '';
  
  try {
    if (isEditing.value) {
      // Update existing system
      const response = await api.put(`/systems/${currentSystemId.value}`, formData.value);
      if (response.data.status === 'success') {
        await loadSystems();
        closeModal();
      }
    } else {
      // Create new system
      const response = await api.post('/systems', formData.value);
      if (response.data.status === 'success') {
        await loadSystems();
        closeModal();
      }
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    errorMessage.value = error.response?.data?.error || 'Có lỗi xảy ra khi lưu hệ thống';
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (system) => {
  systemToDelete.value = system;
  errorMessage.value = '';
  relatedDataWarning.value = null;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  systemToDelete.value = null;
  errorMessage.value = '';
  relatedDataWarning.value = null;
};

const deleteSystem = async () => {
  if (!systemToDelete.value) return;
  
  submitting.value = true;
  errorMessage.value = '';
  relatedDataWarning.value = null;
  
  try {
    const response = await api.delete(`/systems/${systemToDelete.value.id}`);
    if (response.data.status === 'success') {
      await loadSystems();
      closeDeleteModal();
    }
  } catch (error) {
    console.error('Error deleting system:', error);
    errorMessage.value = error.response?.data?.error || 'Có lỗi xảy ra khi xóa hệ thống';
    
    // Check if error contains related data information
    if (error.response?.data?.relatedData) {
      relatedDataWarning.value = error.response.data.relatedData;
    }
  } finally {
    submitting.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const truncateUrl = (url) => {
  if (!url) return '';
  if (url.length <= 50) return url;
  return url.substring(0, 47) + '...';
};

// Lifecycle
onMounted(() => {
  loadSystems();
});
</script>

<style scoped>
/* Additional styles if needed */
</style>

