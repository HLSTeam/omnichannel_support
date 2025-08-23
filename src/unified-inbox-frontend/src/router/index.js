import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue'; // Our main chat dashboard
import Login from '../views/Login.vue'; // The new login page
import AdminLayout from '../layouts/AdminLayout.vue'; // Admin layout

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: App,
    meta: { requiresAuth: true } // This route requires login
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true } // Admin only
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard - The "Bouncer"
router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('authToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const agentProfile = JSON.parse(localStorage.getItem('agentProfile') || '{}');

  // Use either user or agentProfile, whichever has the role
  const userRole = user.role || agentProfile.role;

  console.log('Router Guard Debug:', {
    to: to.path,
    loggedIn: !!loggedIn,
    userRole: userRole,
    user: user,
    agentProfile: agentProfile
  });

  if (to.meta.requiresAuth && !loggedIn) {
    // If the route requires auth and user is not logged in, redirect to login
    console.log('Redirecting to login: No auth token');
    next('/login');
  } else if (to.meta.requiresAdmin && userRole !== 'ADMIN') {
    // If route requires admin and user is not admin, redirect to dashboard
    console.log('Access denied: User role is', userRole, 'but ADMIN required');
    next('/');
  } else if (to.name === 'Login' && loggedIn) {
    // If user is logged in and tries to visit login page, redirect based on role
    if (userRole === 'ADMIN') {
      console.log('Redirecting admin to admin dashboard');
      next('/admin');
    } else {
      console.log('Redirecting agent to main dashboard');
      next('/');
    }
  } else {
    console.log('Proceeding to:', to.path);
    next(); // Otherwise, proceed
  }
});

export default router;