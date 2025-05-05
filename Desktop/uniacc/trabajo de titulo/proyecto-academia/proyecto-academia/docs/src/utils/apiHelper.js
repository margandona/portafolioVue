import axios from 'axios';

// Base API URL
const API_BASE_URL = 'https://us-central1-casiangelesydemonios.cloudfunctions.net/api';

/**
 * Formatea un mensaje de error para mostrar al usuario
 * @param {Error} error - El error capturado
 * @returns {String} Mensaje de error formateado
 */
export const formatErrorMessage = (error) => {
  if (error.response) {
    // Error de respuesta del servidor (tiene código de estado)
    const status = error.response.status;
    const message = error.response.data?.message || 'Error del servidor';
    
    // Manejar códigos de error específicos
    switch (status) {
      case 401:
        return `Error de autenticación: ${message}. Por favor inicie sesión nuevamente.`;
      case 403:
        return `Acceso denegado: ${message}`;
      case 404:
        return `Recurso no encontrado: ${message}`;
      default:
        return `Error ${status}: ${message}`;
    }
  } else if (error.request) {
    // Error de solicitud (no se recibió respuesta)
    return "No se recibió respuesta del servidor. Verifique su conexión.";
  } else {
    // Error de configuración o de otro tipo
    return `Error en la solicitud: ${error.message}`;
  }
};

/**
 * Realiza una llamada a la API con manejo de errores mejorado
 * @param {String} endpoint - Endpoint relativo (sin API_BASE_URL)
 * @param {Object} options - Opciones para la llamada
 * @returns {Promise} Promise con el resultado de la llamada
 */
export const fetchFromAPI = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor inicie sesión nuevamente.');
    }

    // Construir la URL completa
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Configurar opciones por defecto y fusionar con las proporcionadas
    const defaultOptions = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000, // 15 segundos de timeout
    };
    
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };
    
    console.log(`API Request to: ${url}`, mergedOptions);
    
    const response = await axios(url, mergedOptions);
    console.log(`API Response from: ${url}`, response);
    
    return response.data;
  } catch (error) {
    console.error(`API Error in ${endpoint}:`, error);
    
    // Si es un error de timeout, personalizarlo
    if (error.code === 'ECONNABORTED') {
      error.customMessage = "La solicitud ha tardado demasiado. Compruebe su conexión a internet.";
    } else {
      error.customMessage = formatErrorMessage(error);
    }
    
    throw error;
  }
};

/**
 * Obtener cursos según el rol del usuario
 * @param {String} role - Rol del usuario (admin, teacher, student)
 * @param {String} userId - ID del usuario
 * @param {String} path - Ruta actual (para determinar si mostrar cursos inscritos o disponibles para estudiantes)
 * @returns {Promise<Array>} - Lista de cursos
 */
export const fetchCoursesByRole = async (role, userId, path) => {
  let endpoint = '/courses';
  const options = { method: 'GET' };
  
  if (role === 'admin') {
    // Admin ve todos los cursos
    endpoint = '/courses';
  } else if (role === 'teacher') {
    // Teacher ve solo sus cursos - usamos su ID
    endpoint = `/courses/teacher`;
    // Incluir el ID de profesor como parámetro de consulta
    options.params = { teacherId: userId };
  } else if (role === 'student') {
    // Estudiantes ven cursos según la ruta
    if (path === '/courses') {
      endpoint = '/courses/enrolled';
    } else {
      endpoint = '/courses/available';
    }
  }
  
  return await fetchFromAPI(endpoint, options);
};

/**
 * API Helper functions for common operations
 */
import api from './api';

/**
 * Format prices for display
 * @param {number} amount - Price to format
 * @param {string} locale - Locale for formatting (default: 'es-CL')
 * @param {string} currency - Currency code (default: 'CLP')
 * @returns {string} Formatted price
 */
export const formatPrice = (amount, locale = 'es-CL', currency = 'CLP') => {
  if (amount === undefined || amount === null) return '$0';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a date for display
 * @param {Date|string} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (date, options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('es-CL', options).format(
    typeof date === 'string' ? new Date(date) : date
  );
};

/**
 * Calculate IVA (VAT/sales tax) based on net price
 * @param {number} netPrice - Price without tax
 * @param {number} rate - Tax rate (default: 0.19 for 19% in Chile)
 * @returns {number} Tax amount
 */
export const calculateIVA = (netPrice, rate = 0.19) => {
  if (!netPrice || isNaN(netPrice)) return 0;
  return Math.round(netPrice * rate);
};

/**
 * Calculate total price with IVA
 * @param {number} netPrice - Price without tax
 * @param {number} rate - Tax rate (default: 0.19 for 19% in Chile)
 * @returns {number} Total price with tax
 */
export const calculateTotalPrice = (netPrice, rate = 0.19) => {
  if (!netPrice || isNaN(netPrice)) return 0;
  return Math.round(netPrice * (1 + rate));
};

/**
 * Calculate discounted price
 * @param {number} originalPrice - Original price
 * @param {number} discountPercentage - Discount percentage (0-100)
 * @returns {number} Discounted price
 */
export const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  if (!originalPrice || isNaN(originalPrice)) return 0;
  if (!discountPercentage || isNaN(discountPercentage)) return originalPrice;
  
  const discount = (discountPercentage / 100);
  return Math.round(originalPrice * (1 - discount));
};

/**
 * Get payment method display name
 * @param {string} paymentMethod - Payment method code
 * @returns {string} Display name
 */
export const getPaymentMethodName = (paymentMethod) => {
  const methods = {
    credit_card: 'Tarjeta de Crédito',
    debit_card: 'Tarjeta de Débito',
    bank_transfer: 'Transferencia Bancaria',
    paypal: 'PayPal',
    other: 'Otro método'
  };
  
  return methods[paymentMethod] || paymentMethod;
};

/**
 * Get sale status display name
 * @param {string} status - Sale status code
 * @returns {string} Display name
 */
export const getSaleStatusName = (status) => {
  const statuses = {
    pending: 'Pendiente',
    processing: 'Procesando',
    completed: 'Completado',
    failed: 'Fallido',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado'
  };
  
  return statuses[status] || status;
};

/**
 * Get enrollment type display name
 * @param {string} type - Enrollment type code
 * @returns {string} Display name
 */
export const getEnrollmentTypeName = (type) => {
  const types = {
    free: 'Gratuito',
    paid: 'De pago',
    assigned: 'Asignado'
  };
  
  return types[type] || type;
};

/**
 * Check if a course is free
 * @param {object} course - Course object
 * @returns {boolean} True if course is free
 */
export const isFree = (course) => {
  return course?.isFree === true;
};

/**
 * Check if a course has an active discount
 * @param {object} course - Course object
 * @returns {boolean} True if course has an active discount
 */
export const hasActiveDiscount = (course) => {
  return course?.hasActiveDiscount === true;
};

/**
 * Helper to handle API errors
 * @param {Error} error - Error object from API call
 * @param {function} errorHandler - Function to handle the error
 * @returns {object} Error information object
 */
export const handleApiError = (error, errorHandler = null) => {
  const errorInfo = {
    message: error.response?.data?.message || 'Error en la solicitud',
    details: error.response?.data?.details || error.message,
    status: error.response?.status || 500
  };
  
  console.error('API Error:', errorInfo);
  
  if (errorHandler && typeof errorHandler === 'function') {
    errorHandler(errorInfo);
  }
  
  return errorInfo;
};

/**
 * Check user permissions for a specific course
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID
 * @returns {Promise<object>} Permission object
 */
export const checkCoursePermissions = async (courseId, userId) => {
  try {
    const response = await api.get(`/courses/${courseId}/permissions/${userId}`);
    return response.data;
  } catch (error) {
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canEnroll: false,
      isOwner: false,
      isEnrolled: false
    };
  }
};

export default {
  fetchFromAPI,
  formatErrorMessage,
  fetchCoursesByRole,
  formatPrice,
  formatDate,
  calculateIVA,
  calculateTotalPrice,
  calculateDiscountedPrice,
  getPaymentMethodName,
  getSaleStatusName,
  getEnrollmentTypeName,
  isFree,
  hasActiveDiscount,
  handleApiError,
  checkCoursePermissions
};
