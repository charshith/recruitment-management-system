<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Session Management</h1>
      <p class="text-gray-600 mt-1">Monitor and manage all application sessions</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="statusFilter"
            @change="fetchSessions"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Sessions</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <select
            v-model="clientFilter"
            @change="fetchSessions"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Clients</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recruiter</label>
          <select
            v-model="recruiterFilter"
            @change="fetchSessions"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Recruiters</option>
            <option v-for="recruiter in recruiters" :key="recruiter.id" :value="recruiter.id">
              {{ recruiter.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Active Sessions Alert -->
    <div v-if="activeSessions.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="font-medium text-yellow-800">
          {{ activeSessions.length }} active session(s) running
        </span>
      </div>
    </div>

    <!-- Sessions Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
      
      <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recruiter</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="session in sessions" :key="session.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  session.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                ]">
                  {{ session.status === 'active' ? 'Active' : 'Completed' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="$router.push(`/admin/clients/${session.clientId}`)"
                  class="text-sm text-indigo-600 hover:text-indigo-900 hover:underline"
                >
                  {{ session.clientName }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="$router.push(`/admin/recruiters/${session.recruiterId}`)"
                  class="text-sm text-indigo-600 hover:text-indigo-900 hover:underline"
                >
                  {{ session.recruiterName }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ new Date(session.startTime).toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ session.endTime ? new Date(session.endTime).toLocaleString() : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getDuration(session) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  v-if="session.status === 'active'"
                  @click="requestEndSession(session.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  End Session
                </button>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-model="showEndSessionConfirm"
      title="End Session"
      message="Are you sure you want to end this session?"
      @confirm="endSession"
      @cancel="sessionToEnd = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const toastStore = useToastStore()
const sessions = ref([])
const clients = ref([])
const recruiters = ref([])
const loading = ref(true)
const error = ref(null)
const statusFilter = ref('')
const clientFilter = ref('')
const recruiterFilter = ref('')
const showEndSessionConfirm = ref(false)
const sessionToEnd = ref(null)

const activeSessions = computed(() => {
  return sessions.value.filter(s => s.status === 'active')
})

const getDuration = (session) => {
  if (!session.endTime) {
    const now = new Date()
    const start = new Date(session.startTime)
    const diff = Math.floor((now - start) / 1000 / 60)
    return `${diff} min (ongoing)`
  }
  const start = new Date(session.startTime)
  const end = new Date(session.endTime)
  const diff = Math.floor((end - start) / 1000 / 60)
  return `${diff} min`
}

const fetchSessions = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('adminToken')
    const params = {}
    if (statusFilter.value) params.status = statusFilter.value
    if (clientFilter.value) params.clientId = clientFilter.value
    if (recruiterFilter.value) params.recruiterId = recruiterFilter.value
    
    const [sessionsRes, clientsRes, recruitersRes] = await Promise.all([
      axios.get('/api/admin/sessions', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get('/api/admin/recruiters', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
    
    sessions.value = sessionsRes.data
    clients.value = clientsRes.data.clients || clientsRes.data
    recruiters.value = recruitersRes.data.recruiters || recruitersRes.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load sessions'
  } finally {
    loading.value = false
  }
}

const requestEndSession = (sessionId) => {
  sessionToEnd.value = sessionId
  showEndSessionConfirm.value = true
}

const endSession = async () => {
  if (!sessionToEnd.value) return
  
  try {
    const token = localStorage.getItem('adminToken')
    await axios.post(`/api/admin/sessions/${sessionToEnd.value}/end`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toastStore.success('Session ended successfully')
    fetchSessions()
  } catch (err) {
    toastStore.error(err.response?.data?.error || 'Failed to end session')
  } finally {
    showEndSessionConfirm.value = false
    sessionToEnd.value = null
  }
}

onMounted(() => {
  fetchSessions()
  // Refresh every 30 seconds to update active sessions
  setInterval(() => {
    if (statusFilter.value === '' || statusFilter.value === 'active') {
      fetchSessions()
    }
  }, 30000)
})
</script>

