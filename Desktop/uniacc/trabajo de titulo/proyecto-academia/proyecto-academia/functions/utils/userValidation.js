/**
 * Validación de datos para usuarios
 */

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} true si el email es válido
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email);
};

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {boolean} true si la contraseña es válida
 */
const validatePassword = (password) => {
  // Al menos 6 caracteres, una letra mayúscula, un número y un carácter especial
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
  return typeof password === 'string' && passwordRegex.test(password);
};

/**
 * Valida un nombre de usuario
 * @param {string} name - Nombre a validar
 * @returns {boolean} true si el nombre es válido
 */
const validateName = (name) => {
  return typeof name === 'string' && name.trim().length >= 2;
};

/**
 * Valida un rol de usuario
 * @param {string} role - Rol a validar
 * @returns {boolean} true si el rol es válido
 */
const validateRole = (role) => {
  const validRoles = ['student', 'teacher', 'admin'];
  return validRoles.includes(role);
};

/**
 * Valida datos de usuario para creación
 * @param {Object} userData - Datos a validar
 * @returns {Object} Objeto con resultado de validación
 */
const validateUserCreation = (userData) => {
  const errors = [];
  
  if (!userData.name || !validateName(userData.name)) {
    errors.push('El nombre es obligatorio y debe tener al menos 2 caracteres.');
  }
  
  if (!userData.email || !validateEmail(userData.email)) {
    errors.push('El correo electrónico es inválido.');
  }
  
  if (!userData.password || !validatePassword(userData.password)) {
    errors.push('La contraseña debe tener al menos 6 caracteres, una letra mayúscula, un número y un carácter especial.');
  }
  
  if (userData.role && !validateRole(userData.role)) {
    errors.push('El rol especificado no es válido. Roles permitidos: student, teacher, admin.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida datos de usuario para actualización
 * @param {Object} userData - Datos a validar
 * @returns {Object} Objeto con resultado de validación
 */
const validateUserUpdate = (userData) => {
  const errors = [];
  
  if (userData.name && !validateName(userData.name)) {
    errors.push('El nombre debe tener al menos 2 caracteres.');
  }
  
  if (userData.email && !validateEmail(userData.email)) {
    errors.push('El correo electrónico es inválido.');
  }
  
  if (userData.password && !validatePassword(userData.password)) {
    errors.push('La contraseña debe tener al menos 6 caracteres, una letra mayúscula, un número y un carácter especial.');
  }
  
  if (userData.role && !validateRole(userData.role)) {
    errors.push('El rol especificado no es válido. Roles permitidos: student, teacher, admin.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateRole,
  validateUserCreation,
  validateUserUpdate
};
