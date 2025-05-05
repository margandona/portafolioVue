<template>
  <div class="enrollment-list-container">
    <h1>Gestión de Inscripciones</h1>
    
    <!-- Filtros -->
    <div class="filters-container">
      <div class="filter-group">
        <label for="status-filter">Estado:</label>
        <select id="status-filter" v-model="filters.status" class="filter-select">
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="completed">Completados</option>
          <option value="dropped">Abandonados</option>
        </select>
      </div>
      
      <div class="filter-group" v-if="isAdmin">
        <label for="course-filter">Curso:</label>
        <select id="course-filter" v-model="filters.courseId" class="filter-select">
          <option value="all">Todos</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">
            {{ course.title }}
          </option>
        </select>
      </div>
      
      <div class="search-box">
        <input 
          type="text" 
          v-model="filters.search" 
          placeholder="Buscar por estudiante..." 
          class="search-input" 
        />
      </div>
    </div>
    
    <!-- Tabla de inscripciones -->
    <div class="enrollments-table-container">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Cargando inscripciones...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="loadEnrollments" class="btn btn-primary">
          Reintentar
        </button>
      </div>
      
      <div v-else-if="filteredEnrollments.length === 0" class="no-enrollments">
        <p>No se encontraron inscripciones con los criterios seleccionados.</p>
      </div>
      
      <table v-else class="enrollments-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Estudiante</th>
            <th>Curso</th>
            <th>Progreso</th>
            <th>Fecha de Inicio</th>
            <th>Estado</th>
            <th>Calificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="enrollment in filteredEnrollments" :key="enrollment.id" :class="getRowClass(enrollment)">
            <td>{{ enrollment.id }}</td>
            <td>{{ enrollment.user?.name || 'No disponible' }}</td>
            <td>{{ enrollment.course?.title || 'No disponible' }}</td>
            <td>
              <div class="progress-container">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: `${enrollment.progress || 0}%` }"
                    :class="getProgressClass(enrollment.progress)"
                  ></div>
                </div>
                <span class="progress-text">{{ enrollment.progress || 0 }}%</span>
              </div>
            </td>
            <td>{{ formatDate(enrollment.startDate) }}</td>
            <td>
              <span :class="`status-badge ${enrollment.status}`">
                {{ formatStatus(enrollment.status) }}
              </span>
            </td>
            <td>{{ enrollment.grade || 'N/A' }}</td>
            <td class="actions">
              <button 
                class="btn-action view" 
                @click="viewDetails(enrollment)"
                title="Ver detalles"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button 
                v-if="canGradeEnrollment(enrollment)"
                class="btn-action grade" 
                @click="openGradeModal(enrollment)"
                title="Calificar"
              >
                <i class="fas fa-star"></i>
              </button>
              <button 
                v-if="isAdmin"
                class="btn-action delete" 
                @click="confirmDelete(enrollment)"
                title="Eliminar"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Modal de Calificación -->
    <div v-if="showGradeModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Calificar Estudiante</h3>
          <button class="close-button" @click="showGradeModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p><strong>Estudiante:</strong> {{ selectedEnrollment?.user?.name }}</p>
          <p><strong>Curso:</strong> {{ selectedEnrollment?.course?.title }}</p>
          
          <div class="form-group">
            <label for="grade">Calificación (0-100):</label>
            <input 
              type="number" 
              id="grade" 
              v-model="gradeForm.grade" 
              min="0" 
              max="100" 
              class="form-control"
            >
          </div>
          
          <div class="form-group">
            <label for="certificate">
              <input 
                type="checkbox" 
                id="certificate" 
                v-model="gradeForm.certificateIssued"
              > 
              Emitir certificado
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showGradeModal = false">Cancelar</button>
          <button 
            class="btn btn-primary" 
            @click="submitGrade"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Guardando...' : 'Guardar Calificación' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de Confirmación de Eliminación -->
    <div v-if="showDeleteConfirmation" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Confirmar Eliminación</h3>
          <button class="close-button" @click="showDeleteConfirmation = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar esta inscripción?</p>
          <p class="warning-text">Esta acción es irreversible y eliminará todos los datos de progreso del estudiante.</p>
          
          <div class="enrollment-info">
            <p><strong>Estudiante:</strong> {{ selectedEnrollment?.user?.name }}</p>
            <p><strong>Curso:</strong> {{ selectedEnrollment?.course?.title }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteConfirmation = false">Cancelar</button>
          <button 
            class="btn btn-danger" 
            @click="deleteEnrollment"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Eliminando...' : 'Eliminar Inscripción' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import api from '@/utils/api';

export default {
  name: 'EnrollmentListView',
  data() {
    return {
      enrollments: [],
      courses: [],
      isLoading: true,
      error: null,
      filters: {
        status: 'all',
        courseId: 'all',
        search: ''
      },
      showGradeModal: false,
      showDeleteConfirmation: false,
      selectedEnrollment: null,
      gradeForm: {
        grade: null,
        certificateIssued: false
      },
      isSubmitting: false
    };
  },
  computed: {
    ...mapGetters(['userRole']),
    
    isAdmin() {
      return this.userRole === 'admin';
    },
    
    isTeacher() {
      return this.userRole === 'teacher';
    },
    
    filteredEnrollments() {
      return this.enrollments.filter(enrollment => {
        // Filtrar por estado
        if (this.filters.status !== 'all' && enrollment.status !== this.filters.status) {
          return false;
        }
        
        // Filtrar por curso
        if (this.filters.courseId !== 'all' && enrollment.courseId !== this.filters.courseId) {
          return false;
        }
        
        // Filtrar por búsqueda (nombre de estudiante)
        if (this.filters.search && enrollment.user) {
          const searchLower = this.filters.search.toLowerCase();
          const studentName = enrollment.user.name?.toLowerCase() || '';
          const studentEmail = enrollment.user.email?.toLowerCase() || '';
          
          if (!studentName.includes(searchLower) && !studentEmail.includes(searchLower)) {
            return false;
          }
        }
        
        return true;
      });
    }
  },
  created() {
    this.loadEnrollments();
    this.loadCourses();
  },
  methods: {
    async loadEnrollments() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // Para administradores y profesores, cargar con relaciones
        const params = {
          includeRelations: true
        };
        
        const response = await api.enrollments.getAll(params);
        this.enrollments = response.data || [];
      } catch (error) {
        console.error('Error al cargar inscripciones:', error);
        this.error = error.response?.data?.message || 'Error al cargar las inscripciones';
      } finally {
        this.isLoading = false;
      }
    },
    
    async loadCourses() {
      try {
        // Usar el rol específico para obtener cursos
        let response;
        
        if (this.isAdmin) {
          response = await api.courses.getAll();
        } else if (this.isTeacher) {
          response = await api.courses.getByTeacher();
        } else {
          return; // Para estudiantes no necesitamos esta lista
        }
        
        this.courses = response.data || [];
      } catch (error) {
        console.error('Error al cargar cursos:', error);
      }
    },
    
    formatDate(date) {
      if (!date) return 'No disponible';
      return new Date(date).toLocaleDateString('es-CL');
    },
    
    formatStatus(status) {
      const statuses = {
        'active': 'Activo',
        'completed': 'Completado',
        'dropped': 'Abandonado'
      };
      
      return statuses[status] || status;
    },
    
    getRowClass(enrollment) {
      return {
        'row-completed': enrollment.status === 'completed',
        'row-dropped': enrollment.status === 'dropped'
      };
    },
    
    getProgressClass(progress) {
      if (progress < 30) return 'low';
      if (progress < 70) return 'mid';
      return 'high';
    },
    
    viewDetails(enrollment) {
      // Guardar la inscripción seleccionada en el store o navegar a una página de detalles
      this.$router.push(`/enrollments/${enrollment.id}`);
    },
    
    canGradeEnrollment(enrollment) {
      // Solo profesores y administradores pueden calificar
      if (this.isAdmin) return true;
      
      if (this.isTeacher) {
        // Verificar si el profesor está asociado al curso
        const isTeacherOfCourse = enrollment.course?.teacherId === this.$store.getters.userId;
        return isTeacherOfCourse;
      }
      
      return false;
    },
    
    openGradeModal(enrollment) {
      this.selectedEnrollment = enrollment;
      this.gradeForm = {
        grade: enrollment.grade || 0,
        certificateIssued: enrollment.certificateIssued || false
      };
      this.showGradeModal = true;
    },
    
    async submitGrade() {
      if (!this.selectedEnrollment) return;
      
      this.isSubmitting = true;
      
      try {
        await api.enrollments.updateGrade(
          this.selectedEnrollment.id, 
          this.gradeForm.grade, 
          this.gradeForm.certificateIssued
        );
        
        // Actualizar el enrollment en la lista
        const index = this.enrollments.findIndex(e => e.id === this.selectedEnrollment.id);
        if (index !== -1) {
          this.enrollments[index].grade = this.gradeForm.grade;
          this.enrollments[index].certificateIssued = this.gradeForm.certificateIssued;
        }
        
        // Cerrar el modal
        this.showGradeModal = false;
        this.selectedEnrollment = null;
        
        // Notificar éxito
        this.$toast.success('Calificación guardada correctamente');
      } catch (error) {
        console.error('Error al guardar calificación:', error);
        this.$toast.error(error.response?.data?.message || 'Error al guardar la calificación');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    confirmDelete(enrollment) {
      this.selectedEnrollment = enrollment;
      this.showDeleteConfirmation = true;
    },
    
    async deleteEnrollment() {
      if (!this.selectedEnrollment) return;
      
      this.isSubmitting = true;
      
      try {
        await api.enrollments.delete(this.selectedEnrollment.id);
        
        // Eliminar de la lista local
        this.enrollments = this.enrollments.filter(e => e.id !== this.selectedEnrollment.id);
        
        // Cerrar el modal
        this.showDeleteConfirmation = false;
        this.selectedEnrollment = null;
        
        // Notificar éxito
        this.$toast.success('Inscripción eliminada correctamente');
      } catch (error) {
        console.error('Error al eliminar inscripción:', error);
        this.$toast.error(error.response?.data?.message || 'Error al eliminar la inscripción');
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.enrollment-list-container {
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

/* Filters */
.filters-container {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 200px;
}

.filter-group label {
  font-weight: 500;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  flex-grow: 1;
}

.search-box {
  flex-grow: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

/* Table */
.enrollments-table-container {
  margin-top: 20px;
  overflow-x: auto;
}

.enrollments-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

.enrollments-table th,
.enrollments-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.enrollments-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2A3B5F;
}

.enrollments-table tbody tr:hover {
  background-color: #f5f5f5;
}

.row-completed {
  background-color: rgba(40, 167, 69, 0.05);
}

.row-dropped {
  background-color: rgba(220, 53, 69, 0.05);
}

/* Progress bar */
.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.progress-bar {
  flex-grow: 1;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
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

.progress-text {
  min-width: 40px;
  text-align: right;
  font-size: 14px;
  font-weight: 500;
}

/* Status badges */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  min-width: 80px;
}

.status-badge.active {
  background-color: #0d6efd;
  color: white;
}

.status-badge.completed {
  background-color: #28a745;
  color: white;
}

.status-badge.dropped {
  background-color: #dc3545;
  color: white;
}

/* Action buttons */
.actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-action.view {
  background-color: #6c757d;
  color: white;
}

.btn-action.view:hover {
  background-color: #5a6268;
}

.btn-action.grade {
  background-color: #ffc107;
  color: #212529;
}

.btn-action.grade:hover {
  background-color: #e0a800;
}

.btn-action.delete {
  background-color: #dc3545;
  color: white;
}

.btn-action.delete:hover {
  background-color: #c82333;
}

/* Loading and empty states */
.loading, .no-enrollments, .error-message {
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
  border: 4px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #2E8B57;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
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
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2A3B5F;
  font-family: "Playfair Display", serif;
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

.modal-body .form-group {
  margin-bottom: 15px;
}

.modal-body label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.modal-body input[type="number"],
.modal-body input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.modal-body input[type="checkbox"] {
  margin-right: 8px;
}

.warning-text {
  color: #dc3545;
  font-weight: 500;
  margin-bottom: 20px;
}

.enrollment-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

.btn-primary:hover:not(:disabled) {
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

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
  }
  
  .filter-group, .search-box {
    width: 100%;
  }
  
  .enrollments-table th:nth-child(1),
  .enrollments-table td:nth-child(1),
  .enrollments-table th:nth-child(5),
  .enrollments-table td:nth-child(5) {
    display: none;
  }
}
</style>
