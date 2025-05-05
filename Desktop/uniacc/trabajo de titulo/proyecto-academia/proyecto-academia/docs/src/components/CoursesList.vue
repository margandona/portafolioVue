<template>
  <div class="courses-list">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando cursos...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="courses.length === 0" class="empty-state">
      <p>No tienes cursos creados aún.</p>
    </div>
    
    <ul v-else class="courses">
      <li v-for="course in courses" :key="course.id" class="course-item">
        <div class="course-info">
          <h3 class="course-title">{{ course.title }}</h3>
          <div class="course-meta">
            <span class="category">
              <i class="fas fa-tag"></i> {{ course.category || 'Sin categoría' }}
            </span>
            <span class="modality">
              <i class="fas fa-clock"></i> {{ formatModality(course) }}
            </span>
          </div>
          <div class="course-status">
            <span class="enrollment-count">
              <i class="fas fa-users"></i> {{ course.enrollmentCount || 0 }} estudiantes
            </span>
            <span 
              :class="['price-badge', course.isFree ? 'free' : 'paid']"
            >
              {{ course.isFree ? 'Gratuito' : `$${formatPrice(course.totalPrice)}` }}
              <span v-if="course.hasActiveDiscount" class="discount-badge">
                -{{ course.discount }}%
              </span>
            </span>
          </div>
        </div>
        <div class="course-actions">
          <button class="btn btn-view" @click="$emit('view-details', course.id)" title="Ver Detalles">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-edit" @click="$emit('edit', course.id)" title="Editar Curso">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'CoursesList',
  props: {
    courses: {
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
    formatModality(course) {
      if (course.modality === 'synchronized') {
        return `Sincronizado (${this.formatDate(course.start_date)} - ${this.formatDate(course.end_date)})`;
      } else {
        return `Asincrónico (${course.duration_days || 'N/A'} días)`;
      }
    },
    
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('es-CL');
    },
    
    formatPrice(price) {
      if (price === undefined || price === null) return '0';
      return Number(price).toLocaleString('es-CL');
    }
  }
};
</script>

<style scoped>
.courses-list {
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

.courses {
  list-style: none;
  padding: 0;
  margin: 0;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eaeaea;
  transition: background-color 0.2s;
}

.course-item:last-child {
  border-bottom: none;
}

.course-item:hover {
  background-color: #f8f9fa;
}

.course-info {
  flex: 1;
  min-width: 0;
}

.course-title {
  font-size: 16px;
  font-weight: 500;
  color: #2A3B5F;
  margin: 0 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
  gap: 15px;
}

.course-meta i {
  margin-right: 5px;
}

.course-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.enrollment-count {
  color: #6c757d;
}

.price-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  color: white;
}

.price-badge.free {
  background-color: #28a745;
}

.price-badge.paid {
  background-color: #0d6efd;
}

.discount-badge {
  margin-left: 5px;
  background-color: #dc3545;
  color: white;
  padding: 1px 5px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.course-actions {
  display: flex;
  gap: 5px;
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

.btn-edit {
  background-color: #2E8B57;
}

.btn-edit:hover {
  background-color: #3AA870;
}
</style>
