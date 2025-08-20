import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue'; // Our main chat dashboard
import Login from '../views/Login.vue'; // The new login page

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: App,
    meta: { requiresAuth: true } // This route requires login
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

  if (to.meta.requiresAuth && !loggedIn) {
    // If the route requires auth and user is not logged in, redirect to login
    next('/login');
  } else if (to.name === 'Login' && loggedIn) {
    // If user is logged in and tries to visit login page, redirect to dashboard
    next('/');
  } else {
    next(); // Otherwise, proceed
  }
});

export default router;