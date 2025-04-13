import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Bootstrap y jQuery
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'jquery'
import '@popperjs/core'

// Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css'

// Estilos globales
import './assets/css/style.css'

// Crear la app
const app = createApp(App)

// Directiva personalizada para accesibilidad
app.directive('accessibility', {
  mounted(el, binding) {
    if (binding.value) {
      el.classList.add(binding.arg)
    } else {
      el.classList.remove(binding.arg)
    }
  },
  updated(el, binding) {
    if (binding.value) {
      el.classList.add(binding.arg)
    } else {
      el.classList.remove(binding.arg)
    }
  }
})

app.use(store)
app.use(router)
app.mount('#app')