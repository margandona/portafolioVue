<template>
  <div class="user-dashboard">
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
            <div v-for="course in displayedCourses" :key="course.id" class="course-card">
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
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'TeacherDashboard',
  props: {
    teacherCourses: {
      type: Array,
      default: () => []
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    activeCourses: {
      type: Number,
      default: 0
    },
    recentStudents: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(['getUser']),
    userName() {
      return this.getUser?.name || '';
    },
    displayedCourses() {
      return this.teacherCourses.slice(0, 3);
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return 'No disponible';
      return new Date(date).toLocaleDateString('es-CL');
    }
  }
};
</script>

<style scoped>
.user-dashboard {
  width: 100%;
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

.student-count {
  font-size: 14px;
  color: #6c757d;
  margin: 10px 0;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}
</style>
