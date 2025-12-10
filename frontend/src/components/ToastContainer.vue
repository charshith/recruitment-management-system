<template>
  <div
    aria-live="polite"
    aria-atomic="true"
    class="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm sm:max-w-md pointer-events-none"
  >
    <transition-group
      name="toast"
      tag="div"
      class="flex flex-col gap-2"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto rounded-lg shadow-lg p-4 flex items-start gap-3 transition-all duration-300 ease-in-out',
          getToastClasses(toast.type)
        ]"
        role="alert"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <component :is="getIcon(toast.type)" class="w-5 h-5" />
        </div>

        <!-- Message -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium" :class="getTextClasses(toast.type)">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button
          @click="remove(toast.id)"
          class="flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          :aria-label="'Close notification'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useToastStore } from '@/stores/toast'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon 
} from '@heroicons/vue/24/solid'

const toastStore = useToastStore()
const toasts = computed(() => toastStore.toasts)

const remove = (id) => {
  toastStore.remove(id)
}

const getIcon = (type) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  }
  return icons[type] || InformationCircleIcon
}

const getToastClasses = (type) => {
  const classes = {
    success: 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
  }
  return classes[type] || classes.info
}

const getTextClasses = (type) => {
  const classes = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-yellow-800 dark:text-yellow-200',
    info: 'text-blue-800 dark:text-blue-200'
  }
  return classes[type] || classes.info
}
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>

