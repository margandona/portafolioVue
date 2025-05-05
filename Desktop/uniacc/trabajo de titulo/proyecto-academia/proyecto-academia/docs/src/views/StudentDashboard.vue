<template>
  <div class="student-dashboard">
    <h1>Dashboard del Estudiante</h1>
    
    <div class="dashboard-summary">
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-book"></i>
        </div>
        <div class="summary-content">
          <h3>{{ stats.totalCourses }}</h3>
          <p>Cursos Inscritos</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="summary-content">
          <h3>{{ stats.averageProgress }}%</h3>
          <p>Progreso Promedio</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-certificate"></i>
        </div>
        <div class="summary-content">
          <h3>{{ stats.completedCourses }}</h3>
          <p>Cursos Completados</p>
        </div>
      </div>
    </div>

    <div class="dashboard-sections">
      <div class="section">
        <div class="section-header">
          <h2>Mis Cursos</h2>
          <router-link to="/enrolled" class="view-all">Ver Todos</router-link>
        </div>
        <StudentCoursesList 
          :isLoading="isLoadingCourses" 
          :courses="recentCourses" 
          @view-course="viewCourse"
        />
      </div>
      
      <div class="section">
        <div class="section-header">
          <h2>Cursos Recomendados</h2>
          <router-link to="/courses" class="view-all">Ver Todos</router-link>
        </div>
        <div v-if="isLoadingRecommendations" class="loading-section">
          <div class="spinner-small"></div>
          <p>Cargando recomendaciones...</p>
        </div>
        <div v-else-if="recommendedCourses.length === 0" class="empty-state">
          <p>No hay recomendaciones disponibles en este momento.</p>
        </div>
        <div v-else class="course-grid">
          <div v-for="course in recommendedCourses" :key="course.id" class="course-card">
            <h3 class="course-title">{{ course.title }}</h3>
            <p class="course-description">{{ truncateText(course.description, 100) }}</p>
            <div v-if="course.hasActiveDiscount" class="course-price discount">
              <span class="original-price">${{ formatPrice(course.totalPrice) }}</span>
              <span class="discount-price">${{ formatPrice(course.discountedTotalPrice) }}</span>
              <span class="discount-badge">-{{ course.discount }}%</span>
            </div>
            <div v-else-if="course.isFree" class="course-price free">
              <span>Gratis</span>
            </div>
            <div v-else class="course-price">
              <span>${{ formatPrice(course.totalPrice) }}</span>
            </div>
            <button class="btn btn-primary" @click="viewCourse(course.id)">
              Ver Detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StudentCoursesList from '@/components/StudentCoursesList.vue';
import api from '@/utils/api';
import { formatPrice } from '@/utils/apiHelper';

export default {
  name: 'StudentDashboard',
  components: {
    StudentCoursesList
  },
  props: {
    userData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      stats: {
        totalCourses: 0,
        averageProgress: 0,
        completedCourses: 0
      },
      recentCourses: [],
      recommendedCourses: [],
      isLoadingCourses: true,
      isLoadingRecommendations: true,
      error: null
    };
  },
  created() {
    this.loadDashboardData();
  },
  methods: {
    formatPrice,
    async loadDashboardData() {
      try {
        // Usar datos precargados si existen
        if (this.userData.enrolledCourses) {
          this.processEnrolledCourses(this.userData.enrolledCourses);
        } else {
          await this.loadEnrolledCourses();
        }
        
        // Cargar recomendaciones
        await this.loadRecommendedCourses();
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        this.error = error.response?.data?.message || 'Error al cargar el dashboard';
      }
    },
    
    async loadEnrolledCourses() {
      this.isLoadingCourses = true;
      try {
        const response = await api.courses.getEnrolled();
        this.processEnrolledCourses(response.data);
      } catch (error) {
        console.error('Error al cargar cursos inscritos:', error);
        throw error;
      } finally {
        this.isLoadingCourses = false;
      }
    },
    
    processEnrolledCourses(courses) {
      this.recentCourses = courses
        .sort((a, b) => {
          // Ordenar por último acceso más reciente
          const dateA = a.enrollment?.lastAccessDate ? new Date(a.enrollment.lastAccessDate) : new Date(0);
          const dateB = b.enrollment?.lastAccessDate ? new Date(b.enrollment.lastAccessDate) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 3); // Mostrar solo los 3 más recientes
      
      // Calcular estadísticas
      this.stats.totalCourses = courses.length;
      this.stats.completedCourses = courses.filter(c => 
        c.enrollment?.status === 'completed' || c.enrollment?.progress === 100
      ).length;
      
      // Calcular promedio de progreso
      let totalProgress = 0;
      let courseCount = 0;
      
      courses.forEach(course => {
        if (course.enrollment && typeof course.enrollment.progress === 'number') {
          totalProgress += course.enrollment.progress;
          courseCount++;
        }
      });
      
      this.stats.averageProgress = courseCount > 0 ? 
        Math.round(totalProgress / courseCount) : 0;
      
      this.isLoadingCourses = false;
    },
    
    async loadRecommendedCourses() {
      this.isLoadingRecommendations = true;
      try {
        const response = await api.courses.getAvailable();
        
        // Filtrar y ordenar recomendaciones (algoritmo simple)
        // En una aplicación real, esto vendría del backend con un algoritmo de recomendación más sofisticado
        this.recommendedCourses = response.data
          .filter(course => course.active !== false) // Solo cursos activos
          .sort((a, b) => {
            // Priorizar cursos con descuento
            if (a.hasActiveDiscount && !b.hasActiveDiscount) return -1;
            if (!a.hasActiveDiscount && b.hasActiveDiscount) return 1;
            // Luego ordenar por más nuevos
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          })
          .slice(0, 3); // Mostrar solo 3 recomendaciones
      } catch (error) {
        console.error('Error al cargar cursos recomendados:', error);
        this.recommendedCourses = [];
      } finally {
        this.isLoadingRecommendations = false;
      }
    },
    
    viewCourse(courseId) {
      this.$router.push(`/courses/${courseId}`);
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
.student-dashboard {
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

.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

.section {
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

.section-header h2 {
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

.loading-section,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: #6c757d;
  text-align: center;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(46, 139, 87, 0.1);
  border-radius: 50%;
  border-top-color: #2E8B57;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  padding: 20px;
}

.course-card {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.course-title {
  font-size: 16px;
  color: #2A3B5F;
  margin: 0 0 10px 0;
}

.course-description {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 15px;
  flex-grow: 1;
}

.course-price {
  margin-bottom: 15px;
  font-weight: 600;
}

.course-price.discount {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.original-price {
  text-decoration: line-through;
  color: #6c757d;
  font-size: 14px;
  margin-right: 10px;
}

.discount-price {
  color: #dc3545;
  font-size: 18px;
}

.discount-badge {
  background-color: #dc3545;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  margin-left: 10px;
}

.course-price.free {
  color: #28a745;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
  align-self: flex-start;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover {
  background-color: #3AA870;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
