<template>
  <div class="enrolled-courses-container">
    <h1>Mis Cursos</h1>
    
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando tus cursos inscritos...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadEnrolledCourses" class="btn btn-primary">
        Reintentar
      </button>
    </div>
    
    <div v-else-if="enrolledCourses.length === 0" class="no-courses">
      <p>No estás inscrito en ningún curso todavía.</p>
      <button @click="$router.push('/courses/available')" class="btn btn-primary">
        Explorar Cursos Disponibles
      </button>
    </div>
    
    <div v-else>
      <!-- Filtros para los cursos -->
      <div class="course-filters">
        <div class="filter-group">
          <label for="status-filter">Estado:</label>
          <select id="status-filter" v-model="filters.status" class="filter-select">
            <option value="all">Todos</option>
            <option value="active">En progreso</option>
            <option value="completed">Completados</option>
            <option value="dropped">Abandonados</option>
          </select>
        </div>
        
        <div class="search-filter">
          <input 
            type="text" 
            v-model="filters.search" 
            placeholder="Buscar por título..." 
            class="search-input" 
          />
        </div>
      </div>
      
      <!-- Lista de cursos -->
      <div class="courses-grid">
        <div 
          v-for="course in filteredCourses" 
          :key="course.id" 
          class="course-card"
        >
          <div class="course-status">
            <span 
              :class="{
                'status-badge': true,
                'active': course.enrollment.status === 'active',
                'completed': course.enrollment.status === 'completed',
                'dropped': course.enrollment.status === 'dropped'
              }"
            >
              {{ formatStatus(course.enrollment.status) }}
            </span>
          </div>
          
          <div class="course-header">
            <h2>{{ course.title }}</h2>
            <div class="course-badges">
              <span v-if="course.isFree" class="badge free">Gratuito</span>
              <span v-else class="badge paid">De pago</span>
            </div>
          </div>
          
          <p class="course-description">{{ truncateText(course.description, 100) }}</p>
          
          <div class="course-meta">
            <div class="meta-item">
              <i class="fas fa-tag"></i>
              <span>{{ course.category }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-user"></i>
              <span>{{ course.teacher?.name || 'Profesor no especificado' }}</span>
            </div>
          </div>
          
          <div class="course-progress">
            <div class="progress-header">
              <span>Progreso:</span>
              <span>{{ course.enrollment.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${course.enrollment.progress}%` }"
                :class="{
                  'low': course.enrollment.progress < 30,
                  'mid': course.enrollment.progress >= 30 && course.enrollment.progress < 70,
                  'high': course.enrollment.progress >= 70
                }"
              ></div>
            </div>
          </div>
          
          <div class="enrollment-info">
            <div v-if="course.enrollment.grade" class="grade-info">
              <span>Calificación: <strong>{{ course.enrollment.grade }}</strong></span>
            </div>
            <div v-if="course.enrollment.completionDate" class="completion-date">
              <span>Completado: {{ formatDate(course.enrollment.completionDate) }}</span>
            </div>
          </div>
          
          <div class="course-actions">
            <button 
              v-if="course.enrollment.status !== 'dropped'" 
              class="btn btn-primary"
              @click="goToCourse(course.id)"
            >
              {{ course.enrollment.status === 'active' ? 'Continuar' : 'Ver Curso' }}
            </button>
            
            <button 
              v-if="course.enrollment.status === 'active'" 
              class="btn btn-outline danger"
              @click="dropCourse(course.enrollment.id)"
            >
              Abandonar
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmación para abandonar curso -->
    <div v-if="showDropConfirmation" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirmar abandono</h3>
          <button class="close-button" @click="showDropConfirmation = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas abandonar este curso?</p>
          <p class="warning-text">Esta acción no se puede deshacer y perderás tu progreso actual.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDropConfirmation = false">Cancelar</button>
          <button 
            class="btn btn-danger" 
            @click="confirmDropCourse" 
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Procesando...' : 'Confirmar Abandono' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api';

export default {
  name: 'EnrolledCoursesView',
  data() {
    return {
      enrolledCourses: [],
      isLoading: true,
      error: null,
      filters: {
        status: 'all',
        search: ''
      },
      showDropConfirmation: false,
      selectedEnrollmentId: null,
      isSubmitting: false
    };
  },
  computed: {
    filteredCourses() {
      return this.enrolledCourses.filter(course => {
        // Filter by status
        if (this.filters.status !== 'all' && course.enrollment.status !== this.filters.status) {
          return false;
        }
        
        // Filter by search text
        if (this.filters.search && 
            !course.title.toLowerCase().includes(this.filters.search.toLowerCase()) &&
            !course.description.toLowerCase().includes(this.filters.search.toLowerCase())) {
          return false;
        }
        
        return true;
      });
    }
  },
  created() {
    this.loadEnrolledCourses();
  },
  methods: {
    formatStatus(status) {
      const statusMap = {
        'active': 'En progreso',
        'completed': 'Completado',
        'dropped': 'Abandonado'
      };
      
      return statusMap[status] || status;
    },
    
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-CL');
    },
    
    truncateText(text, maxLength) {
      if (!text || text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    async loadEnrolledCourses() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await api.courses.getEnrolled();
        this.enrolledCourses = response.data;
      } catch (error) {
        console.error('Error loading enrolled courses:', error);
        this.error = error.response?.data?.message || 'Error al cargar tus cursos inscritos';
      } finally {
        this.isLoading = false;
      }
    },
    
    goToCourse(courseId) {
      this.$router.push(`/courses/${courseId}`);
    },
    
    dropCourse(enrollmentId) {
      this.selectedEnrollmentId = enrollmentId;
      this.showDropConfirmation = true;
    },
    
    async confirmDropCourse() {
      if (!this.selectedEnrollmentId) return;
      
      this.isSubmitting = true;
      
      try {
        await api.enrollments.updateStatus(
          this.selectedEnrollmentId, 
          'dropped', 
          'Abandonado voluntariamente por el estudiante'
        );
        
        // Actualizar la lista de cursos
        await this.loadEnrolledCourses();
        
        // Cerrar el modal
        this.showDropConfirmation = false;
        this.selectedEnrollmentId = null;
        
        // Mostrar mensaje de éxito
        this.$toast.success('Has abandonado el curso exitosamente');
      } catch (error) {
        console.error('Error dropping course:', error);
        this.error = error.response?.data?.message || 'Error al abandonar el curso';
        this.$toast.error(this.error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.enrolled-courses-container {
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

.course-filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  min-width: 150px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 100%;
  max-width: 300px;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.course-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.course-status {
  position: absolute;
  top: 15px;
  right: 15px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.status-badge.active {
  background-color: #0d6efd;
}

.status-badge.completed {
  background-color: #28a745;
}

.status-badge.dropped {
  background-color: #dc3545;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  padding-right: 60px; /* Space for the status badge */
}

.course-header h2 {
  font-family: "Playfair Display", serif;
  color: #2A3B5F;
  font-size: 18px;
  margin: 0;
}

.course-badges {
  display: flex;
  gap: 5px;
}

.badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
}

.badge.free {
  background-color: #28a745;
}

.badge.paid {
  background-color: #0d6efd;
}

.course-description {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 15px;
}

.course-meta {
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-size: 14px;
}

.meta-item i {
  color: #6c757d;
  width: 20px;
  margin-right: 5px;
}

.course-progress {
  margin-bottom: 15px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
}

.progress-bar {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
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

.enrollment-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 14px;
}

.course-actions {
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover {
  background-color: #3AA870;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #dc3545;
  color: #dc3545;
}

.btn-outline:hover {
  background-color: #dc3545;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.loading-container, .error-message, .no-courses {
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  overflow-y: auto;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-family: "Playfair Display", serif;
  color: #2A3B5F;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
}

.warning-text {
  color: #dc3545;
  font-weight: 500;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .course-filters {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-input {
    max-width: none;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>
