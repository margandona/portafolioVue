const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const MOODLE_URL = process.env.MOODLE_URL || 'https://moodle.example.com';
const MOODLE_TOKEN = process.env.MOODLE_TOKEN;

class MoodleService {
  constructor() {
    this.apiUrl = `${MOODLE_URL}/webservice/rest/server.php`;
    this.token = MOODLE_TOKEN;
  }

  // Helper method to make API calls to Moodle
  async callMoodleApi(wsfunction, params = {}) {
    try {
      if (!this.token) {
        throw new Error('Moodle API token not configured');
      }

      const response = await axios.get(this.apiUrl, {
        params: {
          wstoken: this.token,
          wsfunction,
          moodlewsrestformat: 'json',
          ...params
        }
      });

      // Check for Moodle API exceptions
      if (response.data && response.data.exception) {
        throw new Error(`Moodle API Error: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      console.error(`Error calling Moodle API (${wsfunction}):`, error);
      throw error;
    }
  }

  // Get all courses
  async getCourses() {
    try {
      const data = await this.callMoodleApi('core_course_get_courses');
      return data || [];
    } catch (error) {
      console.error('Error fetching courses from Moodle:', error);
      throw error;
    }
  }

  // Get a specific course by ID
  async getCourse(id) {
    try {
      const data = await this.callMoodleApi('core_course_get_courses', {
        options: { ids: [id] }
      });
      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(`Error fetching course ${id} from Moodle:`, error);
      throw error;
    }
  }

  // Get enrolled users for a course
  async getEnrolledUsers(courseId) {
    try {
      const data = await this.callMoodleApi('core_enrol_get_enrolled_users', {
        courseid: courseId
      });
      return data || [];
    } catch (error) {
      console.error(`Error fetching enrolled users for course ${courseId}:`, error);
      throw error;
    }
  }

  // Enroll a user in a course
  async enrollUser(userId, courseId, roleId = 5) { // 5 is the default role ID for students
    try {
      const data = await this.callMoodleApi('enrol_manual_enrol_users', {
        enrolments: [
          {
            roleid: roleId,
            userid: userId,
            courseid: courseId
          }
        ]
      });
      return data;
    } catch (error) {
      console.error(`Error enrolling user ${userId} in course ${courseId}:`, error);
      throw error;
    }
  }

  // Get course contents
  async getCourseContents(courseId) {
    try {
      const data = await this.callMoodleApi('core_course_get_contents', {
        courseid: courseId
      });
      return data || [];
    } catch (error) {
      console.error(`Error fetching course contents for ${courseId}:`, error);
      throw error;
    }
  }

  // Sync course data from Moodle to our database
  async syncCoursesToDatabase() {
    try {
      const courses = await this.getCourses();
      console.log(`Found ${courses.length} courses in Moodle`);
      
      // Here you would typically update your database
      // This is a placeholder - actual implementation would depend on your database setup
      
      return {
        success: true,
        count: courses.length,
        message: `Successfully synced ${courses.length} courses from Moodle`
      };
    } catch (error) {
      console.error('Error syncing courses from Moodle:', error);
      throw error;
    }
  }
}

module.exports = new MoodleService();
