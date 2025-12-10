<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
      <p class="text-gray-600 mt-1">View and manage your admin account details</p>
    </div>

    <!-- Profile Card -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
      
      <div v-else-if="error" class="p-4 text-red-600">{{ error }}</div>
      
      <div v-else-if="admin" class="p-6 sm:p-8">
        <!-- Profile Header -->
        <div class="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {{ admin.name?.charAt(0).toUpperCase() || 'A' }}
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ admin.name }}</h2>
              <p class="text-gray-600 mt-1">{{ admin.email }}</p>
              <span class="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                {{ admin.role || 'admin' }}
              </span>
            </div>
          </div>
          <button
            @click="showEditModal = true"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </button>
        </div>

        <!-- Profile Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <label class="text-sm font-medium text-gray-500">Admin ID</label>
            <p class="mt-1 text-sm font-mono text-gray-900">{{ admin.id }}</p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <label class="text-sm font-medium text-gray-500">Email Address</label>
            <p class="mt-1 text-sm text-gray-900">{{ admin.email }}</p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <label class="text-sm font-medium text-gray-500">Full Name</label>
            <p class="mt-1 text-sm text-gray-900">{{ admin.name }}</p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <label class="text-sm font-medium text-gray-500">Role</label>
            <p class="mt-1">
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                {{ admin.role || 'admin' }}
              </span>
            </p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <label class="text-sm font-medium text-gray-500">Account Created</label>
            <p class="mt-1 text-sm text-gray-900">
              {{ new Date(admin.createdAt).toLocaleString() }}
            </p>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-4">
            <label class="text-sm font-medium text-gray-500">Last Updated</label>
            <p class="mt-1 text-sm text-gray-900">
              {{ new Date(admin.updatedAt).toLocaleString() }}
            </p>
          </div>
        </div>

        <!-- Security Section -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Security</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p class="text-sm font-medium text-yellow-900">Password</p>
                <p class="text-xs text-yellow-700 mt-1">Last changed: {{ new Date(admin.updatedAt).toLocaleDateString() }}</p>
              </div>
              <button
                @click="showPasswordModal = true"
                class="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Edit Profile</h2>
          
          <form @submit.prevent="saveProfile" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                v-model="profileForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="profileForm.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Change Password</h2>
          
          <form @submit.prevent="changePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p class="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div v-if="passwordError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {{ passwordError }}
            </div>
            
            <div class="flex justify-end gap-3 pt-4">
              <button
                type="button"
                @click="showPasswordModal = false; passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' }; passwordError = ''"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {{ saving ? 'Changing...' : 'Change Password' }}
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
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const admin = ref(null)
const loading = ref(true)
const error = ref(null)
const showEditModal = ref(false)
const showPasswordModal = ref(false)
const saving = ref(false)
const passwordError = ref('')

const profileForm = ref({
  name: '',
  email: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const fetchProfile = async () => {
  loading.value = true
  error.value = null
  
  try {
    await authStore.refreshAdmin()
    admin.value = authStore.admin
    if (admin.value) {
      profileForm.value = {
        name: admin.value.name,
        email: admin.value.email
      }
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

const saveProfile = async () => {
  saving.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    const response = await axios.put(`/api/admin/admins/${admin.value.id}`, {
      name: profileForm.value.name,
      email: profileForm.value.email
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    // Refresh admin data
    await authStore.refreshAdmin()
    admin.value = authStore.admin
    showEditModal.value = false
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Failed to update profile'
    console.error('Error updating profile:', err)
    if (window.showToast) {
      window.showToast(errorMsg, 'error')
    } else {
      alert(errorMsg)
    }
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  passwordError.value = ''
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'New passwords do not match'
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'New password must be at least 6 characters'
    return
  }
  
  saving.value = true
  
  try {
    const token = localStorage.getItem('adminToken')
    // First verify current password by trying to login
    const loginResponse = await axios.post('/api/auth/admin/login', {
      email: admin.value.email,
      password: passwordForm.value.currentPassword
    })
    
    if (!loginResponse.data || !loginResponse.data.token) {
      passwordError.value = 'Current password is incorrect'
      saving.value = false
      return
    }
    
    // Update password
    await axios.put(`/api/admin/admins/${admin.value.id}`, {
      password: passwordForm.value.newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    showPasswordModal.value = false
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    
    if (window.showToast) {
      window.showToast('Password changed successfully', 'success')
    } else {
      alert('Password changed successfully')
    }
  } catch (err) {
    if (err.response?.status === 401) {
      passwordError.value = 'Current password is incorrect'
    } else {
      passwordError.value = err.response?.data?.error || 'Failed to change password'
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

