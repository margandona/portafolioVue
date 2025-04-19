const { isDate, isInt } = require('validator');

/**
 * Valida si el ID es un número entero válido.
 * @param {any} id - El ID a validar.
 * @returns {boolean} Verdadero si es un ID válido.
 */
const validateId = (id) => {
  return isInt(String(id), { min: 1 });
};

/**
 * Valida si la fecha proporcionada es válida.
 * @param {any} date - La fecha a validar.
 * @returns {boolean} Verdadero si es una fecha válida.
 */
const validateDate = (date) => {
  return isDate(String(date));
};

/**
 * Valida si un objeto tiene las claves requeridas.
 * @param {object} obj - El objeto a validar.
 * @param {string[]} keys - Las claves requeridas.
 * @returns {boolean} Verdadero si todas las claves están presentes.
 */
const validateRequiredKeys = (obj, keys) => {
  return keys.every((key) => obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null);
};

/**
 * Valida si una estructura es un array no vacío.
 * @param {any} array - La estructura a validar.
 * @returns {boolean} Verdadero si es un array no vacío.
 */
const validateNonEmptyArray = (array) => {
  return Array.isArray(array) && array.length > 0;
};

/**
 * Valida si un número está dentro de un rango específico.
 * @param {number} number - El número a validar.
 * @param {number} min - Valor mínimo.
 * @param {number} max - Valor máximo.
 * @returns {boolean} Verdadero si el número está dentro del rango.
 */
const validateRange = (number, min, max) => {
  return isInt(String(number), { min, max });
};

module.exports = {
  validateId,
  validateDate,
  validateRequiredKeys,
  validateNonEmptyArray,
  validateRange,
};
