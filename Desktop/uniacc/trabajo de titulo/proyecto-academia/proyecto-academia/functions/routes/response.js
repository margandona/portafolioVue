const express = require('express');
const { 
  submitResponse,
  getCompletedEvaluations 
} = require('../controllers/responseController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

// Enviar respuestas a una evaluación
router.post('/submit', isAuthenticated, submitResponse);

// Obtener historial de evaluaciones completadas por el usuario
router.get('/history', isAuthenticated, getCompletedEvaluations);

module.exports = router;
