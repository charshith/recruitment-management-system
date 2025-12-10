<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-colors duration-300 ease-in-out">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Activity Timeline</h3>
      <button
        @click="loadMore"
        v-if="hasMore"
        class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
      >
        Load More
      </button>
    </div>
    
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="animate-pulse">
        <div class="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>

    <div v-else-if="activities.length === 0" class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
        <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400">No activity yet</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <!-- Timeline line -->
        <div class="flex-shrink-0">
          <div class="w-2 h-2 rounded-full mt-2" :class="getActivityColor(activity.type)"></div>
          <div v-if="activity !== activities[activities.length - 1]" class="w-0.5 h-full bg-gray-200 dark:bg-gray-700 ml-0.5 mt-1"></div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ activity.action }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ activity.description }}
              </p>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {{ formatDate(activity.date) }}
                </span>
                <span
                  v-if="activity.status"
                  class="text-xs px-2 py-0.5 rounded-full"
                  :class="getStatusClass(activity.status)"
                >
                  {{ activity.status }}
                </span>
                <span v-if="activity.duration" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ activity.duration }} min
                </span>
              </div>
            </div>
            <div class="flex-shrink-0">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ activity.clientName }}
              </span>
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
import { format } from 'date-fns'

const props = defineProps({
  limit: {
    type: Number,
    default: 20
  }
})

const activities = ref([])
const loading = ref(true)
const hasMore = ref(false)
const currentLimit = ref(props.limit)

const fetchTimeline = async () => {
  try {
    loading.value = true
    const response = await api.get(`/recruiters/me/timeline?limit=${currentLimit.value}`)
    activities.value = response.data || []
    hasMore.value = response.data.length >= currentLimit.value
  } catch (error) {
    console.error('Error fetching timeline:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  currentLimit.value += 20
  fetchTimeline()
}

const formatDate = (dateString) => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch {
    return dateString
  }
}

const getActivityColor = (type) => {
  return type === 'job' 
    ? 'bg-primary-500' 
    : 'bg-green-500'
}

const getStatusClass = (status) => {
  const classes = {
    'Applied': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    'Not Fit': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    'Duplicate': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    'completed': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
  }
  return classes[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
}

onMounted(() => {
  fetchTimeline()
})
</script>

