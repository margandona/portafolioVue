const EvaluationModel = require('../models/evaluationModel');
const CourseModel = require('../models/courseModel');

// Crear una nueva evaluación
const createEvaluation = async (req, res) => {
  try {
    const { title, description, questions, courseId } = req.body;

    if (!title || !Array.isArray(questions) || !questions.length || !courseId) {
      return res.status(400).json({ 
        message: 'Datos incompletos. Se requiere título, preguntas y ID del curso.' 
      });
    }

    // Verificar que el curso existe
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'El curso no existe' });
    }

    // Verificar permiso (solo el profesor del curso o admin pueden crear evaluaciones)
    if (req.user.role !== 'admin' && req.user.uid !== course.teacherId) {
      return res.status(403).json({
        message: 'No tienes permiso para crear evaluaciones en este curso'
      });
    }

    // Crear la evaluación
    const evaluation = await EvaluationModel.create({
      title,
      description: description || '',
      questions,
      courseId
    });

    res.status(201).json({
      message: 'Evaluación creada exitosamente',
      evaluation
    });
  } catch (error) {
    console.error('Error al crear evaluación:', error);
    res.status(500).json({ message: 'Error al crear evaluación', details: error.message });
  }
};

// Obtener evaluaciones por curso
const getEvaluationsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Verificar que el curso existe
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'El curso no existe' });
    }

    const evaluations = await EvaluationModel.findByCourseId(courseId);
    
    // Para estudiantes, filtrar información sensible (respuestas correctas)
    if (req.user.role === 'student') {
      evaluations.forEach(evaluation => {
        if (evaluation.questions) {
          evaluation.questions = evaluation.questions.map(q => {
            const { correctAnswer, ...rest } = q;
            return rest;
          });
        }
      });
    }

    res.status(200).json(evaluations);
  } catch (error) {
    console.error('Error al obtener evaluaciones por curso:', error);
    res.status(500).json({ message: 'Error al obtener evaluaciones', details: error.message });
  }
};

// Obtener una evaluación por ID
const getEvaluationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evaluation = await EvaluationModel.findById(id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }
    
    // Verificar que el usuario tenga acceso al curso asociado
    const course = await CourseModel.findById(evaluation.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'El curso asociado no existe' });
    }
    
    // Solo admin y profesor del curso ven las respuestas correctas
    if (req.user.role === 'student') {
      if (evaluation.questions) {
        evaluation.questions = evaluation.questions.map(q => {
          const { correctAnswer, ...rest } = q;
          return rest;
        });
      }
    }
    
    res.status(200).json(evaluation);
  } catch (error) {
    console.error('Error al obtener evaluación:', error);
    res.status(500).json({ message: 'Error al obtener evaluación', details: error.message });
  }
};

// Actualizar una evaluación
const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions } = req.body;
    
    const evaluation = await EvaluationModel.findById(id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }
    
    // Verificar permiso
    const hasPermission = await EvaluationModel.hasPermission(id, req.user.uid, req.user.role);
    if (!hasPermission) {
      return res.status(403).json({ message: 'No tienes permiso para editar esta evaluación' });
    }
    
    // Actualizar la evaluación
    const updatedEvaluation = await EvaluationModel.update(id, {
      title,
      description,
      questions
    });
    
    res.status(200).json({
      message: 'Evaluación actualizada correctamente',
      evaluation: updatedEvaluation
    });
  } catch (error) {
    console.error('Error al actualizar evaluación:', error);
    res.status(500).json({ message: 'Error al actualizar evaluación', details: error.message });
  }
};

// Eliminar una evaluación
const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evaluation = await EvaluationModel.findById(id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }
    
    // Verificar permiso
    const hasPermission = await EvaluationModel.hasPermission(id, req.user.uid, req.user.role);
    if (!hasPermission) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta evaluación' });
    }
    
    await EvaluationModel.delete(id);
    
    res.status(200).json({ message: 'Evaluación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar evaluación:', error);
    res.status(500).json({ message: 'Error al eliminar evaluación', details: error.message });
  }
};

module.exports = {
  createEvaluation,
  getEvaluationsByCourse,
  getEvaluationById,
  updateEvaluation,
  deleteEvaluation
};
