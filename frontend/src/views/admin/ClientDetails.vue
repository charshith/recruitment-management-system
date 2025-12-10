<template>
  <div>
    <div class="mb-6">
      <button
        @click="$router.push('/admin/clients')"
        class="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Clients
      </button>
      <h1 class="text-3xl font-bold text-gray-900">{{ client?.name || 'Client Details' }}</h1>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else-if="client" class="space-y-6">
      <!-- Client Info Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Client Information</h2>
          <button
            @click="showEditModal = true"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Edit Client
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">Name</label>
            <p class="text-lg text-gray-900">{{ client.name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Email</label>
            <p class="text-lg text-gray-900">{{ client.email }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Assigned Recruiter</label>
            <p class="text-lg text-gray-900">
              <button
                v-if="client.assignedRecruiterName"
                @click="$router.push(`/admin/recruiters/${client.assignedRecruiter}`)"
                class="text-indigo-600 hover:underline"
              >
                {{ client.assignedRecruiterName }}
              </button>
              <span v-else class="text-gray-500">Unassigned</span>
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Daily Target</label>
            <p class="text-lg text-gray-900">{{ client.dailyTarget || 0 }} jobs</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Monthly Target</label>
            <p class="text-lg text-gray-900">{{ client.monthlyTarget || 0 }} jobs</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Instructions</label>
            <p class="text-lg text-gray-900 whitespace-pre-wrap">{{ client.instructions || 'No instructions' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Password Status</label>
            <div class="flex items-center gap-2">
              <span 
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="client.hasPassword ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                {{ client.hasPassword ? 'Password Set' : 'No Password' }}
              </span>
              <button
                @click="showPasswordResetModal = true"
                class="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {{ client.hasPassword ? 'Reset Password' : 'Set Password' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-600">Total Jobs</label>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalJobs || 0 }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Applied Jobs</label>
            <p class="text-2xl font-bold text-gray-900">{{ stats.appliedJobs || 0 }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Total Sessions</label>
            <p class="text-2xl font-bold text-gray-900">{{ stats.totalSessions || 0 }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-600">Active Sessions</label>
            <p class="text-2xl font-bold text-gray-900">{{ stats.activeSessions || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Reset Modal -->
    <div v-if="showPasswordResetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Reset Client Password</h2>
          
          <div v-if="!generatedPassword" class="space-y-4">
            <p class="text-gray-600">
              This will generate a new password for <strong>{{ client?.name }}</strong>. 
              The password will be shown once generated - make sure to copy it!
            </p>
            
            <div class="flex gap-3 justify-end pt-4">
              <button
                type="button"
                @click="showPasswordResetModal = false"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                @click="resetPassword"
                :disabled="resettingPassword"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ resettingPassword ? 'Generating...' : 'Generate New Password' }}
              </button>
            </div>
          </div>
          
          <div v-else class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <p class="text-sm font-medium text-green-800 mb-2">Password Generated Successfully!</p>
              <div class="bg-white border border-green-300 rounded-lg p-3 mb-3">
                <p class="text-lg font-mono font-bold text-center text-gray-900 break-all">{{ generatedPassword }}</p>
              </div>
              <p class="text-xs text-green-700">
                ⚠️ Copy this password now - it won't be shown again!
              </p>
            </div>
            
            <div class="flex gap-3 justify-end pt-4">
              <button
                @click="copyPassword"
                class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Copy Password
              </button>
              <button
                @click="closePasswordModal"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Edit Client</h2>
          
          <form @submit.prevent="saveClient" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                v-model="editForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="editForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Assigned Recruiter</label>
              <select
                v-model="editForm.assignedRecruiter"
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
                  v-model.number="editForm.dailyTarget"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Monthly Target</label>
                <input
                  v-model.number="editForm.monthlyTarget"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
              <textarea
                v-model="editForm.instructions"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Password (leave blank to keep current)
              </label>
              <div class="flex gap-2">
                <input
                  v-model="editForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new password or leave blank"
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
                <button
                  type="button"
                  @click="editForm.generatePassword = !editForm.generatePassword"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    editForm.generatePassword
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ editForm.generatePassword ? '✓ Generate' : 'Generate' }}
                </button>
              </div>
            </div>
            
            <div class="flex gap-3 justify-end pt-4">
              <button
                type="button"
                @click="showEditModal = false"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const clientId = route.params.clientId
const client = ref(null)
const stats = ref({})
const recruiters = ref([])
const loading = ref(true)
const error = ref(null)
const showEditModal = ref(false)
const saving = ref(false)
const showPassword = ref(false)
const showPasswordResetModal = ref(false)
const resettingPassword = ref(false)
const generatedPassword = ref(null)

const editForm = ref({
  name: '',
  email: '',
  assignedRecruiter: '',
  monthlyTarget: 0,
  dailyTarget: 0,
  instructions: '',
  password: '',
  generatePassword: false
})

const fetchClientDetails = async () => {
  loading.value = true
  error.value = null
  
  try {
    const token = localStorage.getItem('adminToken')
    const [clientRes, recruitersRes] = await Promise.all([
      axios.get(`/api/admin/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get('/api/admin/recruiters', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
    
    client.value = clientRes.data
    recruiters.value = recruitersRes.data.recruiters || recruitersRes.data
    
    // Get stats from jobs and sessions
    const jobs = await axios.get('/api/admin/jobs', {
      params: { clientId },
      headers: { Authorization: `Bearer ${token}` }
    })
    const clientJobs = jobs.data.jobs || []
    
    stats.value = {
      totalJobs: clientJobs.length,
      appliedJobs: clientJobs.filter(j => j.status === 'Applied' || j.status === 'To be Applied').length,
      totalSessions: 0,
      activeSessions: 0
    }
    
    editForm.value = {
      name: client.value.name,
      email: client.value.email,
      assignedRecruiter: client.value.assignedRecruiter || '',
      monthlyTarget: client.value.monthlyTarget || 0,
      dailyTarget: client.value.dailyTarget || 0,
      instructions: client.value.instructions || '',
      password: '',
      generatePassword: false
    }
    showPassword.value = false
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load client details'
  } finally {
    loading.value = false
  }
}

const saveClient = async () => {
  saving.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    
    // Prepare data - only include password if it's set or generatePassword is true
    const data = {
      name: editForm.value.name,
      email: editForm.value.email,
      assignedRecruiter: editForm.value.assignedRecruiter || null,
      monthlyTarget: editForm.value.monthlyTarget || 0,
      dailyTarget: editForm.value.dailyTarget || 0,
      instructions: editForm.value.instructions || null,
      generatePassword: editForm.value.generatePassword && !editForm.value.password
    }
    
    // Only include password if it's provided
    if (editForm.value.password && !editForm.value.generatePassword) {
      data.password = editForm.value.password
    }
    
    const response = await axios.put(`/api/admin/clients/${clientId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    // If password was generated, show it
    if (response.data.generatedPassword) {
      generatedPassword.value = response.data.generatedPassword
      showPasswordResetModal.value = true
      showEditModal.value = false
    } else {
    client.value = response.data
    showEditModal.value = false
    
    if (window.showToast) {
      window.showToast('Client updated successfully', 'success')
      }
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

const resetPassword = async () => {
  resettingPassword.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    const response = await axios.put(`/api/admin/clients/${clientId}`, {
      generatePassword: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.data.generatedPassword) {
      generatedPassword.value = response.data.generatedPassword
      // Update client to show password is set
      if (client.value) {
        client.value.hasPassword = true
      }
    } else {
      if (window.showToast) {
        window.showToast('Password reset failed', 'error')
      }
      showPasswordResetModal.value = false
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Failed to reset password'
    if (window.showToast) {
      window.showToast(errorMsg, 'error')
    } else {
      alert(errorMsg)
    }
    showPasswordResetModal.value = false
  } finally {
    resettingPassword.value = false
  }
}

const copyPassword = () => {
  if (generatedPassword.value) {
    navigator.clipboard.writeText(generatedPassword.value).then(() => {
      if (window.showToast) {
        window.showToast('Password copied to clipboard!', 'success')
      }
    }).catch(() => {
      alert('Failed to copy password. Please copy it manually.')
    })
  }
}

const closePasswordModal = () => {
  showPasswordResetModal.value = false
  generatedPassword.value = null
  // Refresh client data
  fetchClientDetails()
}

onMounted(() => {
  fetchClientDetails()
})
</script>

