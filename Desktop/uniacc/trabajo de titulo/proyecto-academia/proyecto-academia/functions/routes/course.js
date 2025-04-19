const express = require('express');
const { 
  listCourses,
  listAvailableCourses,
  listEnrolledCourses,
  enrollInCourse,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');
const { 
  isAuthenticated, 
  isTeacher,
  isStudent,
  hasCourseAccess 
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Listar todos los cursos según el rol del usuario
router.get('/', isAuthenticated, listCourses);

// Obtener cursos disponibles para inscripción
router.get('/available', isAuthenticated, isStudent, listAvailableCourses);

// Obtener cursos en los que el estudiante está inscrito
router.get('/enrolled', isAuthenticated, isStudent, listEnrolledCourses);

// Inscribir al usuario en un curso
router.post('/enroll/:id', isAuthenticated, isStudent, enrollInCourse);

// Obtener un curso por ID
router.get('/:id', isAuthenticated, hasCourseAccess, getCourseById);

// Crear un nuevo curso
router.post('/', isAuthenticated, isTeacher, createCourse);

// Actualizar un curso existente
router.put('/:id', isAuthenticated, hasCourseAccess, updateCourse);

// Eliminar un curso
router.delete('/:id', isAuthenticated, hasCourseAccess, deleteCourse);

module.exports = router;
