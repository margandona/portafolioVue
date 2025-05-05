<template>
  <div class="dashboard-section">
    <div class="section-header">
      <h3>Actividad Reciente</h3>
      <router-link to="/enrolled" class="view-all">Ver Todo</router-link>
    </div>
    
    <div class="section-content">
      <div v-if="activities.length === 0" class="empty-state">
        <p>No hay actividad reciente para mostrar.</p>
      </div>
      <ul v-else class="activity-list">
        <li v-for="activity in activities" :key="activity.id" class="activity-item">
          <div class="activity-icon">
            <i class="fas fa-book-open"></i>
          </div>
          <div class="activity-details">
            <h4>{{ activity.course.title }}</h4>
            <div class="activity-meta">
              <span>Último acceso: {{ formatDate(activity.lastAccessDate) }}</span>
              <span class="progress-badge">{{ activity.progress }}% Completado</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${activity.progress}%` }"
                :class="getProgressClass(activity.progress)"
              ></div>
            </div>
          </div>
          <button class="continue-btn" @click="$emit('continue', activity.courseId)">
            Continuar
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActivityList',
  props: {
    activities: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return 'No disponible';
      return new Date(date).toLocaleDateString('es-CL');
    },
    getProgressClass(progress) {
      if (progress < 30) return 'low';
      if (progress < 70) return 'mid';
      return 'high';
    }
  }
}
</script>

<style scoped>
.dashboard-section {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eaeaea;
}

.section-header h3 {
  font-family: "Playfair Display", serif;
  color: #2A3B5F;
  margin: 0;
  font-size: 18px;
}

.view-all {
  color: #2E8B57;
  text-decoration: none;
  font-size: 14px;
}

.section-content {
  padding: 20px;
}

.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eaeaea;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(46, 139, 87, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.activity-icon i {
  font-size: 18px;
  color: #2E8B57;
}

.activity-details {
  flex-grow: 1;
}

.activity-details h4 {
  margin: 0 0 5px;
  color: #2A3B5F;
  font-size: 16px;
}

.activity-meta {
  font-size: 12px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-badge {
  background-color: #f8f9fa;
  padding: 2px 8px;
  border-radius: 20px;
}

.progress-bar {
  margin-top: 8px;
  height: 6px;
  background-color: #eaeaea;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
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

.continue-btn {
  background-color: #2E8B57;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.continue-btn:hover {
  background-color: #3AA870;
}

.empty-state {
  text-align: center;
  padding: 20px 0;
  color: #6c757d;
}
</style>
