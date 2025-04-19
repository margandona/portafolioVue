const express = require('express');
const { submitResponse, getCompletedEvaluations } = require('../controllers/responseController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

// Enviar respuestas a una evaluación y calcular el puntaje
router.post('/submit', isAuthenticated, submitResponse);

// Obtener el historial de evaluaciones completadas y puntajes obtenidos
router.get('/history', isAuthenticated, getCompletedEvaluations);

module.exports = router;
