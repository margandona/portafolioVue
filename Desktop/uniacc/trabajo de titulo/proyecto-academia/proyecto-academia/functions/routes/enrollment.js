const express = require('express');
const { 
  enrollInCourse, 
  getEnrollments, 
  updateProgress,
  updateGrade,
  updateStatus, 
  deleteEnrollment, 
  getStudentByIdOrEmail,
  getCourseEnrollmentStats  // Nueva función
} = require('../controllers/enrollmentController');
const { 
  verifyToken,
  checkRole,
  hasCourseAccess 
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Inscribir a un usuario en un curso
router.post('/', verifyToken, enrollInCourse);

// Obtener todas las inscripciones (filtradas según el rol)
router.get('/', verifyToken, getEnrollments);

// Buscar estudiantes por ID o email (solo admin)
router.get('/students', verifyToken, checkRole(['admin']), getStudentByIdOrEmail);

// Obtener estadísticas de inscripciones para un curso
router.get('/stats/:courseId', verifyToken, getCourseEnrollmentStats);

// Actualizar el progreso de una inscripción
router.patch('/:enrollmentId/progress', verifyToken, updateProgress);

// Actualizar la calificación de una inscripción (solo teachers y admins)
router.patch('/:enrollmentId/grade', verifyToken, checkRole(['teacher', 'admin']), updateGrade);

// Cambiar el estado de una inscripción
router.patch('/:enrollmentId/status', verifyToken, updateStatus);

// Eliminar una inscripción
router.delete('/:enrollmentId', verifyToken, deleteEnrollment);

module.exports = router;
