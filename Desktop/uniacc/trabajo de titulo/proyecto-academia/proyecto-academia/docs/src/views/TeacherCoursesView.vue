<template>
  <div class="teacher-courses-container">
    <h1>Mis Cursos (Profesor)</h1>
    
    <div class="course-actions">
      <button class="btn btn-primary" @click="goToCreateCourse">
        <i class="fas fa-plus"></i> Crear Nuevo Curso
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando cursos...</p>
    </div>

    <!-- Error message -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
      <button class="btn btn-sm btn-outline-secondary ml-2" @click="loadCourses">
        Reintentar
      </button>
    </div>

    <!-- No courses state -->
    <div v-else-if="courses.length === 0" class="no-courses">
      <p>No tienes cursos creados todavía.</p>
      <p>Crea tu primer curso haciendo clic en el botón "Crear Nuevo Curso".</p>
    </div>

    <!-- Courses list -->
    <div v-else class="courses-grid">
      <div v-for="course in courses" :key="course.id" class="course-card">
        <div class="course-header">
          <h2>{{ course.title }}</h2>
          <div class="course-badges">
            <span v-if="course.isFree" class="badge free">Gratuito</span>
            <span v-else-if="course.hasActiveDiscount" class="badge discount">{{ course.discount }}% descuento</span>
            <span v-else class="badge paid">De pago</span>
          </div>
        </div>

        <div class="course-details">
          <p class="description">{{ course.description }}</p>
          <p class="category"><strong>Categoría:</strong> {{ course.category }}</p>
          <p>
            <strong>Modalidad:</strong> {{ course.modality === 'synchronized' ? 'Sincronizada' : 'Asincrónica' }}
          </p>
          <div v-if="!course.isFree" class="price-info">
            <p class="price-label">Precio:</p>
            <div v-if="course.hasActiveDiscount" class="price-with-discount">
              <span class="original-price">${{ formatPrice(course.totalPrice) }}</span>
              <span class="current-price">${{ formatPrice(course.discountedTotalPrice) }}</span>
            </div>
            <div v-else class="price-regular">
              <span>${{ formatPrice(course.totalPrice) }}</span>
            </div>
          </div>
        </div>

        <div class="enrollment-stats" v-if="courseStats[course.id]">
          <h3>Estadísticas</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ courseStats[course.id].totalEnrollments }}</span>
              <span class="stat-label">Total inscritos</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ courseStats[course.id].activeEnrollments }}</span>
              <span class="stat-label">Activos</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ courseStats[course.id].completedEnrollments }}</span>
              <span class="stat-label">Completados</span>
            </div>
          </div>
          
          <div class="enrollment-types" v-if="!course.isFree">
            <div class="enrollment-type">
              <span class="type-label">Compras:</span>
              <span class="type-value">{{ courseStats[course.id].byEnrollmentType.paid }}</span>
            </div>
            <div class="enrollment-type">
              <span class="type-label">Asignaciones:</span>
              <span class="type-value">{{ courseStats[course.id].byEnrollmentType.assigned }}</span>
            </div>
          </div>
        </div>

        <div class="course-actions">
          <button class="btn btn-secondary" @click="viewCourseDetails(course.id)">
            Ver Detalles
          </button>
          <button class="btn btn-primary" @click="editCourse(course.id)">
            Editar Curso
          </button>
          <button v-if="!course.isFree" class="btn btn-outline" @click="manageDiscount(course)">
            {{ course.hasActiveDiscount ? 'Editar Descuento' : 'Añadir Descuento' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Discount Modal -->
    <div v-if="showDiscountModal" class="modal-overlay">
      <div class="modal-container">
        <CourseDiscountForm 
          :course="selectedCourse" 
          @success="handleDiscountSuccess" 
          @cancel="closeDiscountModal"
        />
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api';
import CourseDiscountForm from '@/components/CourseDiscountForm.vue';

export default {
  name: 'TeacherCoursesView',
  components: {
    CourseDiscountForm
  },
  data() {
    return {
      courses: [],
      courseStats: {},
      isLoading: true,
      error: null,
      showDiscountModal: false,
      selectedCourse: null
    };
  },
  async created() {
    await this.loadCourses();
  },
  methods: {
    formatPrice(price) {
      if (price === undefined || price === null) return '0';
      return Number(price).toLocaleString('es-CL');
    },
    
    async loadCourses() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await api.get('/courses', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        this.courses = response.data.courses || [];
        
        // Load enrollment stats for each course
        await this.loadCourseStats();
      } catch (error) {
        console.error('Error loading teacher courses:', error);
        this.error = error.response?.data?.message || 'Error al cargar los cursos';
      } finally {
        this.isLoading = false;
      }
    },
    
    async loadCourseStats() {
      for (const course of this.courses) {
        try {
          const response = await api.get(`/enrollments/stats/${course.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          this.$set(this.courseStats, course.id, response.data);
        } catch (error) {
          console.error(`Error loading stats for course ${course.id}:`, error);
          this.$set(this.courseStats, course.id, {
            totalEnrollments: 0,
            activeEnrollments: 0,
            completedEnrollments: 0,
            droppedEnrollments: 0,
            byEnrollmentType: { free: 0, paid: 0, assigned: 0 }
          });
        }
      }
    },
    
    goToCreateCourse() {
      this.$router.push('/courses/create');
    },
    
    viewCourseDetails(courseId) {
      this.$router.push(`/courses/${courseId}`);
    },
    
    editCourse(courseId) {
      this.$router.push(`/courses/edit/${courseId}`);
    },
    
    manageDiscount(course) {
      this.selectedCourse = course;
      this.showDiscountModal = true;
    },
    
    closeDiscountModal() {
      this.showDiscountModal = false;
      this.selectedCourse = null;
    },
    
    async handleDiscountSuccess(updatedCourse) {
      this.closeDiscountModal();
      await this.loadCourses(); // Reload all courses to get the updated data
      
      // Show success message
      alert('Descuento actualizado correctamente');
    }
  }
};
</script>

<style scoped>
.teacher-courses-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-family: "Playfair Display", serif;
  color: #2A3B5F;
  margin-bottom: 20px;
}

.course-actions {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.course-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.course-header h2 {
  font-family: "Playfair Display", serif;
  color: #2A3B5F;
  font-size: 20px;
  margin: 0;
}

.course-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: white;
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

.course-details {
  margin-bottom: 20px;
}

.description {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 14px;
  line-height: 1.5;
}

.price-info {
  margin-top: 10px;
}

.price-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.original-price {
  text-decoration: line-through;
  color: #6c757d;
  margin-right: 10px;
}

.current-price {
  font-weight: bold;
  color: #2E8B57;
  font-size: 18px;
}

.enrollment-stats {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.enrollment-stats h3 {
  font-size: 16px;
  color: #2A3B5F;
  margin-top: 0;
  margin-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #2A3B5F;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
}

.enrollment-types {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}

.enrollment-type {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.type-label {
  font-size: 12px;
  color: #6c757d;
}

.type-value {
  font-weight: bold;
  color: #2A3B5F;
}

.course-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
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

.btn-outline {
  background-color: transparent;
  border: 1px solid #2E8B57;
  color: #2E8B57;
}

.btn-outline:hover {
  background-color: rgba(46, 139, 87, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6c757d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #2E8B57;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.no-courses {
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #6c757d;
}

.alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .course-header {
    flex-direction: column;
  }
  
  .course-badges {
    margin-top: 10px;
  }
  
  .course-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
