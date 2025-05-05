<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando tu dashboard...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadDashboardData" class="btn btn-primary">
        Reintentar
      </button>
    </div>
    
    <!-- Student Dashboard -->
    <StudentDashboard 
      v-else-if="userRole === 'student'"
      :enrolledCourses="enrolledCourses"
      :recentEnrollments="recentEnrollments"
      :recommendedCourses="recommendedCourses"
    />
    
    <!-- Teacher Dashboard -->
    <TeacherDashboard 
      v-else-if="userRole === 'teacher'"
      :teacherCourses="teacherCourses"
      :totalStudents="totalStudents"
      :activeCourses="activeCourses"
      :recentStudents="recentStudents"
    />
    
    <!-- Admin Dashboard -->
    <AdminDashboard 
      v-else-if="userRole === 'admin'"
      :adminStats="adminStats"
      :recentSales="recentSales"
      :apiResponseTime="apiResponseTime"
    />
  </div>
</template>

<script>
import api from '@/utils/api';
import { mapGetters } from 'vuex';
import { formatPrice } from '@/utils/apiHelper';
import StudentDashboard from '@/components/dashboard/StudentDashboard.vue';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard.vue';
import AdminDashboard from '@/components/dashboard/AdminDashboard.vue';

export default {
  name: 'DashboardView',
  components: {
    StudentDashboard,
    TeacherDashboard,
    AdminDashboard
  },
  data() {
    return {
      isLoading: true,
      error: null,
      enrolledCourses: [],
      recentEnrollments: [],
      recommendedCourses: [],
      teacherCourses: [],
      totalStudents: 0,
      activeCourses: 0,
      recentStudents: [],
      recentSales: [],
      adminStats: {},
      apiResponseTime: 45
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'getUser', 'userRole']),
  },
  async created() {
    await this.loadDashboardData();
  },
  methods: {
    formatPrice,
    async loadDashboardData() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Load data based on user role
        if (this.userRole === 'student') {
          await this.loadStudentDashboard();
        } else if (this.userRole === 'teacher') {
          await this.loadTeacherDashboard();
        } else if (this.userRole === 'admin') {
          await this.loadAdminDashboard();
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        this.error = error.response?.data?.message || 'Error al cargar información del dashboard';
      } finally {
        this.isLoading = false;
      }
    },
    
    async loadStudentDashboard() {
      try {
        // Get enrolled courses
        const enrolledResponse = await api.courses.getEnrolled();
        this.enrolledCourses = enrolledResponse.data || [];
        
        // Get recent activity (sort by last access date)
        this.recentEnrollments = this.enrolledCourses
          .filter(course => course.enrollment)
          .sort((a, b) => {
            return new Date(b.enrollment.lastAccessDate || 0) - 
                  new Date(a.enrollment.lastAccessDate || 0);
          })
          .slice(0, 3);
        
        // Get recommended courses
        const availableResponse = await api.courses.getAvailable();
        this.recommendedCourses = availableResponse.data || [];
        
        // Sort by relevance (simplified version: newest first)
        this.recommendedCourses = this.recommendedCourses
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 3);
      } catch (error) {
        console.error('Error loading student dashboard:', error);
        throw error;
      }
    },
    
    async loadTeacherDashboard() {
      try {
        // Get teacher's courses
        const coursesResponse = await api.get('/courses', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.teacherCourses = coursesResponse.data.courses || coursesResponse.data || [];
        
        // Count active courses
        this.activeCourses = this.teacherCourses.filter(c => c.active !== false).length;
        
        // Calculate total students
        let studentsCount = 0;
        for (const course of this.teacherCourses) {
          try {
            const statsResponse = await api.get(`/enrollments/stats/${course.id}`);
            course.students = statsResponse.data.totalEnrollments || 0;
            studentsCount += course.students;
          } catch (err) {
            console.warn(`Error getting stats for course ${course.id}:`, err);
            course.students = 0;
          }
        }
        this.totalStudents = studentsCount;
        
        // Recent enrollments example data (in a real app, you would fetch this)
        this.recentStudents = [
          { id: '1', name: 'Ana Martínez', course: this.teacherCourses[0]?.title || 'Curso 1', enrollmentDate: new Date() },
          { id: '2', name: 'Carlos López', course: this.teacherCourses[0]?.title || 'Curso 1', enrollmentDate: new Date(Date.now() - 86400000) },
          { id: '3', name: 'Maria González', course: this.teacherCourses[1]?.title || 'Curso 2', enrollmentDate: new Date(Date.now() - 172800000) }
        ];
      } catch (error) {
        console.error('Error loading teacher dashboard:', error);
        throw error;
      }
    },
    
    async loadAdminDashboard() {
      try {
        // Get platform statistics
        this.adminStats = {
          totalStudents: 150,
          totalCourses: 25,
          totalRevenue: 350000,
          totalEnrollments: 280,
          storageUsed: '2.4',
          version: '1.2.5'
        };
        
        // Get recent sales
        const salesResponse = await api.get('/sales', { 
          params: { limit: 5 },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.recentSales = salesResponse.data || [];
      } catch (error) {
        console.error('Error loading admin dashboard:', error);
        throw error;
      }
    }
  }
};
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2A3B5F;
  font-family: "Playfair Display", serif;
  margin-bottom: 30px;
  text-align: center;
}

/* Loading and Error States */
.loading-container, .error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #2E8B57;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #dc3545;
}

.btn {
  padding: 8px 16px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
  text-decoration: none;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover {
  background-color: #3AA870;
}
</style>