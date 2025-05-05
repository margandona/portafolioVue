const axios = require('axios');
const functions = require('firebase-functions');

// Get token from environment variables for security
const MOODLE_URL = 'https://neekworld.cl/NW/';
const MOODLE_TOKEN = functions.config().moodle?.token || '0c9a56f911419b833d7f71eb58317d3e';

// Create axios instance for Moodle API calls
const moodleApi = axios.create({
  baseURL: MOODLE_URL + 'webservice/rest/server.php',
  params: {
    wstoken: MOODLE_TOKEN,
    moodlewsrestformat: 'json'
  }
});

// Service methods to interact with Moodle
const moodleService = {
  /**
   * Get all courses from Moodle
   */
  getCourses: async () => {
    try {
      const response = await moodleApi.get('', {
        params: {
          wsfunction: 'core_course_get_courses'
        }
      });
      
      // Handle Moodle API errors
      if (response.data && response.data.exception) {
        throw new Error(`Moodle API error: ${response.data.message}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching courses from Moodle:', error);
      throw error;
    }
  },
  
  /**
   * Get course by ID from Moodle
   */
  getCourseById: async (courseId) => {
    try {
      const response = await moodleApi.get('', {
        params: {
          wsfunction: 'core_course_get_courses',
          options: JSON.stringify({ ids: [courseId] })
        }
      });
      
      // Handle Moodle API errors
      if (response.data && response.data.exception) {
        throw new Error(`Moodle API error: ${response.data.message}`);
      }
      
      if (!response.data || response.data.length === 0) {
        throw new Error('Course not found');
      }
      
      return response.data[0];
    } catch (error) {
      console.error(`Error fetching course ${courseId} from Moodle:`, error);
      throw error;
    }
  },
  
  /**
   * Get course categories from Moodle
   */
  getCategories: async () => {
    try {
      const response = await moodleApi.get('', {
        params: {
          wsfunction: 'core_course_get_categories'
        }
      });
      
      // Handle Moodle API errors
      if (response.data && response.data.exception) {
        throw new Error(`Moodle API error: ${response.data.message}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching categories from Moodle:', error);
      throw error;
    }
  },
  
  /**
   * Get enrolled users in a course
   */
  getCourseEnrollments: async (courseId) => {
    try {
      const response = await moodleApi.get('', {
        params: {
          wsfunction: 'core_enrol_get_enrolled_users',
          courseid: courseId
        }
      });
      
      // Handle Moodle API errors
      if (response.data && response.data.exception) {
        throw new Error(`Moodle API error: ${response.data.message}`);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching enrollments for course ${courseId} from Moodle:`, error);
      throw error;
    }
  },
  
  /**
   * Test connection to Moodle API
   */
  testConnection: async () => {
    try {
      const response = await moodleApi.get('', {
        params: {
          wsfunction: 'core_webservice_get_site_info'
        }
      });
      
      if (response.data && response.data.exception) {
        return {
          success: false,
          message: `Moodle API error: ${response.data.message}`,
          details: response.data
        };
      }
      
      return {
        success: true,
        siteName: response.data.sitename,
        version: response.data.release,
        userName: response.data.username,
        functions: response.data.functions?.map(f => f.name) || []
      };
    } catch (error) {
      console.error('Error testing connection to Moodle:', error);
      return {
        success: false,
        message: error.message,
        details: error.response?.data || error
      };
    }
  }
};

module.exports = moodleService;
