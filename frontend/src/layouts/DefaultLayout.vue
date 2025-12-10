<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 ease-in-out">
    <!-- Top Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 transition-colors duration-300 ease-in-out">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16 sm:h-20">
          <div class="flex items-center gap-3">
            <div class="hidden sm:flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-md">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <RouterLink
              to="/dashboard"
              class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300 ease-in-out hover:text-primary-600 dark:hover:text-primary-400"
            >
              Recruiter Dashboard
            </RouterLink>
          </div>
          <div class="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors duration-300 ease-in-out">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300 ease-in-out">{{ recruiter?.name || recruiter?.email }}</span>
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

    <!-- Quick Job Add Widget -->
    <QuickJobAdd />

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { computed, onMounted, onUnmounted } from 'vue'
import QuickJobAdd from '@/components/QuickJobAdd.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ToastContainer from '@/components/ToastContainer.vue'

const router = useRouter()
const authStore = useAuthStore()

const recruiter = computed(() => authStore.recruiter)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}


// Keyboard shortcuts
const themeStore = useThemeStore()
const handleKeyDown = (e) => {
  // Cmd/Ctrl + D for dark mode toggle
  if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
    e.preventDefault()
    themeStore.toggleTheme()
  }
  // Cmd/Ctrl + K for quick add (if on dashboard)
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    const fab = document.querySelector('[title="Quick Add Job"]')
    if (fab) fab.click()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  // Refresh recruiter data from DB on mount to get latest name
  // Do this silently - don't show errors if it fails
  authStore.refreshRecruiter().catch(() => {
    // Silently fail - recruiter data from localStorage is fine
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>
