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
    <div v-else-if="userRole === 'student'" class="user-dashboard">
      <div class="welcome-header">
        <h2>Bienvenido, {{ userName }}</h2>
        <p class="subtitle">Tu plataforma de aprendizaje personal</p>
      </div>
      
      <div class="dashboard-summary">
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-book"></i>
          </div>
          <div class="summary-content">
            <h3>{{ enrolledCourses.length }}</h3>
            <p>Cursos Inscritos</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="summary-content">
            <h3>{{ averageProgress }}%</h3>
            <p>Progreso Promedio</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-certificate"></i>
          </div>
          <div class="summary-content">
            <h3>{{ completedCourses }}</h3>
            <p>Cursos Completados</p>
          </div>
        </div>
      </div>
      
      <div class="dashboard-sections">
        <!-- Recent Activity -->
        <div class="dashboard-section">
          <div class="section-header">
            <h3>Actividad Reciente</h3>
            <router-link to="/enrolled" class="view-all">Ver Todo</router-link>
          </div>
          
          <div class="section-content">
            <div v-if="recentEnrollments.length === 0" class="empty-state">
              <p>No hay actividad reciente para mostrar.</p>
            </div>
            <ul v-else class="activity-list">
              <li v-for="enrollment in recentEnrollments" :key="enrollment.id" class="activity-item">
                <div class="activity-icon">
                  <i class="fas fa-book-open"></i>
                </div>
                <div class="activity-details">
                  <h4>{{ enrollment.course.title }}</h4>
                  <div class="activity-meta">
                    <span>Último acceso: {{ formatDate(enrollment.lastAccessDate) }}</span>
                    <span class="progress-badge">{{ enrollment.progress }}% Completado</span>
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: `${enrollment.progress}%` }"
                      :class="{
                        'low': enrollment.progress < 30,
                        'mid': enrollment.progress >= 30 && enrollment.progress < 70,
                        'high': enrollment.progress >= 70
                      }"
                    ></div>
                  </div>
                </div>
                <router-link :to="`/courses/${enrollment.courseId}`" class="continue-btn">
                  Continuar
                </router-link>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Recommended Courses -->
        <div class="dashboard-section">
          <div class="section-header">
            <h3>Cursos Recomendados</h3>
            <router-link to="/courses/available" class="view-all">Ver Todos</router-link>
          </div>
          
          <div class="section-content">
            <div v-if="recommendedCourses.length === 0" class="empty-state">
              <p>No hay cursos recomendados por el momento.</p>
              <router-link to="/courses/available" class="btn btn-primary">
                Explorar Cursos
              </router-link>
            </div>
            
            <div v-else class="course-grid">
              <div v-for="course in recommendedCourses" :key="course.id" class="course-card">
                <div class="course-header">
                  <h4>{{ course.title }}</h4>
                  <span v-if="course.isFree" class="badge free">Gratis</span>
                  <span v-else-if="course.hasActiveDiscount" class="badge discount">{{ course.discount }}% Dcto</span>
                </div>
                
                <p class="course-description">{{ truncateText(course.description, 80) }}</p>
                
                <div class="course-footer">
                  <router-link :to="`/courses/${course.id}`" class="btn btn-primary sm">
                    Ver Detalles
                  </router-link>
                  <span v-if="!course.isFree" class="course-price">
                    <span v-if="course.hasActiveDiscount" class="discounted-price">
                      <span class="original">${{ formatPrice(course.totalPrice) }}</span>
                      <span class="current">${{ formatPrice(course.discountedTotalPrice) }}</span>
                    </span>
                    <span v-else>${{ formatPrice(course.totalPrice) }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Teacher Dashboard -->
    <div v-else-if="userRole === 'teacher'" class="user-dashboard">
      <div class="welcome-header">
        <h2>Bienvenido, Profesor {{ userName }}</h2>
        <p class="subtitle">Panel de gestión de cursos</p>
      </div>
      
      <div class="dashboard-summary">
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-chalkboard-teacher"></i>
          </div>
          <div class="summary-content">
            <h3>{{ teacherCourses.length }}</h3>
            <p>Cursos Creados</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="summary-content">
            <h3>{{ totalStudents }}</h3>
            <p>Estudiantes Totales</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div class="summary-content">
            <h3>{{ activeCourses }}</h3>
            <p>Cursos Activos</p>
          </div>
        </div>
      </div>
      
      <div class="dashboard-sections">
        <!-- My Courses -->
        <div class="dashboard-section">
          <div class="section-header">
            <h3>Mis Cursos</h3>
            <router-link to="/teacher/courses" class="view-all">Ver Todos</router-link>
          </div>
          
          <div class="section-content">
            <div v-if="teacherCourses.length === 0" class="empty-state">
              <p>Aún no has creado ningún curso.</p>
              <router-link to="/courses/create" class="btn btn-primary">
                Crear Curso
              </router-link>
            </div>
            
            <div v-else class="course-grid">
              <div v-for="course in teacherCourses.slice(0, 3)" :key="course.id" class="course-card">
                <div class="course-header">
                  <h4>{{ course.title }}</h4>
                  <span v-if="course.isFree" class="badge free">Gratis</span>
                  <span v-else class="badge paid">De pago</span>
                </div>
                
                <div class="student-count">
                  <i class="fas fa-users"></i> {{ course.students || 0 }} estudiantes
                </div>
                
                <div class="course-footer">
                  <router-link :to="`/courses/${course.id}`" class="btn btn-primary sm">
                    Ver Detalles
                  </router-link>
                  <router-link :to="`/courses/edit/${course.id}`" class="btn btn-secondary sm">
                    Editar
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Enrollments -->
        <div class="dashboard-section">
          <div class="section-header">
            <h3>Inscripciones Recientes</h3>
            <router-link to="/teacher/students" class="view-all">Ver Todos</router-link>
          </div>
          
          <div class="section-content">
            <div v-if="recentStudents.length === 0" class="empty-state">
              <p>No hay inscripciones recientes.</p>
            </div>
            
            <ul v-else class="student-list">
              <li v-for="student in recentStudents" :key="student.id" class="student-item">
                <div class="student-info">
                  <div class="student-avatar">
                    <i class="fas fa-user"></i>
                  </div>
                  <div>
                    <h4>{{ student.name }}</h4>
                    <p>{{ student.course }}</p>
                  </div>
                </div>
                <div class="enrollment-date">
                  {{ formatDate(student.enrollmentDate) }}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Admin Dashboard -->
    <div v-else-if="userRole === 'admin'" class="user-dashboard">
      <div class="welcome-header">
        <h2>Panel de Administración</h2>
        <p class="subtitle">Estadísticas generales de la plataforma</p>
      </div>
      
      <div class="dashboard-summary">
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-users"></i>
          </div>
          <div class="summary-content">
            <h3>{{ adminStats.totalStudents || 0 }}</h3>
            <p>Estudiantes Registrados</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-chalkboard"></i>
          </div>
          <div class="summary-content">
            <h3>{{ adminStats.totalCourses || 0 }}</h3>
            <p>Cursos Disponibles</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="summary-content">
            <h3>${{ formatPrice(adminStats.totalRevenue || 0) }}</h3>
            <p>Ingresos Totales</p>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">
            <i class="fas fa-certificate"></i>
          </div>
          <div class="summary-content">
            <h3>{{ adminStats.totalEnrollments || 0 }}</h3>
            <p>Inscripciones Totales</p>
          </div>
        </div>
      </div>
      
      <div class="dashboard-sections">
        <!-- Recent Sales -->
        <div class="dashboard-section">
          <div class="section-header">
            <h3>Ventas Recientes</h3>
            <router-link to="/admin/sales" class="view-all">Ver Todas</router-link>
          </div>
          
          <div class="section-content">
            <div v-if="recentSales.length === 0" class="empty-state">
              <p>No hay ventas recientes para mostrar.</p>
            </div>
            
            <table v-else class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Curso</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sale in recentSales" :key="sale.id">
                  <td>{{ sale.id.substring(0, 8) }}...</td>
                  <td>{{ sale.user?.name || 'Usuario' }}</td>
                  <td>{{ sale.course?.title || 'Curso' }}</td>
                  <td>${{ formatPrice(sale.amount) }}</td>
                  <td>{{ formatDate(sale.updatedAt) }}</td>
                  <td>
                    <span :class="`status-badge ${sale.status}`">
                      {{ formatSaleStatus(sale.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- System Status -->
        <div class="dashboard-section">
          <div class="section-header">
            <h3>Estado del Sistema</h3>
          </div>
          
          <div class="section-content">
            <div class="status-grid">
              <div class="status-card">
                <div class="status-header">
                  <h4>Base de datos</h4>
                  <span class="status-indicator online">Online</span>
                </div>
                <p>Última sincronización: {{ formatDate(new Date()) }}</p>
              </div>
              
              <div class="status-card">
                <div class="status-header">
                  <h4>API</h4>
                  <span class="status-indicator online">Online</span>
                </div>
                <p>Tiempo de respuesta: {{ apiResponseTime }}ms</p>
              </div>
              
              <div class="status-card">
                <div class="status-header">
                  <h4>Almacenamiento</h4>
                  <span class="status-indicator online">Online</span>
                </div>
                <p>Espacio utilizado: {{ adminStats.storageUsed || '0' }} GB</p>
              </div>
              
              <div class="status-card">
                <div class="status-header">
                  <h4>Backend</h4>
                  <span class="status-indicator online">Online</span>
                </div>
                <p>Versión: {{ adminStats.version || '1.0.0' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api';
import { mapGetters, mapActions } from 'vuex';
import { formatPrice } from '@/utils/apiHelper';

export default {
  name: 'DashboardView',
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
    userName() {
      return this.getUser?.name || '';
    },
    averageProgress() {
      if (this.enrolledCourses.length === 0) return 0;
      const totalProgress = this.enrolledCourses.reduce((sum, course) => {
        return sum + (course.enrollment?.progress || 0);
      }, 0);
      return Math.round(totalProgress / this.enrolledCourses.length);
    },
    completedCourses() {
      return this.enrolledCourses.filter(course => 
        course.enrollment?.status === 'completed').length;
    }
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
    },
    
    formatDate(date) {
      if (!date) return 'No disponible';
      return new Date(date).toLocaleDateString('es-CL');
    },
    
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    formatSaleStatus(status) {
      const statuses = {
        'pending': 'Pendiente',
        'processing': 'Procesando',
        'completed': 'Completado',
        'failed': 'Fallido',
        'cancelled': 'Cancelado',
        'refunded': 'Reembolsado'
      };
      return statuses[status] || status;
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

.welcome-header {
  margin-bottom: 30px;
  text-align: center;
}

.welcome-header h2 {
  color: #2A3B5F;
  font-family: "Playfair Display", serif;
  margin-bottom: 5px;
}

.welcome-header .subtitle {
  color: #6c757d;
  font-size: 16px;
}

/* Dashboard Summary Section */
.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.summary-icon {
  width: 50px;
  height: 50px;
  background-color: rgba(46, 139, 87, 0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.summary-icon i {
  font-size: 22px;
  color: #2E8B57;
}

.summary-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #2A3B5F;
  margin: 0;
}

.summary-content p {
  margin: 5px 0 0;
  color: #6c757d;
  font-size: 14px;
}

/* Dashboard Sections */
.dashboard-sections {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

@media (min-width: 992px) {
  .dashboard-sections {
    grid-template-columns: 1fr 1fr;
  }
}

.dashboard-section {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eaeaea;
}

.section-header h3 {
  font-family: "Playfair Display", serif;
  color: #2A3B5F;
  margin: 0;
  font-size: 18px;
}

.view-all {
  color: #2E8B57;
  text-decoration: none;
  font-size: 14px;
}

.section-content {
  padding: 20px;
}

/* Activity List */
.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eaeaea;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(46, 139, 87, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.activity-icon i {
  font-size: 18px;
  color: #2E8B57;
}

.activity-details {
  flex-grow: 1;
}

.activity-details h4 {
  margin: 0 0 5px;
  color: #2A3B5F;
  font-size: 16px;
}

.activity-meta {
  font-size: 12px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-badge {
  background-color: #f8f9fa;
  padding: 2px 8px;
  border-radius: 20px;
}

.progress-bar {
  margin-top: 8px;
  height: 6px;
  background-color: #eaeaea;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-fill.low {
  background-color: #dc3545;
}

.progress-fill.mid {
  background-color: #fd7e14;
}

.progress-fill.high {
  background-color: #28a745;
}

.continue-btn {
  background-color: #2E8B57;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.continue-btn:hover {
  background-color: #3AA870;
}

/* Course Grid */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.course-card {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.course-header h4 {
  margin: 0;
  color: #2A3B5F;
  font-size: 16px;
  flex-grow: 1;
}

.badge {
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  margin-left: 8px;
}

.badge.free {
  background-color: #28a745;
}

.badge.paid {
  background-color: #0d6efd;
}

.badge.discount {
  background-color: #fd7e14;
}

.course-description {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 15px;
  height: 60px;
  overflow: hidden;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-count {
  font-size: 14px;
  color: #6c757d;
  margin: 10px 0;
}

.course-price {
  font-weight: 600;
  color: #2A3B5F;
}

.discounted-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.discounted-price .original {
  text-decoration: line-through;
  color: #6c757d;
  font-size: 12px;
  font-weight: normal;
}

.discounted-price .current {
  color: #2E8B57;
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

.btn.sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover {
  background-color: #3AA870;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

/* Student List */
.student-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eaeaea;
}

.student-item:last-child {
  border-bottom: none;
}

.student-info {
  display: flex;
  align-items: center;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.student-info h4 {
  margin: 0;
  color: #2A3B5F;
  font-size: 16px;
}

.student-info p {
  margin: 5px 0 0;
  color: #6c757d;
  font-size: 14px;
}

.enrollment-date {
  color: #6c757d;
  font-size: 14px;
}

/* Data Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 10px;
  text-align: left;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 500;
  color: #2A3B5F;
}

.data-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.status-badge.completed {
  background-color: #28a745;
}

.status-badge.pending {
  background-color: #fd7e14;
}

.status-badge.failed {
  background-color: #dc3545;
}

.status-badge.processing {
  background-color: #0d6efd;
}

.status-badge.cancelled {
  background-color: #6c757d;
}

/* Status Cards */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.status-card {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 15px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-header h4 {
  margin: 0;
  color: #2A3B5F;
  font-size: 16px;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-indicator.online {
  background-color: #28a745;
  color: white;
}

.status-indicator.offline {
  background-color: #dc3545;
  color: white;
}

.status-card p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 20px;
  color: #6c757d;
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
</style>
