import axios from "axios";

// Configuración base de Axios
const api = axios.create({
  baseURL: "http://localhost:3000", // Cambia a la URL de tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para incluir el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
