const express = require('express');
const { registerUser, loginUser, sendPasswordResetEmail } = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);

// Ruta protegida
router.post('/password-reset', isAuthenticated, sendPasswordResetEmail);

module.exports = router;
