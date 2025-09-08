<template>
  <div class="group-permission-manager">
    <!-- Header -->
    <div class="header mb-6">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">
        🎯 Group Permission Templates
      </h2>
      <p class="text-gray-600">
        Quản lý permission templates cho từng loại nhóm (ADMIN, CUSTOMER, SUPPLIER)
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600">Đang tải permission templates...</p>
    </div>

    <!-- Permission Templates -->
    <div v-else-if="permissionTemplates" class="space-y-6">
      <!-- Admin Group -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-700 flex items-center">
            👑 Admin Group
          </h3>
          <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {{ permissionTemplates.ADMIN?.length || 0 }} permissions
          </span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="permission in permissionTemplates.ADMIN"
            :key="permission.name"
            class="bg-gray-50 rounded-lg p-3 border border-gray-200"
          >
            <div class="font-medium text-gray-900">{{ permission.name }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ permission.description }}</div>
          </div>
        </div>
      </div>

      <!-- Customer Group -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-700 flex items-center">
            👥 Customer Group
          </h3>
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {{ permissionTemplates.CUSTOMER?.length || 0 }} permissions
          </span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="permission in permissionTemplates.CUSTOMER"
            :key="permission.name"
            class="bg-gray-50 rounded-lg p-3 border border-gray-200"
          >
            <div class="font-medium text-gray-900">{{ permission.name }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ permission.description }}</div>
          </div>
        </div>
      </div>

      <!-- Supplier Group -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-700 flex items-center">
            🚚 Supplier Group
          </h3>
          <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {{ permissionTemplates.SUPPLIER?.length || 0 }} permissions
          </span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="permission in permissionTemplates.SUPPLIER"
            :key="permission.name"
            class="bg-gray-50 rounded-lg p-3 border border-gray-200"
          >
            <div class="font-medium text-gray-900">{{ permission.name }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ permission.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div class="text-red-600 text-lg mb-2">❌ Lỗi tải permission templates</div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        @click="loadPermissionTemplates"
        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Thử lại
      </button>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
      <div class="text-gray-600 text-lg mb-2">📭 Không có permission templates</div>
      <p class="text-gray-600">Hãy kiểm tra backend để đảm bảo dữ liệu đã được seed.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api.js';

// Reactive data
const loading = ref(true);
const error = ref(null);
const permissionTemplates = ref(null);

// Load permission templates
const loadPermissionTemplates = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Lấy system ID từ localStorage hoặc sử dụng default
    const systemId = localStorage.getItem('systemId') || '25ceca8e-c455-4b86-a54c-69dc9be79ad9';
    
    const response = await api.get(`/permissions/templates?systemId=${systemId}`);
    
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

// Lifecycle
onMounted(() => {
  loadPermissionTemplates();
});
</script>

<style scoped>
.group-permission-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 1rem;
}

.permission-card {
  transition: all 0.2s ease-in-out;
}

.permission-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
