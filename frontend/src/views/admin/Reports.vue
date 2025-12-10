<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Reports</h1>
      <p class="text-gray-600 mt-1">Generate and view detailed reports</p>
    </div>

    <!-- Report Type Selector -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex gap-4">
        <button
          @click="reportType = 'daily'"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            reportType === 'daily' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Daily Report
        </button>
        <button
          @click="reportType = 'weekly'"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            reportType === 'weekly' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Weekly Report
        </button>
        <button
          @click="reportType = 'monthly'"
          :class="[
            'px-4 py-2 rounded-lg transition-colors',
            reportType === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Monthly Report
        </button>
      </div>
      
      <div v-if="reportType === 'daily'" class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
        <input
          v-model="selectedDate"
          type="date"
          @change="fetchReport"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>

    <!-- Report Content -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="report" class="space-y-6">
      <!-- Report Summary -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">
          {{ reportType === 'daily' ? 'Daily' : reportType === 'weekly' ? 'Weekly' : 'Monthly' }} Report
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="text-sm text-gray-600">Total Applications</p>
            <p class="text-3xl font-bold text-gray-900">{{ report.totalApplications }}</p>
          </div>
          <div v-if="report.period">
            <p class="text-sm text-gray-600">Period</p>
            <p class="text-lg font-medium text-gray-900">
              {{ report.period.start }} to {{ report.period.end }}
            </p>
          </div>
          <div v-if="report.date">
            <p class="text-sm text-gray-600">Date</p>
            <p class="text-lg font-medium text-gray-900">{{ report.date }}</p>
          </div>
        </div>
      </div>

      <!-- By Recruiter -->
      <div v-if="report.byRecruiter" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">By Recruiter</h3>
        <div class="space-y-2">
          <div
            v-for="(count, name) in report.byRecruiter"
            :key="name"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span class="text-sm font-medium text-gray-700">{{ name }}</span>
            <span class="text-sm font-bold text-indigo-600">{{ count }} applications</span>
          </div>
        </div>
      </div>

      <!-- By Client -->
      <div v-if="report.byClient" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">By Client</h3>
        <div class="space-y-2">
          <div
            v-for="(count, name) in report.byClient"
            :key="name"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span class="text-sm font-medium text-gray-700">{{ name }}</span>
            <span class="text-sm font-bold text-blue-600">{{ count }} applications</span>
          </div>
        </div>
      </div>

      <!-- By Status -->
      <div v-if="report.byStatus" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">By Status</h3>
        <div class="space-y-2">
          <div
            v-for="(count, status) in report.byStatus"
            :key="status"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span class="text-sm font-medium text-gray-700">{{ status }}</span>
            <span class="text-sm font-bold text-gray-900">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- Daily/Weekly Breakdown -->
      <div v-if="report.dailyBreakdown || report.weeklyBreakdown" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          {{ report.dailyBreakdown ? 'Daily' : 'Weekly' }} Breakdown
        </h3>
        <div class="space-y-2">
          <div
            v-for="(count, period) in (report.dailyBreakdown || report.weeklyBreakdown)"
            :key="period"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span class="text-sm font-medium text-gray-700">{{ period }}</span>
            <span class="text-sm font-bold text-green-600">{{ count }} applications</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const reportType = ref('daily')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const report = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchReport = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('adminToken')
    let url = `/api/admin/reports/${reportType.value}`
    
    if (reportType.value === 'daily') {
      url += `?date=${selectedDate.value}`
    }
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
    report.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load report'
  } finally {
    loading.value = false
  }
}

watch(reportType, () => {
  fetchReport()
})

onMounted(() => {
  fetchReport()
})
</script>

