import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://unified_inbox_backend:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// This is the interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // If the token exists, add it to the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export both default and named export for compatibility
export default apiClient;
export const api = apiClient;