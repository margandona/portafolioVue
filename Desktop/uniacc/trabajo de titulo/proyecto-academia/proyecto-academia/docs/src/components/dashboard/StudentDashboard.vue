<template>
  <div class="user-dashboard">
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
</template>

<script>
import { mapGetters } from 'vuex';
import { formatPrice } from '@/utils/apiHelper';

export default {
  name: 'StudentDashboard',
  props: {
    enrolledCourses: {
      type: Array,
      default: () => []
    },
    recentEnrollments: {
      type: Array,
      default: () => []
    },
    recommendedCourses: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(['getUser']),
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
  methods: {
    formatPrice,
    formatDate(date) {
      if (!date) return 'No disponible';
      return new Date(date).toLocaleDateString('es-CL');
    },
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}
</style>
