<template>
  <div class="admin-layout">
    <!-- Admin Header -->
    <header class="admin-header bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">
              🛠️ Admin Dashboard
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">
              Xin chào, {{ userInfo?.name || 'Admin' }}
            </span>
            <button
              @click="logout"
              class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Admin Navigation -->
    <nav class="admin-nav bg-gray-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="handleTabChange(tab.id)"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </nav>

    <!-- Admin Content -->
    <main class="admin-content bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Tab Content -->
        <div v-if="activeTab === 'overview'" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Stats Cards -->
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span class="text-white text-lg">👥</span>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Tổng Nhóm Telegram
                      </dt>
                      <dd class="text-lg font-medium text-gray-900">
                        {{ stats.totalGroups || 0 }}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span class="text-white text-lg">📱</span>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Nhóm Hoạt Động
                      </dt>
                      <dd class="text-lg font-medium text-gray-900">
                        {{ stats.activeGroups || 0 }}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span class="text-white text-lg">📊</span>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">
                        Tổng Thông Báo
                      </dt>
                      <dd class="text-lg font-medium text-gray-900">
                        {{ stats.totalNotifications || 0 }}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              🚀 Quick Actions
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                @click="activeTab = 'telegram-groups'"
                class="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <div class="text-2xl mb-2">➕</div>
                <div class="font-medium">Thêm Nhóm Mới</div>
              </button>
              
              <button
                @click="refreshStats"
                class="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <div class="text-2xl mb-2">🔄</div>
                <div class="font-medium">Làm Mới Dữ Liệu</div>
              </button>
              
              <button
                @click="exportGroups"
                class="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                <div class="text-2xl mb-2">📤</div>
                <div class="font-medium">Xuất Dữ Liệu</div>
              </button>
              
              <button
                @click="showSystemInfo"
                class="bg-gray-600 text-white p-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <div class="text-2xl mb-2">ℹ️</div>
                <div class="font-medium">Thông Tin Hệ Thống</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Telegram Groups Management Tab -->
        <div v-if="activeTab === 'telegram-groups'" class="space-y-6">
          <TelegramGroupManager />
        </div>

        <!-- Group Permission Templates Tab -->
        <div v-if="activeTab === 'permission-templates'" class="space-y-6">
          <PermissionTemplateManager />
        </div>

        <!-- User Declaration Management Tab -->
        <div v-if="activeTab === 'user-declarations'" class="space-y-6">
          <UserDeclarationManager />
        </div>

        <!-- System Settings Tab -->
        <div v-if="activeTab === 'settings'" class="space-y-6">
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              ⚙️ Cài Đặt Hệ Thống
            </h3>
            <p class="text-gray-600">
              Cài đặt hệ thống sẽ được thêm vào đây...
            </p>
          </div>
        </div>
      </div>
    </main>

    <!-- System Info Modal -->
    <div v-if="showSystemInfoModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">ℹ️ Thông Tin Hệ Thống</h3>
          <div class="space-y-3">
            <div>
              <span class="font-medium">Phiên bản Backend:</span>
              <span class="ml-2 text-gray-600">{{ systemInfo.backendVersion }}</span>
            </div>
            <div>
              <span class="font-medium">Cơ sở dữ liệu:</span>
              <span class="ml-2 text-gray-600">{{ systemInfo.database }}</span>
            </div>
            <div>
              <span class="font-medium">Cập nhật lần cuối:</span>
              <span class="ml-2 text-gray-600">{{ systemInfo.lastUpdated }}</span>
            </div>
          </div>
          <div class="mt-6">
            <button
              @click="showSystemInfoModal = false"
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import TelegramGroupManager from '../components/TelegramGroupManager.vue';
import UserDeclarationManager from '../components/UserDeclarationManager.vue';
import PermissionTemplateManager from '../components/PermissionTemplateManager.vue';
import api from '../api.js';

export default {
  name: 'AdminLayout',
  components: {
    TelegramGroupManager,
    UserDeclarationManager,
    PermissionTemplateManager
  },
  setup() {
    const router = useRouter();
    
    // Reactive data
    const activeTab = ref(localStorage.getItem('adminActiveTab') || 'overview');
    const stats = ref({});
    const userInfo = ref({});
    const showSystemInfoModal = ref(false);
    const systemInfo = ref({});

    // Navigation tabs
    const tabs = [
      { id: 'overview', label: '📊 Tổng Quan' },
      { id: 'telegram-groups', label: '🚀 Quản Lý Nhóm Telegram' },
      { id: 'user-declarations', label: '👥 User Declaration Management' },
      { id: 'permission-templates', label: '🔧 Permission Management' },
      { id: 'settings', label: '⚙️ Cài Đặt' }
    ];

    // Method to handle tab change
    const handleTabChange = (tabId) => {
      activeTab.value = tabId;
      localStorage.setItem('adminActiveTab', tabId);
    };

    // Methods
    const loadStats = async () => {
      try {
        const response = await api.get('/telegram-groups');
        const groupsData = response.data;
        
        if (groupsData.success) {
          const groups = groupsData.data || [];
          stats.value = {
            totalGroups: groups.length,
            activeGroups: groups.filter(g => g.isActive).length,
            totalNotifications: groups.reduce((sum, g) => sum + (g._count?.notifications || 0), 0)
          };
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    const refreshStats = () => {
      loadStats();
    };

    const exportGroups = () => {
      alert('Tính năng xuất dữ liệu sẽ được thêm vào đây...');
    };

    const showSystemInfo = () => {
      systemInfo.value = {
        backendVersion: '1.0.0',
        database: 'PostgreSQL',
        lastUpdated: new Date().toLocaleString('vi-VN')
      };
      showSystemInfoModal.value = true;
    };

    const logout = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('agentProfile');
      router.push('/login');
    };

    // Load user info from localStorage
    const loadUserInfo = () => {
      try {
        const user = localStorage.getItem('user');
        const agentProfile = localStorage.getItem('agentProfile');
        
        if (user) {
          userInfo.value = JSON.parse(user);
        } else if (agentProfile) {
          userInfo.value = JSON.parse(agentProfile);
        }
      } catch (error) {
        console.error('Error loading user info:', error);
        userInfo.value = {};
      }
    };

    // Lifecycle
    onMounted(() => {
      loadUserInfo();
      loadStats();
    });

    return {
      // Data
      activeTab,
      tabs,
      stats,
      userInfo,
      showSystemInfoModal,
      systemInfo,
      
      // Methods
      handleTabChange,
      loadStats,
      refreshStats,
      exportGroups,
      showSystemInfo,
      logout
    };
  }
};
</script>

<style>
/* Admin Layout - Scrollable và đẹp */
.admin-layout {
  height: 100vh;
  background-color: #f9fafb;
  overflow-y: auto;
  overflow-x: hidden;
}

.admin-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background-color: white;
}

.admin-nav {
  position: sticky;
  top: 64px;
  z-index: 30;
  background-color: #f9fafb;
}

.admin-content {
  flex: 1;
  padding-bottom: 3rem;
}

/* Override các conflict từ main app */
body:has(.admin-layout) {
  overflow: visible !important;
}

html:has(.admin-layout) {
  overflow: visible !important;
}

/* Force scroll cho admin */
.admin-layout * {
  max-height: none !important;
}

.admin-layout .h-screen {
  height: auto !important;
}

.admin-layout .overflow-hidden {
  overflow: visible !important;
}
</style>
