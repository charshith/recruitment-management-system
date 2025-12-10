<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Job Activity Overview</h1>
        <p class="text-gray-600 mt-1">Track job applications across all recruiters and clients</p>
      </div>
      <div class="flex items-center gap-3">
        <select
          v-model="days"
          @change="fetchActivity"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option :value="7">Last 7 days</option>
          <option :value="30">Last 30 days</option>
          <option :value="90">Last 90 days</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Summary Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Summary</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="text-sm text-gray-600">Total Applications</p>
            <p class="text-3xl font-bold text-gray-900">{{ activity.totalJobs }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Period</p>
            <p class="text-lg font-medium text-gray-900">
              {{ activity.period?.start }} to {{ activity.period?.end }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Days</p>
            <p class="text-lg font-medium text-gray-900">{{ activity.period?.days }} days</p>
          </div>
        </div>
      </div>

      <!-- Daily Activity -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Daily Activity</h2>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="(count, date) in activity.dailyActivity"
            :key="date"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span class="text-sm font-medium text-gray-700">{{ date }}</span>
            <span class="text-sm font-bold text-indigo-600">{{ count }} applications</span>
          </div>
        </div>
      </div>

      <!-- By Recruiter -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">By Recruiter</h2>
        <div class="space-y-2">
          <div
            v-for="(count, name) in activity.recruiterActivity"
            :key="name"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span class="text-sm font-medium text-gray-700">{{ name }}</span>
            <span class="text-sm font-bold text-purple-600">{{ count }} applications</span>
          </div>
        </div>
      </div>

      <!-- By Client -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">By Client</h2>
        <div class="space-y-2">
          <div
            v-for="(count, name) in activity.clientActivity"
            :key="name"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span class="text-sm font-medium text-gray-700">{{ name }}</span>
            <span class="text-sm font-bold text-blue-600">{{ count }} applications</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const activity = ref({})
const days = ref(30)
const loading = ref(true)
const error = ref(null)

const fetchActivity = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('adminToken')
    const response = await axios.get(`/api/admin/jobs/activity?days=${days.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    activity.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load activity'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchActivity()
})
</script>

