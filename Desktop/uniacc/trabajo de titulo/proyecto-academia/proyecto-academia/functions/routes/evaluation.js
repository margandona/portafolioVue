const express = require('express');
const { 
  createEvaluation, 
  getEvaluationsByCourse, 
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation 
} = require('../controllers/evaluationController');
const { 
  isAuthenticated, 
  isTeacher,
  hasCourseAccess
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Crear una nueva evaluación
router.post('/', isAuthenticated, isTeacher, createEvaluation);

// Obtener evaluaciones de un curso
router.get('/course/:courseId', isAuthenticated, hasCourseAccess, getEvaluationsByCourse);

// Obtener una evaluación específica
router.get('/:id', isAuthenticated, getEvaluationById);

// Actualizar una evaluación
router.put('/:id', isAuthenticated, updateEvaluation);

// Eliminar una evaluación
router.delete('/:id', isAuthenticated, deleteEvaluation);

module.exports = router;
