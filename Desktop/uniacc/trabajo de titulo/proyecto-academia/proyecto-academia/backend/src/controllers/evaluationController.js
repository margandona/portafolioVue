const Evaluation = require('../models/evaluation');
const Course = require('../models/Course');
const Enrollment = require('../models/enrollment');

// Crear una nueva evaluación
const createEvaluation = async (req, res) => {
  try {
    const { title, description, questions, course_id } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0 || !course_id) {
      return res.status(400).json({ message: 'Título, preguntas y curso son obligatorios.' });
    }

    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({ message: 'El curso asociado no existe.' });
    }

    if (req.user.role !== 'admin' && req.user.id !== course.teacher_id) {
      return res.status(403).json({
        message: 'No tienes permisos para crear evaluaciones en este curso.',
      });
    }

    const evaluation = await Evaluation.create({ title, description, questions, course_id });
    res.status(201).json({ message: 'Evaluación creada exitosamente.', data: evaluation });
  } catch (error) {
    console.error('Error al crear evaluación:', error);
    res.status(500).json({ message: 'Error al crear evaluación.', details: error.message });
  }
};

// Obtener evaluaciones por curso (según rol del usuario)
const getEvaluationsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'El curso no existe.' });
    }

    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        where: { user_id: req.user.id, course_id: courseId },
      });
      if (!enrollment) {
        return res.status(403).json({
          message: 'No tienes acceso a las evaluaciones de este curso.',
        });
      }
    } else if (req.user.role === 'teacher' && course.teacher_id !== req.user.id) {
      return res.status(403).json({
        message: 'No tienes permisos para ver las evaluaciones de este curso.',
      });
    }

    const evaluations = await Evaluation.findAll({ where: { course_id: courseId } });
    res.status(200).json({
      message: evaluations.length
        ? 'Evaluaciones obtenidas exitosamente.'
        : 'No hay evaluaciones para este curso.',
      data: evaluations,
    });
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error);
    res.status(500).json({ message: 'Error al obtener evaluaciones.', details: error.message });
  }
};

// Obtener evaluaciones completadas por el usuario autenticado
const getCompletedEvaluationsByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const completedEvaluations = await Enrollment.findAll({
      where: { user_id: userId },
      attributes: ['completed_evaluations'],
    });

    res.status(200).json({
      message: 'Evaluaciones completadas obtenidas exitosamente.',
      data: completedEvaluations.flatMap((enrollment) => enrollment.completed_evaluations),
    });
  } catch (error) {
    console.error('Error al obtener evaluaciones completadas:', error);
    res.status(500).json({ message: 'Error al obtener evaluaciones completadas.', details: error.message });
  }
};

// Actualizar una evaluación
const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, questions } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Título y preguntas son obligatorios.' });
    }

    const evaluation = await Evaluation.findByPk(id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada.' });
    }

    const course = await Course.findByPk(evaluation.course_id);
    if (!course || (req.user.role !== 'admin' && req.user.id !== course.teacher_id)) {
      return res.status(403).json({
        message: 'No tienes permisos para actualizar esta evaluación.',
      });
    }

    const updatedEvaluation = await evaluation.update({ title, description, questions });
    res.status(200).json({
      message: 'Evaluación actualizada exitosamente.',
      data: updatedEvaluation,
    });
  } catch (error) {
    console.error('Error al actualizar evaluación:', error);
    res.status(500).json({ message: 'Error al actualizar evaluación.', details: error.message });
  }
};

// Eliminar una evaluación
const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await Evaluation.findByPk(id);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada.' });
    }

    const course = await Course.findByPk(evaluation.course_id);
    if (!course || (req.user.role !== 'admin' && req.user.id !== course.teacher_id)) {
      return res.status(403).json({
        message: 'No tienes permisos para eliminar esta evaluación.',
      });
    }

    await evaluation.destroy();
    res.status(200).json({ message: 'Evaluación eliminada exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar evaluación:', error);
    res.status(500).json({ message: 'Error al eliminar evaluación.', details: error.message });
  }
};

module.exports = {
  createEvaluation,
  getEvaluationsByCourse,
  getCompletedEvaluationsByUser,
  updateEvaluation,
  deleteEvaluation,
};
