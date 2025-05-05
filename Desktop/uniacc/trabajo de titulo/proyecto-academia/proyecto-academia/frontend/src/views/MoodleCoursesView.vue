<template>
  <div class="moodle-courses">
    <div class="container py-5">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="display-5 fw-bold">Cursos de Moodle</h1>
          <p class="lead text-muted">
            Explora los cursos disponibles en la plataforma Moodle de NeeWorld
          </p>
        </div>
      </div>

      <!-- Connection Test Button -->
      <div class="row mb-4">
        <div class="col-12 d-flex justify-content-end">
          <button class="btn btn-outline-secondary me-2" @click="testConnection">
            <i class="fas fa-sync-alt me-2"></i>
            Probar Conexión
          </button>
          <a href="https://neekworld.cl/NW/login/index.php" 
             target="_blank" 
             class="btn btn-primary">
            <i class="fas fa-external-link-alt me-2"></i>
            Ir a Moodle
          </a>
        </div>
      </div>

      <!-- Connection Test Results -->
      <div class="row mb-4" v-if="connectionTestResult">
        <div class="col-12">
          <div class="alert" :class="connectionTestResult.success ? 'alert-success' : 'alert-danger'">
            <h4 class="alert-heading">
              {{ connectionTestResult.success ? 'Conexión exitosa!' : 'Error de conexión' }}
            </h4>
            <p>{{ connectionTestResult.success ? 
              `Conectado a: ${connectionTestResult.siteName}` : 
              connectionTestResult.error }}</p>
            <div v-if="!connectionTestResult.success" class="mt-2">
              <p><strong>Posibles soluciones:</strong></p>
              <ul>
                <li>Verifica que el token de API Moodle sea válido</li>
                <li>Verifica que la URL de Moodle sea correcta</li>
                <li>Asegúrate de tener permisos para acceder a los cursos</li>
                <li>Verifica que el servicio web de Moodle esté habilitado</li>
              </ul>
              <button class="btn btn-sm btn-primary" @click="showDebugInfo = !showDebugInfo">
                {{ showDebugInfo ? 'Ocultar' : 'Mostrar' }} información técnica
              </button>
            </div>
            <div v-if="showDebugInfo && connectionTestResult.details" class="mt-3 p-3 bg-light">
              <pre class="mb-0">{{ JSON.stringify(connectionTestResult.details, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input 
              type="text" 
              class="form-control" 
              placeholder="Buscar cursos..." 
              v-model="searchQuery"
            >
          </div>
        </div>
        <div class="col-md-6">
          <select class="form-select" v-model="selectedCategory">
            <option value="">Todas las categorías</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row justify-content-center my-5">
        <div class="col-auto text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2">Cargando cursos de Moodle...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="row justify-content-center my-5">
        <div class="col-md-8">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">¡Error al cargar cursos!</h4>
            <p>{{ error }}</p>
            <hr>
            <p><strong>Posibles causas:</strong></p>
            <ul>
              <li>Problemas de conexión con el servidor Moodle</li>
              <li>Token de API inválido o expirado</li>
              <li>Restricciones CORS (Cross-Origin Resource Sharing)</li>
              <li>El servidor Moodle está caído o inaccesible</li>
              <li>Problemas de permisos en la cuenta Moodle</li>
            </ul>
            <hr>
            <div class="d-flex align-items-center">
              <button class="btn btn-outline-danger" @click="fetchCourses">
                <i class="fas fa-sync-alt me-2"></i>
                Reintentar
              </button>
              <button class="btn btn-link ms-3" @click="showDebugInfo = !showDebugInfo">
                {{ showDebugInfo ? 'Ocultar' : 'Mostrar' }} información técnica
              </button>
            </div>
            <div v-if="showDebugInfo" class="mt-3 p-3 bg-light">
              <pre class="mb-0 text-wrap">{{ errorDetails }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Courses Grid -->
      <div v-else class="row g-4">
        <div v-for="course in filteredCourses" :key="course.id" class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm">
            <!-- Course Image -->
            <img 
              :src="course.imageurl || defaultImage" 
              class="card-img-top course-img"
              :alt="course.fullname"
            >
            
            <!-- Course Category Badge -->
            <div class="position-absolute top-0 end-0 p-2">
              <span class="badge bg-primary">{{ getCategoryName(course.categoryid) }}</span>
            </div>
            
            <div class="card-body">
              <h5 class="card-title">{{ course.fullname }}</h5>
              <div class="card-text" v-html="truncateText(course.summary, 150)"></div>
            </div>
            
            <div class="card-footer bg-transparent border-top-0">
              <div class="d-grid gap-2">
                <a :href="getMoodleCourseUrl(course.id)" 
                   target="_blank" 
                   class="btn btn-outline-primary">
                  <i class="fas fa-external-link-alt me-2"></i>
                  Ver en Moodle
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No Results -->
        <div v-if="filteredCourses.length === 0 && courses.length > 0" class="col-12 text-center my-5">
          <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            No se encontraron cursos que coincidan con tu búsqueda.
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredCourses.length > 0" class="row mt-5">
        <div class="col-12">
          <nav aria-label="Navegación de páginas">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                  <i class="fas fa-chevron-left"></i>
                </button>
              </li>
              <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                <button class="page-link" @click="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { moodleService } from '@/api/moodleService';

export default {
  name: 'MoodleCoursesView',
  
  data() {
    return {
      courses: [],
      categories: [],
      loading: true,
      error: null,
      errorDetails: '',
      showDebugInfo: false,
      searchQuery: '',
      selectedCategory: '',
      currentPage: 1,
      itemsPerPage: 9,
      defaultImage: 'https://via.placeholder.com/300x200?text=Curso+NeeWorld',
      connectionTestResult: null
    };
  },
  
  computed: {
    filteredCourses() {
      let filtered = [...this.courses];
      
      // Apply category filter
      if (this.selectedCategory) {
        filtered = filtered.filter(course => course.categoryid === this.selectedCategory);
      }
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(course => 
          (course.fullname && course.fullname.toLowerCase().includes(query)) || 
          (course.summary && course.summary.toLowerCase().includes(query))
        );
      }
      
      // Pagination
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      
      return filtered.slice(startIndex, endIndex);
    },
    
    totalPages() {
      let filtered = [...this.courses];
      
      if (this.selectedCategory) {
        filtered = filtered.filter(course => course.categoryid === this.selectedCategory);
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(course => 
          (course.fullname && course.fullname.toLowerCase().includes(query)) || 
          (course.summary && course.summary.toLowerCase().includes(query))
        );
      }
      
      return Math.max(1, Math.ceil(filtered.length / this.itemsPerPage));
    }
  },
  
  methods: {
    async fetchCourses() {
      this.loading = true;
      this.error = null;
      this.errorDetails = '';
      
      try {
        console.log('Fetching Moodle courses...');
        // Fetch courses using the Moodle API service
        const courses = await moodleService.getCourses();
        console.log(`Successfully fetched ${courses.length} Moodle courses`);
        
        this.courses = courses.filter(course => !course.hidden);
        
        // Extract unique categories
        const categoriesMap = {};
        this.courses.forEach(course => {
          if (course.categoryid && !categoriesMap[course.categoryid]) {
            categoriesMap[course.categoryid] = {
              id: course.categoryid,
              name: course.categoryname || `Categoría ${course.categoryid}`
            };
          }
        });
        
        this.categories = Object.values(categoriesMap);
      } catch (error) {
        console.error('Error fetching Moodle courses:', error);
        this.error = error.message || 'No se pudieron cargar los cursos de Moodle. Por favor, intenta de nuevo más tarde.';
        
        // Store more detailed error information for debugging
        try {
          this.errorDetails = JSON.stringify({
            message: error.message,
            name: error.name,
            stack: error.stack,
            config: error.config ? {
              url: error.config.url,
              method: error.config.method,
              params: error.config.params
            } : 'No config available',
            response: error.response ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            } : 'No response available',
          }, null, 2);
        } catch (e) {
          this.errorDetails = 'No se pudo serializar el error para su visualización';
        }
      } finally {
        this.loading = false;
      }
    },
    
    async testConnection() {
      this.loading = true;
      this.connectionTestResult = null;
      
      try {
        console.log('Testing Moodle connection...');
        const result = await moodleService.testConnection();
        this.connectionTestResult = result;
        console.log('Connection test result:', result);
        
        if (result.success) {
          // If connection is successful, refresh courses
          await this.fetchCourses();
        }
      } catch (error) {
        console.error('Error testing connection:', error);
        this.connectionTestResult = {
          success: false,
          error: error.message || 'Error inesperado al probar la conexión',
          details: {
            message: error.message,
            stack: error.stack
          }
        };
      } finally {
        this.loading = false;
      }
    },
    
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? category.name : 'Sin categoría';
    },
    
    truncateText(text, maxLength) {
      if (!text) return '';
      
      // First strip HTML tags as they shouldn't count towards character length
      const tempElement = document.createElement('div');
      tempElement.innerHTML = text;
      const plainText = tempElement.textContent || tempElement.innerText || '';
      
      if (plainText.length <= maxLength) return text;
      
      // Find where to cut the text
      const cutPoint = plainText.lastIndexOf(' ', maxLength);
      const truncated = plainText.substring(0, cutPoint > 0 ? cutPoint : maxLength);
      
      return truncated + '...';
    },
    
    getMoodleCourseUrl(courseId) {
      return `https://neekworld.cl/NW/course/view.php?id=${courseId}`;
    }
  },
  
  created() {
    this.fetchCourses();
  },
  
  watch: {
    selectedCategory() {
      this.currentPage = 1; // Reset to first page when category changes
    },
    
    searchQuery() {
      this.currentPage = 1; // Reset to first page when search changes
    }
  }
};
</script>

<style scoped>
.moodle-courses {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.course-img {
  height: 200px;
  object-fit: cover;
}

/* Bootstrap theme customizations */
:deep(.card) {
  transition: transform 0.3s, box-shadow 0.3s;
}

:deep(.card:hover) {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.lead {
  font-size: 1.1rem;
}

/* Ensure pre tags don't overflow */
pre {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
