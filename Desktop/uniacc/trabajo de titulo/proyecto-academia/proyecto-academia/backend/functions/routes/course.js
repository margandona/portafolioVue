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
  hasCourseAccess,
} = require('../middlewares/authMiddleware');

const router = express.Router();

// Rutas para cursos disponibles e inscritos
router.get('/available', isAuthenticated, isStudent, listAvailableCourses);
router.get('/enrolled', isAuthenticated, isStudent, listEnrolledCourses);
router.post('/enroll/:id', isAuthenticated, isStudent, enrollInCourse);

// Rutas CRUD básicas
router.get('/:id', isAuthenticated, hasCourseAccess, getCourseById);
router.get('/', isAuthenticated, listCourses);
router.post('/', isAuthenticated, isTeacher, createCourse);
router.put('/:id', isAuthenticated, hasCourseAccess, updateCourse);
router.delete('/:id', isAuthenticated, hasCourseAccess, deleteCourse);

module.exports = router;
