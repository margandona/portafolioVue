const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendPasswordResetEmail } = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Rutas de autenticación con manejo de errores mejorado
router.post('/register', async (req, res) => {
  try {
    await registerUser(req, res);
  } catch (error) {
    console.error("Error en ruta de registro:", error);
    res.status(500).json({
      message: 'Error en el proceso de registro',
      details: error.message
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    await loginUser(req, res);
  } catch (error) {
    console.error("Error en ruta de login:", error);
    res.status(500).json({
      message: 'Error en el proceso de login',
      details: error.message
    });
  }
});

router.post('/password-reset', isAuthenticated, async (req, res) => {
  try {
    await sendPasswordResetEmail(req, res);
  } catch (error) {
    console.error("Error en ruta de reseteo de contraseña:", error);
    res.status(500).json({
      message: 'Error en el proceso de reseteo de contraseña',
      details: error.message
    });
  }
});

module.exports = router;
