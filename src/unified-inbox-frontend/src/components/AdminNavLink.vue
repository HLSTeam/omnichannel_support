<template>
  <div v-if="isAdmin" class="admin-nav-link">
    <router-link
      to="/admin"
      class="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors duration-200"
    >
      <span class="mr-2">🛠️</span>
      Admin Dashboard
    </router-link>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'AdminNavLink',
  setup() {
    const isAdmin = ref(false);

    const checkAdminRole = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const agentProfile = JSON.parse(localStorage.getItem('agentProfile') || '{}');
        
        // Check both user and agentProfile for role
        const userRole = user.role || agentProfile.role;
        isAdmin.value = userRole === 'ADMIN';
        
        console.log('AdminNavLink: User role is', userRole, 'isAdmin:', isAdmin.value);
      } catch (error) {
        console.error('Error checking admin role:', error);
        isAdmin.value = false;
      }
    };

    onMounted(() => {
      checkAdminRole();
    });

    return {
      isAdmin
    };
  }
};
</script>

<style scoped>
.admin-nav-link {
  /* Component styles */
}
</style>
