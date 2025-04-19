const EnrollmentModel = require('../models/enrollmentModel');
const CourseModel = require('../models/courseModel');
const UserModel = require('../models/userModel');
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

    try {
      const enrollment = await EnrollmentModel.create(userIdToEnroll, courseId);
      res.status(201).json({ 
        message: 'Inscripción exitosa', 
        enrollment 
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
    let enrollments = [];
    
    // Administradores pueden ver todas las inscripciones
    if (req.user.role === 'admin') {
      enrollments = await db.collection('enrollments').get()
        .then(snapshot => {
          return Promise.all(snapshot.docs.map(async doc => {
            const enrollData = doc.data();
            const user = await UserModel.findById(enrollData.userId);
            const course = await CourseModel.findById(enrollData.courseId);
            return {
              id: doc.id,
              ...enrollData,
              user: user || { id: enrollData.userId },
              course: course || { id: enrollData.courseId }
            };
          }));
        });
    } 
    // Profesores pueden ver inscripciones a sus cursos
    else if (req.user.role === 'teacher') {
      const coursesSnapshot = await db.collection('courses')
        .where('teacherId', '==', req.user.uid)
        .get();
      
      const courseIds = coursesSnapshot.docs.map(doc => doc.id);
      
      if (courseIds.length > 0) {
        // Para cada curso, obtener inscripciones
        for (const courseId of courseIds) {
          const enrollSnapshot = await db.collection('enrollments')
            .where('courseId', '==', courseId)
            .get();
          
          for (const doc of enrollSnapshot.docs) {
            const enrollData = doc.data();
            const user = await UserModel.findById(enrollData.userId);
            const course = await CourseModel.findById(enrollData.courseId);
            
            enrollments.push({
              id: doc.id,
              ...enrollData,
              user: user || { id: enrollData.userId },
              course: course || { id: enrollData.courseId }
            });
          }
        }
      }
    } 
    // Estudiantes solo pueden ver sus propias inscripciones
    else {
      enrollments = await EnrollmentModel.findByUser(req.user.uid);
    }
    
    if (enrollments.length === 0) {
      return res.status(200).json({ 
        message: 'No se encontraron inscripciones',
        enrollments: [] 
      });
    }
    
    res.status(200).json(enrollments);
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
    
    // Verificar que la inscripción pertenece al usuario (a menos que sea admin)
    const enrollment = await db.collection('enrollments').doc(enrollmentId).get();
    
    if (!enrollment.exists) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }
    
    const enrollmentData = enrollment.data();
    
    // Solo el usuario inscrito o un admin pueden actualizar el progreso
    if (enrollmentData.userId !== req.user.uid && req.user.role !== 'admin') {
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
    
    // Incluir información de cursos para cada inscripción
    const enrollmentsWithCourses = await Promise.all(
      enrollments.map(async enrollment => {
        const course = await CourseModel.findById(enrollment.courseId);
        return {
          ...enrollment,
          course: course || { id: enrollment.courseId }
        };
      })
    );
    
    // Eliminar información sensible
    delete userDoc.password;
    
    res.status(200).json({
      user: userDoc,
      enrollments: enrollmentsWithCourses
    });
  } catch (error) {
    console.error('Error al buscar estudiante:', error);
    res.status(500).json({ 
      message: 'Error al buscar estudiante', 
      details: error.message 
    });
  }
};

module.exports = {
  enrollInCourse,
  getEnrollments,
  updateProgress,
  deleteEnrollment,
  getStudentByIdOrEmail
};
