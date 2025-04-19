const express = require('express');
const router = express.Router();
const { checkFirebaseConnection } = require('../controllers/firebaseController');

/**
 * @route GET /api/health
 * @desc Verificar el estado del servidor
 * @access Público
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route GET /api/health/firebase
 * @desc Verificar la conexión con Firebase
 * @access Público
 */
router.get('/firebase', checkFirebaseConnection);

module.exports = router;
