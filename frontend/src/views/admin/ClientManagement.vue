<template>
  <div>
    <div class="mb-6 flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Client Management</h1>
        <p class="text-gray-600 mt-1">Manage all clients and their settings</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="exportClients"
          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
        <button
          @click="showAddModal = true"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div class="flex gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="Search by name or email..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Recruiter</label>
          <select
            v-model="recruiterFilter"
            @change="fetchClients"
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

    <!-- Clients Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
      
      <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Recruiter</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Targets</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="clients.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                No clients found. Click "Add Client" to create one.
              </td>
            </tr>
            <tr v-for="client in clients" :key="client.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <button
                    @click="viewClientDetails(client.id)"
                    class="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline"
                  >
                    {{ client.name }}
                  </button>
                  <div class="text-sm text-gray-500">{{ client.email }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  v-if="client.assignedRecruiterName"
                  @click="viewRecruiterDetails(client.assignedRecruiter)"
                  class="text-sm text-indigo-600 hover:text-indigo-900 hover:underline"
                >
                  {{ client.assignedRecruiterName }}
                </button>
                <span v-else class="text-sm text-gray-500">Unassigned</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  <div>Daily: {{ client.dailyTarget }}</div>
                  <div>Monthly: {{ client.monthlyTarget }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-gray-900">{{ client.todayApplications || 0 }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ client.totalApplications || 0 }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editClient(client)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Edit
                </button>
                <button
                  @click="deleteClient(client.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingClient" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            {{ editingClient ? 'Edit Client' : 'Add New Client' }}
          </h2>
          
          <form @submit.prevent="saveClient" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                v-model="clientForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="clientForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div class="flex gap-2">
                <input
                  v-model="clientForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Leave empty to generate"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <label class="flex items-center mt-2">
                <input
                  v-model="clientForm.generatePassword"
                  type="checkbox"
                  class="mr-2"
                />
                <span class="text-sm text-gray-600">Generate random password</span>
              </label>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Assigned Recruiter</label>
              <select
                v-model="clientForm.assignedRecruiter"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                <option v-for="recruiter in recruiters" :key="recruiter.id" :value="recruiter.id">
                  {{ recruiter.name }}
                </option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Daily Target</label>
                <input
                  v-model.number="clientForm.dailyTarget"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Monthly Target</label>
                <input
                  v-model.number="clientForm.monthlyTarget"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
              <textarea
                v-model="clientForm.instructions"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Special instructions for this client..."
              ></textarea>
            </div>
            
            <div v-if="clientForm.generatedPassword" class="bg-green-50 border border-green-200 rounded-lg p-3">
              <p class="text-sm font-medium text-green-800">Generated Password:</p>
              <p class="text-sm font-mono text-green-900 mt-1">{{ clientForm.generatedPassword }}</p>
              <p class="text-xs text-green-700 mt-1">Save this password! It won't be shown again.</p>
            </div>
            
            <div class="flex gap-3 justify-end pt-4">
              <button
                type="button"
                @click="cancelEdit"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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

    <!-- Delete Confirm Dialog -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Client"
      message="Are you sure you want to delete this client? This action cannot be undone."
      @confirm="confirmDelete"
      @cancel="clientToDelete = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const router = useRouter()
const clients = ref([])
const recruiters = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const recruiterFilter = ref('')
const pagination = ref(null)
const showAddModal = ref(false)
const editingClient = ref(null)
const saving = ref(false)
const showPassword = ref(false)
const showDeleteConfirm = ref(false)
const clientToDelete = ref(null)

const clientForm = ref({
  name: '',
  email: '',
  password: '',
  assignedRecruiter: '',
  monthlyTarget: 0,
  dailyTarget: 0,
  instructions: '',
  generatePassword: false,
  generatedPassword: null
})

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchClients()
  }, 300)
}

const fetchClients = async (page = 1) => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      error.value = 'Not authenticated'
      loading.value = false
      return
    }
    
    const params = {
      page,
      limit: 50,
      ...(searchQuery.value && { search: searchQuery.value }),
      ...(recruiterFilter.value && { recruiterId: recruiterFilter.value })
    }
    
    const clientsRes = await axios.get('/api/admin/clients', {
      params,
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
    })
    
    if (clientsRes.data && clientsRes.data.clients) {
      clients.value = clientsRes.data.clients || []
      pagination.value = clientsRes.data.pagination || {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 1
      }
    } else {
      clients.value = []
      pagination.value = {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 1
      }
    }
    
    // Fetch recruiters separately
    try {
      const recruitersRes = await axios.get('/api/admin/recruiters', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      })
      recruiters.value = recruitersRes.data.recruiters || recruitersRes.data || []
    } catch (recErr) {
      console.error('Error fetching recruiters:', recErr)
      recruiters.value = []
    }
  } catch (err) {
    console.error('Error fetching clients:', err)
    error.value = err.response?.data?.error || err.message || 'Failed to load clients'
    clients.value = []
    pagination.value = {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 1
    }
  } finally {
    loading.value = false
  }
}

const viewClientDetails = (clientId) => {
  router.push(`/admin/clients/${clientId}`)
}

const viewRecruiterDetails = (recruiterId) => {
  router.push(`/admin/recruiters/${recruiterId}`)
}

const editClient = (client) => {
  editingClient.value = client
  clientForm.value = {
    name: client.name,
    email: client.email,
    password: '',
    assignedRecruiter: client.assignedRecruiter || '',
    monthlyTarget: client.monthlyTarget || 0,
    dailyTarget: client.dailyTarget || 0,
    instructions: client.instructions || '',
    generatePassword: false,
    generatedPassword: null
  }
  showAddModal.value = true
}

const cancelEdit = () => {
  showAddModal.value = false
  editingClient.value = null
  clientForm.value = {
    name: '',
    email: '',
    password: '',
    assignedRecruiter: '',
    monthlyTarget: 0,
    dailyTarget: 0,
    instructions: '',
    generatePassword: false,
    generatedPassword: null
  }
}

const saveClient = async () => {
  saving.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    const url = editingClient.value
      ? `/api/admin/clients/${editingClient.value.id}`
      : '/api/admin/clients'
    
    const method = editingClient.value ? 'put' : 'post'
    
    const data = {
      ...clientForm.value,
      generatePassword: clientForm.value.generatePassword && !clientForm.value.password
    }
    if (!data.password && !data.generatePassword) {
      delete data.password
    }
    
    const response = await axios[method](url, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.data.generatedPassword) {
      clientForm.value.generatedPassword = response.data.generatedPassword
    } else {
      cancelEdit()
      fetchClients(pagination.value?.page || 1)
    }
    
    if (window.showToast) {
      window.showToast(editingClient.value ? 'Client updated successfully' : 'Client created successfully', 'success')
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Failed to save client'
    if (window.showToast) {
      window.showToast(errorMsg, 'error')
    } else {
      alert(errorMsg)
    }
  } finally {
    saving.value = false
  }
}

const deleteClient = (clientId) => {
  clientToDelete.value = clientId
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!clientToDelete.value) return
  
  try {
    const token = localStorage.getItem('adminToken')
    await axios.delete(`/api/admin/clients/${clientToDelete.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    showDeleteConfirm.value = false
    clientToDelete.value = null
    fetchClients(pagination.value?.page || 1)
    
    if (window.showToast) {
      window.showToast('Client deleted successfully', 'success')
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Failed to delete client'
    if (window.showToast) {
      window.showToast(errorMsg, 'error')
    } else {
      alert(errorMsg)
    }
  }
}

const exportClients = async () => {
  try {
    const token = localStorage.getItem('adminToken')
    const response = await axios.get('/api/admin/export/clients', {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'clients.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (err) {
    if (window.showToast) {
      window.showToast('Failed to export clients', 'error')
    } else {
      alert('Failed to export clients')
    }
  }
}

onMounted(() => {
  fetchClients()
})

onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

