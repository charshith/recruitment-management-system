<template>
  <div>
    <div class="mb-6 flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Admin Management</h1>
        <p class="text-gray-600 mt-1">Manage admin accounts</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Admin
      </button>
    </div>

    <!-- Admins Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
      
      <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="admin in admins" :key="admin.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ admin.name }}</div>
                  <div class="text-sm text-gray-500">{{ admin.email }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                  {{ admin.role || 'admin' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(admin.createdAt).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  v-if="admin.id !== currentAdminId"
                  @click="editAdmin(admin)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Edit
                </button>
                <button
                  v-if="admin.id !== currentAdminId"
                  @click="deleteAdmin(admin.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
                <span v-else class="text-gray-400 text-xs">(You)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingAdmin" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            {{ editingAdmin ? 'Edit Admin' : 'Add New Admin' }}
          </h2>
          
          <form @submit.prevent="saveAdmin" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                v-model="adminForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="adminForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Password {{ editingAdmin ? '(leave blank to keep current)' : '*' }}
              </label>
              <div class="flex gap-2">
                <input
                  v-model="adminForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  :required="!editingAdmin && !adminForm.generatePassword"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter password or generate one"
                />
                <button
                  type="button"
                  @click="adminForm.generatePassword = !adminForm.generatePassword"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    adminForm.generatePassword
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ adminForm.generatePassword ? '✓ Generate' : 'Generate' }}
                </button>
                <button
                  v-if="adminForm.password"
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
            <h2 class="text-2xl font-bold text-gray-900">Admin Account Created</h2>
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
      title="Delete Admin"
      message="Are you sure you want to delete this admin? This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false; adminToDelete = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from 'axios'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const admins = ref([])
const loading = ref(true)
const error = ref(null)
const showAddModal = ref(false)
const editingAdmin = ref(null)
const saving = ref(false)
const showPassword = ref(false)
const showCredentialsModal = ref(false)
const generatedCredentials = ref(null)

const adminForm = ref({
  name: '',
  email: '',
  password: '',
  generatePassword: false
})

const currentAdminId = computed(() => {
  const admin = localStorage.getItem('admin')
  return admin ? JSON.parse(admin).id : null
})

const fetchAdmins = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('adminToken')
    const response = await axios.get('/api/admin/admins', {
      headers: { Authorization: `Bearer ${token}` }
    })
    admins.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load admins'
  } finally {
    loading.value = false
  }
}

const editAdmin = (admin) => {
  editingAdmin.value = admin
  adminForm.value = {
    name: admin.name,
    email: admin.email,
    password: '',
    generatePassword: false
  }
  showPassword.value = false
}

const cancelEdit = () => {
  showAddModal.value = false
  editingAdmin.value = null
  showCredentialsModal.value = false
  generatedCredentials.value = null
  adminForm.value = {
    name: '',
    email: '',
    password: '',
    generatePassword: false
  }
  showPassword.value = false
}

const saveAdmin = async () => {
  saving.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    const url = editingAdmin.value
      ? `/api/admin/admins/${editingAdmin.value.id}`
      : '/api/admin/admins'
    
    const method = editingAdmin.value ? 'put' : 'post'
    
    const data = {
      ...adminForm.value,
      generatePassword: adminForm.value.generatePassword && !adminForm.value.password
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
    
    if (response.data.generatedPassword) {
      generatedCredentials.value = {
        email: adminForm.value.email,
        password: response.data.generatedPassword,
        type: 'admin'
      }
      showCredentialsModal.value = true
    } else {
      cancelEdit()
      fetchAdmins()
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Failed to save admin'
    if (window.showToast) {
      window.showToast(errorMsg, 'error')
    } else {
      alert(errorMsg)
    }
  } finally {
    saving.value = false
  }
}

const showDeleteConfirm = ref(false)
const adminToDelete = ref(null)

const deleteAdmin = async (adminId) => {
  adminToDelete.value = adminId
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!adminToDelete.value) return
  
  try {
    const token = localStorage.getItem('adminToken')
    await axios.delete(`/api/admin/admins/${adminToDelete.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showDeleteConfirm.value = false
    adminToDelete.value = null
    fetchAdmins()
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Failed to delete admin'
    if (window.showToast) {
      window.showToast(errorMsg, 'error')
    } else {
      alert(errorMsg)
    }
  }
}

const copyCredentials = (text) => {
  navigator.clipboard.writeText(text)
}

const closeCredentialsModal = () => {
  showCredentialsModal.value = false
  generatedCredentials.value = null
  cancelEdit()
  fetchAdmins()
}

// Refresh data periodically and on focus
let refreshInterval = null

const refreshData = () => {
  fetchAdmins()
}

onMounted(() => {
  fetchAdmins()
  
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

