<template>
  <div class="course-list-container">
    <h1>{{ title }}</h1>
    
    <div class="actions-bar">
      <div v-if="showFilters" class="filters">
        <div class="filter-group">
          <label for="category-filter">Categoría:</label>
          <select id="category-filter" v-model="filters.category" class="filter-select">
            <option value="all">Todas</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="modality-filter">Modalidad:</label>
          <select id="modality-filter" v-model="filters.modality" class="filter-select">
            <option value="all">Todas</option>
            <option value="synchronized">Sincronizada</option>
            <option value="asynchronized">Asincrónica</option>
          </select>
        </div>
        
        <div v-if="showPriceFilter" class="filter-group">
          <label for="price-filter">Precio:</label>
          <select id="price-filter" v-model="filters.price" class="filter-select">
            <option value="all">Todos</option>
            <option value="free">Gratuitos</option>
            <option value="paid">De pago</option>
            <option value="discount">Con descuento</option>
          </select>
        </div>
      </div>
      
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Buscar cursos..." 
          class="search-input" 
        />
      </div>
      
      <div v-if="showCreateButton" class="create-button">
        <button class="btn btn-primary" @click="$emit('create')">
          <i class="fas fa-plus"></i> Crear Curso
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando cursos...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="$emit('reload')" class="btn btn-primary">
        Reintentar
      </button>
    </div>
    
    <div v-else-if="filteredCourses.length === 0" class="no-courses">
      <p>No se encontraron cursos con los filtros seleccionados.</p>
      <button @click="resetFilters" class="btn btn-primary">
        Limpiar filtros
      </button>
    </div>
    
    <div v-else class="courses-grid">
      <slot 
        v-for="course in filteredCourses" 
        :key="course.id" 
        :course="course"
        name="course-item"
      >
        <!-- Default course card -->
        <div class="course-card">
          <div class="course-header">
            <h2>{{ course.title }}</h2>
            <div class="course-badges">
              <span v-if="course.isFree" class="badge free">Gratuito</span>
              <span v-else-if="course.hasActiveDiscount" class="badge discount">{{ course.discount }}% descuento</span>
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
              <i class="fas fa-user-tie"></i>
              <span>{{ course.teacher?.name || 'Profesor no especificado' }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-clock"></i>
              <span>{{ formatModality(course) }}</span>
            </div>
          </div>
          
          <div v-if="!course.isFree" class="course-price">
            <div v-if="course.hasActiveDiscount" class="price-with-discount">
              <span class="original-price">${{ formatPrice(course.totalPrice) }}</span>
              <span class="final-price">${{ formatPrice(course.discountedTotalPrice) }}</span>
            </div>
            <div v-else class="price-regular">
              <span>${{ formatPrice(course.totalPrice) }}</span>
            </div>
          </div>
          
          <div class="course-actions">
            <button 
              class="btn btn-primary"
              @click="$emit('select', course.id)"
            >
              Ver Detalle
            </button>
            
            <button 
              v-if="showEditButtons"
              class="btn btn-secondary" 
              @click="$emit('edit', course.id)"
            >
              Editar
            </button>
            
            <button 
              v-if="showDeleteButtons"
              class="btn btn-danger" 
              @click="$emit('delete', course.id)"
            >
              Eliminar
            </button>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CourseListView',
  props: {
    courses: {
      type: Array,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: 'Cursos'
    },
    showFilters: {
      type: Boolean,
      default: true
    },
    showPriceFilter: {
      type: Boolean,
      default: true
    },
    showCreateButton: {
      type: Boolean,
      default: false
    },
    showEditButtons: {
      type: Boolean,
      default: false
    },
    showDeleteButtons: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchQuery: '',
      filters: {
        category: 'all',
        modality: 'all',
        price: 'all'
      }
    };
  },
  computed: {
    categories() {
      // Extract unique categories from courses
      const uniqueCategories = new Set(this.courses.map(course => course.category));
      return Array.from(uniqueCategories).filter(Boolean).sort();
    },
    filteredCourses() {
      return this.courses.filter(course => {
        // Filter by search query
        if (this.searchQuery && 
            !course.title.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
            !course.description.toLowerCase().includes(this.searchQuery.toLowerCase())) {
          return false;
        }
        
        // Filter by category
        if (this.filters.category !== 'all' && course.category !== this.filters.category) {
          return false;
        }
        
        // Filter by modality
        if (this.filters.modality !== 'all' && course.modality !== this.filters.modality) {
          return false;
        }
        
        // Filter by price
        if (this.filters.price === 'free' && !course.isFree) {
          return false;
        } else if (this.filters.price === 'paid' && course.isFree) {
          return false;
        } else if (this.filters.price === 'discount' && 
                  (!course.hasActiveDiscount || course.isFree)) {
          return false;
        }
        
        return true;
      });
    }
  },
  methods: {
    formatPrice(price) {
      if (price === undefined || price === null) return '0';
      return Number(price).toLocaleString('es-CL');
    },
    
    formatModality(course) {
      if (course.modality === 'synchronized') {
        return `Sincronizada (${this.formatDate(course.start_date)} - ${this.formatDate(course.end_date)})`;
      } else {
        return `Asincrónica (${course.duration_days} días)`;
      }
    },
    
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-CL');
    },
    
    truncateText(text, maxLength) {
      if (!text || text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },
    
    resetFilters() {
      this.searchQuery = '';
      this.filters = {
        category: 'all',
        modality: 'all',
        price: 'all'
      };
    }
  }
};
</script>

<style scoped>
.course-list-container {
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

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
}

.filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.search-box {
  flex-grow: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
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

.badge.discount {
  background-color: #fd7e14;
}

.course-description {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 15px;
  min-height: 60px;
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

.course-price {
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 500;
}

.price-with-discount {
  display: flex;
  align-items: center;
  gap: 10px;
}

.original-price {
  text-decoration: line-through;
  color: #6c757d;
  font-size: 14px;
}

.final-price {
  color: #2E8B57;
}

.course-actions {
  display: flex;
  gap: 10px;
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

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
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

@media (max-width: 768px) {
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .search-box {
    max-width: none;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
}
</style>
