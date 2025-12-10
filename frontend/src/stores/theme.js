import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
          // Get initial theme from localStorage or default to light mode
          const getInitialTheme = () => {
            if (typeof window === 'undefined') return false

            try {
              const stored = localStorage.getItem('theme')
              if (stored === 'dark') return true
              if (stored === 'light') return false

              // Default to light mode (bright mode) if no stored preference
              return false
            } catch (e) {
              return false
            }
          }

  const isDark = ref(getInitialTheme())

  // Apply theme to document
  const applyTheme = () => {
    if (typeof document === 'undefined') return
    
    try {
      const html = document.documentElement
      const shouldBeDark = isDark.value
      
      if (shouldBeDark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
      
      localStorage.setItem('theme', shouldBeDark ? 'dark' : 'light')
    } catch (e) {
    }
  }
  
  // Initialize theme on store creation
  if (typeof window !== 'undefined') {
    applyTheme()
  }

  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  // Set theme
  const setTheme = (dark) => {
    isDark.value = dark
    applyTheme()
  }

          // Don't watch for system preference changes - always default to light mode
          // User can manually toggle if they want dark mode

  return {
    isDark,
    toggleTheme,
    setTheme,
    applyTheme
  }
})

