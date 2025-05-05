<template>
  <div class="student-courses-list">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando tus cursos...</p>
    </div>
    
    <div v-else-if="courses.length === 0" class="empty-state">
      <i class="fas fa-book-open empty-icon"></i>
      <p>No estás inscrito en ningún curso todavía.</p>
      <router-link to="/courses" class="btn btn-primary">
        Explorar Cursos
      </router-link>
    </div>
    
    <ul v-else class="courses-list">
      <li v-for="course in courses" :key="course.id" class="course-item">
        <div class="course-info">
          <h3 class="course-title">{{ course.title }}</h3>
          <div class="course-meta">
            <span class="teacher">
              <i class="fas fa-user-tie"></i> {{ course.teacher?.name || 'Instructor' }}
            </span>
            <span class="category">
              <i class="fas fa-tag"></i> {{ course.category || 'Sin categoría' }}
            </span>
          </div>
        </div>
        
        <div class="course-progress">
          <div class="progress-info">
            <span class="progress-text">{{ course.enrollment?.progress || 0 }}% completado</span>
            <span class="last-access" v-if="course.enrollment?.lastAccessDate">
              Último acceso: {{ formatDate(course.enrollment.lastAccessDate) }}
            </span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${course.enrollment?.progress || 0}%` }"
                :class="getProgressClass(course.enrollment?.progress)"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="course-actions">
          <button 
            class="btn btn-primary"
            @click="$emit('view-course', course.id)"
          >
            Continuar
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'StudentCoursesList',
  props: {
    courses: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-CL');
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
.student-courses-list {
  width: 100%;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #2E8B57;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  color: #6c757d;
  margin-bottom: 15px;
}

.courses-list {
  list-style: none;
  margin: 0;
  padding: 10px 20px;
}

.course-item {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #eaeaea;
  padding: 15px 0;
}

.course-item:last-child {
  border-bottom: none;
}

.course-title {
  font-size: 16px;
  color: #2A3B5F;
  margin: 0 0 8px 0;
}

.course-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 12px;
}

.course-meta i {
  margin-right: 5px;
}

.course-progress {
  margin-bottom: 15px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 5px;
}

.progress-text {
  font-weight: 600;
}

.last-access {
  color: #6c757d;
}

.progress-bar-container {
  width: 100%;
}

.progress-bar {
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
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
  background-color: #ffc107;
}

.progress-fill.high {
  background-color: #28a745;
}

.course-actions {
  align-self: flex-end;
  margin-top: 10px;
}

.btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
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

@media (min-width: 768px) {
  .course-item {
    flex-direction: row;
    align-items: center;
    gap: 20px;
  }
  
  .course-info {
    flex: 1;
  }
  
  .course-progress {
    flex: 2;
    margin-bottom: 0;
  }
  
  .course-actions {
    margin-top: 0;
  }
}
</style>
