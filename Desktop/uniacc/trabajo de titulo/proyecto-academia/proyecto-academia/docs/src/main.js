// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';
import './assets/styles/variables.scss';
import './assets/styles/global.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';


// Configuración global de Axios
axios.defaults.baseURL = 'http://localhost:3000'; // URL base del backend
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Interceptores de solicitudes para incluir el token dinámicamente
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptores de respuesta para manejar errores globalmente
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.commit('CLEAR_USER'); // Limpiar usuario en Vuex
      router.push('/login'); // Redirigir al inicio de sesión
    }
    return Promise.reject(error);
  }
);

// Crear instancia de la aplicación
const app = createApp(App);

// Agregar Axios a globalProperties para acceso global (opcional)
app.config.globalProperties.$axios = axios;

// Usar Vuex Store y Vue Router
app.use(store);
app.use(router);

// Montar la aplicación
app.mount('#app');
