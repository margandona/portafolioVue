<template>
  <div class="available-courses-page">
    <h1>Cursos Disponibles</h1>
    
    <div class="filters-container">
      <div class="search-filter">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar cursos..." 
          class="search-input" 
        />
      </div>
      
      <div class="filter-options">
        <div class="filter-group">
          <label>Modalidad:</label>
          <select v-model="modalityFilter" class="filter-select">
            <option value="all">Todas</option>
            <option value="synchronized">Sincronizada</option>
            <option value="asynchronized">Asincrónica</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Categoría:</label>
          <select v-model="categoryFilter" class="filter-select">
            <option value="all">Todas</option>
            <option v-for="category in availableCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Precio:</label>
          <select v-model="priceFilter" class="filter-select">
            <option value="all">Todos</option>
            <option value="free">Gratuitos</option>
            <option value="paid">De pago</option>
            <option value="discount">Con descuento</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Loading indicator -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando cursos disponibles...</p>
    </div>
    
    <!-- Error message -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="loadCourses" class="btn btn-primary">Reintentar</button>
    </div>
    
    <!-- No courses found -->
    <div v-else-if="filteredCourses.length === 0" class="no-courses">
      <p>No se encontraron cursos disponibles con los filtros actuales.</p>
      <button @click="resetFilters" class="btn btn-primary">Limpiar filtros</button>
    </div>
    
    <!-- Courses list -->
    <div v-else class="courses-grid">
      <div v-for="course in filteredCourses" :key="course.id" class="course-card">
        <div class="course-header">
          <span v-if="course.isFree" class="course-badge free">GRATIS</span>
          <span v-else-if="course.hasActiveDiscount" class="course-badge discount">
            {{ course.discount }}% DCTO
          </span>
        </div>
        
        <h2 class="course-title">{{ course.title }}</h2>
        <p class="course-description">{{ course.description }}</p>
        
        <div class="course-meta">
          <div class="course-category">
            <i class="fas fa-tag"></i> {{ course.category }}
          </div>
          <div class="course-modality">
            <i class="fas fa-clock"></i>
            {{ course.modality === 'synchronized' ? 'Sincronizado' : 'Asincrónico' }}
          </div>
        </div>
        
        <div class="course-price" v-if="!course.isFree">
          <div v-if="course.hasActiveDiscount" class="discounted-price">
            <span class="original-price">${{ formatPrice(course.totalPrice) }}</span>
            <span class="final-price">${{ formatPrice(course.discountedTotalPrice) }}</span>
          </div>
          <div v-else class="regular-price">
            <span class="final-price">${{ formatPrice(course.totalPrice) }}</span>
          </div>
        </div>
        <div v-else class="free-label">Curso Gratuito</div>
        
        <div class="course-actions">
          <button class="btn btn-primary" @click="enrollOrPurchase(course)">
            {{ course.isFree ? 'Inscribirse' : 'Comprar Ahora' }}
          </button>
          <button class="btn btn-secondary" @click="viewCourseDetails(course.id)">
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
    
    <!-- Purchase Modal -->
    <div v-if="showPurchaseConfirm" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirmar Compra</h3>
          <button class="close-button" @click="showPurchaseConfirm = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Estás a punto de comprar:</p>
          <h4>{{ selectedCourse.title }}</h4>
          
          <div class="purchase-price">
            <p><strong>Precio:</strong></p>
            <div v-if="selectedCourse.hasActiveDiscount" class="discounted-price">
              <span class="original-price">${{ formatPrice(selectedCourse.totalPrice) }}</span>
              <span class="final-price">${{ formatPrice(selectedCourse.discountedTotalPrice) }}</span>
            </div>
            <div v-else class="regular-price">
              <span class="final-price">${{ formatPrice(selectedCourse.totalPrice) }}</span>
            </div>
          </div>
          
          <p class="confirmation-message">¿Deseas proceder al pago?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showPurchaseConfirm = false">Cancelar</button>
          <button class="btn btn-primary" @click="proceedWithPurchase" :disabled="isPurchasing">
            {{ isPurchasing ? 'Procesando...' : 'Confirmar Compra' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api';
import { formatPrice } from '@/utils/apiHelper';

export default {
  name: 'AvailableCoursesView',
  data() {
    return {
      courses: [],
      isLoading: true,
      error: null,
      searchQuery: '',
      modalityFilter: 'all',
      categoryFilter: 'all',
      priceFilter: 'all',
      showPurchaseConfirm: false,
      selectedCourse: null,
      isPurchasing: false
    };
  },
  computed: {
    availableCategories() {
      // Extract unique categories from courses
      const categories = new Set(this.courses.map(course => course.category));
      return Array.from(categories);
    },
    filteredCourses() {
      return this.courses.filter(course => {
        // Search filter
        if (this.searchQuery && !course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
            !course.description.toLowerCase().includes(this.searchQuery.toLowerCase())) {
          return false;
        }
        
        // Modality filter
        if (this.modalityFilter !== 'all' && course.modality !== this.modalityFilter) {
          return false;
        }
        
        // Category filter
        if (this.categoryFilter !== 'all' && course.category !== this.categoryFilter) {
          return false;
        }
        
        // Price filter
        if (this.priceFilter === 'free' && !course.isFree) {
          return false;
        } else if (this.priceFilter === 'paid' && course.isFree) {
          return false;
        } else if (this.priceFilter === 'discount' && (!course.hasActiveDiscount || course.isFree)) {
          return false;
        }
        
        return true;
      });
    }
  },
  async created() {
    await this.loadCourses();
  },
  methods: {
    formatPrice,
    async loadCourses() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await api.get('/courses/available', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        this.courses = response.data || [];
      } catch (error) {
        console.error('Error loading available courses:', error);
        this.error = error.response?.data?.message || 'Error al cargar los cursos disponibles';
      } finally {
        this.isLoading = false;
      }
    },
    resetFilters() {
      this.searchQuery = '';
      this.modalityFilter = 'all';
      this.categoryFilter = 'all';
      this.priceFilter = 'all';
    },
    viewCourseDetails(courseId) {
      this.$router.push(`/courses/${courseId}`);
    },
    enrollOrPurchase(course) {
      if (course.isFree) {
        this.enrollInFreeCourse(course.id);
      } else {
        this.selectedCourse = course;
        this.showPurchaseConfirm = true;
      }
    },
    async enrollInFreeCourse(courseId) {
      try {
        this.isLoading = true;
        await api.post('/enrollments', { courseId }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        alert('¡Te has inscrito exitosamente en el curso gratuito!');
        
        // Remove the enrolled course from available courses
        this.courses = this.courses.filter(course => course.id !== courseId);
      } catch (error) {
        console.error('Error enrolling in free course:', error);
        alert(error.response?.data?.message || 'Error al inscribirse en el curso');
      } finally {
        this.isLoading = false;
      }
    },
    async proceedWithPurchase() {
      try {
        this.isPurchasing = true;
        
        const response = await api.post(`/courses/${this.selectedCourse.id}/purchase`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        this.showPurchaseConfirm = false;
        
        // Redirect to checkout page
        if (response.data.redirectTo) {
          this.$router.push(response.data.redirectTo);
        } else if (response.data.saleId) {
          this.$router.push(`/checkout/${response.data.saleId}`);
        } else {
          throw new Error('No se recibió información de pago');
        }
      } catch (error) {
        console.error('Error initiating purchase:', error);
        alert(error.response?.data?.message || 'Error al iniciar el proceso de compra');
      } finally {
        this.isPurchasing = false;
      }
    }
  }
};
</script>

<style scoped>
.available-courses-page {
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

.filters-container {
  margin-bottom: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.search-filter {
  margin-bottom: 15px;
}

.search-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-group {
  flex: 1;
  min-width: 180px;
}

.filter-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.filter-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.course-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  padding: 20px;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.course-header {
  position: relative;
  height: 30px;
  margin-bottom: 10px;
}

.course-badge {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.course-badge.free {
  background-color: #28a745;
}

.course-badge.discount {
  background-color: #fd7e14;
}

.course-title {
  font-family: "Playfair Display", serif;
  color: #2A3B5F;
  font-size: 18px;
  margin-bottom: 10px;
}

.course-description {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 15px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  min-height: 63px;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 14px;
  color: #495057;
}

.course-meta i {
  margin-right: 5px;
}

.course-price {
  margin: 15px 0;
}

.discounted-price {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.original-price {
  text-decoration: line-through;
  color: #6c757d;
  font-size: 14px;
}

.final-price {
  font-weight: bold;
  color: #2E8B57;
  font-size: 22px;
}

.regular-price {
  text-align: center;
}

.free-label {
  text-align: center;
  color: #28a745;
  font-size: 18px;
  font-weight: bold;
  margin: 15px 0;
}

.course-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
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

.loading-container, .no-courses, .error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
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

.error-message {
  color: #dc3545;
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
  overflow: hidden;
}

.modal-header {
  padding: 15px 20px;
  background-color: #f8f9fa;
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
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 20px;
}

.modal-body h4 {
  margin-top: 0;
  color: #2A3B5F;
}

.purchase-price {
  margin: 15px 0;
  text-align: center;
}

.confirmation-message {
  text-align: center;
  font-weight: 500;
  margin-top: 20px;
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .filter-options {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-group {
    min-width: 100%;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .course-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
