import { reactive } from 'vue';

export const agentStore = reactive({
  profile: JSON.parse(localStorage.getItem('agentProfile')) || null,
  isAdmin() {
    return this.profile && this.profile.role === 'ADMIN';
  },
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('agentProfile');
    this.profile = null;
  }
});