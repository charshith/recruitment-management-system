<template>
  <div>
    <div class="mb-6">
      <button
        @click="$router.push('/admin/recruiters')"
        class="text-indigo-600 hover:text-indigo-900 mb-4 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Recruiters
      </button>
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ recruiter?.name || 'Loading...' }}</h1>
          <p class="text-gray-600 mt-1">{{ recruiter?.email }}</p>
        </div>
        <button
          @click="editRecruiter"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Edit Recruiter
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="recruiter" class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-600">Total Jobs</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalJobs }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-600">Today's Jobs</p>
          <p class="text-3xl font-bold text-green-600 mt-2">{{ stats.todayJobs }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-600">Assigned Clients</p>
          <p class="text-3xl font-bold text-blue-600 mt-2">{{ stats.assignedClientsCount }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p class="text-sm font-medium text-gray-600">Active Sessions</p>
          <p class="text-3xl font-bold text-purple-600 mt-2">{{ stats.activeSessions }}</p>
        </div>
      </div>

      <!-- Assigned Clients -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">Assigned Clients</h2>
          <button
            @click="showAssignModal = true"
            class="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Manage Assignment
          </button>
        </div>
        <div v-if="assignedClients.length === 0" class="text-center py-8 text-gray-500">
          No clients assigned
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="client in assignedClients"
            :key="client.id"
            class="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
            @click="$router.push(`/admin/clients/${client.id}`)"
          >
            <div class="font-medium text-gray-900">{{ client.name }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ client.email }}</div>
          </div>
        </div>
      </div>

      <!-- Recent Jobs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">Recent Jobs</h2>
          <RouterLink to="/admin/jobs" class="text-indigo-600 hover:text-indigo-900 text-sm">
            View All Jobs →
          </RouterLink>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="job in recentJobs" :key="job.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">{{ job.date }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ job.companyName }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ job.jobTitle }}</td>
                <td class="px-4 py-3 text-sm">
                  <span :class="getStatusClass(job.status)">{{ job.status }}</span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <button
                    @click="$router.push(`/admin/clients/${client.id}`)"
                    class="text-indigo-600 hover:text-indigo-900 hover:underline"
                  >
                    {{ job.clientName }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Edit Recruiter</h2>
          <form @submit.prevent="saveRecruiter" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                v-model="recruiterForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="recruiterForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label>
              <input
                v-model="recruiterForm.password"
                type="password"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="showEditModal = false"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Assign Clients Modal -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Assign Clients</h2>
          <div class="space-y-2 max-h-96 overflow-y-auto mb-4">
            <label
              v-for="client in allClients"
              :key="client.id"
              class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <input
                type="checkbox"
                :value="client.id"
                v-model="selectedClients"
                class="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div>
                <div class="font-medium text-gray-900">{{ client.name }}</div>
                <div class="text-sm text-gray-500">{{ client.email }}</div>
              </div>
            </label>
          </div>
          <div class="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              @click="showAssignModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="saveAssignment"
              :disabled="saving"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {{ saving ? 'Saving...' : 'Save Assignment' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const recruiter = ref(null)
const stats = ref({})
const assignedClients = ref([])
const allClients = ref([])
const recentJobs = ref([])
const loading = ref(true)
const error = ref(null)
const showEditModal = ref(false)
const showAssignModal = ref(false)
const saving = ref(false)
const selectedClients = ref([])

const recruiterForm = ref({
  name: '',
  email: '',
  password: ''
})

const getStatusClass = (status) => {
  const classes = {
    'Applied': 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800',
    'To be Applied': 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800',
    'Not Fit': 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800',
    'Duplicate': 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800'
  }
  return classes[status] || 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800'
}

const fetchRecruiterDetails = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('adminToken')
    const recruiterRes = await axios.get(`/api/admin/recruiters/${route.params.recruiterId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    recruiter.value = recruiterRes.data
    stats.value = recruiterRes.data.stats || {}
    assignedClients.value = recruiterRes.data.assignedClients || []
    
    // Fetch all clients for assignment modal
    try {
      const clientsRes = await axios.get('/api/admin/clients', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      })
      allClients.value = clientsRes.data.clients || []
    } catch (clientsErr) {
      console.error('Error fetching clients:', clientsErr)
      allClients.value = []
    }
    
    selectedClients.value = assignedClients.value.map(c => c.id)
    
    // Get recent jobs with client names
    const jobs = recruiterRes.data.jobs || []
    recentJobs.value = jobs.slice(0, 10).map(job => {
      const client = allClients.value.find(c => c.id === job.clientId)
      return {
        ...job,
        clientName: client ? client.name : 'Unknown'
      }
    })
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load recruiter details'
  } finally {
    loading.value = false
  }
}

const editRecruiter = () => {
  recruiterForm.value = {
    name: recruiter.value.name,
    email: recruiter.value.email,
    password: ''
  }
  showEditModal.value = true
}

const saveRecruiter = async () => {
  saving.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    const data = { ...recruiterForm.value }
    if (!data.password) delete data.password
    
    await axios.put(`/api/admin/recruiters/${route.params.recruiterId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    showEditModal.value = false
    fetchRecruiterDetails()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to save recruiter')
  } finally {
    saving.value = false
  }
}

const saveAssignment = async () => {
  saving.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    await axios.post(`/api/admin/recruiters/${route.params.recruiterId}/assign-clients`, {
      clientIds: selectedClients.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    showAssignModal.value = false
    fetchRecruiterDetails()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to assign clients')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchRecruiterDetails()
})
</script>

