/**
 * Utilidades para manipulación y formateo de fechas
 */

/**
 * Formatea una fecha en formato legible (dd/mm/yyyy)
 * @param {Date|string|number|Object} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  let dateObj;
  
  // Handle Firebase Timestamp objects
  if (date && date.seconds) {
    dateObj = new Date(date.seconds * 1000);
  } 
  // Handle string dates
  else if (typeof date === 'string') {
    dateObj = new Date(date);
  } 
  // Handle timestamps (numbers)
  else if (typeof date === 'number') {
    dateObj = new Date(date);
  }
  // Handle Date objects
  else if (date instanceof Date) {
    dateObj = date;
  }
  else {
    return 'Fecha inválida';
  }
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  // Format as dd/mm/yyyy
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formatea una fecha con hora (dd/mm/yyyy HH:MM)
 * @param {Date|string|number|Object} date - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  let dateObj;
  
  // Handle Firebase Timestamp objects
  if (date && date.seconds) {
    dateObj = new Date(date.seconds * 1000);
  } 
  // Handle string dates
  else if (typeof date === 'string') {
    dateObj = new Date(date);
  } 
  // Handle timestamps (numbers)
  else if (typeof date === 'number') {
    dateObj = new Date(date);
  }
  // Handle Date objects
  else if (date instanceof Date) {
    dateObj = date;
  }
  else {
    return 'Fecha inválida';
  }
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  // Format as dd/mm/yyyy HH:MM
  return dateObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calcula tiempo transcurrido desde una fecha en formato legible
 * @param {Date|string|number|Object} date - Fecha a analizar
 * @returns {string} Tiempo transcurrido en formato legible
 */
export const timeAgo = (date) => {
  if (!date) return '';
  
  let dateObj;
  
  // Handle Firebase Timestamp objects
  if (date && date.seconds) {
    dateObj = new Date(date.seconds * 1000);
  } 
  // Handle string dates
  else if (typeof date === 'string') {
    dateObj = new Date(date);
  } 
  // Handle timestamps (numbers)
  else if (typeof date === 'number') {
    dateObj = new Date(date);
  }
  // Handle Date objects
  else if (date instanceof Date) {
    dateObj = date;
  }
  else {
    return 'Fecha inválida';
  }
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  const seconds = Math.floor((new Date() - dateObj) / 1000);
  
  // Less than a minute
  if (seconds < 60) {
    return 'ahora mismo';
  }
  
  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }
  
  // Less than a month
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
  }
  
  // Less than a year
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
  
  // More than a year
  const years = Math.floor(months / 12);
  return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
};
