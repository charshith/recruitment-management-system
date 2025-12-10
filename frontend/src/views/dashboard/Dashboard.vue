<template>
  <div class="space-y-6 sm:space-y-8">
    <!-- Dashboard Header -->
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300 ease-in-out">Dashboard</h1>
      <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 transition-colors duration-300 ease-in-out">Overview of your recruitment activity</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <StatCard
        v-if="!loading"
        label="Today's Applications"
        :value="stats.todayApplications"
        :icon="DocumentIcon"
        icon-bg="bg-blue-100 dark:bg-blue-900/30"
        icon-color="text-blue-600 dark:text-blue-400"
      />
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse border border-gray-100 dark:border-gray-700">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>

      <StatCard
        v-if="!loading"
        label="This Week"
        :value="stats.weekApplications"
        :icon="CalendarIcon"
        icon-bg="bg-green-100 dark:bg-green-900/30"
        icon-color="text-green-600 dark:text-green-400"
      />
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse border border-gray-100 dark:border-gray-700">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>

      <StatCard
        v-if="!loading"
        label="This Month"
        :value="stats.monthApplications"
        :icon="ChartBarIcon"
        icon-bg="bg-purple-100 dark:bg-purple-900/30"
        icon-color="text-purple-600 dark:text-purple-400"
      />
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse border border-gray-100 dark:border-gray-700 sm:col-span-2 lg:col-span-1">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>

    <!-- Assigned Clients -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300 ease-in-out">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 transition-colors duration-300 ease-in-out">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">Assigned Clients</h2>
        <p class="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 ease-in-out">Click on a client to start applying to jobs</p>
      </div>

      <!-- Error State -->
      <div v-if="error && !loading" class="p-6 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
          <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-1">Error Loading Clients</h3>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">{{ error }}</p>
        <button
          @click="fetchDashboardData"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </div>

      <div v-else-if="loading" class="p-4 sm:p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div class="flex gap-4">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      </div>

      <div v-else-if="clients.length === 0" class="p-8 sm:p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-1">No clients assigned</h3>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Get started by contacting your administrator.</p>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="client in clients"
          :key="client.id"
          @click="goToClient(client.id)"
          @keydown.enter="goToClient(client.id)"
          @keydown.space.prevent="goToClient(client.id)"
          :tabindex="0"
          :aria-label="`View ${client.name} details`"
          role="button"
          class="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-300 ease-in-out group active:bg-gray-100 dark:active:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
        >
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-3 sm:mb-2">
                <div class="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-semibold text-base sm:text-lg shadow-md">
                  {{ client.name.charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300 ease-in-out truncate">{{ client.name }}</h3>
                  <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 ease-in-out truncate">{{ client.email }}</p>
                </div>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-3 sm:mt-4">
                <div class="flex items-center gap-2">
                  <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 ease-in-out">Daily Target:</span>
                  <span class="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white transition-colors duration-300 ease-in-out">{{ client.dailyTarget }} jobs</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 ease-in-out">Today:</span>
                  <span 
                    class="text-xs sm:text-sm font-semibold px-2 py-1 rounded-full"
                    :class="client.todayApplications >= client.dailyTarget 
                      ? 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30' 
                      : 'text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30'"
                  >
                    {{ client.todayApplications }}/{{ client.dailyTarget }}
                  </span>
                </div>
                <div class="flex-1 max-w-full sm:max-w-xs">
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full transition-all duration-300 ease-in-out"
                      :class="client.todayApplications >= client.dailyTarget ? 'bg-green-500 dark:bg-green-400' : 'bg-orange-500 dark:bg-orange-400'"
                      :style="{ width: `${Math.min((client.todayApplications / client.dailyTarget) * 100, 100)}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-shrink-0 sm:ml-4">
              <svg class="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import StatCard from '@/components/StatCard.vue'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import { 
  DocumentIcon, 
  CalendarIcon, 
  ChartBarIcon 
} from '@heroicons/vue/24/outline'

const router = useRouter()
const toastStore = useToastStore()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const clients = ref([])
const stats = ref({
  todayApplications: 0,
  weekApplications: 0,
  monthApplications: 0
})

const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Fetch clients and stats in parallel
    const [clientsResponse, statsResponse] = await Promise.all([
      api.get('/recruiters/me/clients'),
      api.get('/recruiters/me/dashboard')
    ])
    
    // Ensure we have valid data
    clients.value = Array.isArray(clientsResponse.data) ? clientsResponse.data : []
    stats.value = statsResponse.data && typeof statsResponse.data === 'object' ? statsResponse.data : {
      todayApplications: 0,
      weekApplications: 0,
      monthApplications: 0
    }
    
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load dashboard data'
    
    // Show error toast
    if (err.response?.status === 401) {
      toastStore.error('Session expired. Please login again.')
      // Clear auth and redirect to login after a delay
      setTimeout(() => {
        authStore.logout()
        router.push('/login')
      }, 2000)
    } else if (err.response?.status === 404) {
      // Recruiter not found - account may have been deleted
      const message = err.response?.data?.message || 'Your account may have been deleted. Please contact administrator.'
      toastStore.error(message)
      // Redirect to login after a delay
      setTimeout(() => {
        authStore.logout()
        router.push('/login')
      }, 3000)
    } else if (err.response?.status === 429) {
      toastStore.error('Too many requests. Please wait a moment and try again.')
    } else {
      toastStore.error(error.value)
    }
  } finally {
    loading.value = false
  }
}

const goToClient = (clientId) => {
  router.push(`/dashboard/client/${clientId}`)
}

// Listen for job added event
const handleJobAdded = () => {
  fetchDashboardData()
}

onMounted(() => {
  fetchDashboardData()
  window.addEventListener('job-added', handleJobAdded)
})

// Cleanup
onUnmounted(() => {
  window.removeEventListener('job-added', handleJobAdded)
})
</script>
