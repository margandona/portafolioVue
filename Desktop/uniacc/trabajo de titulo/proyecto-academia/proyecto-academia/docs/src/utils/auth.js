/**
 * Authentication utility functions
 */

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Get the current user from the token
 * @returns {object|null} User object or null if not authenticated
 */
export const getCurrentUser = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    // JWT tokens are formatted as: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing authentication token:', error);
    return null;
  }
};

/**
 * Get the user's role
 * @returns {string|null} The user's role or null if not authenticated
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

/**
 * Check if the user has a specific role
 * @param {string|array} roles - Role(s) to check
 * @returns {boolean} True if the user has one of the specified roles
 */
export const hasRole = (roles) => {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  
  return userRole === roles;
};

/**
 * Check if token is expired
 * @returns {boolean} True if the token is expired or invalid
 */
export const isTokenExpired = () => {
  const user = getCurrentUser();
  if (!user || !user.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  return user.exp * 1000 < Date.now();
};

/**
 * Remove authentication data and log out the user
 */
export const logout = () => {
  localStorage.removeItem('token');
  // You might want to also clear other user data from localStorage
};

/**
 * Set the authentication token
 * @param {string} token - The JWT token to store
 */
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Check if token needs refresh (will expire soon)
 * @param {number} thresholdMinutes - Minutes threshold before expiration (default: 10)
 * @returns {boolean} True if token will expire soon
 */
export const needsRefresh = (thresholdMinutes = 10) => {
  const user = getCurrentUser();
  if (!user || !user.exp) return true;
  
  const expiryTime = user.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const thresholdMs = thresholdMinutes * 60 * 1000;
  
  return expiryTime - currentTime < thresholdMs;
};
