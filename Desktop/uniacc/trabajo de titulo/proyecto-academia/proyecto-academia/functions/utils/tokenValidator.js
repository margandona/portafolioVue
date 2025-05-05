const jwt = require('jsonwebtoken');

// This should be the same secret used to sign the tokens in your auth system
// Replace this with your actual secret or load it from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

/**
 * Validates a custom JWT token
 * @param {string} token - The JWT token to validate
 * @returns {Promise<object>} The decoded token payload
 */
const validateCustomJwt = async (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

/**
 * Examines a token to determine if it's a custom JWT or Firebase token
 * @param {string} token - The token to examine
 * @returns {boolean} True if it appears to be a custom token
 */
const isCustomJwtToken = (token) => {
  try {
    // Decode (without verification) to check the token structure
    const decoded = jwt.decode(token);
    
    // Custom tokens typically have these properties but lack Firebase-specific ones
    if (decoded && 
        decoded.role && 
        decoded.email && 
        !decoded.firebase && 
        !decoded.kid) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

module.exports = {
  validateCustomJwt,
  isCustomJwtToken
};
