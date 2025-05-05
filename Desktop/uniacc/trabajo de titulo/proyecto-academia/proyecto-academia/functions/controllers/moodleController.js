const moodleService = require('../services/moodleService');

/**
 * Get all courses from Moodle
 */
const getCourses = async (req, res) => {
  try {
    const courses = await moodleService.getCourses();
    
    // Enhance course data with additional information
    const enhancedCourses = courses.map(course => ({
      ...course,
      imageUrl: course.overviewfiles?.find(file => file.fileurl)?.fileurl || null,
      summary: course.summary || '',
      isPremium: course.enrollmentmethods?.includes('paypal') || false
    }));
    
    res.status(200).json(enhancedCourses);
  } catch (error) {
    console.error('Error in getCourses controller:', error);
    res.status(500).json({ 
      message: 'Error al obtener cursos de Moodle', 
      details: error.message 
    });
  }
};

/**
 * Get a specific course by ID
 */
const getCourseById = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await moodleService.getCourseById(courseId);
    
    // Enhance course data
    const enhancedCourse = {
      ...course,
      imageUrl: course.overviewfiles?.find(file => file.fileurl)?.fileurl || null,
      summary: course.summary || '',
      isPremium: course.enrollmentmethods?.includes('paypal') || false
    };
    
    res.status(200).json(enhancedCourse);
  } catch (error) {
    console.error(`Error in getCourseById controller for course ${req.params.id}:`, error);
    
    if (error.message === 'Course not found') {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    
    res.status(500).json({ 
      message: 'Error al obtener curso de Moodle', 
      details: error.message 
    });
  }
};

/**
 * Get all categories from Moodle
 */
const getCategories = async (req, res) => {
  try {
    const categories = await moodleService.getCategories();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error in getCategories controller:', error);
    res.status(500).json({ 
      message: 'Error al obtener categorías de Moodle', 
      details: error.message 
    });
  }
};

/**
 * Get enrollments for a specific course
 */
const getCourseEnrollments = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const enrollments = await moodleService.getCourseEnrollments(courseId);
    res.status(200).json(enrollments);
  } catch (error) {
    console.error(`Error in getCourseEnrollments controller for course ${req.params.courseId}:`, error);
    res.status(500).json({ 
      message: 'Error al obtener inscripciones del curso de Moodle', 
      details: error.message 
    });
  }
};

/**
 * Test connection to Moodle API
 */
const testConnection = async (req, res) => {
  try {
    const result = await moodleService.testConnection();
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Error in testConnection controller:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al conectar con Moodle API', 
      details: error.message 
    });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  getCategories,
  getCourseEnrollments,
  testConnection
};
