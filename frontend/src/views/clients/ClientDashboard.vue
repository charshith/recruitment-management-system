<template>
  <div class="space-y-6 sm:space-y-8">
    <!-- Dashboard Header -->
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300 ease-in-out">Dashboard</h1>
      <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 transition-colors duration-300 ease-in-out">Overview of your job applications</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse border border-gray-100 dark:border-gray-700">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>

      <StatCard
        v-if="!loading"
        label="Total Applications"
        :value="stats.totalApplications"
        :icon="BriefcaseIcon"
        icon-bg="bg-indigo-100 dark:bg-indigo-900/30"
        icon-color="text-indigo-600 dark:text-indigo-400"
      />
      <div v-else class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse border border-gray-100 dark:border-gray-700">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>

    <!-- Recruiter Info & Target Progress -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Assigned Recruiter -->
      <div v-if="recruiter && !loading" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assigned Recruiter</h2>
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg shadow-md">
            {{ recruiter.name.charAt(0) }}
          </div>
          <div>
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ recruiter.name }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ recruiter.email }}</p>
          </div>
        </div>
      </div>

      <!-- Daily Target Progress -->
      <div v-if="!loading && stats.dailyTarget > 0" class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Target</h2>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600 dark:text-gray-400">Progress</span>
            <span class="font-semibold text-gray-900 dark:text-white">
              {{ stats.todayApplications }} / {{ stats.dailyTarget }}
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              class="h-3 rounded-full transition-all duration-300"
              :class="stats.todayApplications >= stats.dailyTarget ? 'bg-green-500 dark:bg-green-400' : 'bg-orange-500 dark:bg-orange-400'"
              :style="{ width: `${Math.min((stats.todayApplications / stats.dailyTarget) * 100, 100)}%` }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ stats.todayApplications >= stats.dailyTarget ? 'Target achieved! 🎉' : `${stats.dailyTarget - stats.todayApplications} more applications needed` }}
          </p>
        </div>
      </div>
    </div>

    <!-- Session Status Card -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Session Status</h2>
            <p class="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Current recruitment session activity</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="fetchSessionData"
              class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
              title="Refresh session status"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              v-if="sessionHistory.length > 0"
              @click="showSessionHistory = !showSessionHistory"
              class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              {{ showSessionHistory ? 'Hide History' : 'View History' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Active Session -->
      <div v-if="activeSession && !sessionLoading && activeSession.id" class="p-4 sm:p-6">
        <div class="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">Active Session</h3>
              <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                Live
              </span>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Duration: <strong class="text-gray-900 dark:text-white">{{ activeSessionDuration }}</strong></span>
              </div>
              <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Started: <strong class="text-gray-900 dark:text-white">{{ formatTime(activeSession.startTime) }}</strong></span>
              </div>
              <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Jobs Applied: <strong class="text-gray-900 dark:text-white">{{ activeSession.jobsApplied || 0 }}</strong></span>
              </div>
              <div v-if="activeSession.recruiter" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Recruiter: <strong class="text-gray-900 dark:text-white">{{ activeSession.recruiter.name }}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Active Session -->
      <div v-else-if="!sessionLoading" class="p-4 sm:p-6 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-1">No Active Session</h3>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Your recruiter hasn't started a session yet.</p>
      </div>

      <!-- Loading State -->
      <div v-else class="p-4 sm:p-6">
        <div class="animate-pulse space-y-4">
          <div class="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>

      <!-- Session History (Collapsible) -->
      <div v-if="showSessionHistory && sessionHistory.length > 0" class="border-t border-gray-200 dark:border-gray-700">
        <div class="p-4 sm:p-6">
          <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-4">Recent Sessions</h3>
          <div class="space-y-3">
            <div
              v-for="session in sessionHistory"
              :key="session.id"
              class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatDate(session.startTime) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ formatTime(session.startTime) }} - {{ formatTime(session.endTime) }}
                  </p>
                </div>
                <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                  {{ session.duration?.formatted || 'N/A' }}
                </span>
              </div>
              <div class="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {{ session.jobsApplied || 0 }} jobs applied
                </span>
                <span v-if="session.recruiter" class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {{ session.recruiter.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Jobs -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Recent Job Applications</h2>
            <p class="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Latest applications submitted on your behalf</p>
          </div>
          <button
            @click="showAllJobs = !showAllJobs"
            class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            {{ showAllJobs ? 'Show Less' : 'View All' }}
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error && !loading" class="p-6 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
          <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-1">Error Loading Jobs</h3>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">{{ error }}</p>
        <button
          @click="fetchDashboardData"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </div>

      <div v-else-if="loading" class="p-4 sm:p-6 space-y-4">
        <div v-for="i in 5" :key="i" class="animate-pulse">
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        </div>
      </div>

      <div v-else-if="jobs.length === 0" class="p-8 sm:p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
          <svg class="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-1">No applications yet</h3>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Your recruiter will start submitting applications soon.</p>
      </div>

      <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="job in displayedJobs"
          :key="job.id"
          class="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-3 mb-2">
                <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                  {{ job.companyName.charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {{ job.jobTitle }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{{ job.companyName }}</p>
                  <div class="flex flex-wrap gap-2 text-xs sm:text-sm">
                    <span v-if="job.location" class="text-gray-600 dark:text-gray-400">
                      📍 {{ job.location }}
                    </span>
                    <span class="px-2 py-1 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300': job.status === 'Applied',
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300': job.status === 'To be Applied',
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300': job.status === 'Not Fit',
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300': job.status === 'Duplicate'
                      }"
                    >
                      {{ job.status }}
                    </span>
                    <span class="text-gray-500 dark:text-gray-400">
                      {{ formatDate(job.date) }}
                    </span>
                  </div>
                  <p v-if="job.notes" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {{ job.notes }}
                  </p>
                </div>
              </div>
            </div>
            <div v-if="job.jobLink" class="flex-shrink-0">
              <a
                :href="job.jobLink"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                View Job
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && jobs.length > 0 && showAllJobs" class="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          Showing {{ pagination.page }} of {{ pagination.totalPages }} pages
        </div>
        <div class="flex gap-2">
          <button
            @click="loadPage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="loadPage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import api from '@/services/api'
import StatCard from '@/components/StatCard.vue'
import { useToastStore } from '@/stores/toast'
import { 
  DocumentIcon, 
  CalendarIcon, 
  ChartBarIcon,
  BriefcaseIcon
} from '@heroicons/vue/24/outline'

const toastStore = useToastStore()

const loading = ref(true)
const error = ref(null)
const jobs = ref([])
const recruiter = ref(null)
const stats = ref({
  todayApplications: 0,
  weekApplications: 0,
  monthApplications: 0,
  totalApplications: 0,
  dailyTarget: 0,
  monthlyTarget: 0
})
const pagination = ref({
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 1
})
const showAllJobs = ref(false)
const activeSession = ref(null)
const sessionHistory = ref([])
const sessionLoading = ref(false)
const showSessionHistory = ref(false)
const activeSessionDuration = ref('0m')

let sessionDurationInterval = null
let sessionRefreshInterval = null

const displayedJobs = computed(() => {
  if (showAllJobs.value) {
    return jobs.value
  }
  return jobs.value.slice(0, 10)
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const updateActiveSessionDuration = () => {
  if (!activeSession.value || !activeSession.value.startTime) {
    activeSessionDuration.value = '0m'
    return
  }
  
  const start = new Date(activeSession.value.startTime)
  const now = new Date()
  const diffMs = now - start
  const diffMinutes = Math.floor(diffMs / 1000 / 60)
  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  
  if (hours > 0) {
    activeSessionDuration.value = `${hours}h ${minutes}m`
  } else {
    activeSessionDuration.value = `${minutes}m`
  }
}

const fetchSessionData = async () => {
  try {
    sessionLoading.value = true
    const [activeResponse, historyResponse] = await Promise.all([
      api.get('/sessions/me/active'),
      api.get('/sessions/me/history', { params: { limit: 5 } })
    ])
    
    console.log('Session data fetched:', { 
      active: activeResponse.data, 
      history: historyResponse.data 
    })
    
    // Handle null response (no active session)
    activeSession.value = activeResponse.data || null
    sessionHistory.value = historyResponse.data || []
    
    if (activeSession.value) {
      updateActiveSessionDuration()
      // Update duration every 10 seconds for live feel
      if (sessionDurationInterval) {
        clearInterval(sessionDurationInterval)
      }
      sessionDurationInterval = setInterval(() => {
        updateActiveSessionDuration()
      }, 10000) // Update every 10 seconds for live timer
    } else {
      if (sessionDurationInterval) {
        clearInterval(sessionDurationInterval)
        sessionDurationInterval = null
      }
    }
  } catch (error) {
    console.error('Error fetching session data:', error)
    console.error('Error response:', error.response?.data)
    // Don't show error toast for session data - it's not critical
    activeSession.value = null
    sessionHistory.value = []
  } finally {
    sessionLoading.value = false
  }
}

const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await api.get('/clients/me/dashboard')
    
    stats.value = response.data.stats || {
      todayApplications: 0,
      weekApplications: 0,
      monthApplications: 0,
      totalApplications: 0,
      dailyTarget: 0,
      monthlyTarget: 0
    }
    recruiter.value = response.data.recruiter
    jobs.value = response.data.recentJobs || []
    
    // If showing all jobs, fetch paginated data
    if (showAllJobs.value) {
      await loadPage(1)
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
    error.value = err.response?.data?.error || 'Failed to load dashboard data'
    
    if (err.response?.status === 401) {
      toastStore.error('Session expired. Please login again.')
      setTimeout(() => {
        window.location.href = '/client/login'
      }, 2000)
    } else {
      toastStore.error(error.value)
    }
  } finally {
    loading.value = false
  }
}

const loadPage = async (page) => {
  try {
    loading.value = true
    const response = await api.get('/jobs/me', {
      params: {
        page,
        limit: 50
      }
    })
    
    jobs.value = response.data.jobs || []
    pagination.value = response.data.pagination || {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 1
    }
  } catch (err) {
    console.error('Error loading jobs:', err)
    toastStore.error('Failed to load jobs')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
  fetchSessionData()
  
  // Refresh session data every 15 seconds for faster updates
  sessionRefreshInterval = setInterval(() => {
    fetchSessionData()
  }, 15000)
})

onUnmounted(() => {
  if (sessionDurationInterval) {
    clearInterval(sessionDurationInterval)
  }
  if (sessionRefreshInterval) {
    clearInterval(sessionRefreshInterval)
  }
})
</script>
