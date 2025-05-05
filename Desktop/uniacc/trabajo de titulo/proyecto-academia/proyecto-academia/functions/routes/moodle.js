const express = require('express');
const router = express.Router();
const moodleController = require('../controllers/moodleController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Public routes
router.get('/test-connection', moodleController.testConnection);
router.get('/courses', moodleController.getCourses);
router.get('/courses/:id', moodleController.getCourseById);
router.get('/categories', moodleController.getCategories);

// Protected routes (require authentication)
router.get('/courses/:courseId/enrollments', isAuthenticated, moodleController.getCourseEnrollments);

module.exports = router;
