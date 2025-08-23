<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { agentStore } from '../store';



const emit = defineEmits(['toggle-chat', 'toggle-kanban']);

const router = useRouter(); // <-- Initialize the router

// User info
const userName = ref('');
const userRole = ref('');
const userInitials = ref('');

const handleLogout = () => {
  localStorage.removeItem('authToken'); // Remove the token
  localStorage.removeItem('user');
  localStorage.removeItem('agentProfile');
  router.push('/login'); // Redirect to login page
};

const handleProfile = () => {
  // TODO: Implement profile management
  console.log('Profile management clicked');
};

onMounted(async () => {
  try {
    // Load user info
    const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('agentProfile') || '{}');
    userName.value = user.name || 'User';
    userRole.value = user.role === 'Admin' ? 'Admin' : 'Agent';
    userInitials.value = userName.value.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  } catch (err) {
    console.error('Error loading user info:', err);
  }
});
</script>

<template>
  <div class="p-4 h-full flex flex-col">
    <!-- Logo/Brand Section -->
    <div class="mb-6 text-center">
      <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-2 flex items-center justify-center shadow-lg">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
      </div>
      <h1 class="text-lg font-bold text-slate-800 mb-1">Omnichannel</h1>
      <p class="text-xs text-slate-500">Support System</p>
    </div>



          <!-- Navigation Section -->
      <div class="mb-6">
        <h3 class="text-sm font-semibold mb-3 text-slate-800">Chức Năng</h3>
        <div class="space-y-1">
          <button 
            @click="emit('toggle-chat')" 
            class="w-full bg-white hover:bg-slate-50 p-2 rounded-lg text-sm transition-colors text-left border border-slate-200 hover:border-slate-300 shadow-sm"
          >
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <span class="text-white text-xs">💬</span>
              </div>
              <span class="text-slate-800 font-medium">Kênh Chat</span>
            </div>
          </button>
          
          <button 
            @click="emit('toggle-kanban')" 
            class="w-full bg-white hover:bg-slate-50 p-2 rounded-lg text-sm transition-colors text-left border border-slate-200 hover:border-slate-300 shadow-sm"
          >
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-emerald-600 rounded flex items-center justify-center">
                <span class="text-white text-xs">🎯</span>
              </div>
              <span class="text-slate-800 font-medium">Helpdesk</span>
            </div>
          </button>
        </div>
      </div>
    
          <!-- User Profile Section -->
      <div class="mt-auto p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="flex items-center space-x-2 mb-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm">
            <span class="text-white font-bold text-xs">
              {{ userInitials }}
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-800 truncate">{{ userName }}</p>
            <p class="text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-full inline-block border border-slate-200">{{ userRole }}</p>
          </div>
        </div>
      
      <!-- Profile & Logout -->
      <div class="space-y-1">
        <button 
          @click="handleProfile" 
          class="w-full bg-white hover:bg-slate-50 p-2 rounded-lg text-xs transition-colors border border-slate-200 hover:border-slate-300 shadow-sm"
        >
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center">
              <span class="text-white text-xs">👤</span>
            </div>
            <span class="text-slate-800 font-medium">Profile</span>
          </div>
        </button>
        
        <button 
          @click="handleLogout" 
          class="w-full bg-white hover:bg-red-50 p-2 rounded-lg transition-colors border border-slate-200 hover:border-red-200 shadow-sm"
        >
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-red-600 rounded flex items-center justify-center">
              <span class="text-white text-xs">🚪</span>
            </div>
            <span class="text-slate-800 font-medium text-xs">Đăng xuất</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>