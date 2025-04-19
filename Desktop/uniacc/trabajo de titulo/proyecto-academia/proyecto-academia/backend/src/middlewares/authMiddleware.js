const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Course = require('../models/Course');
const Enrollment = require('../models/enrollment');
const Evaluation = require('../models/evaluation');

// Middleware para verificar si el usuario está autenticado
const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó un token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en la autenticación:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware genérico para verificar roles
const checkRole = (roles) => (req, res, next) => {
  if (roles.includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: `Acceso denegado. Rol requerido: ${roles.join(', ')}.` });
};

// Middleware específicos para roles
const isStudent = checkRole(['student']);
const isTeacher = checkRole(['teacher', 'admin']);
const isAdmin = checkRole(['admin']);

// Middleware para verificar acceso a un curso específico
const hasCourseAccess = async (req, res, next) => {
  const courseId = req.params.courseId || req.params.id;

  if (!Number.isInteger(parseInt(courseId))) {
    return res.status(400).json({ message: 'El ID del curso debe ser un número válido.' });
  }

  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    // Acceso completo para admins
    if (req.user.role === 'admin') {
      return next();
    }

    // Acceso para el profesor propietario del curso
    if (req.user.role === 'teacher' && course.teacher_id === req.user.id) {
      return next();
    }

    // Acceso para estudiantes inscritos
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        where: { user_id: req.user.id, course_id: courseId },
      });

      if (enrollment) {
        return next();
      }
    }

    return res.status(403).json({
      message: 'No tienes acceso a este curso. Verifica si estás inscrito o tienes permisos.',
    });
  } catch (error) {
    console.error('Error en hasCourseAccess:', error);
    return res.status(500).json({ message: 'Error al verificar acceso al curso.', details: error.message });
  }
};

// Middleware para verificar acceso a evaluaciones
const hasEvaluationAccess = async (req, res, next) => {
  const evaluationId = req.params.evaluationId || req.params.id;

  if (!Number.isInteger(parseInt(evaluationId))) {
    return res.status(400).json({ message: 'El ID de la evaluación debe ser un número válido.' });
  }

  try {
    const evaluation = await Evaluation.findByPk(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluación no encontrada.' });
    }

    // Validar que la evaluación esté relacionada con el curso
    const course = await Course.findByPk(evaluation.course_id);
    if (!course) {
      return res.status(404).json({ message: 'El curso relacionado con esta evaluación no existe.' });
    }

    // Verificar acceso al curso relacionado
    req.params.courseId = evaluation.course_id; // Asignar el ID del curso para el siguiente middleware
    return hasCourseAccess(req, res, next);
  } catch (error) {
    console.error('Error en hasEvaluationAccess:', error);
    return res.status(500).json({
      message: 'Error al verificar acceso a la evaluación.',
      details: error.message,
    });
  }
};

module.exports = { isAuthenticated, isStudent, isTeacher, isAdmin, hasCourseAccess, hasEvaluationAccess };
