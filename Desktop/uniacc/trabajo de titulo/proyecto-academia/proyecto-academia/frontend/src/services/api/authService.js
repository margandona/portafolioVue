import api from './api';

/**
 * Servicio para manejar la autenticación de usuarios
 */
export default {
  /**
   * Iniciar sesión con correo electrónico y contraseña
   * @param {Object} credentials - Credenciales del usuario (email, password)
   */
  login(credentials) {
    return api.post('/auth/login', credentials);
  },

  /**
   * Registrar un nuevo usuario
   * @param {Object} userData - Datos para el registro
   */
  register(userData) {
    return api.post('/auth/register', userData);
  },

  /**
   * Solicitar recuperación de contraseña
   * @param {Object} data - Datos para la recuperación (email)
   */
  forgotPassword(data) {
    return api.post('/auth/forgot-password', data);
  },

  /**
   * Restablecer contraseña con token
   * @param {Object} data - Datos para restablecer (token, password)
   */
  resetPassword(data) {
    return api.post('/auth/reset-password', data);
  },

  /**
   * Verificar token de autenticación
   * @param {String} token - Token a verificar
   */
  verifyToken(token) {
    return api.post('/auth/verify-token', { token });
  }
};
