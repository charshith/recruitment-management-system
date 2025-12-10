<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-3">
            <button
              @click="sidebarOpen = !sidebarOpen"
              class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div class="hidden sm:flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-md">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <RouterLink to="/admin/dashboard" class="text-base sm:text-lg font-bold text-gray-900">
              <span class="hidden sm:inline">Admin Dashboard</span>
              <span class="sm:hidden">Admin</span>
            </RouterLink>
          </div>
          <div class="flex items-center gap-2 sm:gap-4">
            <RouterLink
              to="/admin/profile"
              class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
              title="View profile"
            >
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm font-medium text-gray-700">{{ admin?.name || admin?.email }}</span>
            </RouterLink>
            <button
              @click="refreshAdminData"
              class="hidden sm:flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              title="Refresh admin data"
            >
              <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              @click="handleLogout"
              class="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              aria-label="Logout"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span class="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Sidebar Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <div class="flex relative">
      <!-- Sidebar -->
      <aside
        :class="[
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] transform transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        ]"
      >
        <nav class="p-4 space-y-2">
          <div class="flex items-center justify-between mb-4 lg:hidden">
            <h2 class="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              @click="sidebarOpen = false"
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <RouterLink
            to="/admin/dashboard"
            @click="sidebarOpen = false"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="$route.path === '/admin/dashboard' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </RouterLink>
          <RouterLink
            to="/admin/clients"
            @click="sidebarOpen = false"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="$route.path.startsWith('/admin/clients') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Clients
          </RouterLink>
          <RouterLink
            to="/admin/recruiters"
            @click="sidebarOpen = false"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="$route.path.startsWith('/admin/recruiters') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Recruiters
          </RouterLink>
          <RouterLink
            to="/admin/jobs"
            @click="sidebarOpen = false"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="$route.path.startsWith('/admin/jobs') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Jobs
          </RouterLink>
          <RouterLink
            to="/admin/sessions"
            @click="sidebarOpen = false"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="$route.path.startsWith('/admin/sessions') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Sessions
          </RouterLink>
          <RouterLink
            to="/admin/activity"
            @click="sidebarOpen = false"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="$route.path.startsWith('/admin/activity') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Activity
          </RouterLink>
          <RouterLink
            to="/admin/reports"
            @click="sidebarOpen = false"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="$route.path.startsWith('/admin/reports') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reports
          </RouterLink>
          <RouterLink
            to="/admin/admins"
            @click="sidebarOpen = false"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="$route.path.startsWith('/admin/admins') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Admins
          </RouterLink>
          <RouterLink
            to="/admin/profile"
            @click="sidebarOpen = false"
            class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            :class="$route.path.startsWith('/admin/profile') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </RouterLink>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-4 sm:p-6 w-full lg:w-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

const admin = computed(() => authStore.admin)

const handleLogout = () => {
  authStore.adminLogout()
  router.push('/admin/login')
}

// Close sidebar on route change (mobile)
const closeSidebarOnRouteChange = () => {
  sidebarOpen.value = false
}

// Close sidebar on escape key
const handleEscape = (e) => {
  if (e.key === 'Escape' && sidebarOpen.value) {
    sidebarOpen.value = false
  }
}

// Refresh admin data periodically and on focus
let refreshInterval = null

const refreshAdminData = async () => {
  if (authStore.isAdminAuthenticated) {
    try {
      await authStore.refreshAdmin()
      // Force reactivity update
      if (admin.value) {
        // Trigger reactivity by accessing the value
        const _ = admin.value.name
      }
    } catch (error) {
      console.error('Error refreshing admin data:', error)
    }
  }
}

onMounted(() => {
  router.afterEach(closeSidebarOnRouteChange)
  document.addEventListener('keydown', handleEscape)
  
  // Refresh admin data on mount immediately (with small delay to ensure auth is ready)
  setTimeout(() => {
    refreshAdminData()
  }, 100)
  
  // Refresh every 5 seconds (very frequent for real-time sync)
  refreshInterval = setInterval(refreshAdminData, 5000)
  
  // Refresh when window gains focus (user switches back to tab)
  window.addEventListener('focus', refreshAdminData)
  
  // Also refresh on visibility change (tab becomes visible)
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      refreshAdminData()
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Store handler for cleanup
  window._adminVisibilityHandler = handleVisibilityChange
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('focus', refreshAdminData)
  if (window._adminVisibilityHandler) {
    document.removeEventListener('visibilitychange', window._adminVisibilityHandler)
    delete window._adminVisibilityHandler
  }
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

