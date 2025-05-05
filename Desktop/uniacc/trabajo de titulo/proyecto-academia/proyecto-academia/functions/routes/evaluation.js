const express = require('express');
const {
  createEvaluation,
  getEvaluationsByCourse,
  getCompletedEvaluationsByUser,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation
} = require('../controllers/evaluationController');
const { 
  verifyToken,
  checkRole,
  isTeacher,
  isStudent 
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Crear una nueva evaluación (teacher, admin)
router.post('/', verifyToken, checkRole(['teacher', 'admin']), createEvaluation);

// Obtener evaluaciones por curso
router.get('/course/:courseId', verifyToken, getEvaluationsByCourse);

// Obtener una evaluación específica
router.get('/:id', verifyToken, getEvaluationById);

// Obtener evaluaciones completadas por el usuario actual
router.get('/completed', verifyToken, getCompletedEvaluationsByUser);

// Obtener evaluaciones completadas por un usuario específico (admin)
router.get('/completed/:userId', verifyToken, checkRole(['admin']), getCompletedEvaluationsByUser);

// Actualizar una evaluación existente
router.patch('/:id', verifyToken, checkRole(['teacher', 'admin']), updateEvaluation);

// Actualizar una evaluación existente (PUT también soportado)
router.put('/:id', verifyToken, checkRole(['teacher', 'admin']), updateEvaluation);

// Eliminar una evaluación
router.delete('/:id', verifyToken, checkRole(['teacher', 'admin']), deleteEvaluation);

module.exports = router;
