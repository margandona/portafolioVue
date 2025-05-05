import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'https://us-central1-casiangelesydemonios.cloudfunctions.net/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors (e.g., token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle forbidden errors
    if (error.response && error.response.status === 403) {
      console.error('Acceso denegado:', error.response.data?.message || 'No tienes permisos para realizar esta acción');
    }
    
    // Handle not found errors
    if (error.response && error.response.status === 404) {
      console.error('Recurso no encontrado:', error.response.data?.message || 'El recurso solicitado no existe');
    }
    
    // Handle validation errors
    if (error.response && error.response.status === 400) {
      console.error('Error de validación:', error.response.data?.message || 'Datos inválidos');
    }
    
    // Handle server errors
    if (error.response && error.response.status >= 500) {
      console.error('Error del servidor:', error.response.data?.message || 'Error interno del servidor');
    }
    
    return Promise.reject(error);
  }
);

export default api;
