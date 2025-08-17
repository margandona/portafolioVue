const moodleService = require('../services/moodleService');

// Get all courses from Moodle
const getCourses = async (req, res) => {
  try {
    const courses = await moodleService.getCourses();
    return res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching Moodle courses:', error);
    return res.status(500).json({
      message: 'Error fetching courses from Moodle',
      details: error.message
    });
  }
};

// Get a specific course by ID
const getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await moodleService.getCourse(courseId);
    
    if (!course) {
      return res.status(404).json({
        message: `Course with ID ${courseId} not found in Moodle`
      });
    }
    
    return res.status(200).json(course);
  } catch (error) {
    console.error(`Error fetching Moodle course ${req.params.id}:`, error);
    return res.status(500).json({
      message: 'Error fetching course from Moodle',
      details: error.message
    });
  }
};

// Get users enrolled in a course
const getEnrolledUsers = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const users = await moodleService.getEnrolledUsers(courseId);
    return res.status(200).json(users);
  } catch (error) {
    console.error(`Error fetching enrolled users for course ${req.params.courseId}:`, error);
    return res.status(500).json({
      message: 'Error fetching enrolled users from Moodle',
      details: error.message
    });
  }
};

// Enroll a user in a course
const enrollUser = async (req, res) => {
  try {
    const { userId, courseId, roleId } = req.body;
    
    if (!userId || !courseId) {
      return res.status(400).json({
        message: 'User ID and Course ID are required'
      });
    }
    
    const result = await moodleService.enrollUser(userId, courseId, roleId || 5);
    return res.status(200).json({
      message: `User ${userId} successfully enrolled in course ${courseId}`,
      data: result
    });
  } catch (error) {
    console.error(`Error enrolling user in Moodle course:`, error);
    return res.status(500).json({
      message: 'Error enrolling user in Moodle course',
      details: error.message
    });
  }
};

// Get course contents
const getCourseContents = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const contents = await moodleService.getCourseContents(courseId);
    return res.status(200).json(contents);
  } catch (error) {
    console.error(`Error fetching contents for course ${req.params.courseId}:`, error);
    return res.status(500).json({
      message: 'Error fetching course contents from Moodle',
      details: error.message
    });
  }
};

// Sync all Moodle courses with our database
const syncCourses = async (req, res) => {
  try {
    const result = await moodleService.syncCoursesToDatabase();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error syncing Moodle courses:', error);
    return res.status(500).json({
      message: 'Error syncing Moodle courses',
      details: error.message
    });
  }
};

module.exports = {
  getCourses,
  getCourse,
  getEnrolledUsers,
  enrollUser,
  getCourseContents,
  syncCourses
};
