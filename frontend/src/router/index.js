import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      component: () => import('@/layouts/DefaultLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/Dashboard.vue')
        },
        {
          path: 'client/:clientId',
          name: 'ClientDetails',
          component: () => import('@/views/clients/ClientDetails.vue')
        }
      ]
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('@/views/admin/AdminLogin.vue'),
      meta: { requiresAdminAuth: false }
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAdminAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/AdminDashboard.vue')
        },
        {
          path: 'clients',
          name: 'AdminClients',
          component: () => import('@/views/admin/ClientManagement.vue')
        },
        {
          path: 'clients/:clientId',
          name: 'AdminClientDetails',
          component: () => import('@/views/admin/ClientDetails.vue')
        },
        {
          path: 'recruiters',
          name: 'AdminRecruiters',
          component: () => import('@/views/admin/RecruiterManagement.vue')
        },
        {
          path: 'recruiters/:recruiterId',
          name: 'AdminRecruiterDetails',
          component: () => import('@/views/admin/RecruiterDetails.vue')
        },
        {
          path: 'jobs',
          name: 'AdminJobs',
          component: () => import('@/views/admin/JobManagement.vue')
        },
        {
          path: 'sessions',
          name: 'AdminSessions',
          component: () => import('@/views/admin/SessionManagement.vue')
        },
        {
          path: 'activity',
          name: 'AdminActivity',
          component: () => import('@/views/admin/ActivityOverview.vue')
        },
        {
          path: 'reports',
          name: 'AdminReports',
          component: () => import('@/views/admin/Reports.vue')
        },
        {
          path: 'admins',
          name: 'AdminManagement',
          component: () => import('@/views/admin/AdminManagement.vue')
        },
        {
          path: 'profile',
          name: 'AdminProfile',
          component: () => import('@/views/admin/AdminProfile.vue')
        }
      ]
    },
    {
      path: '/client/login',
      name: 'ClientLogin',
      component: () => import('@/views/auth/ClientLogin.vue'),
      meta: { requiresClientAuth: false }
    },
    {
      path: '/client',
      component: () => import('@/layouts/ClientLayout.vue'),
      meta: { requiresClientAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'ClientDashboard',
          component: () => import('@/views/clients/ClientDashboard.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const adminToken = localStorage.getItem('adminToken')
  const clientToken = localStorage.getItem('clientToken')
  
  // Admin routes
  if (to.path.startsWith('/admin')) {
    if (to.path === '/admin/login') {
      if (adminToken) {
        next('/admin/dashboard')
      } else {
        next()
      }
    } else {
      if (!adminToken) {
        next('/admin/login')
      } else {
        next()
      }
    }
  }
  // Client routes
  else if (to.path.startsWith('/client')) {
    if (to.path === '/client/login') {
      if (clientToken) {
        next('/client/dashboard')
      } else {
        next()
      }
    } else {
      if (!clientToken) {
        next('/client/login')
      } else {
        next()
      }
    }
  }
  // Recruiter routes
  else {
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next('/login')
    } else if (to.path === '/login' && authStore.isAuthenticated) {
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router


