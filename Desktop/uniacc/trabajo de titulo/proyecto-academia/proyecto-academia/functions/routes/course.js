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
  initiatePurchase,
  applyCourseDiscount,     // Nueva función
  removeCourseDiscount,    // Nueva función
  assignFreeCourseAccess   // Nueva función
} = require('../controllers/courseController');
const { 
  isAuthenticated, 
  isTeacher,
  isStudent,
  hasCourseAccess,
  verifyToken,
  checkRole
} = require('../middlewares/authMiddleware');
const admin = require('../config/firebase');
const db = admin.firestore(); // Add this line to define the db reference
const CourseModel = require('../models/courseModel'); // Add this line to import CourseModel

const router = express.Router();

// Listar todos los cursos según el rol del usuario
router.get('/', listCourses); // Changed from getAllCourses to listCourses

// Obtener cursos disponibles para inscripción
router.get('/available', isAuthenticated, isStudent, listAvailableCourses);

// Obtener cursos en los que el estudiante está inscrito
router.get('/enrolled', isAuthenticated, isStudent, listEnrolledCourses);

// Inscribir al usuario en un curso
router.post('/enroll/:id', isAuthenticated, isStudent, enrollInCourse);

// Obtener un curso por ID
router.get('/:id', isAuthenticated, hasCourseAccess, getCourseById);

// Crear un nuevo curso
router.post('/', verifyToken, checkRole(['admin', 'teacher']), createCourse);

// Actualizar un curso existente
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.uid;
    const userRole = req.user.role;
    const courseData = req.body;
    
    // Verify course exists
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    const courseInfo = courseDoc.data();
    
    // Check if user has permission to edit this course
    const isTeacher = courseInfo.teacherId === userId || courseInfo.instructor_id === userId;
    const isAdmin = userRole === 'admin';
    
    if (!isTeacher && !isAdmin) {
      return res.status(403).json({
        message: "No tienes permiso para modificar este curso"
      });
    }
    
    // Now update the course
    const updatedCourse = await CourseModel.update(courseId, courseData);
    
    res.status(200).json({
      message: 'Curso actualizado exitosamente',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Error al actualizar el curso:', error);
    res.status(400).json({ 
      message: 'Error al actualizar el curso', 
      details: error.message 
    });
  }
});

// Eliminar un curso
router.delete('/:id', isAuthenticated, hasCourseAccess, deleteCourse);

// Iniciar proceso de compra de un curso
router.post('/:id/purchase', verifyToken, checkRole(['student']), initiatePurchase);

// Aplicar descuento a un curso
router.post('/:id/discount', verifyToken, checkRole(['admin', 'teacher']), applyCourseDiscount);

// Eliminar descuento de un curso
router.delete('/:id/discount', verifyToken, checkRole(['admin', 'teacher']), removeCourseDiscount);

// Asignar acceso gratuito a un curso de pago
router.post('/:id/assign-free-access', verifyToken, checkRole(['admin', 'teacher']), assignFreeCourseAccess);

module.exports = router;
