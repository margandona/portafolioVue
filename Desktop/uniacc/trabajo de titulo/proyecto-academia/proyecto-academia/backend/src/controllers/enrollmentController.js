const Enrollment = require('../models/enrollment');
const Course = require('../models/Course');
const User = require('../models/user');
const Evaluation = require('../models/evaluation');

// Inscribir al usuario en un curso
const enrollInCourse = async (req, res) => {
  const { course_id, user_id } = req.body;

  if (!course_id || isNaN(course_id)) {
    return res.status(400).json({ message: 'ID de curso inválido.' });
  }

  try {
    const course = await Course.findByPk(course_id);
    if (!course) {
      return res.status(404).json({ message: 'El curso no existe.' });
    }

    const userIdToEnroll = req.user.role === 'admin' ? user_id : req.user.id;

    if (req.user.role === 'admin' && user_id) {
      const userToEnroll = await User.findByPk(user_id);
      if (!userToEnroll) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
    }

    const existingEnrollment = await Enrollment.findOne({
      where: { user_id: userIdToEnroll, course_id },
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Ya estás inscrito en este curso.' });
    }

    const enrollment = await Enrollment.create({
      user_id: userIdToEnroll,
      course_id,
    });

    res.status(201).json({ message: 'Inscripción completada.', enrollment });
  } catch (error) {
    console.error('Error al inscribir en curso:', error);
    res.status(500).json({ message: 'Error al inscribir en curso.', details: error.message });
  }
};

// Obtener las inscripciones del usuario actual
const getEnrollments = async (req, res) => {
  try {
    let enrollments;

    if (req.user.role === 'admin') {
      enrollments = await Enrollment.findAll({
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { model: Course, attributes: ['id', 'title'] },
        ],
      });
    } else if (req.user.role === 'teacher') {
      enrollments = await Enrollment.findAll({
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          {
            model: Course,
            attributes: ['id', 'title'],
            where: { teacher_id: req.user.id },
          },
        ],
      });
    } else {
      enrollments = await Enrollment.findAll({
        where: { user_id: req.user.id },
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          { model: Course, attributes: ['id', 'title'] },
        ],
      });
    }

    if (!enrollments || enrollments.length === 0) {
      return res.status(200).json({ message: 'No se encontraron inscripciones.' });
    }

    res.status(200).json(enrollments);
  } catch (error) {
    console.error('Error al obtener inscripciones:', error);
    res.status(500).json({ message: 'Error al obtener inscripciones.', details: error.message });
  }
};

// Actualizar el progreso de un curso
const updateProgress = async (req, res) => {
  const { id } = req.params;
  const { evaluation_id } = req.body;

  if (!evaluation_id || isNaN(evaluation_id)) {
    return res.status(400).json({ message: 'ID de evaluación inválido.' });
  }

  try {
    const enrollment = await Enrollment.findByPk(id, {
      include: { model: Course, attributes: ['id', 'title'] },
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Inscripción no encontrada.' });
    }

    if (req.user.role !== 'student' || req.user.id !== enrollment.user_id) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar el progreso de este curso.' });
    }

    const evaluation = await Evaluation.findByPk(evaluation_id);
    if (!evaluation || evaluation.course_id !== enrollment.course_id) {
      return res.status(400).json({ message: 'Evaluación inválida para este curso.' });
    }

    if (enrollment.completed_evaluations.includes(evaluation_id)) {
      return res.status(400).json({ message: 'Esta evaluación ya fue completada.' });
    }

    enrollment.completed_evaluations.push(evaluation_id);

    const totalEvaluations = await Evaluation.count({
      where: { course_id: enrollment.course_id },
    });

    enrollment.progress = (enrollment.completed_evaluations.length / totalEvaluations) * 100;

    await enrollment.save();

    res.status(200).json({
      message: 'Progreso actualizado exitosamente.',
      progress: enrollment.progress,
      completed_evaluations: enrollment.completed_evaluations,
    });
  } catch (error) {
    console.error('Error al actualizar progreso:', error);
    res.status(500).json({ message: 'Error al actualizar progreso.', details: error.message });
  }
};

// Eliminar inscripción
const deleteEnrollment = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'ID de inscripción inválido.' });
  }

  try {
    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Inscripción no encontrada.' });
    }

    await enrollment.destroy();
    res.status(200).json({ message: 'Inscripción eliminada con éxito.' });
  } catch (error) {
    console.error('Error al eliminar inscripción:', error);
    res.status(500).json({ message: 'Error al eliminar inscripción.', details: error.message });
  }
};

// Buscar estudiante por ID o correo electrónico
const getStudentByIdOrEmail = async (req, res) => {
  const { id, email } = req.query;

  if (!id && !email) {
    return res.status(400).json({ message: 'Debe proporcionar un ID o un email para buscar.' });
  }

  try {
    let student;

    if (id) {
      student = await User.findByPk(id, {
        include: [{ model: Enrollment, include: [Course] }],
      });
    } else if (email) {
      student = await User.findOne({
        where: { email },
        include: [{ model: Enrollment, include: [Course] }],
      });
    }

    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado.' });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error('Error al buscar estudiante:', error);
    res.status(500).json({ message: 'Error interno al buscar estudiante.', details: error.message });
  }
};

module.exports = {
  enrollInCourse,
  getEnrollments,
  updateProgress,
  deleteEnrollment,
  getStudentByIdOrEmail,
};
