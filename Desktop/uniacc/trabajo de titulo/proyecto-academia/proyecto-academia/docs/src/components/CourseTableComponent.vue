<template>
  <div class="course-table-container">
    <!-- Debug button -->
    <button 
      v-if="error" 
      class="debug-btn" 
      @click="showDebugInfo = !showDebugInfo"
    >
      {{ showDebugInfo ? 'Ocultar' : 'Mostrar' }} Información de Depuración
    </button>

    <!-- Debug information -->
    <div v-if="showDebugInfo && error" class="debug-info">
      <h4>Información de Depuración:</h4>
      <p><strong>Rol de usuario:</strong> {{ userRole }}</p>
      <p><strong>ID de usuario:</strong> {{ userId }}</p>
      <p><strong>Número de cursos:</strong> {{ courses.length }}</p>
      <p><strong>Error:</strong> {{ error }}</p>
      <p>Por favor comunique este error al administrador del sistema.</p>
    </div>

    <!-- Debug information - can be toggled on/off -->
    <div v-if="debug" class="debug-info">
      <p><strong>Debug Info:</strong></p>
      <p>Courses count: {{ courses.length }}</p>
      <p>User Role: {{ userRole }}</p>
      <p>User ID: {{ userId }}</p>
      <p>Loading: {{ loading }}</p>
      <p>Error: {{ error || 'None' }}</p>
      <button class="btn btn-sm btn-debug" @click="debug = false">Hide Debug Info</button>
    </div>
  
    <!-- Show debug toggle button when not in debug mode -->
    <div v-if="!debug && (error || courses.length === 0)" class="debug-toggle">
      <button class="btn btn-sm btn-debug" @click="debug = true">Show Debug Info</button>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-spinner">
      <p>Cargando cursos...</p>
    </div>

    <!-- Error message -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button class="btn btn-primary btn-retry" @click="$emit('retry')">
        Reintentar
      </button>
    </div>

    <!-- Course table -->
    <div v-else-if="courses.length > 0" class="table-responsive">
      <table class="course-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th>Profesor</th>
            <th>Estado</th>
            <th class="actions-header">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in courses" :key="course.id">
            <td>{{ course.id }}</td>
            <td>{{ course.title }}</td>
            <td>{{ course.category }}</td>
            <td class="description-cell">{{ truncateDescription(course.description) }}</td>
            <td>{{ course.teacher?.name || 'No asignado' }}</td>
            <td>
              <span :class="['status-badge', course.active ? 'active' : 'inactive']">
                {{ course.active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="actions-cell">
              <!-- View button -->
              <button 
                class="btn btn-primary btn-sm" 
                @click="$emit('view', course.id)"
                aria-label="Ver detalles del curso"
              >
                <i class="fas fa-eye"></i> Ver
              </button>
              
              <!-- Edit button -->
              <button 
                v-if="canEdit(course)"
                class="btn btn-secondary btn-sm" 
                @click="$emit('edit', course.id)"
                aria-label="Editar curso"
              >
                <i class="fas fa-edit"></i> Editar
              </button>
              
              <!-- Delete button -->
              <button 
                v-if="canDelete(course)"
                class="btn btn-danger btn-sm" 
                @click="confirmDelete(course.id, course.title)"
                aria-label="Eliminar curso"
              >
                <i class="fas fa-trash-alt"></i> Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- No courses message -->
    <div v-else class="no-courses">
      <p>No hay cursos disponibles.</p>
      <p class="help-text">
        <span v-if="userRole === 'teacher'">
          Los cursos se mostrarán aquí cuando hayas creado alguno o hayas sido asignado como profesor.
        </span>
        <span v-else-if="userRole === 'admin'">
          Aún no hay cursos registrados en la plataforma. Puedes crear uno usando el botón "Crear Nuevo Curso".
        </span>
        <span v-else>
          No hay cursos disponibles para mostrar en este momento.
        </span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "CourseTableComponent",
  props: {
    courses: {
      type: Array,
      required: true,
      validator: (value) => {
        // Validate that courses is an array and log error if not
        if (!Array.isArray(value)) {
          console.error('CourseTableComponent: Expected courses to be an array, got:', typeof value);
          return false;
        }
        return true;
      }
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    userRole: {
      type: String,
      required: true
    },
    userId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      debug: false, // Debug mode toggle
      showDebugInfo: false
    };
  },
  mounted() {
    console.log('CourseTableComponent mounted with courses:', this.courses);
    if (this.courses.length === 0) {
      console.warn('CourseTableComponent: No courses provided to display');
    }
  },
  watch: {
    courses(newValue) {
      console.log('CourseTableComponent courses updated:', newValue);
    }
  },
  methods: {
    truncateDescription(description) {
      if (!description) return 'Sin descripción';
      return description.length > 50 ? description.substring(0, 50) + '...' : description;
    },
    canEdit(course) {
      if (this.userRole === 'admin') return true;
      if (this.userRole === 'teacher') {
        return parseInt(course.teacher_id) === parseInt(this.userId) ||
               course.teacher?.id === this.userId;
      }
      return false;
    },
    // eslint-disable-next-line no-unused-vars
    canDelete(course) {
      return this.userRole === 'admin';
    },
    confirmDelete(courseId, courseTitle) {
      if (confirm(`¿Estás seguro que deseas eliminar el curso "${courseTitle}"? Esta acción es irreversible.`)) {
        this.$emit('delete', courseId);
      }
    },
    toggleDebug() {
      this.debug = !this.debug;
      if (this.debug) {
        console.log('Debug mode enabled for CourseTableComponent');
        console.log('Props:', {
          courses: this.courses,
          userRole: this.userRole,
          userId: this.userId,
          loading: this.loading,
          error: this.error
        });
      }
    }
  }
};
</script>

<style scoped>
.course-table-container {
  margin: 20px 0;
  overflow-x: auto;
}

.course-table {
  width: 100%;
  border-collapse: collapse;
  font-family: "Roboto", sans-serif;
  box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.course-table th,
.course-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.course-table thead {
  background-color: #2a3b5f;
  color: white;
}

.course-table tbody tr:hover {
  background-color: #f5f5f5;
}

.loading-spinner {
  text-align: center;
  padding: 20px;
  color: #2e8b57;
}

.error-message {
  text-align: center;
  padding: 20px;
  color: #dc3545;
}

.no-courses {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}

.description-cell {
  max-width: 200px;
}

.actions-cell {
  white-space: nowrap;
}

.btn {
  margin-right: 5px;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-primary {
  background-color: #2e8b57;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.active {
  background-color: #28a745;
  color: white;
}

.status-badge.inactive {
  background-color: #dc3545;
  color: white;
}

.table-responsive {
  overflow-x: auto;
}

/* Enhanced styles for actions */
.actions-header {
  width: 180px;
  text-align: center;
}

.actions-cell {
  white-space: nowrap;
  display: flex;
  gap: 5px;
  justify-content: center;
}

.btn {
  margin-right: 5px;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 3px;
}

/* Debug info styling */
.debug-info, .debug-toggle {
  background-color: #f8f9fa;
  border: 1px dashed #6c757d;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 12px;
}

.debug-info p {
  margin: 5px 0;
}

.btn-debug {
  background-color: #17a2b8;
  color: white;
  padding: 3px 8px;
  font-size: 11px;
  border-radius: 3px;
  border: none;
  cursor: pointer;
}

.help-text {
  font-size: 14px;
  color: #6c757d;
  font-style: italic;
  margin-top: 10px;
}

.btn-retry {
  margin-top: 10px;
}

.debug-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  margin-bottom: 10px;
  cursor: pointer;
}

.debug-info {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 15px;
  font-family: monospace;
}

.debug-info h4 {
  margin-top: 0;
  color: #6c757d;
}
</style>
