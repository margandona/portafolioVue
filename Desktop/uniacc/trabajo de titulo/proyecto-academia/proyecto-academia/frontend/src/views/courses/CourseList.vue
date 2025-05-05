<template>
  <div class="course-list">
    <v-container fluid>
      <!-- Encabezado con título y botón de crear -->
      <v-row class="mb-4">
        <v-col cols="12" md="8">
          <h1 class="text-h4">Cursos disponibles</h1>
          <p class="text-subtitle-1 text-grey">
            Explora nuestro catálogo de cursos y encuentra tu próximo aprendizaje
          </p>
        </v-col>
        <v-col cols="12" md="4" class="d-flex justify-end align-center">
          <v-btn 
            v-if="canCreateCourse" 
            color="primary" 
            prepend-icon="mdi-plus"
            to="/courses/create"
          >
            Crear curso
          </v-btn>
        </v-col>
      </v-row>
      
      <!-- Contenido principal -->
      <v-row>
        <!-- Filtros en el lateral -->
        <v-col cols="12" md="3" class="d-none d-md-block">
          <CourseFilter @filter-changed="applyFilters" />
        </v-col>
        
        <!-- Cursos -->
        <v-col cols="12" md="9">
          <!-- Filtros para móvil -->
          <div class="d-md-none mb-4">
            <v-expand-transition>
              <CourseFilter v-if="showMobileFilters" @filter-changed="applyFilters" />
            </v-expand-transition>
            
            <v-btn
              block
              variant="outlined"
              @click="showMobileFilters = !showMobileFilters"
              class="mb-4"
            >
              <v-icon start>{{ showMobileFilters ? 'mdi-filter-off' : 'mdi-filter' }}</v-icon>
              {{ showMobileFilters ? 'Ocultar filtros' : 'Mostrar filtros' }}
            </v-btn>
          </div>
          
          <!-- Resultados y ordenación -->
          <div class="d-flex justify-space-between align-center mb-4">
            <span class="text-body-1">{{ filteredCourses.length }} cursos encontrados</span>
          </div>
          
          <!-- Loader -->
          <div v-if="isLoading" class="d-flex justify-center my-6">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
          </div>
          
          <!-- Mensaje de error -->
          <v-alert
            v-else-if="error"
            type="error"
            class="mb-4"
          >
            {{ error }}
          </v-alert>
          
          <!-- Sin resultados -->
          <v-alert
            v-else-if="filteredCourses.length === 0"
            type="info"
            class="mb-4"
          >
            No se encontraron cursos con los filtros seleccionados
          </v-alert>
          
          <!-- Lista de cursos -->
          <v-row v-else>
            <v-col
              v-for="course in filteredCourses"
              :key="course.id"
              cols="12"
              sm="6"
              md="6"
              lg="4"
            >
              <CourseCard 
                :course="course" 
                @enroll="handleEnrollment(course)"
                @edit="navigateToEdit"
                @delete="confirmDelete"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog.show" width="500">
      <v-card>
        <v-card-title class="text-h5">
          Confirmar eliminación
        </v-card-title>
        
        <v-card-text>
          ¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="deleteDialog.show = false">
            Cancelar
          </v-btn>
          <v-btn color="error" variant="flat" @click="deleteCourse" :loading="deleteDialog.loading">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import CourseCard from '@/components/courses/CourseCard.vue';
import CourseFilter from '@/components/courses/CourseFilter.vue';
import { mapState, mapGetters, mapActions } from 'vuex';

export default {
  name: 'CourseList',
  
  components: {
    CourseCard,
    CourseFilter
  },
  
  data() {
    return {
      showMobileFilters: false,
      activeFilters: {
        search: '',
        category: 'Todas',
        showFree: false,
        showDiscounted: false,
        modality: 'all',
        sort: 'recent'
      },
      deleteDialog: {
        show: false,
        courseId: null,
        loading: false
      }
    }
  },
  
  computed: {
    ...mapState('courses', ['courses', 'loading', 'error']),
    ...mapState('auth', ['user']),
    ...mapGetters('courses', ['isLoading']),
    
    canCreateCourse() {
      return this.user && (this.user.role === 'admin' || this.user.role === 'teacher');
    },
    
    filteredCourses() {
      let result = [...this.courses];
      
      // Filtro por texto
      if (this.activeFilters.search) {
        const searchLower = this.activeFilters.search.toLowerCase();
        result = result.filter(course => 
          course.title?.toLowerCase().includes(searchLower) ||
          course.description?.toLowerCase().includes(searchLower)
        );
      }
      
      // Filtro por categoría
      if (this.activeFilters.category && this.activeFilters.category !== 'Todas') {
        result = result.filter(course => course.category === this.activeFilters.category);
      }
      
      // Filtro por cursos gratuitos
      if (this.activeFilters.showFree) {
        result = result.filter(course => course.isFree);
      }
      
      // Filtro por cursos con descuento
      if (this.activeFilters.showDiscounted) {
        result = result.filter(course => course.hasActiveDiscount);
      }
      
      // Filtro por modalidad
      if (this.activeFilters.modality !== 'all') {
        result = result.filter(course => course.modality === this.activeFilters.modality);
      }
      
      // Ordenación
      switch (this.activeFilters.sort) {
        case 'price_asc':
          result.sort((a, b) => {
            const priceA = a.hasActiveDiscount ? a.discountedTotalPrice : a.totalPrice;
            const priceB = b.hasActiveDiscount ? b.discountedTotalPrice : b.totalPrice;
            return priceA - priceB;
          });
          break;
        case 'price_desc':
          result.sort((a, b) => {
            const priceA = a.hasActiveDiscount ? a.discountedTotalPrice : a.totalPrice;
            const priceB = b.hasActiveDiscount ? b.discountedTotalPrice : b.totalPrice;
            return priceB - priceA;
          });
          break;
        case 'name_asc':
          result.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'name_desc':
          result.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case 'recent':
        default:
          // Asumimos que los cursos más recientes están primero
          break;
      }
      
      return result;
    }
  },
  
  created() {
    this.fetchAllCourses();
  },
  
  methods: {
    ...mapActions('courses', [
      'fetchAllCourses', 
      'enrollInCourse',
      'initiatePurchase',
      'deleteCourse'
    ]),
    
    applyFilters(filters) {
      this.activeFilters = { ...filters };
    },
    
    async handleEnrollment(course) {
      try {
        if (course.isFree) {
          // Para cursos gratuitos, inscribir directamente
          await this.enrollInCourse(course.id);
          this.$router.push(`/courses/${course.id}/content`);
          this.$toast.success('Te has inscrito exitosamente en el curso');
        } else {
          // Para cursos de pago, iniciar proceso de compra
          const response = await this.initiatePurchase(course.id);
          this.$router.push(response.redirectTo);
        }
      } catch (error) {
        console.error('Error en la inscripción:', error);
        this.$toast.error(error.response?.data?.message || 'Error al procesar la solicitud');
      }
    },
    
    navigateToEdit(courseId) {
      this.$router.push(`/courses/${courseId}/edit`);
    },
    
    confirmDelete(courseId) {
      this.deleteDialog.courseId = courseId;
      this.deleteDialog.show = true;
    },
    
    async deleteCourse() {
      this.deleteDialog.loading = true;
      
      try {
        await this.$store.dispatch('courses/deleteCourse', this.deleteDialog.courseId);
        this.$toast.success('Curso eliminado exitosamente');
        this.deleteDialog.show = false;
      } catch (error) {
        this.$toast.error(error.message || 'Error al eliminar el curso');
      } finally {
        this.deleteDialog.loading = false;
      }
    }
  }
}
</script>

<style scoped>
/* Estilos para la página de listado de cursos */
.course-list {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 2rem;
}

@media (max-width: 600px) {
  .course-list h1 {
    font-size: 1.75rem;
  }
}
</style>
