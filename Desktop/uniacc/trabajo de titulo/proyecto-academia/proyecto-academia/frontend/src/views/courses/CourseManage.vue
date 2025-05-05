<template>
  <div class="course-manage pa-4">
    <v-container>
      <div class="d-flex align-center mb-4">
        <h1 class="text-h4">Gestión de Cursos</h1>
        <v-spacer></v-spacer>
        <v-btn color="primary" :to="{ name: 'CreateCourse' }">
          <v-icon left>mdi-plus</v-icon>
          Crear Curso
        </v-btn>
      </div>
      
      <!-- Filtros y búsqueda -->
      <CourseManageFilters 
        :categories="courseCategories" 
        @filter-change="applyFilters"
      />
      
      <v-card class="mb-4">
        <v-card-title>
          Mis Cursos
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Buscar"
            single-line
            hide-details
            density="compact"
          ></v-text-field>
        </v-card-title>
        
        <!-- Tabla de cursos -->
        <CourseManageTable 
          :courses="filteredCourses" 
          :loading="isLoading"
          @delete-course="showDeleteDialog"
          @toggle-publish="togglePublishStatus"
          @show-discount="showDiscountDialog"
          @show-access="showAccessDialog"
          @edit-course="openEditModal"
        />
      </v-card>
      
      <!-- Modal de edición -->
      <CourseEditModal
        v-model="showEditModal"
        :course="selectedCourse"
        @updated="handleCourseUpdated"
        @success="showSnackbar"
        @error="showErrorSnackbar"
        @close="handleModalClose"
      />
      
      <!-- Diálogo de confirmación de eliminación -->
      <DeleteCourseDialog
        v-model="showDeleteModal"
        :course="selectedCourse"
        :loading="isDeleteLoading"
        @confirm="confirmDeleteCourse"
      />
      
      <!-- Diálogo de gestión de descuentos -->
      <DiscountCourseDialog
        v-model="showDiscountModal"
        :course="selectedCourse"
        :loading="isDiscountLoading"
        @apply-discount="applyDiscount"
        @remove-discount="removeDiscount"
      />
      
      <!-- Diálogo para asignar acceso gratuito -->
      <AssignAccessDialog
        v-model="showAccessModal"
        :course="selectedCourse"
        :loading="isAccessLoading"
        @assign-access="assignAccess"
      />
      
      <!-- Snackbar para mensajes -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="snackbar.timeout"
      >
        {{ snackbar.text }}
        <template v-slot:actions>
          <v-btn
            variant="text"
            @click="snackbar.show = false"
          >
            Cerrar
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import CourseManageFilters from '@/components/courses/CourseManageFilters.vue';
import CourseManageTable from '@/components/courses/CourseManageTable.vue';
import CourseEditModal from '@/components/courses/CourseEditModal.vue';
import DeleteCourseDialog from '@/components/courses/DeleteCourseDialog.vue';
import DiscountCourseDialog from '@/components/courses/DiscountCourseDialog.vue';
import AssignAccessDialog from '@/components/courses/AssignAccessDialog.vue';
import { formatPrice } from '@/utils/courseUtils';

export default {
  name: 'CourseManage',
  
  components: {
    CourseManageFilters,
    CourseManageTable,
    CourseEditModal,
    DeleteCourseDialog,
    DiscountCourseDialog,
    AssignAccessDialog
  },
  
  data() {
    return {
      search: '',
      showEditModal: false,
      showDeleteModal: false,
      showDiscountModal: false,
      showAccessModal: false,
      selectedCourse: null,
      isDeleteLoading: false,
      isDiscountLoading: false,
      isAccessLoading: false,
      filterCriteria: {
        searchQuery: '',
        status: 'all',
        category: 'all',
        sort: 'recent',
        onlyDiscounted: false,
        onlyPublished: false
      },
      snackbar: {
        show: false,
        text: '',
        color: 'success',
        timeout: 3000
      }
    };
  },
  
  computed: {
    ...mapState({
      courses: state => state.courses.teacherCourses,
    }),
    
    ...mapGetters({
      isLoading: 'courses/isLoading',
      error: 'courses/error',
    }),
    
    ...mapGetters('courses', ['courseCategories']),
    
    filteredCourses() {
      if (!this.courses) return [];
      
      let filtered = [...this.courses];
      
      // Aplicar filtros
      if (this.filterCriteria.searchQuery) {
        const query = this.filterCriteria.searchQuery.toLowerCase();
        filtered = filtered.filter(course => 
          course.title?.toLowerCase().includes(query) || 
          course.description?.toLowerCase().includes(query)
        );
      }
      
      if (this.filterCriteria.category !== 'all') {
        filtered = filtered.filter(course => course.category === this.filterCriteria.category);
      }
      
      if (this.filterCriteria.status !== 'all') {
        const isPublished = this.filterCriteria.status === 'published';
        filtered = filtered.filter(course => course.isPublished === isPublished);
      }
      
      if (this.filterCriteria.onlyDiscounted) {
        filtered = filtered.filter(course => course.hasActiveDiscount);
      }
      
      if (this.filterCriteria.onlyPublished) {
        filtered = filtered.filter(course => course.isPublished);
      }
      
      // Aplicar ordenamiento
      switch (this.filterCriteria.sort) {
        case 'name_asc':
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'name_desc':
          filtered.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case 'students_desc':
          filtered.sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0));
          break;
        case 'recent':
        default:
          filtered.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA;
          });
          break;
      }
      
      // Aplicar búsqueda general (independiente de los filtros)
      if (this.search) {
        const query = this.search.toLowerCase();
        filtered = filtered.filter(course => 
          course.title?.toLowerCase().includes(query) || 
          course.description?.toLowerCase().includes(query) ||
          course.category?.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    }
  },
  
  created() {
    this.fetchTeacherCourses();
  },
  
  methods: {
    ...mapActions('courses', [
      'fetchTeacherCourses',
      'updateCourse',
      'deleteCourse',
      'applyCourseDiscount',
      'removeCourseDiscount',
      'assignFreeCourseAccess'
    ]),
    
    formatPrice,
    
    applyFilters(filters) {
      this.filterCriteria = { ...filters };
    },
    
    openEditModal(course) {
      this.selectedCourse = course;
      this.showEditModal = true;
    },
    
    handleCourseUpdated() {
      // Refrescar la lista de cursos después de actualizar
      this.fetchTeacherCourses();
    },
    
    handleModalClose() {
      this.selectedCourse = null;
    },
    
    showDeleteDialog(course) {
      this.selectedCourse = course;
      this.showDeleteModal = true;
    },
    
    async confirmDeleteCourse() {
      this.isDeleteLoading = true;
      
      try {
        await this.deleteCourse(this.selectedCourse.id);
        this.showSnackbar('Curso eliminado correctamente');
        this.showDeleteModal = false;
        this.selectedCourse = null;
      } catch (error) {
        this.showErrorSnackbar(error.message || 'Error al eliminar el curso');
      } finally {
        this.isDeleteLoading = false;
      }
    },
    
    async togglePublishStatus(course) {
      try {
        await this.updateCourse({
          courseId: course.id,
          courseData: { isPublished: !course.isPublished }
        });
        
        this.showSnackbar(`Curso ${course.isPublished ? 'despublicado' : 'publicado'} correctamente`);
        this.fetchTeacherCourses();
      } catch (error) {
        this.showErrorSnackbar(error.message || 'Error al cambiar el estado de publicación');
      }
    },
    
    showDiscountDialog(course) {
      this.selectedCourse = course;
      this.showDiscountModal = true;
    },
    
    showAccessDialog(course) {
      this.selectedCourse = course;
      this.showAccessModal = true;
    },
    
    async applyDiscount(discountData) {
      this.isDiscountLoading = true;
      
      try {
        await this.applyCourseDiscount({
          courseId: this.selectedCourse.id,
          discountData
        });
        this.showSnackbar('Descuento aplicado correctamente');
        this.showDiscountModal = false;
        this.fetchTeacherCourses();
      } catch (error) {
        this.showErrorSnackbar(error.message || 'Error al aplicar el descuento');
      } finally {
        this.isDiscountLoading = false;
      }
    },
    
    async removeDiscount() {
      this.isDiscountLoading = true;
      
      try {
        await this.removeCourseDiscount(this.selectedCourse.id);
        this.showSnackbar('Descuento eliminado correctamente');
        this.showDiscountModal = false;
        this.fetchTeacherCourses();
      } catch (error) {
        this.showErrorSnackbar(error.message || 'Error al eliminar el descuento');
      } finally {
        this.isDiscountLoading = false;
      }
    },
    
    async assignAccess(accessData) {
      this.isAccessLoading = true;
      
      try {
        await this.assignFreeCourseAccess({
          courseId: this.selectedCourse.id,
          userId: accessData.userId,
          reason: accessData.reason
        });
        this.showSnackbar('Acceso asignado correctamente');
        this.showAccessModal = false;
      } catch (error) {
        this.showErrorSnackbar(error.message || 'Error al asignar acceso');
      } finally {
        this.isAccessLoading = false;
      }
    },
    
    showSnackbar(text) {
      this.snackbar = {
        show: true,
        text,
        color: 'success',
        timeout: 3000
      };
    },
    
    showErrorSnackbar(text) {
      this.snackbar = {
        show: true,
        text,
        color: 'error',
        timeout: 5000
      };
    }
  }
};
</script>

<style scoped>
.course-manage {
  background-color: #f5f5f5;
  min-height: calc(100vh - 64px);
}
</style>
