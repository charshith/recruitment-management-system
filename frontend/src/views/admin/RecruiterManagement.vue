<template>
  <div>
    <div class="mb-6 flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Recruiter Management</h1>
        <p class="text-gray-600 mt-1">Manage all recruiters and their assignments</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Recruiter
      </button>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div class="w-full md:w-96">
        <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          placeholder="Search by name or email..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>

    <!-- Recruiters Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
      
      <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recruiter</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Clients</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="recruiter in recruiters" :key="recruiter.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <button
                    @click="viewRecruiterDetails(recruiter.id)"
                    class="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline"
                  >
                    {{ recruiter.name }}
                  </button>
                  <div class="text-sm text-gray-500">{{ recruiter.email }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ recruiter.assignedClientsCount || 0 }} clients</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">{{ recruiter.todayApplications || 0 }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ recruiter.totalApplications || 0 }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="viewRecruiterDetails(recruiter.id)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  View
                </button>
                <button
                  @click="editRecruiter(recruiter)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Edit
                </button>
                <button
                  @click="deleteRecruiter(recruiter.id)"
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
            class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingRecruiter" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            {{ editingRecruiter ? 'Edit Recruiter' : 'Add New Recruiter' }}
          </h2>
          
          <form @submit.prevent="saveRecruiter" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                v-model="recruiterForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="recruiterForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Password {{ editingRecruiter ? '(leave blank to keep current)' : '*' }}
              </label>
              <div class="flex gap-2">
                <input
                  v-model="recruiterForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  :required="!editingRecruiter && !recruiterForm.generatePassword"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter password or generate one"
                />
                <button
                  type="button"
                  @click="recruiterForm.generatePassword = !recruiterForm.generatePassword"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    recruiterForm.generatePassword
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ recruiterForm.generatePassword ? '✓ Generate' : 'Generate' }}
                </button>
                <button
                  v-if="recruiterForm.password"
                  type="button"
                  @click="showPassword = !showPassword"
                  class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="cancelEdit"
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

    <!-- Generated Credentials Modal -->
    <div v-if="showCredentialsModal && generatedCredentials" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold text-gray-900">Account Created</h2>
            <button
              @click="closeCredentialsModal"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p class="text-sm text-yellow-800 font-medium mb-2">⚠️ Save these credentials now!</p>
            <p class="text-xs text-yellow-700">You won't be able to see this password again.</p>
          </div>
          
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div class="flex gap-2">
                <input
                  :value="generatedCredentials.email"
                  readonly
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                />
                <button
                  @click="copyCredentials(generatedCredentials.email)"
                  class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  title="Copy email"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div class="flex gap-2">
                <input
                  :value="generatedCredentials.password"
                  readonly
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm font-bold"
                />
                <button
                  @click="copyCredentials(generatedCredentials.password)"
                  class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  title="Copy password"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button
              @click="closeCredentialsModal"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              I've Saved These
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :is-open="showDeleteConfirm"
      title="Delete Recruiter"
      message="Are you sure you want to delete this recruiter? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false; recruiterToDelete = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const recruiters = ref([])
const loading = ref(true)
const error = ref(null)
const showAddModal = ref(false)
const editingRecruiter = ref(null)
const saving = ref(false)
const searchQuery = ref('')
const pagination = ref(null)
let searchTimeout = null

const recruiterForm = ref({
  name: '',
  email: '',
  password: '',
  generatePassword: false
})

const showPassword = ref(false)
const showCredentialsModal = ref(false)
const generatedCredentials = ref(null)
const showDeleteConfirm = ref(false)
const recruiterToDelete = ref(null)

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

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchRecruiters()
  }, 300)
}

const fetchRecruiters = async (page = 1) => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('adminToken')
    const params = {
      page,
      limit: 50,
      ...(searchQuery.value && { search: searchQuery.value })
    }
    
    const response = await axios.get('/api/admin/recruiters', {
      params,
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.data.recruiters) {
      recruiters.value = response.data.recruiters
      pagination.value = response.data.pagination
    } else {
      // Fallback for old API format
      recruiters.value = response.data
      pagination.value = null
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load recruiters'
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || (pagination.value && page > pagination.value.totalPages)) return
  fetchRecruiters(page)
}

const viewRecruiterDetails = (recruiterId) => {
  router.push(`/admin/recruiters/${recruiterId}`)
}

const editRecruiter = (recruiter) => {
  editingRecruiter.value = recruiter
  recruiterForm.value = {
    name: recruiter.name,
    email: recruiter.email,
    password: '',
    generatePassword: false
  }
  showPassword.value = false
}

const cancelEdit = () => {
  showAddModal.value = false
  editingRecruiter.value = null
  showCredentialsModal.value = false
  generatedCredentials.value = null
  recruiterForm.value = {
    name: '',
    email: '',
    password: '',
    generatePassword: false
  }
  showPassword.value = false
}

const saveRecruiter = async () => {
  saving.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    const url = editingRecruiter.value
      ? `/api/admin/recruiters/${editingRecruiter.value.id}`
      : '/api/admin/recruiters'
    
    const method = editingRecruiter.value ? 'put' : 'post'
    
    // Prepare data
    const data = {
      ...recruiterForm.value,
      generatePassword: recruiterForm.value.generatePassword && !recruiterForm.value.password
    }
    if (!data.password && !data.generatePassword) {
      delete data.password
    }
    if (!data.generatePassword) {
      delete data.generatePassword
    }
    
    const response = await axios[method](url, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    // Show credentials if password was generated
    if (response.data.generatedPassword) {
      generatedCredentials.value = {
        email: recruiterForm.value.email,
        password: response.data.generatedPassword,
        type: 'recruiter'
      }
      showCredentialsModal.value = true
    } else {
      cancelEdit()
      fetchRecruiters(pagination.value?.page || 1)
    }
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to save recruiter')
  } finally {
    saving.value = false
  }
}

const deleteRecruiter = (recruiterId) => {
  recruiterToDelete.value = recruiterId
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!recruiterToDelete.value) return
  
  try {
    const token = localStorage.getItem('adminToken')
    await axios.delete(`/api/admin/recruiters/${recruiterToDelete.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    showDeleteConfirm.value = false
    recruiterToDelete.value = null
    fetchRecruiters(pagination.value?.page || 1)
    
    // Show success message
    if (window.showToast) {
      window.showToast('Recruiter deleted successfully', 'success')
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Failed to delete recruiter'
    if (window.showToast) {
      window.showToast(errorMsg, 'error')
    } else {
      alert(errorMsg)
    }
  }
}

// Refresh data periodically and on focus
let refreshInterval = null

const refreshData = () => {
  fetchRecruiters(pagination.value?.page || 1)
}

onMounted(() => {
  fetchRecruiters()
  
  // Refresh every 30 seconds
  refreshInterval = setInterval(refreshData, 30000)
  
  // Refresh when window gains focus
  window.addEventListener('focus', refreshData)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  window.removeEventListener('focus', refreshData)
})
</script>

