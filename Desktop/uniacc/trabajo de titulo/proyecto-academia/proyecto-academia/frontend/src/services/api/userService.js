import api from './api';

/**
 * Servicio para manejar las operaciones relacionadas con usuarios
 */
export default {
  /**
   * Obtener el perfil del usuario autenticado
   */
  getProfile() {
    return api.get('/users/me');
  },

  /**
   * Actualizar el perfil del usuario autenticado
   * @param {Object} userData - Datos del usuario a actualizar
   */
  updateProfile(userData) {
    return api.put('/users/me', userData);
  },

  /**
   * Obtener todos los usuarios (solo admin)
   */
  getAllUsers() {
    return api.get('/users');
  },

  /**
   * Buscar usuarios por ID, correo o nombre
   * @param {Object} params - Parámetros de búsqueda
   */
  searchUsers(params) {
    return api.get('/users/search', { params });
  },

  /**
   * Crear un nuevo usuario (solo admin)
   * @param {Object} userData - Datos del usuario
   */
  createUser(userData) {
    return api.post('/users', userData);
  },

  /**
   * Actualizar un usuario existente
   * @param {string} userId - ID del usuario
   * @param {Object} userData - Datos del usuario
   */
  updateUser(userId, userData) {
    return api.put(`/users/${userId}`, userData);
  },

  /**
   * Eliminar un usuario
   * @param {string} userId - ID del usuario
   */
  deleteUser(userId) {
    // Asegurarse de que el ID sea válido antes de hacer la solicitud
    if (!userId) {
      return Promise.reject(new Error('ID de usuario no válido'));
    }
    return api.delete(`/users/${userId}`);
  },

  /**
   * Cambiar contraseña del usuario autenticado
   * @param {Object} passwordData - Datos de contraseña
   */
  changePassword(passwordData) {
    return api.post('/users/change-password', passwordData);
  }
};
