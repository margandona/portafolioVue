const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const moodleController = require('../controllers/moodleController');

// Protected routes - requires admin role
router.use(verifyToken, checkRole(['admin']));

// Get all courses
router.get('/courses', moodleController.getCourses);

// Get specific course
router.get('/courses/:id', moodleController.getCourse);

// Get enrolled users for a course
router.get('/courses/:courseId/users', moodleController.getEnrolledUsers);

// Get course contents
router.get('/courses/:courseId/contents', moodleController.getCourseContents);

// Enroll user in a course
router.post('/enroll', moodleController.enrollUser);

// Trigger sync of courses from Moodle to database
router.post('/sync', moodleController.syncCourses);

module.exports = router;
