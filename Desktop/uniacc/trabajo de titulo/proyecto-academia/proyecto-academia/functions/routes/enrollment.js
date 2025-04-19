const express = require('express');
const { 
  enrollInCourse, 
  getEnrollments, 
  updateProgress, 
  deleteEnrollment, 
  getStudentByIdOrEmail 
} = require('../controllers/enrollmentController');
const { 
  isAuthenticated, 
  isAdmin, 
  hasCourseAccess 
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Inscribir a un usuario en un curso
router.post('/', isAuthenticated, enrollInCourse);

// Obtener todas las inscripciones (filtradas según el rol)
router.get('/', isAuthenticated, getEnrollments);

// Buscar estudiantes por ID o email (solo admin)
router.get('/students', isAuthenticated, isAdmin, getStudentByIdOrEmail);

// Actualizar el progreso de una inscripción
router.patch('/:enrollmentId', isAuthenticated, updateProgress);

// Eliminar una inscripción
router.delete('/:enrollmentId', isAuthenticated, deleteEnrollment);

module.exports = router;
