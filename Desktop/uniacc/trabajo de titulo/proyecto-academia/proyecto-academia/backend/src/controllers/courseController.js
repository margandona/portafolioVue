const { Op } = require('sequelize');
const Course = require('../models/Course');
const User = require('../models/user');
const Enrollment = require('../models/enrollment');

// Opciones comunes para consultas de cursos
const queryOptions = {
  include: [
    {
      model: User,
      as: 'teacher',
      attributes: ['id', 'name', 'email'],
    },
  ],
};

// Listar todos los cursos
const listCourses = async (req, res) => {
  try {
    const options = { ...queryOptions };

    if (req.user.role === 'teacher') {
      options.where = { teacher_id: req.user.id };
    } else if (req.user.role === 'student') {
      const enrolledCourses = await Enrollment.findAll({
        where: { user_id: req.user.id },
        attributes: ['course_id'],
      });
      const enrolledIds = enrolledCourses.map((e) => e.course_id);
      options.where = { id: enrolledIds };
    }

    const courses = await Course.findAll(options);

    if (!courses.length) {
      return res.status(200).json({ message: 'No hay cursos disponibles.' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error al listar cursos:', error);
    res.status(500).json({ message: 'Error al listar cursos.', details: error.message });
  }
};

// Listar cursos disponibles para inscripción
const listAvailableCourses = async (req, res) => {
  try {
    const enrolledCourses = await Enrollment.findAll({
      where: { user_id: req.user.id },
      attributes: ['course_id'],
    });

    const enrolledIds = enrolledCourses.map((e) => e.course_id);

    const availableCourses = await Course.findAll({
      where: {
        id: { [Op.notIn]: enrolledIds },
      },
      ...queryOptions,
    });

    if (!availableCourses.length) {
      return res.status(200).json({ message: 'No hay cursos disponibles para inscripción.' });
    }

    res.status(200).json(availableCourses);
  } catch (error) {
    console.error('Error al listar cursos disponibles:', error);
    res.status(500).json({ message: 'Error al listar cursos disponibles.', details: error.message });
  }
};

// Listar cursos inscritos
const listEnrolledCourses = async (req, res) => {
  try {
    const enrolledCourses = await Enrollment.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Course,
          ...queryOptions,
        },
      ],
    });

    if (!enrolledCourses.length) {
      return res.status(200).json({ message: 'No estás inscrito en ningún curso.' });
    }

    res.status(200).json(enrolledCourses);
  } catch (error) {
    console.error('Error al listar cursos inscritos:', error);
    res.status(500).json({ message: 'Error al listar cursos inscritos.', details: error.message });
  }
};

// Inscribir al usuario en un curso
const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ message: 'El curso no existe.' });
    }

    const existingEnrollment = await Enrollment.findOne({
      where: { user_id: req.user.id, course_id: courseId },
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Ya estás inscrito en este curso.' });
    }

    await Enrollment.create({ user_id: req.user.id, course_id: courseId });
    res.status(201).json({ message: 'Inscripción exitosa en el curso.' });
  } catch (error) {
    console.error('Error al inscribirse en el curso:', error);
    res.status(500).json({ message: 'Error al inscribirse en el curso.', details: error.message });
  }
};

// Obtener un curso por ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, queryOptions);

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    res.status(200).json(course);
  } catch (error) {
    console.error('Error al obtener curso:', error);
    res.status(500).json({ message: 'Error al obtener curso.', details: error.message });
  }
};

// Crear un curso
const createCourse = async (req, res) => {
  try {
    const { title, description, category, modality, duration_days, start_date, end_date } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      modality,
      duration_days,
      start_date,
      end_date,
      teacher_id: req.user.id,
    });

    res.status(201).json({ message: 'Curso creado exitosamente.', course });
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({ message: 'Error al crear curso.', details: error.message });
  }
};

// Actualizar un curso
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    if (course.teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para actualizar este curso.' });
    }

    const updatedCourse = await course.update(req.body);
    res.status(200).json({ message: 'Curso actualizado exitosamente.', course: updatedCourse });
  } catch (error) {
    console.error('Error al actualizar el curso:', error);
    res.status(500).json({ message: 'Error al actualizar el curso.', details: error.message });
  }
};

// Eliminar un curso
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    if (course.teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este curso.' });
    }

    await course.destroy();
    res.status(200).json({ message: 'Curso eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar el curso:', error);
    res.status(500).json({ message: 'Error al eliminar el curso.', details: error.message });
  }
};

module.exports = {
  listCourses,
  listAvailableCourses,
  listEnrolledCourses,
  enrollInCourse,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
