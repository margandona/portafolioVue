const express = require('express');
const {
  enrollInCourse,
  getEnrollments,
  updateProgress,
  deleteEnrollment,
  getStudentByIdOrEmail,
} = require('../controllers/enrollmentController');
const {
  isAuthenticated,
  hasCourseAccess,
  isAdmin,
} = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Middleware para validar ID en las rutas
 */
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !Number.isInteger(Number(id))) {
    return res.status(400).json({ message: 'ID inválido. Debe ser un número entero.' });
  }
  next();
};

/**
 * Middleware para validar query parameters
 */
const validateQueryParams = (req, res, next) => {
  const { id, email } = req.query;
  if (!id && !email) {
    return res.status(400).json({ message: 'Debes proporcionar un ID o un email para buscar.' });
  }
  next();
};

/**
 * @route POST /api/enrollments
 * @desc Inscribir al usuario en un curso
 * @access Privado (estudiantes y administradores)
 */
router.post('/', isAuthenticated, async (req, res, next) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para inscribirte o inscribir a otros.' });
    }
    await enrollInCourse(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/enrollments
 * @desc Obtener las inscripciones del usuario actual
 * @access Privado (todos los usuarios autenticados)
 */
router.get('/', isAuthenticated, async (req, res, next) => {
  try {
    await getEnrollments(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/enrollments/students
 * @desc Obtener todos los estudiantes o buscar por ID o email
 * @access Privado (solo administradores)
 */
router.get('/students', isAuthenticated, isAdmin, validateQueryParams, async (req, res, next) => {
  try {
    await getStudentByIdOrEmail(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /api/enrollments/:id
 * @desc Actualizar el progreso de un curso
 * @access Privado (usuarios inscritos, profesores, o administradores)
 */
router.patch('/:id', isAuthenticated, validateId, hasCourseAccess, async (req, res, next) => {
  try {
    await updateProgress(req, res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/enrollments/:id
 * @desc Eliminar una inscripción de un estudiante
 * @access Privado (solo administradores)
 */
router.delete('/:id', isAuthenticated, validateId, isAdmin, async (req, res, next) => {
  try {
    await deleteEnrollment(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
