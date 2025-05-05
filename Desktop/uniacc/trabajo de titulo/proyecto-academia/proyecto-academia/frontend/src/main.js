import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

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