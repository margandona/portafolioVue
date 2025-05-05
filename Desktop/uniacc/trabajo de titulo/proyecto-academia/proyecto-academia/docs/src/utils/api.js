import axios from "axios";

// Base API configuration
const API_BASE_URL = "https://us-central1-casiangelesydemonios.cloudfunctions.net/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add authentication token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// User Authentication
const auth = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  resetPassword: (email) => api.post("/auth/password-reset", { email }),
  getProfile: () => api.get("/users/me"),
};

// Course Management
const courses = {
  getAll: () => api.get("/courses"),
  getById: (id) => api.get(`/courses/${id}`),
  getAvailable: () => api.get("/courses/available"),
  getEnrolled: () => api.get("/courses/enrolled"),
  create: (courseData) => api.post("/courses", courseData),
  update: (id, courseData) => api.put(`/courses/${id}`, courseData),
  delete: (id) => api.delete(`/courses/${id}`),
  getStudents: (courseId) => api.get(`/courses/${courseId}/students`),
  
  // Pricing and discount methods
  applyDiscount: (courseId, discountData) => 
    api.post(`/courses/${courseId}/discount`, discountData),
  removeDiscount: (courseId) => api.delete(`/courses/${courseId}/discount`),
  
  // Free access assignment
  assignFreeAccess: (courseId, userId, reason) => 
    api.post(`/courses/${courseId}/assign-free-access`, { userId, reason }),
  
  // Purchase methods
  initiatePurchase: (courseId) => api.post(`/courses/${courseId}/purchase`),
  
  // Dashboard specific endpoints
  getByTeacher: () => api.get("/courses/teacher"),
};

// Enrollment Management
const enrollments = {
  getAll: (params) => api.get("/enrollments", { params }),
  create: (courseId) => api.post("/enrollments", { courseId }),
  updateProgress: (enrollmentId, progress, completedEvaluations) => 
    api.patch(`/enrollments/${enrollmentId}/progress`, { 
      progress, 
      completedEvaluations 
    }),
  updateGrade: (enrollmentId, grade, certificateIssued) => 
    api.patch(`/enrollments/${enrollmentId}/grade`, { 
      grade, 
      certificateIssued 
    }),
  updateStatus: (enrollmentId, status, notes) => 
    api.patch(`/enrollments/${enrollmentId}/status`, { 
      status, 
      notes 
    }),
  delete: (enrollmentId) => api.delete(`/enrollments/${enrollmentId}`),
  getStats: (courseId) => api.get(`/enrollments/stats/${courseId}`),
  
  // Dashboard specific endpoints
  getByCourse: (courseId) => api.get(`/enrollments/course/${courseId}`),
  getRecent: () => api.get('/enrollments/recent'),
};

// Evaluation Management
const evaluations = {
  getByCourse: (courseId) => api.get(`/evaluations/course/${courseId}`),
  getById: (id) => api.get(`/evaluations/${id}`),
  create: (evaluationData) => api.post("/evaluations", evaluationData),
  update: (id, evaluationData) => api.put(`/evaluations/${id}`, evaluationData),
  delete: (id) => api.delete(`/evaluations/${id}`),
  submitResponse: (evaluationId, answers) => 
    api.post(`/evaluations/${evaluationId}/submit`, { answers }),
};

// User Management
const users = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getStudents: () => api.get("/users/students"),
  search: (query) => api.get("/users/search", { params: query }),
};

// Sales Management
const sales = {
  getAll: (params) => api.get("/sales", { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (courseId) => api.post("/sales", { courseId }),
  processPayment: (id, paymentData) => 
    api.post(`/sales/${id}/process-payment`, paymentData),
  updateStatus: (id, status, message) => 
    api.patch(`/sales/${id}/status`, { status, message }),
  cancelSale: (id) => 
    api.patch(`/sales/${id}/status`, { 
      status: "cancelled", 
      message: "Cancelled by user" 
    }),
  getStats: (params) => api.get("/sales/stats", { params }),
};

// Admin Management
const admin = {
  getStats: () => api.get("/admin/stats"),
  getSystemHealth: () => api.get("/admin/health"),
  checkHealth: () => api.get('/admin/health')
};

// Export the configured axios instance with namespaces
export default {
  ...api,
  auth,
  courses,
  enrollments,
  evaluations,
  users,
  sales,
  admin,
};
