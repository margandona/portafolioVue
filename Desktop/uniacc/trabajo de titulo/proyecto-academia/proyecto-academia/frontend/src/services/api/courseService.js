import api from './api';

/**
 * Servicio para manejar las operaciones relacionadas con cursos
 */
export default {
  /**
   * Obtener todos los cursos
   */
  getAllCourses() {
    return api.get('/courses');
  },

  /**
   * Obtener cursos disponibles para inscripción (no inscritos)
   */
  getAvailableCourses() {
    return api.get('/courses/available');
  },

  /**
   * Obtener cursos en los que el usuario está inscrito
   */
  getEnrolledCourses() {
    return api.get('/courses/enrolled');
  },

  /**
   * Obtener un curso por su ID
   * @param {string} courseId - ID del curso
   */
  getCourse(courseId) {
    return api.get(`/courses/${courseId}`);
  },

  /**
   * Crear un nuevo curso
   * @param {Object} courseData - Datos del curso
   */
  createCourse(courseData) {
    return api.post('/courses', courseData);
  },

  /**
   * Actualizar un curso existente
   * @param {string} courseId - ID del curso
   * @param {Object} courseData - Datos del curso
   */
  updateCourse(courseId, courseData) {
    console.log(`API request to update course ${courseId}:`, courseData);
    
    // Check for common issues before sending to API
    if (!courseId) {
      console.error('Missing courseId in updateCourse request');
      return Promise.reject(new Error('ID de curso no proporcionado'));
    }
    
    if (!courseData || Object.keys(courseData).length === 0) {
      console.error('Empty courseData in updateCourse request');
      return Promise.reject(new Error('Datos de curso vacíos'));
    }
    
    // Specific validation for asynchronized courses - they need duration_days
    if (courseData.modality === 'asynchronized') {
      if (courseData.duration_days === undefined || courseData.duration_days === null) {
        console.error('Missing duration_days for asynchronized course');
        return Promise.reject(new Error('La duración en días es obligatoria para cursos asincrónicos'));
      }
    }

    // Make sure we don't send undefined values that could cause issues
    const cleanedData = {};
    Object.keys(courseData).forEach(key => {
      if (courseData[key] !== undefined) {
        cleanedData[key] = courseData[key];
      }
    });
    
    console.log('Sending cleaned data to API:', cleanedData);
    
    return api.put(`/courses/${courseId}`, cleanedData)
      .catch(error => {
        // Enhanced error handling with more details
        if (error.response) {
          console.error('API Error Response:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers
          });
          
          // Log request that caused the error
          console.error('Request that caused error:', {
            url: error.config.url,
            method: error.config.method,
            data: JSON.parse(error.config.data)  // Convert the string to object for better logging
          });
        } else if (error.request) {
          console.error('API Request Error (No Response)', error.request);
        } else {
          console.error('API Request Setup Error:', error.message);
        }
        throw error;
      });
  },

  /**
   * Eliminar un curso
   * @param {string} courseId - ID del curso
   */
  deleteCourse(courseId) {
    return api.delete(`/courses/${courseId}`);
  },

  /**
   * Inscribir al usuario en un curso
   * @param {string} courseId - ID del curso
   */
  enrollInCourse(courseId) {
    return api.post(`/enrollments`, { courseId });
  },

  /**
   * Iniciar proceso de compra de un curso
   * @param {string} courseId - ID del curso
   */
  initiatePurchase(courseId) {
    return api.post(`/sales`, { courseId });
  },

  /**
   * Procesar pago de una venta
   * @param {string} saleId - ID de la venta
   * @param {Object} paymentData - Datos del pago
   */
  processPayment(saleId, paymentData) {
    return api.post(`/sales/${saleId}/process-payment`, paymentData);
  },

  /**
   * Confirmar pago de una venta
   * @param {string} saleId - ID de la venta
   * @param {Object} confirmationData - Datos de confirmación
   */
  confirmPayment(saleId, confirmationData) {
    return api.post(`/sales/${saleId}/confirm`, confirmationData);
  },

  /**
   * Obtener información de una venta
   * @param {string} saleId - ID de la venta
   */
  getSale(saleId) {
    return api.get(`/sales/${saleId}`);
  },

  /**
   * Obtener ventas del usuario
   */
  getUserSales() {
    return api.get('/sales');
  },

  /**
   * Aplicar descuento a un curso
   * @param {string} courseId - ID del curso
   * @param {Object} discountData - Datos del descuento
   */
  applyCourseDiscount(courseId, discountData) {
    return api.post(`/courses/${courseId}/discount`, discountData);
  },

  /**
   * Eliminar descuento de un curso
   * @param {string} courseId - ID del curso
   */
  removeCourseDiscount(courseId) {
    return api.delete(`/courses/${courseId}/discount`);
  },

  /**
   * Asignar acceso gratuito a un estudiante
   * @param {string} courseId - ID del curso
   * @param {Object} assignData - Datos de asignación
   */
  assignFreeCourseAccess(courseId, assignData) {
    return api.post(`/courses/${courseId}/assign`, assignData);
  },

  /**
   * Obtener estadísticas de un curso
   * @param {string} courseId - ID del curso
   */
  getCourseStats(courseId) {
    return api.get(`/enrollments/stats/${courseId}`);
  },

  /**
   * Obtener estudiantes inscritos en un curso
   * @param {string} courseId - ID del curso
   */
  getCourseStudents(courseId) {
    return api.get(`/courses/${courseId}/students`);
  },

  /**
   * Obtener módulos y lecciones de un curso
   * @param {string} courseId - ID del curso
   */
  getCourseModules(courseId) {
    return api.get(`/courses/${courseId}/modules`);
  },

  /**
   * Actualizar progreso de un estudiante en un curso
   * @param {string} enrollmentId - ID de la inscripción
   * @param {Object} progressData - Datos de progreso
   */
  updateCourseProgress(enrollmentId, progressData) {
    return api.patch(`/enrollments/${enrollmentId}/progress`, progressData);
  }
};
