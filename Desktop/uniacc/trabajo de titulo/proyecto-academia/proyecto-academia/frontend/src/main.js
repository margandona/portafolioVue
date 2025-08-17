import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// Configurar Axios para pagos
const apiBaseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000'
axios.defaults.baseURL = apiBaseURL

// Interceptor para logging (desarrollo)
if (process.env.NODE_ENV === 'development') {
  axios.interceptors.request.use(request => {
    console.log('🌐 API Request:', request.method?.toUpperCase(), request.url, request.data)
    return request
  })
  
  axios.interceptors.response.use(
    response => {
      console.log('✅ API Response:', response.status, response.data)
      return response
    },
    error => {
      console.error('❌ API Error:', error.response?.status, error.response?.data || error.message)
      return Promise.reject(error)
    }
  )
}

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// Create Vuetify instance with all components
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2E8B57',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        },
      },
    },
  },
  // Ensure icons are properly configured
  icons: {
    defaultSet: 'mdi',
  },
})

// Create and mount app with plugins
const app = createApp(App)

// Configurar axios como propiedad global
app.config.globalProperties.$http = axios

// Use plugins
app.use(store)
app.use(router)
app.use(vuetify)

// Mount the application
app.mount('#app')

// Global error handler
app.config.errorHandler = (err) => {
  console.error('Error global:', err)
}