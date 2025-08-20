<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api';
import { HardDrive } from 'lucide-vue-next'; // Import icon
import { useRouter } from 'vue-router';
import { agentStore } from '../store';

defineProps({
  activeSystemId: String // Nhận ID hệ thống đang active để highlight
});
const emit = defineEmits(['select-system', 'toggle-rules']);

const systems = ref([]);
const error = ref(null);
const router = useRouter(); // <-- Initialize the router

const handleLogout = () => {
  localStorage.removeItem('authToken'); // Remove the token
  router.push('/login'); // Redirect to login page
};

onMounted(async () => {
  try {
    const response = await apiClient.get('/systems');
    systems.value = response.data;
    // Tự động chọn hệ thống đầu tiên khi tải xong
    if (response.data.length > 0) {
      emit('select-system', response.data[0].id);
    }
  } catch (err) {
    error.value = "Không thể tải hệ thống";
    console.error(err);
  }
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Các Hệ Thống</h1>
    <div v-if="error" class="text-red-400">{{ error }}</div>
    <ul v-else class="space-y-2">
      <li
        v-for="system in systems"
        :key="system.id"
        @click="emit('select-system', system.id)" :class="[
          'flex items-center p-2 rounded-md cursor-pointer transition-colors',
          activeSystemId === system.id ? 'bg-cyan-600' : 'bg-gray-700 hover:bg-gray-600'
        ]"
      >
        <HardDrive class="w-5 h-5 mr-3" />
        <span class="font-semibold">{{ system.name }}</span>
      </li>
    </ul>
    <button v-if="agentStore.isAdmin()" @click="$emit('toggle-rules')" class="...">
    Quản lý Bot
  </button>
    <div class="mt-auto">
      <button 
        @click="handleLogout" 
        class="w-full bg-red-600 p-2 rounded hover:bg-red-700 transition-colors"
      >
        Đăng xuất
      </button>
    </div>
  </div>
</template>