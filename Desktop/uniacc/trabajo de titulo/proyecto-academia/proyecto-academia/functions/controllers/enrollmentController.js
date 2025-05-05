const EnrollmentModel = require('../models/enrollmentModel');
const CourseModel = require('../models/courseModel');
const UserModel = require('../models/userModel');
const EvaluationModel = require('../models/evaluationModel');
const admin = require('../config/firebase');
const db = admin.firestore();

/**
 * Inscribir a un usuario en un curso
 */
const enrollInCourse = async (req, res) => {
  try {
    const { courseId, userId } = req.body;
    const userIdToEnroll = userId || req.user.uid; // Si se proporciona un ID de usuario, úsalo, sino usa el del usuario autenticado
    
    // Si es un admin quien intenta inscribir a alguien, permite diferentes userIds
    if (userId && userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permiso para inscribir a otros usuarios' 
      });
    }

    // Verificar si el usuario puede inscribirse
    try {
      const enrollmentCheck = await EnrollmentModel.canEnroll(userIdToEnroll, courseId);
      
      if (!enrollmentCheck.canEnroll) {
        return res.status(400).json({ 
          message: enrollmentCheck.message,
          reason: enrollmentCheck.reason,
          coursePrice: enrollmentCheck.coursePrice
        });
      }
      
      // Opciones para la inscripción según el tipo
      const options = {};
      
      if (enrollmentCheck.enrollmentType === 'paid' || 
          enrollmentCheck.enrollmentType === 'assigned') {
        options.saleId = enrollmentCheck.saleId;
      }
      
      if (enrollmentCheck.enrollmentType === 'free' || 
          enrollmentCheck.enrollmentType === 'assigned') {
        options.bypassPaymentCheck = true;
      }
      
      // Crear la inscripción
      const enrollment = await EnrollmentModel.create(userIdToEnroll, courseId, options);
      
      res.status(201).json({ 
        message: 'Inscripción exitosa', 
        enrollment,
        enrollmentType: enrollmentCheck.enrollmentType
      });
    } catch (error) {
      // Manejar errores específicos del modelo
      if (error.message.includes('ya está inscrito')) {
        return res.status(400).json({ message: error.message });
      }
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error al inscribir en curso:', error);
    res.status(500).json({ 
      message: 'Error al realizar la inscripción', 
      details: error.message 
    });
  }
};

/**
 * Obtener inscripciones según el rol del usuario
 */
const getEnrollments = async (req, res) => {
  try {
    const { status, courseId, includeRelations } = req.query;
    let filters = {};
    
    // Aplicar filtros según el query
    if (status) filters.status = status;
    if (courseId) filters.courseId = courseId;
    if (includeRelations === 'true') filters.includeRelations = true;
    
    // Administradores pueden ver todas las inscripciones
    if (req.user.role === 'admin') {
      const enrollments = await EnrollmentModel.findAll(filters, 100);
      return res.status(200).json(enrollments);
    } 
    
    // Profesores pueden ver inscripciones a sus cursos
    else if (req.user.role === 'teacher') {
      // Obtener los cursos del profesor
      const coursesSnapshot = await db.collection('courses')
        .where('instructorId', '==', req.user.uid)
        .get();
      
      const courseIds = coursesSnapshot.docs.map(doc => doc.id);
      
      if (courseIds.length === 0) {
        return res.status(200).json({ 
          message: 'No se encontraron cursos para este profesor',
          enrollments: [] 
        });
      }
      
      // Para cada curso, obtener las inscripciones
      let allEnrollments = [];
      for (const courseId of courseIds) {
        const enrollments = await EnrollmentModel.findByCourse(courseId);
        allEnrollments = [...allEnrollments, ...enrollments];
      }
      
      return res.status(200).json(allEnrollments);
    } 
    
    // Estudiantes solo pueden ver sus propias inscripciones
    else {
      filters.userId = req.user.uid;
      const enrollments = await EnrollmentModel.findAll(filters, 100);
      return res.status(200).json(enrollments);
    }
  } catch (error) {
    console.error('Error al obtener inscripciones:', error);
    res.status(500).json({ 
      message: 'Error al obtener inscripciones', 
      details: error.message 
    });
  }
};

/**
 * Actualizar el progreso de una inscripción
 */
const updateProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress, completedEvaluations } = req.body;
    
    if (progress === undefined && completedEvaluations === undefined) {
      return res.status(400).json({ 
        message: 'Debe proporcionar progress y/o completedEvaluations' 
      });
    }
    
    // Verificar que la inscripción existe
    const enrollment = await db.collection('enrollments').doc(enrollmentId).get();
    
    if (!enrollment.exists) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }
    
    const enrollmentData = enrollment.data();
    
    // Verificar permiso para actualizar
    const isOwnEnrollment = enrollmentData.userId === req.user.uid;
    const isTeacherOfCourse = req.user.role === 'teacher' && await isTeacherForCourse(req.user.uid, enrollmentData.courseId);
    
    if (!isOwnEnrollment && !isTeacherOfCourse && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permiso para actualizar esta inscripción' 
      });
    }
    
    // Actualizar el progreso
    const updatedEnrollment = await EnrollmentModel.updateProgress(
      enrollmentId, 
      progress, 
      completedEvaluations
    );
    
    res.status(200).json({ 
      message: 'Progreso actualizado correctamente', 
      enrollment: updatedEnrollment 
    });
  } catch (error) {
    console.error('Error al actualizar progreso:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el progreso', 
      details: error.message 
    });
  }
};

/**
 * Actualizar la calificación de una inscripción
 */
const updateGrade = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { grade, certificateIssued } = req.body;
    
    if (grade === undefined && certificateIssued === undefined) {
      return res.status(400).json({ 
        message: 'Debe proporcionar grade y/o certificateIssued' 
      });
    }
    
    // Verificar que la inscripción existe
    const enrollment = await db.collection('enrollments').doc(enrollmentId).get();
    
    if (!enrollment.exists) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }
    
    const enrollmentData = enrollment.data();
    
    // Solo profesores del curso o administradores pueden actualizar calificaciones
    const isTeacherOfCourse = req.user.role === 'teacher' && await isTeacherForCourse(req.user.uid, enrollmentData.courseId);
    
    if (!isTeacherOfCourse && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permiso para actualizar la calificación de esta inscripción' 
      });
    }
    
    // Actualizar la calificación
    const updatedEnrollment = await EnrollmentModel.updateGrade(
      enrollmentId, 
      grade, 
      certificateIssued
    );
    
    res.status(200).json({ 
      message: 'Calificación actualizada correctamente', 
      enrollment: updatedEnrollment 
    });
  } catch (error) {
    console.error('Error al actualizar calificación:', error);
    res.status(500).json({ 
      message: 'Error al actualizar la calificación', 
      details: error.message 
    });
  }
};

/**
 * Cambiar el estado de una inscripción
 */
const updateStatus = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'El estado es obligatorio' });
    }
    
    // Verificar que la inscripción existe
    const enrollment = await db.collection('enrollments').doc(enrollmentId).get();
    
    if (!enrollment.exists) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }
    
    const enrollmentData = enrollment.data();
    
    // Verificar permiso para actualizar
    const isOwnEnrollment = enrollmentData.userId === req.user.uid;
    const isTeacherOfCourse = req.user.role === 'teacher' && await isTeacherForCourse(req.user.uid, enrollmentData.courseId);
    
    // El estudiante solo puede abandonar (dropped), no completar
    if (isOwnEnrollment && status !== 'dropped' && req.user.role === 'student') {
      return res.status(403).json({ 
        message: 'Como estudiante, solo puedes cambiar el estado a "dropped" (abandonado)' 
      });
    }
    
    // Solo profesores del curso o administradores pueden marcar como completado
    if (status === 'completed' && !isTeacherOfCourse && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Solo profesores o administradores pueden marcar como completado' 
      });
    }
    
    // Si no es el propio usuario, ni profesor del curso, ni admin, no puede cambiar el estado
    if (!isOwnEnrollment && !isTeacherOfCourse && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permiso para cambiar el estado de esta inscripción' 
      });
    }
    
    // Actualizar el estado
    const updatedEnrollment = await EnrollmentModel.updateStatus(
      enrollmentId, 
      status, 
      notes
    );
    
    res.status(200).json({ 
      message: 'Estado actualizado correctamente', 
      enrollment: updatedEnrollment 
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el estado', 
      details: error.message 
    });
  }
};

/**
 * Eliminar una inscripción
 */
const deleteEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    
    // Verificar que la inscripción existe
    const enrollment = await db.collection('enrollments').doc(enrollmentId).get();
    
    if (!enrollment.exists) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }
    
    const enrollmentData = enrollment.data();
    
    // Solo el usuario inscrito o un admin pueden eliminar la inscripción
    if (enrollmentData.userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permiso para eliminar esta inscripción' 
      });
    }
    
    // Eliminar la inscripción
    await EnrollmentModel.delete(enrollmentId);
    
    res.status(200).json({ message: 'Inscripción eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar inscripción:', error);
    res.status(500).json({ 
      message: 'Error al eliminar la inscripción', 
      details: error.message 
    });
  }
};

/**
 * Buscar estudiante por ID o email
 * (Solo para administradores)
 */
const getStudentByIdOrEmail = async (req, res) => {
  try {
    const { id, email } = req.query;
    
    if (!id && !email) {
      return res.status(400).json({ 
        message: 'Debe proporcionar un ID o email para la búsqueda' 
      });
    }
    
    let userDoc;
    
    if (id) {
      userDoc = await UserModel.findById(id);
    } else if (email) {
      userDoc = await UserModel.findByEmail(email);
    }
    
    if (!userDoc) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    
    // Obtener inscripciones del estudiante
    const enrollments = await EnrollmentModel.findByUser(userDoc.id);
    
    res.status(200).json({
      user: userDoc,
      enrollments
    });
  } catch (error) {
    console.error('Error al buscar estudiante:', error);
    res.status(500).json({ 
      message: 'Error al buscar estudiante', 
      details: error.message 
    });
  }
};

/**
 * Obtener estadísticas de inscripciones para un curso
 */
const getCourseEnrollmentStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Verificar que el curso existe
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Verificar permisos (solo profesores del curso o administradores)
    const courseData = courseDoc.data();
    const isTeacher = courseData.teacherId === req.user.uid || 
                     courseData.instructor_id === req.user.uid;
    const isAdmin = req.user.role === 'admin';
    
    if (!isTeacher && !isAdmin) {
      return res.status(403).json({ 
        message: 'No tienes permiso para ver estadísticas de este curso' 
      });
    }
    
    // Obtener estadísticas
    const stats = await EnrollmentModel.getCourseEnrollmentStats(courseId);
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de inscripciones:', error);
    res.status(500).json({ 
      message: 'Error al obtener estadísticas', 
      details: error.message 
    });
  }
};

/**
 * Función auxiliar para verificar si un usuario es profesor de un curso
 */
async function isTeacherForCourse(userId, courseId) {
  try {
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) return false;
    
    const courseData = courseDoc.data();
    return courseData.instructorId === userId || courseData.teacherId === userId;
  } catch (error) {
    console.error('Error al verificar profesor de curso:', error);
    return false;
  }
}

module.exports = {
  enrollInCourse,
  getEnrollments,
  updateProgress,
  updateGrade,
  updateStatus,
  deleteEnrollment,
  getStudentByIdOrEmail,
  getCourseEnrollmentStats  // Nueva función
};
