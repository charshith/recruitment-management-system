<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300 ease-in-out">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Productivity Insights</h3>
    
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse">
        <div class="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
          <p class="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Current Streak</p>
          <p class="text-3xl font-bold text-blue-900 dark:text-blue-100">{{ insights.currentStreak }}</p>
          <p class="text-xs text-blue-700 dark:text-blue-300 mt-1">days in a row</p>
        </div>

        <div class="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg">
          <p class="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Avg per Session</p>
          <p class="text-3xl font-bold text-green-900 dark:text-green-100">{{ insights.averagePerSession }}</p>
          <p class="text-xs text-green-700 dark:text-green-300 mt-1">applications</p>
        </div>

        <div class="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg">
          <p class="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Best Time</p>
          <p class="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {{ insights.bestPerformingHour ? formatHour(insights.bestPerformingHour.hour) : 'N/A' }}
          </p>
          <p class="text-xs text-purple-700 dark:text-purple-300 mt-1">
            {{ insights.bestPerformingHour ? `${insights.bestPerformingHour.count} applications` : '' }}
          </p>
        </div>

        <div class="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg">
          <p class="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Total Sessions</p>
          <p class="text-3xl font-bold text-orange-900 dark:text-orange-100">{{ insights.totalSessions }}</p>
          <p class="text-xs text-orange-700 dark:text-orange-300 mt-1">completed</p>
        </div>
      </div>

      <!-- Achievement Badges -->
      <div v-if="insights.badges && insights.badges.length > 0">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">Achievement Badges</h4>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="badge in insights.badges"
            :key="badge.id"
            class="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div>
              <p class="text-xs font-semibold text-yellow-900 dark:text-yellow-100">{{ badge.name }}</p>
              <p class="text-xs text-yellow-700 dark:text-yellow-300">{{ badge.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const insights = ref({
  currentStreak: 0,
  averagePerSession: 0,
  bestPerformingHour: null,
  totalSessions: 0,
  totalJobs: 0,
  badges: []
})

const loading = ref(true)

const formatHour = (hour) => {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:00 ${period}`
}

const fetchInsights = async () => {
  try {
    loading.value = true
    const response = await api.get('/recruiters/me/insights')
    insights.value = response.data || insights.value
  } catch (error) {
    console.error('Error fetching insights:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchInsights()
})
</script>

