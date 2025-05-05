import axios from 'axios';

// Base URL for Moodle
const MOODLE_URL = 'https://neekworld.cl/NW/';

// You need to get a proper token from Moodle admin
// This is a security-sensitive token that should be stored securely
const MOODLE_TOKEN = process.env.VUE_APP_MOODLE_TOKEN || 'YOUR_MOODLE_TOKEN';

// Debug mode flag - set to true to see detailed logs
const DEBUG = true;

// Create axios instance for Moodle API
const moodleApi = axios.create({
  baseURL: MOODLE_URL + 'webservice/rest/server.php',
  params: {
    wstoken: MOODLE_TOKEN,
    moodlewsrestformat: 'json'
  }
});

// Add response interceptor for debugging
moodleApi.interceptors.response.use(
  response => {
    if (DEBUG) {
      console.log('Moodle API success response:', response);
    }
    
    // Check if the response contains error information in Moodle format
    if (response.data && response.data.exception) {
      console.error('Moodle API returned an error:', response.data);
      throw new Error(`Moodle error: ${response.data.message || 'Unknown error'}`);
    }
    
    return response;
  },
  error => {
    console.error('Moodle API error:', error);
    return Promise.reject(error);
  }
);

/**
 * Helper function to validate connection to Moodle
 */
const validateConnection = async () => {
  try {
    // Use the site info endpoint as a test
    const response = await axios.get(`${MOODLE_URL}webservice/rest/server.php`, {
      params: {
        wstoken: MOODLE_TOKEN,
        wsfunction: 'core_webservice_get_site_info',
        moodlewsrestformat: 'json'
      },
      timeout: 5000 // 5 seconds timeout
    });
    
    if (DEBUG) {
      console.log('Moodle connection test response:', response.data);
    }
    
    // Check if we got an error or a valid response
    if (response.data && response.data.exception) {
      return {
        success: false,
        error: `Moodle API error: ${response.data.message || 'Unknown error'}`,
        details: response.data
      };
    }
    
    if (response.data && response.data.sitename) {
      return {
        success: true,
        siteName: response.data.sitename,
        userName: response.data.username,
        details: response.data
      };
    }
    
    return {
      success: false,
      error: 'Invalid response from Moodle API',
      details: response.data
    };
  } catch (error) {
    console.error('Error validating Moodle connection:', error);
    
    let errorMessage = 'Error connecting to Moodle';
    let errorDetails = {};
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = `Server responded with error: ${error.response.status}`;
      errorDetails = {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers
      };
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from Moodle server';
      errorDetails = {
        request: error.request
      };
    } else {
      // Something happened in setting up the request
      errorMessage = error.message || 'Error setting up request';
    }
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Connection timeout. The Moodle server took too long to respond.';
    }
    
    if (error.message && error.message.includes('Network Error')) {
      errorMessage = 'Network error. Check your internet connection or CORS policy.';
    }
    
    return {
      success: false,
      error: errorMessage,
      details: errorDetails
    };
  }
};

// Fallback method if the API fails - screen scraping (not ideal but as backup)
const scrapeMoodleCourses = async () => {
  try {
    if (DEBUG) console.log('Attempting to scrape Moodle courses page...');
    
    // Use a proxy if CORS is an issue
    // For production, you should set up your own proxy server
    const corsProxy = 'https://corsproxy.io/?';
    const response = await axios.get(`${corsProxy}${MOODLE_URL}course/index.php`, {
      headers: {
        'Accept': 'text/html'
      }
    });
    
    if (DEBUG) console.log('Scrape response received, length:', response.data.length);
    
    // Basic parsing of HTML - this is very fragile and depends on Moodle's HTML structure
    const html = response.data;
    const courseRegex = /<div class="coursename"><a href=".*?id=(\d+)">(.*?)<\/a><\/div>.*?<div class="summary">(.*?)<\/div>/gs;
    
    const courses = [];
    let match;
    
    while ((match = courseRegex.exec(html)) !== null) {
      courses.push({
        id: match[1],
        fullname: match[2],
        summary: match[3],
        categoryid: null,
        categoryname: null,
        // No image available through scraping
      });
    }
    
    if (DEBUG) console.log(`Scraped ${courses.length} courses`);
    
    return courses;
  } catch (error) {
    console.error('Error scraping Moodle courses:', error);
    throw new Error(`Failed to scrape Moodle courses: ${error.message}`);
  }
};

export const moodleService = {
  /**
   * Test the connection to the Moodle server
   */
  testConnection: async () => {
    return await validateConnection();
  },
  
  /**
   * Get list of public courses from Moodle
   */
  getCourses: async () => {
    try {
      if (DEBUG) console.log('Fetching Moodle courses with API token:', MOODLE_TOKEN ? '*****' + MOODLE_TOKEN.substr(-4) : 'Missing');
      
      // First validate the connection
      const connectionTest = await validateConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection validation failed: ${connectionTest.error}`);
      }
      
      const response = await moodleApi.get('', {
        params: {
          wsfunction: 'core_course_get_courses'
        }
      });
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format. Expected an array of courses.');
      }
      
      if (DEBUG) console.log(`Fetched ${response.data.length} Moodle courses`);
      
      // Process and enhance course data
      const courses = response.data.map(course => ({
        ...course,
        // Extract the image URL from the course summary if available
        imageurl: extractImageUrl(course.summary) || 
                 `${MOODLE_URL}course/moodleimage.php?id=${course.id}`
      }));
      
      return courses;
    } catch (error) {
      console.error('Error fetching Moodle courses with API:', error);
      
      // Include detailed error information
      let errorMessage = 'Failed to fetch courses';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server responded with error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`;
        
        if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = 'Authentication failed: Invalid Moodle token or insufficient permissions';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from Moodle server. Check the server URL and your network connection.';
      }
      
      // Try scraping as a fallback
      if (DEBUG) console.log('API call failed, attempting fallback to scraping...');
      
      try {
        return await scrapeMoodleCourses();
      } catch (scrapeError) {
        console.error('Fallback scraping also failed:', scrapeError);
        throw new Error(`${errorMessage}. Fallback scraping also failed: ${scrapeError.message}`);
      }
    }
  },
  
  /**
   * Get courses the current user is enrolled in
   */
  getUserCourses: async (userId) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const response = await moodleApi.get('', {
        params: {
          wsfunction: 'core_enrol_get_users_courses',
          userid: userId
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user\'s Moodle courses:', error);
      throw error;
    }
  },
  
  /**
   * Get course categories
   */
  getCategories: async () => {
    try {
      const response = await moodleApi.get('', {
        params: {
          wsfunction: 'core_course_get_categories'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching Moodle categories:', error);
      throw error;
    }
  }
};

/**
 * Helper function to extract image URL from course summary HTML
 */
function extractImageUrl(summary) {
  if (!summary) return null;
  
  // Try to find an image tag in the summary
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = summary.match(imgRegex);
  
  return match ? match[1] : null;
}
