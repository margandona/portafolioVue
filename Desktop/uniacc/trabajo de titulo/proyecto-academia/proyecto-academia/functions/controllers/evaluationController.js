const EvaluationModel = require('../models/evaluationModel');
const CourseModel = require('../models/courseModel');
const EnrollmentModel = require('../models/enrollmentModel');
const admin = require('../config/firebase');
const db = admin.firestore();

/**
 * Crear una nueva evaluación
 */
const createEvaluation = async (req, res) => {
  try {
    const evaluationData = req.body;
    
    // Validar campos obligatorios
    if (!evaluationData.title || !evaluationData.courseId) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        details: 'El título y el ID del curso son obligatorios'
      });
    }
    
    if (!evaluationData.questions || !Array.isArray(evaluationData.questions) || evaluationData.questions.length === 0) {
      return res.status(400).json({
        message: 'Preguntas inválidas',
        details: 'Se requiere al menos una pregunta en la evaluación'
      });
    }
    
    // Verificar que el curso existe y el usuario tiene permisos
    const course = await CourseModel.findById(evaluationData.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Verificar si el usuario es instructor del curso o admin
    const isInstructor = course.instructor_id === req.user.uid;
    const isAdmin = req.user.role === 'admin';
    
    if (!isInstructor && !isAdmin) {
      return res.status(403).json({
        message: 'Acceso denegado',
        details: 'No tienes permisos para crear evaluaciones en este curso'
      });
    }
    
    // Agregar createdBy
    evaluationData.createdBy = req.user.uid;
    
    // Crear la evaluación
    const evaluation = await EvaluationModel.create(evaluationData);
    
    res.status(201).json({
      message: 'Evaluación creada exitosamente',
      evaluation
    });
  } catch (error) {
    console.error('Error al crear evaluación:', error);
    res.status(500).json({
      message: 'Error al crear la evaluación',
      details: error.message
    });
  }
};

/**
 * Obtener evaluaciones de un curso
 */
const getEvaluationsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Verificar que el curso existe
    const course = await CourseModel.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    // Determinar acceso según rol
    const isAdmin = req.user.role === 'admin';
    const isInstructor = course.instructor_id === req.user.uid;
    const isStudent = req.user.role === 'student';
    
    // Si es estudiante, verificar si está inscrito
    let isEnrolled = false;
    if (isStudent) {
      const enrollment = await EnrollmentModel.findOne({
        user_id: req.user.uid,
        course_id: courseId
      });
      isEnrolled = !!enrollment;
    }
    
    // Solo mostrar evaluaciones publicadas a los estudiantes
    const onlyPublished = isStudent && !isAdmin && !isInstructor;
    
    // Si es estudiante y no está inscrito, denegar acceso
    if (isStudent && !isEnrolled && !isAdmin) {
      return res.status(403).json({
        message: 'Acceso denegado',
        details: 'No estás inscrito en este curso'
      });
    }
    
    // Obtener evaluaciones
    const evaluations = await EvaluationModel.findByCourse(courseId, onlyPublished);
    
    // No exponer las respuestas correctas a los estudiantes
    if (isStudent) {
      evaluations.forEach(evaluation => {
        if (evaluation.questions) {
          evaluation.questions = evaluation.questions.map(q => {
            // Omitir la respuesta correcta
            const { correctAnswer, ...question } = q;
            return question;
          });
        }
      });
    }
    
    return res.status(200).json({ 
      evaluations,
      count: evaluations.length
    });
  } catch (error) {
    console.error('Error al obtener evaluaciones del curso:', error);
    res.status(500).json({
      message: 'Error al obtener las evaluaciones',
      details: error.message
    });
  }
};

/**
 * Obtener evaluaciones completadas por el usuario
 */
const getCompletedEvaluationsByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.uid;
    
    // Solo el propio usuario o un admin pueden ver las evaluaciones completadas
    if (userId !== req.user.uid && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Acceso denegado',
        details: 'No puedes ver las evaluaciones de otro usuario'
      });
    }
    
    const completedEvaluations = await EvaluationModel.findCompletedByUser(userId);
    
    return res.status(200).json({
      evaluations: completedEvaluations,
      count: completedEvaluations.length
    });
  } catch (error) {
    console.error('Error al obtener evaluaciones completadas:', error);
    res.status(500).json({
      message: 'Error al obtener evaluaciones completadas',
      details: error.message
    });
  }
};

/**
 * Obtener una evaluación por ID
 */
const getEvaluationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evaluation = await EvaluationModel.findById(id);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }
    
    // Verificar permisos
    const course = await CourseModel.findById(evaluation.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    const isAdmin = req.user.role === 'admin';
    const isInstructor = course.instructor_id === req.user.uid;
    const isStudent = req.user.role === 'student';
    
    // Si es estudiante, verificar si está inscrito
    let isEnrolled = false;
    if (isStudent) {
      const enrollment = await EnrollmentModel.findOne({
        user_id: req.user.uid,
        course_id: evaluation.courseId
      });
      isEnrolled = !!enrollment;
    }
    
    // Verificar acceso
    if (isStudent && !isEnrolled && !isAdmin) {
      return res.status(403).json({
        message: 'Acceso denegado',
        details: 'No estás inscrito en este curso'
      });
    }
    
    // Si la evaluación no está publicada, solo instructor y admin pueden verla
    if (!evaluation.published && !isInstructor && !isAdmin) {
      return res.status(403).json({
        message: 'Acceso denegado',
        details: 'Esta evaluación no está disponible'
      });
    }
    
    // No exponer las respuestas correctas a los estudiantes
    if (isStudent) {
      evaluation.questions = evaluation.questions.map(q => {
        // Omitir la respuesta correcta
        const { correctAnswer, ...question } = q;
        return question;
      });
    }
    
    return res.status(200).json(evaluation);
  } catch (error) {
    console.error('Error al obtener evaluación:', error);
    res.status(500).json({
      message: 'Error al obtener la evaluación',
      details: error.message
    });
  }
};

/**
 * Actualizar una evaluación
 */
const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Verificar que la evaluación existe
    const evaluation = await EvaluationModel.findById(id);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }
    
    // Verificar permisos
    const course = await CourseModel.findById(evaluation.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    const isAdmin = req.user.role === 'admin';
    const isInstructor = course.instructor_id === req.user.uid;
    
    if (!isInstructor && !isAdmin) {
      return res.status(403).json({
        message: 'Acceso denegado',
        details: 'No tienes permisos para actualizar esta evaluación'
      });
    }
    
    // Actualizar la evaluación
    const updatedEvaluation = await EvaluationModel.update(id, updateData);
    
    res.status(200).json({
      message: 'Evaluación actualizada exitosamente',
      evaluation: updatedEvaluation
    });
  } catch (error) {
    console.error('Error al actualizar evaluación:', error);
    res.status(500).json({
      message: 'Error al actualizar la evaluación',
      details: error.message
    });
  }
};

/**
 * Eliminar una evaluación
 */
const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la evaluación existe
    const evaluation = await EvaluationModel.findById(id);
    
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }
    
    // Verificar permisos
    const course = await CourseModel.findById(evaluation.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    const isAdmin = req.user.role === 'admin';
    const isInstructor = course.instructor_id === req.user.uid;
    
    if (!isInstructor && !isAdmin) {
      return res.status(403).json({
        message: 'Acceso denegado',
        details: 'No tienes permisos para eliminar esta evaluación'
      });
    }
    
    // Eliminar la evaluación
    await EvaluationModel.delete(id);
    
    res.status(200).json({
      message: 'Evaluación eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar evaluación:', error);
    res.status(500).json({
      message: 'Error al eliminar la evaluación',
      details: error.message
    });
  }
};

module.exports = {
  createEvaluation,
  getEvaluationsByCourse,
  getCompletedEvaluationsByUser,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation
};
