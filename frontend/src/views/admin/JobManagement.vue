<template>
  <div>
    <div class="mb-6 flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Job Management</h1>
        <p class="text-gray-600 mt-1">View and manage all job applications</p>
      </div>
      <button
        @click="exportJobs"
        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export CSV
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="Company, job title, location..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <select
            v-model="filters.clientId"
            @change="fetchJobs"
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
            v-model="filters.recruiterId"
            @change="fetchJobs"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Recruiters</option>
            <option v-for="recruiter in recruiters" :key="recruiter.id" :value="recruiter.id">
              {{ recruiter.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            v-model="filters.status"
            @change="fetchJobs"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="To be Applied">To be Applied</option>
            <option value="Not Fit">Not Fit</option>
            <option value="Duplicate">Duplicate</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
          <input
            v-model="filters.dateFrom"
            @change="fetchJobs"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
          <input
            v-model="filters.dateTo"
            @change="fetchJobs"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>

    <!-- Jobs Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
      
      <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recruiter</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="job in jobs" :key="job.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ job.date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ job.companyName }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">
                <a :href="job.jobLink" target="_blank" class="text-indigo-600 hover:text-indigo-900 hover:underline">
                  {{ job.jobTitle }}
                </a>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ job.location || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(job.status)">{{ job.status }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="$router.push(`/admin/clients/${job.clientId}`)"
                  class="text-sm text-indigo-600 hover:text-indigo-900 hover:underline"
                >
                  {{ job.clientName }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="$router.push(`/admin/recruiters/${job.recruiterId}`)"
                  class="text-sm text-indigo-600 hover:text-indigo-900 hover:underline"
                >
                  {{ job.recruiterName }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editJob(job)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Edit
                </button>
                <button
                  @click="deleteJob(job.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination && pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
          {{ pagination.total }} results
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="changePage(page)"
            :class="[
              'px-3 py-2 border rounded-lg',
              page === pagination.page
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Job Modal -->
    <div v-if="editingJob" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Edit Job</h2>
          <form @submit.prevent="saveJob" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                v-model="jobForm.companyName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                v-model="jobForm.jobTitle"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Job Link *</label>
              <input
                v-model="jobForm.jobLink"
                type="url"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                v-model="jobForm.location"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                v-model="jobForm.status"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Applied">Applied</option>
                <option value="To be Applied">To be Applied</option>
                <option value="Not Fit">Not Fit</option>
                <option value="Duplicate">Duplicate</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                v-model="jobForm.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="editingJob = null"
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

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :is-open="showDeleteConfirm"
      title="Delete Job"
      message="Are you sure you want to delete this job? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false; jobToDelete = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const jobs = ref([])
const clients = ref([])
const recruiters = ref([])
const loading = ref(true)
const error = ref(null)
const editingJob = ref(null)
const saving = ref(false)
const pagination = ref(null)
const showDeleteConfirm = ref(false)
const jobToDelete = ref(null)
let searchTimeout = null

const filters = ref({
  search: '',
  clientId: '',
  recruiterId: '',
  status: '',
  dateFrom: '',
  dateTo: ''
})

const jobForm = ref({
  companyName: '',
  jobTitle: '',
  jobLink: '',
  location: '',
  status: '',
  notes: ''
})

const visiblePages = computed(() => {
  if (!pagination.value) return []
  const total = pagination.value.totalPages
  const current = pagination.value.page
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...', total)
    } else if (current >= total - 2) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total)
    }
  }
  return pages.filter(p => p !== '...' || true)
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

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchJobs()
  }, 300)
}

const fetchJobs = async (page = 1) => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('adminToken')
    const params = {
      page,
      limit: 50,
      ...(filters.value.search && { search: filters.value.search }),
      ...(filters.value.clientId && { clientId: filters.value.clientId }),
      ...(filters.value.recruiterId && { recruiterId: filters.value.recruiterId }),
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.dateFrom && { dateFrom: filters.value.dateFrom }),
      ...(filters.value.dateTo && { dateTo: filters.value.dateTo })
    }
    
    const [jobsRes, clientsRes, recruitersRes] = await Promise.all([
      axios.get('/api/admin/jobs', {
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
    
    jobs.value = jobsRes.data.jobs || []
    pagination.value = jobsRes.data.pagination
    clients.value = clientsRes.data.clients || clientsRes.data
    recruiters.value = recruitersRes.data.recruiters || recruitersRes.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load jobs'
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || (pagination.value && page > pagination.value.totalPages)) return
  fetchJobs(page)
}

const editJob = (job) => {
  editingJob.value = job
  jobForm.value = {
    companyName: job.companyName,
    jobTitle: job.jobTitle,
    jobLink: job.jobLink,
    location: job.location || '',
    status: job.status,
    notes: job.notes || ''
  }
}

const saveJob = async () => {
  saving.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    await axios.put(`/api/admin/jobs/${editingJob.value.id}`, jobForm.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    editingJob.value = null
    fetchJobs(pagination.value?.page || 1)
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to save job')
  } finally {
    saving.value = false
  }
}

const deleteJob = (jobId) => {
  jobToDelete.value = jobId
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!jobToDelete.value) return
  
  try {
    const token = localStorage.getItem('adminToken')
    await axios.delete(`/api/admin/jobs/${jobToDelete.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    showDeleteConfirm.value = false
    jobToDelete.value = null
    fetchJobs(pagination.value?.page || 1)
    
    // Show success message
    if (window.showToast) {
      window.showToast('Job deleted successfully', 'success')
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Failed to delete job'
    if (window.showToast) {
      window.showToast(errorMsg, 'error')
    } else {
      alert(errorMsg)
    }
  }
}

const exportJobs = async () => {
  try {
    const token = localStorage.getItem('adminToken')
    const params = {
      ...(filters.value.clientId && { clientId: filters.value.clientId }),
      ...(filters.value.recruiterId && { recruiterId: filters.value.recruiterId }),
      ...(filters.value.dateFrom && { dateFrom: filters.value.dateFrom }),
      ...(filters.value.dateTo && { dateTo: filters.value.dateTo })
    }
    
    const response = await axios.get('/api/admin/export/jobs', {
      params,
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'jobs.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    alert('Failed to export jobs')
  }
}

onMounted(() => {
  fetchJobs()
})
</script>

