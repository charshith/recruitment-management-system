import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme store BEFORE mounting
import { useThemeStore } from './stores/theme'
const themeStore = useThemeStore()

app.mount('#app')

// Theme is already applied in store initialization, but ensure it's applied after mount
setTimeout(() => {
  themeStore.applyTheme()
}, 0)


