<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 ease-in-out">
    <!-- Top Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 transition-colors duration-300 ease-in-out">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16 sm:h-20">
          <div class="flex items-center gap-3">
            <div class="hidden sm:flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-md">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <RouterLink
              to="/client/dashboard"
              class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300 ease-in-out hover:text-primary-600 dark:hover:text-primary-400"
            >
              Client Dashboard
            </RouterLink>
          </div>
          <div class="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors duration-300 ease-in-out">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300 ease-in-out">{{ client?.name || client?.email }}</span>
            </div>
            <button
              type="button"
              @click="handleLogout"
              :aria-label="'Logout'"
              class="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 ease-in-out flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer"
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

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <RouterView />
    </main>

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { computed, onMounted, onUnmounted } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const router = useRouter()
const authStore = useAuthStore()

const client = computed(() => authStore.client)

const handleLogout = () => {
  authStore.clientLogout()
  router.push('/client/login')
}

// Keyboard shortcuts
const themeStore = useThemeStore()
const handleKeyDown = (e) => {
  // Cmd/Ctrl + D for dark mode toggle
  if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
    e.preventDefault()
    themeStore.toggleTheme()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  // Refresh client data from DB on mount to get latest name
  authStore.refreshClient()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>
