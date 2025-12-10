<template>
  <!-- Floating Action Button -->
  <button
    @click="openModal"
    :aria-label="'Quick Add Job (Press Cmd+K)'"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
    :class="{ 'animate-pulse': hasActiveSession }"
    title="Quick Add Job (⌘+K)"
  >
    <svg v-if="!isOpen" class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
    <svg v-else class="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>

  <!-- Modal Overlay -->
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
      <div
        v-if="isOpen"
        @click.self="closeModal"
        @keydown.escape="closeModal"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-title"
      >
      <!-- Modal Content -->
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 transform scale-95 translate-y-4"
        enter-to-class="opacity-100 transform scale-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 transform scale-100 translate-y-0"
        leave-to-class="opacity-0 transform scale-95 translate-y-4"
      >
        <div
          v-if="isOpen"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
        >
          <!-- Modal Header -->
          <div class="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-800">
            <div class="flex items-center justify-between">
              <div>
                <h2 id="quick-add-title" class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Quick Add Job</h2>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Fast job application entry</p>
              </div>
              <button
                @click="closeModal"
                class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-180px)] custom-scrollbar">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Client Selection -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Client *
                </label>
                <select
                  v-model="form.clientId"
                  required
                  @change="onClientChange"
                  class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a client</option>
                  <option
                    v-for="client in clients"
                    :key="client.id"
                    :value="client.id"
                  >
                    {{ client.name }}
                  </option>
                </select>
              </div>

              <!-- Company Name with Recent Suggestions -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <div class="relative">
                  <input
                    v-model="form.companyName"
                    type="text"
                    required
                    @input="checkDuplicate"
                    @paste="handlePaste"
                    list="recent-companies"
                    class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter company name"
                  />
                  <datalist id="recent-companies">
                    <option v-for="company in recentCompanies" :key="company" :value="company" />
                  </datalist>
                  <button
                    v-if="form.companyName"
                    @click="pasteFromClipboard"
                    type="button"
                    class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded"
                    title="Paste from clipboard"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Duplicate Warning -->
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 transform scale-95"
                enter-to-class="opacity-100 transform scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 transform scale-100"
                leave-to-class="opacity-0 transform scale-95"
              >
                <div
                  v-if="duplicateWarning"
                  class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                >
                  <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <div>
                    <p class="font-semibold">Possible duplicate detected!</p>
                    <p class="text-xs mt-1">{{ duplicateWarning }}</p>
                  </div>
                </div>
              </transition>

              <!-- Job Title -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Job Title / Role *
                </label>
                <input
                  v-model="form.jobTitle"
                  type="text"
                  required
                  class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <!-- Job Link -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Job Link *
                </label>
                <input
                  v-model="form.jobLink"
                  type="url"
                  required
                  @paste="handlePaste"
                  class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://..."
                />
              </div>

              <!-- Quick Actions Row -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    v-model="form.status"
                    required
                    class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Applied">Applied</option>
                    <option value="To be Applied">To be Applied</option>
                    <option value="Not Fit">Not Fit</option>
                    <option value="Duplicate">Duplicate</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    v-model="form.location"
                    type="text"
                    class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="City, State"
                  />
                </div>
              </div>

              <!-- Error Message -->
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 transform scale-95"
                enter-to-class="opacity-100 transform scale-100"
              >
                <div
                  v-if="error"
                  class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                >
                  <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ error }}</span>
                </div>
              </transition>

              <!-- Success Message -->
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 transform scale-95"
                enter-to-class="opacity-100 transform scale-100"
              >
                <div
                  v-if="success"
                  class="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
                >
                  <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>Job added successfully!</span>
                </div>
              </transition>

              <!-- Submit Button -->
              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="loading"
                  class="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-sm sm:text-base"
                >
                  <span v-if="loading" class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                  <span v-else class="flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Job
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isOpen = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref(false)
const duplicateWarning = ref('')
const hasActiveSession = ref(false)

const form = ref({
  clientId: '',
  companyName: '',
  jobTitle: '',
  jobLink: '',
  location: '',
  status: 'Applied',
  notes: ''
})

const clients = ref([])
const recentCompanies = ref([])
const existingJobs = ref([])

// Fetch clients and recent companies
const fetchData = async () => {
  try {
    const clientsResponse = await api.get('/recruiters/me/clients')
    clients.value = clientsResponse.data

    // Get recent companies from all jobs
    const allJobs = []
    for (const client of clients.value) {
      try {
        const jobsResponse = await api.get(`/jobs/client/${client.id}`)
        // Handle both response formats: { jobs: [...] } or [...]
        const jobs = jobsResponse.data.jobs || jobsResponse.data || []
        allJobs.push(...jobs)
      } catch (err) {
      }
    }

    // Extract unique company names, sorted by most recent
    const companySet = new Set()
    allJobs
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .forEach(job => {
        if (job.companyName && !companySet.has(job.companyName)) {
          companySet.add(job.companyName)
        }
      })
    
    recentCompanies.value = Array.from(companySet).slice(0, 10)
    existingJobs.value = allJobs
  } catch (err) {
  }
}

// Check for active sessions
const checkActiveSessions = async () => {
  try {
    for (const client of clients.value) {
      try {
        const sessionResponse = await api.get(`/sessions/client/${client.id}/active`)
        if (sessionResponse.data) {
          hasActiveSession.value = true
          return
        }
      } catch (err) {
        // No active session
      }
    }
    hasActiveSession.value = false
  } catch (err) {
  }
}

// Check for duplicates
const checkDuplicate = () => {
  duplicateWarning.value = ''
  
  if (!form.value.companyName || !form.value.jobTitle || !form.value.clientId) {
    return
  }

  const duplicate = existingJobs.value.find(job => 
    job.clientId === form.value.clientId &&
    job.companyName.toLowerCase() === form.value.companyName.toLowerCase() &&
    job.jobTitle.toLowerCase() === form.value.jobTitle.toLowerCase()
  )

  if (duplicate) {
    duplicateWarning.value = `Similar job already exists: ${duplicate.companyName} - ${duplicate.jobTitle} (${formatDate(duplicate.date)})`
  }
}

// Handle paste event
const handlePaste = async (event) => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      // If it looks like a URL, put it in jobLink
      if (text.startsWith('http://') || text.startsWith('https://')) {
        form.value.jobLink = text
      }
      // If it's a short text, might be company name
      else if (text.length < 50 && !form.value.companyName) {
        form.value.companyName = text
      }
    }
  } catch (err) {
    // Clipboard API not available or permission denied
  }
}

// Paste from clipboard button
const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) {
      form.value.companyName = text
      checkDuplicate()
    }
  } catch (err) {
    error.value = 'Could not access clipboard. Please paste manually.'
    setTimeout(() => { error.value = '' }, 3000)
  }
}

// Client change handler
const onClientChange = () => {
  // Refresh jobs for duplicate checking
  if (form.value.clientId) {
    fetchJobsForClient(form.value.clientId)
  }
}

// Fetch jobs for specific client
const fetchJobsForClient = async (clientId) => {
  try {
    const response = await api.get(`/jobs/client/${clientId}`)
    // Handle both response formats: { jobs: [...] } or [...]
    const clientJobs = response.data.jobs || response.data || []
    
    // Update existing jobs for this client
    existingJobs.value = existingJobs.value.filter(j => j.clientId !== clientId)
    existingJobs.value.push(...clientJobs)
    
    checkDuplicate()
  } catch (err) {
  }
}

// Watch form changes for duplicate detection
watch([() => form.value.companyName, () => form.value.jobTitle, () => form.value.clientId], () => {
  checkDuplicate()
})

// Open modal
const openModal = async () => {
  isOpen.value = true
  await fetchData()
  await checkActiveSessions()
  
  // Auto-select client if only one
  if (clients.value.length === 1) {
    form.value.clientId = clients.value[0].id
    await fetchJobsForClient(form.value.clientId)
  }
  
  // Focus first input
  setTimeout(() => {
    const firstInput = document.querySelector('input[type="text"]')
    if (firstInput) firstInput.focus()
  }, 100)
}

// Close modal
const closeModal = () => {
  isOpen.value = false
  // Reset form after animation
  setTimeout(() => {
    form.value = {
      clientId: '',
      companyName: '',
      jobTitle: '',
      jobLink: '',
      location: '',
      status: 'Applied',
      notes: ''
    }
    error.value = ''
    success.value = false
    duplicateWarning.value = ''
  }, 300)
}

// Handle form submission
const handleSubmit = async () => {
  if (!form.value.clientId) {
    error.value = 'Please select a client'
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    await api.post('/jobs', {
      clientId: form.value.clientId,
      ...form.value
    })

    success.value = true
    
    // Refresh data
    await fetchData()
    await fetchJobsForClient(form.value.clientId)

    // Close modal after 1.5 seconds
    setTimeout(() => {
      closeModal()
      // Emit event or refresh parent component
      window.dispatchEvent(new CustomEvent('job-added'))
    }, 1500)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to add job'
  } finally {
    loading.value = false
  }
}

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Close on Escape key
const handleEscape = (e) => {
  if (e.key === 'Escape' && isOpen.value) {
    closeModal()
  }
  // Cmd/Ctrl + K to open
  if ((e.metaKey || e.ctrlKey) && e.key === 'k' && !isOpen.value) {
    e.preventDefault()
    openModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
  fetchData()
  checkActiveSessions()
  
  // Refresh periodically
  setInterval(() => {
    if (!isOpen.value) {
      checkActiveSessions()
    }
  }, 30000) // Every 30 seconds
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

