<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../api';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref(null);

const handleLogin = async () => {
  try {
    const response = await apiClient.post('/api/v1/auth/login', {
      email: email.value,
      password: password.value,
    });

    // Save the token to localStorage
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('agentProfile', JSON.stringify(response.data.agent));
    localStorage.setItem('user', JSON.stringify(response.data.agent)); // Add this for router guard


    // Redirect based on role
    if (response.data.agent.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/');
    }

  } catch (err) {
    error.value = 'Invalid email or password.';
    console.error('Login failed:', err);
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
      <h1 class="text-3xl font-bold text-center text-white">Agent Login</h1>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="text-sm font-medium text-gray-300">Email</label>
          <input v-model="email" type="email" id="email" required class="w-full px-4 py-2 mt-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
        </div>
        <div>
          <label for="password" class="text-sm font-medium text-gray-300">Password</label>
          <input v-model="password" type="password" id="password" required class="w-full px-4 py-2 mt-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
        </div>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
        <button type="submit" class="w-full px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
          Sign In
        </button>
      </form>
    </div>
  </div>
</template>