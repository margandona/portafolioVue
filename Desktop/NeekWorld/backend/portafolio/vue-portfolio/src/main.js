import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

// Import the bootstrap initialization function
import { checkBootstrapModal } from './bootstrap-init'

// Check if Bootstrap modal is available
checkBootstrapModal();

// Debug check for store modules
console.log('Store modules check:');
console.log('- Has modals module:', !!store._modules.root._children.modals);

// Create and mount the Vue app
const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')

// Try again to initialize Bootstrap after the app is mounted
setTimeout(() => {
  if (window.jQuery && typeof window.jQuery.fn.modal === 'function') {
    console.log('Initializing modals after app mount');
    window.jQuery('.modal').modal({show: false});
  } else {
    console.error('Bootstrap modal still not available after app mount');
  }
}, 1000);