const express = require('express');
const {
  createEvaluation,
  getEvaluationsByCourse,
  getCompletedEvaluationsByUser,
  updateEvaluation,
  deleteEvaluation,
} = require('../controllers/evaluationController');
const {
  isAuthenticated,
  isTeacher,
  isAdmin,
  hasCourseAccess,
  hasEvaluationAccess,
} = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Middleware para validar IDs de evaluación
 */
const validateEvaluationId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !Number.isInteger(Number(id))) {
    return res.status(400).json({ message: 'ID de evaluación inválido.' });
  }
  next();
};

/**
 * Middleware para validar IDs de curso
 */
const validateCourseId = (req, res, next) => {
  const { courseId } = req.params;
  if (!courseId || !Number.isInteger(Number(courseId))) {
    return res.status(400).json({ message: 'ID de curso inválido.' });
  }
  next();
};

/**
 * @route POST /api/evaluations
 * @desc Crear una nueva evaluación
 * @access Privado (solo profesores del curso o administradores)
 */
router.post('/', isAuthenticated, isTeacher, async (req, res, next) => {
  try {
    await createEvaluation(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/evaluations/course/:courseId
 * @desc Obtener evaluaciones de un curso
 * @access Privado (según el rol: estudiantes inscritos, profesores y administradores)
 */
router.get(
  '/course/:courseId',
  isAuthenticated,
  validateCourseId,
  hasCourseAccess,
  async (req, res, next) => {
    try {
      await getEvaluationsByCourse(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/evaluations/completed
 * @desc Obtener evaluaciones completadas por el usuario autenticado
 * @access Privado (solo estudiantes)
 */
router.get('/completed', isAuthenticated, async (req, res, next) => {
  try {
    await getCompletedEvaluationsByUser(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /api/evaluations/:id
 * @desc Actualizar una evaluación existente
 * @access Privado (solo profesores del curso o administradores)
 */
router.patch(
  '/:id',
  isAuthenticated,
  validateEvaluationId,
  hasEvaluationAccess,
  async (req, res, next) => {
    try {
      await updateEvaluation(req, res);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /api/evaluations/:id
 * @desc Eliminar una evaluación
 * @access Privado (solo profesores del curso o administradores)
 */
router.delete(
  '/:id',
  isAuthenticated,
  validateEvaluationId,
  hasEvaluationAccess,
  async (req, res, next) => {
    try {
      await deleteEvaluation(req, res);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
