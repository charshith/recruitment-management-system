import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let toastId = 0

  const show = (message, type = 'info', duration = 3000) => {
    const id = ++toastId
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
      visible: true
    }

    toasts.value.push(toast)

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const success = (message, duration = 3000) => {
    return show(message, 'success', duration)
  }

  const error = (message, duration = 4000) => {
    return show(message, 'error', duration)
  }

  const warning = (message, duration = 3000) => {
    return show(message, 'warning', duration)
  }

  const info = (message, duration = 3000) => {
    return show(message, 'info', duration)
  }

  const remove = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value[index].visible = false
      // Remove from array after animation
      setTimeout(() => {
        toasts.value.splice(index, 1)
      }, 300)
    }
  }

  const clear = () => {
    toasts.value.forEach(toast => {
      toast.visible = false
    })
    setTimeout(() => {
      toasts.value = []
    }, 300)
  }

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
})

