<template>
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
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
    >
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
                <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Edit Job</h2>
                <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Update job details</p>
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
              <!-- Company Name -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  v-model="form.companyName"
                  type="text"
                  required
                  class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter company name"
                />
              </div>

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
                  placeholder="Enter job title"
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
                  class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://..."
                />
              </div>

              <!-- Location -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Location (optional)
                </label>
                <input
                  v-model="form.location"
                  type="text"
                  class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="City, State"
                />
              </div>

              <!-- Status -->
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

              <!-- Notes -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  v-model="form.notes"
                  rows="3"
                  class="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  placeholder="Additional notes..."
                ></textarea>
              </div>

              <!-- Error Message -->
              <transition
                enter-active-class="transition ease-out duration-300"
                enter-from-class="opacity-0 transform scale-95"
                enter-to-class="opacity-100 transform scale-100"
              >
                <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <span>{{ error }}</span>
                </div>
              </transition>

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-2">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="loading"
                  class="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span v-if="loading" class="flex items-center justify-center gap-2">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </span>
                  <span v-else>Update Job</span>
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
import { ref, watch, onMounted, onUnmounted } from 'vue'
import api from '@/services/api'
import { useToastStore } from '@/stores/toast'

const props = defineProps({
  isOpen: Boolean,
  job: Object
})

const emit = defineEmits(['close', 'updated'])

const toastStore = useToastStore()
const loading = ref(false)
const error = ref('')

const form = ref({
  companyName: '',
  jobTitle: '',
  jobLink: '',
  location: '',
  status: 'Applied',
  notes: ''
})

// Watch for job changes and populate form
watch(() => props.job, (newJob) => {
  if (newJob) {
    form.value = {
      companyName: newJob.companyName || '',
      jobTitle: newJob.jobTitle || '',
      jobLink: newJob.jobLink || '',
      location: newJob.location || '',
      status: newJob.status || 'Applied',
      notes: newJob.notes || ''
    }
  }
}, { immediate: true })

const closeModal = () => {
  error.value = ''
  emit('close')
}

const handleSubmit = async () => {
  if (!props.job?.id) {
    error.value = 'Job ID is missing'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await api.put(`/jobs/${props.job.id}`, {
      companyName: form.value.companyName,
      jobTitle: form.value.jobTitle,
      jobLink: form.value.jobLink,
      location: form.value.location,
      status: form.value.status,
      notes: form.value.notes
    })

    toastStore.success('Job updated successfully!')
    emit('updated')
    closeModal()
  } catch (err) {
    console.error('Error updating job:', err)
    error.value = err.response?.data?.error || 'Failed to update job'
    toastStore.error(error.value)
  } finally {
    loading.value = false
  }
}

// Close on Escape key
const handleEscape = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleEscape)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleEscape)
  }
})
</script>

