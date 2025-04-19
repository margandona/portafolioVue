const express = require('express');
const {
  listCourses,
  listAvailableCourses,
  listEnrolledCourses,
  enrollInCourse,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const {
  isAuthenticated,
  isStudent,
  isTeacher,
  isAdmin,
  hasCourseAccess,
} = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/courses/available
 * @desc Obtener lista de cursos disponibles para inscripción
 * @access Privado (solo estudiantes)
 */
router.get('/available', isAuthenticated, isStudent, listAvailableCourses);

/**
 * @route GET /api/courses/enrolled
 * @desc Obtener lista de cursos inscritos por el usuario
 * @access Privado (solo estudiantes)
 */
router.get('/enrolled', isAuthenticated, isStudent, listEnrolledCourses);

/**
 * @route POST /api/courses/enroll/:id
 * @desc Inscribir al usuario autenticado en un curso específico
 * @access Privado (solo estudiantes)
 */
router.post('/enroll/:id', isAuthenticated, isStudent, enrollInCourse);

/**
 * @route GET /api/courses/:id
 * @desc Obtener detalles de un curso por ID
 * @access Privado (según permisos del usuario)
 */
router.get('/:id', isAuthenticated, hasCourseAccess, getCourseById);

/**
 * @route GET /api/courses
 * @desc Obtener lista de cursos según el rol del usuario
 * @access Privado (todos los usuarios autenticados)
 */
router.get('/', isAuthenticated, listCourses);

/**
 * @route POST /api/courses
 * @desc Crear un nuevo curso
 * @access Privado (solo profesores o administradores)
 */
router.post('/', isAuthenticated, isTeacher, createCourse);

/**
 * @route PUT /api/courses/:id
 * @desc Actualizar un curso existente
 * @access Privado (solo el creador del curso o administrador)
 */
router.put('/:id', isAuthenticated, hasCourseAccess, updateCourse);

/**
 * @route DELETE /api/courses/:id
 * @desc Eliminar un curso existente
 * @access Privado (solo el creador del curso o administrador)
 */
router.delete('/:id', isAuthenticated, hasCourseAccess, deleteCourse);

module.exports = router;
