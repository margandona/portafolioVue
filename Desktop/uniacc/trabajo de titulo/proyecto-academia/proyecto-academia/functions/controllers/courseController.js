const CourseModel = require('../models/courseModel');
const EnrollmentModel = require('../models/enrollmentModel');

// Listar todos los cursos según el rol del usuario
const listCourses = async (req, res) => {
  try {
    let courses;

    // Filtrar por profesor si el usuario es un profesor
    if (req.user.role === 'teacher') {
      courses = await CourseModel.findByTeacher(req.user.uid);
    }
    // Para estudiantes, obtener solo los cursos en los que están inscritos
    else if (req.user.role === 'student') {
      courses = await CourseModel.findEnrolledByStudent(req.user.uid);
    }
    // Para administradores, obtener todos los cursos
    else {
      courses = await CourseModel.findAll();
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error al listar cursos:', error);
    res.status(500).json({ message: 'Error al obtener los cursos', details: error.message });
  }
};

// Listar cursos disponibles para inscripción
const listAvailableCourses = async (req, res) => {
  try {
    const availableCourses = await CourseModel.findAvailableForStudent(req.user.uid);
    res.status(200).json(availableCourses);
  } catch (error) {
    console.error('Error al listar cursos disponibles:', error);
    res.status(500).json({ message: 'Error al obtener los cursos disponibles', details: error.message });
  }
};

// Listar cursos inscritos
const listEnrolledCourses = async (req, res) => {
  try {
    const enrolledCourses = await CourseModel.findEnrolledByStudent(req.user.uid);
    res.status(200).json(enrolledCourses);
  } catch (error) {
    console.error('Error al listar cursos inscritos:', error);
    res.status(500).json({ message: 'Error al obtener los cursos inscritos', details: error.message });
  }
};

// Inscribir al usuario en un curso
const enrollInCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    try {
      const enrollment = await EnrollmentModel.create(req.user.uid, courseId);
      res.status(201).json({ 
        message: 'Inscripción exitosa', 
        enrollment
      });
    } catch (error) {
      if (error.message === 'El usuario ya está inscrito en este curso') {
        return res.status(400).json({ message: error.message });
      }
      if (error.message === 'Curso no encontrado') {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error al inscribirse en el curso:', error);
    res.status(500).json({ message: 'Error al inscribirse en el curso', details: error.message });
  }
};

// Obtener un curso por ID
const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await CourseModel.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    res.status(200).json(course);
  } catch (error) {
    console.error('Error al obtener el curso:', error);
    res.status(500).json({ message: 'Error al obtener el curso', details: error.message });
  }
};

// Crear un nuevo curso
const createCourse = async (req, res) => {
  try {
    const { title, description, category, modality, durationDays, startDate, endDate } = req.body;
    
    const courseData = {
      title,
      description,
      category,
      modality,
      teacherId: req.user.uid,
    };
    
    // Añadir campos según la modalidad
    if (modality === 'synchronized') {
      courseData.startDate = startDate;
      courseData.endDate = endDate;
    } else {
      courseData.durationDays = parseInt(durationDays);
    }
    
    const course = await CourseModel.create(courseData);
    
    res.status(201).json({
      message: 'Curso creado exitosamente',
      course
    });
  } catch (error) {
    console.error('Error al crear el curso:', error);
    res.status(500).json({ message: 'Error al crear el curso', details: error.message });
  }
};

// Actualizar un curso existente
const updateCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const courseData = req.body;
    
    // Actualizar el curso
    const course = await CourseModel.update(courseId, courseData);
    
    res.status(200).json({
      message: 'Curso actualizado exitosamente',
      course
    });
  } catch (error) {
    console.error('Error al actualizar el curso:', error);
    res.status(500).json({ message: 'Error al actualizar el curso', details: error.message });
  }
};

// Eliminar un curso
const deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    await CourseModel.delete(courseId);
    
    res.status(200).json({ message: 'Curso y sus inscripciones eliminados exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el curso:', error);
    res.status(500).json({ message: 'Error al eliminar el curso', details: error.message });
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
  deleteCourse
};
