<template>
  <div class="enrollments-list">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando inscripciones...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="enrollments.length === 0" class="empty-state">
      <p>No hay inscripciones recientes.</p>
    </div>
    
    <ul v-else class="enrollments">
      <li v-for="enrollment in enrollments" :key="enrollment.id" class="enrollment-item">
        <div class="student-info">
          <div class="student-avatar">
            <i class="fas fa-user-graduate"></i>
          </div>
          <div>
            <h4 class="student-name">{{ enrollment.user?.name || 'Estudiante' }}</h4>
            <p class="course-name">{{ enrollment.course?.title || 'Curso' }}</p>
          </div>
        </div>
        <div class="enrollment-details">
          <div class="enrollment-progress">
            <span class="progress-text">{{ enrollment.progress || 0 }}%</span>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${enrollment.progress || 0}%` }"
                :class="getProgressClass(enrollment.progress)"
              ></div>
            </div>
          </div>
          <div class="enrollment-meta">
            <span class="enrollment-date">
              <i class="fas fa-calendar-alt"></i> Inscrito: {{ formatDate(enrollment.startDate) }}
            </span>
            <span 
              :class="['status-badge', enrollment.status]"
            >
              {{ formatStatus(enrollment.status) }}
            </span>
          </div>
        </div>
        <div class="enrollment-actions">
          <button 
            class="btn btn-view" 
            @click="$emit('view-student', enrollment.id, enrollment.userId)"
            title="Ver Estudiante"
          >
            <i class="fas fa-eye"></i>
          </button>
          <button 
            class="btn btn-grade" 
            @click="$emit('grade', enrollment.id)"
            title="Calificar Estudiante"
          >
            <i class="fas fa-star"></i>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'EnrollmentsList',
  props: {
    enrollments: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return 'Fecha no disponible';
      return new Date(date).toLocaleDateString('es-CL');
    },
    
    formatStatus(status) {
      const statusMap = {
        'active': 'Activo',
        'completed': 'Completado',
        'dropped': 'Abandonado'
      };
      return statusMap[status] || status;
    },
    
    getProgressClass(progress) {
      if (progress < 30) return 'low';
      if (progress < 70) return 'mid';
      return 'high';
    }
  }
};
</script>

<style scoped>
.enrollments-list {
  padding: 0;
}

.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  text-align: center;
  color: #6c757d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #2E8B57;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.enrollments {
  list-style: none;
  padding: 0;
  margin: 0;
}

.enrollment-item {
  display: flex;
  flex-wrap: wrap;
  padding: 15px 20px;
  border-bottom: 1px solid #eaeaea;
  transition: background-color 0.2s;
}

.enrollment-item:last-child {
  border-bottom: none;
}

.enrollment-item:hover {
  background-color: #f8f9fa;
}

.student-info {
  display: flex;
  align-items: center;
  min-width: 250px;
  margin-right: 20px;
  margin-bottom: 10px;
}

.student-avatar {
  width: 40px;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
}

.student-avatar i {
  color: #6c757d;
  font-size: 18px;
}

.student-name {
  font-size: 14px;
  font-weight: 500;
  color: #2A3B5F;
  margin: 0 0 3px;
}

.course-name {
  font-size: 12px;
  color: #6c757d;
  margin: 0;
}

.enrollment-details {
  flex: 1;
  min-width: 220px;
  margin-right: 20px;
  margin-bottom: 10px;
}

.enrollment-progress {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  min-width: 40px;
  font-size: 14px;
  font-weight: 500;
  margin-right: 10px;
}

.progress-bar {
  flex: 1;
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

.enrollment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.enrollment-date {
  color: #6c757d;
}

.enrollment-date i {
  margin-right: 3px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
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

.enrollment-actions {
  display: flex;
  gap: 5px;
  align-items: center;
}

.btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: white;
}

.btn-view {
  background-color: #6c757d;
}

.btn-view:hover {
  background-color: #5a6268;
}

.btn-grade {
  background-color: #ffc107;
  color: #212529;
}

.btn-grade:hover {
  background-color: #e0a800;
}

@media (max-width: 768px) {
  .enrollment-item {
    flex-direction: column;
  }
  
  .student-info, .enrollment-details {
    width: 100%;
    margin-right: 0;
  }
  
  .enrollment-actions {
    margin-top: 10px;
    align-self: flex-end;
  }
}
</style>
