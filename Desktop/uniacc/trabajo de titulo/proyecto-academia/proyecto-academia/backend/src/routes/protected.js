const express = require('express');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
  res.status(200).json({
    message: 'Ruta protegida accedida con éxito.',
    user: req.user, // Datos del usuario autenticado
  });
});

module.exports = router;
