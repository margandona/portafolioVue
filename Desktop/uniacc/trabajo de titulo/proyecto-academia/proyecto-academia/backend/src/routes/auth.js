const express = require('express');
const {
  registerUser,
  loginUser,
  sendPasswordResetEmail,
} = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/authMiddleware'); // Importar middleware de autenticación
const router = express.Router();

// Rutas públicas (sin autenticación)
router.post('/register', registerUser); // Endpoint de registro
router.post('/login', loginUser); // Endpoint de inicio de sesión

// Ruta protegida (requiere autenticación)
router.post('/password-reset', isAuthenticated, sendPasswordResetEmail); // Endpoint de restablecimiento de contraseña

module.exports = router;
