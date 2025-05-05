/**
 * Utilidades para el manejo de cursos en el frontend
 */

/**
 * Formatea un precio a formato de moneda chilena
 * @param {Number} price - Precio a formatear
 * @param {Boolean} includeSymbol - Si se debe incluir el símbolo de moneda
 * @returns {String} Precio formateado
 */
export const formatPrice = (price, includeSymbol = true) => {
  if (price === undefined || price === null) return '-';
  
  const formatter = new Intl.NumberFormat('es-CL', {
    style: includeSymbol ? 'currency' : 'decimal',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(price);
};

/**
 * Calcula el precio con descuento
 * @param {Number} originalPrice - Precio original
 * @param {Number} discountPercent - Porcentaje de descuento
 * @returns {Number} Precio con descuento aplicado
 */
export const calculateDiscountedPrice = (originalPrice, discountPercent) => {
  if (!originalPrice || !discountPercent) return originalPrice;
  
  const discount = (originalPrice * discountPercent) / 100;
  return Math.round(originalPrice - discount);
};

/**
 * Verifica si un curso tiene descuento activo
 * @param {Object} course - Datos del curso
 * @returns {Boolean} - true si tiene descuento activo
 */
export const hasActiveDiscount = (course) => {
  if (!course) return false;
  
  if (course.hasActiveDiscount) return true;
  
  if (!course.discount || course.discount <= 0) return false;
  
  // Si no tiene fecha límite de descuento, está activo
  if (!course.discountEndDate) return true;
  
  // Verificar si está dentro del rango de fechas
  const now = new Date();
  const endDate = course.discountEndDate instanceof Date ? 
    course.discountEndDate : new Date(course.discountEndDate);
    
  return now <= endDate;
};

/**
 * Obtiene la etiqueta de estado para un curso
 * @param {Object} course - Datos del curso
 * @returns {Object} - Objeto con color y texto para el estado
 */
export const getCourseStatusLabel = (course) => {
  if (!course) return { color: 'grey', text: 'No disponible' };
  
  if (course.isFree) {
    return { color: 'success', text: 'Curso Gratuito' };
  }
  
  if (hasActiveDiscount(course)) {
    return { color: 'warning', text: `${course.discount}% Descuento` };
  }
  
  return { color: 'primary', text: 'Disponible' };
};

/**
 * Verifica si el usuario puede editar un curso
 * @param {Object} course - Datos del curso
 * @param {Object} user - Datos del usuario actual
 * @returns {Boolean} - true si puede editar
 */
export const canEditCourse = (course, user) => {
  if (!course || !user) return false;
  
  // Administradores pueden editar cualquier curso
  if (user.role === 'admin') return true;
  
  // Profesores solo pueden editar sus propios cursos
  if (user.role === 'teacher') {
    return course.teacherId === user.uid || course.instructor_id === user.uid;
  }
  
  return false;
};

/**
 * Formatea la duración de un curso
 * @param {Object} course - Datos del curso
 * @returns {String} - Texto con la duración formateada
 */
export const formatCourseDuration = (course) => {
  if (!course) return '';
  
  // Para cursos sincrónicos con fechas
  if (course.modality === 'synchronized' && course.start_date && course.end_date) {
    const startDate = course.start_date instanceof Date ? 
      course.start_date : new Date(course.start_date);
    const endDate = course.end_date instanceof Date ? 
      course.end_date : new Date(course.end_date);
      
    const startFormatted = startDate.toLocaleDateString('es-CL');
    const endFormatted = endDate.toLocaleDateString('es-CL');
    
    return `Del ${startFormatted} al ${endFormatted}`;
  }
  
  // Para cursos asincrónicos con duración en días
  if (course.modality === 'asynchronized' && course.duration_days) {
    const days = course.duration_days;
    if (days === 1) return '1 día';
    if (days < 30) return `${days} días`;
    
    const months = Math.round(days / 30);
    if (months === 1) return '1 mes';
    return `${months} meses`;
  }
  
  return 'Duración no especificada';
};

/**
 * Extrae categorías únicas de una lista de cursos
 * @param {Array} courses - Lista de cursos
 * @returns {Array} - Lista de categorías únicas
 */
export const extractCategories = (courses) => {
  if (!courses || !Array.isArray(courses)) return [];
  
  const categoriesSet = new Set();
  
  courses.forEach(course => {
    if (course.category) {
      categoriesSet.add(course.category);
    }
  });
  
  return Array.from(categoriesSet).sort();
};
