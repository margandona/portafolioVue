<template>
  <div class="dashboard-section">
    <div class="section-header">
      <h3>Cursos Recomendados</h3>
      <router-link to="/courses/available" class="view-all">Ver Todos</router-link>
    </div>
    
    <div class="section-content">
      <div v-if="courses.length === 0" class="empty-state">
        <p>No hay cursos recomendados por el momento.</p>
        <router-link to="/courses/available" class="btn btn-primary">
          Explorar Cursos
        </router-link>
      </div>
      
      <div v-else class="course-grid">
        <div v-for="course in courses" :key="course.id" class="course-card">
          <div class="course-header">
            <h4>{{ course.title }}</h4>
            <span v-if="course.isFree" class="badge free">Gratis</span>
            <span v-else-if="course.hasActiveDiscount" class="badge discount">{{ course.discount }}% Dcto</span>
          </div>
          
          <p class="course-description">{{ truncateText(course.description, 80) }}</p>
          
          <div class="course-footer">
            <button class="btn btn-primary sm" @click="$emit('view-details', course.id)">
              Ver Detalles
            </button>
            <span v-if="!course.isFree" class="course-price">
              <span v-if="course.hasActiveDiscount" class="discounted-price">
                <span class="original">${{ formatPrice(course.totalPrice) }}</span>
                <span class="current">${{ formatPrice(course.discountedTotalPrice) }}</span>
              </span>
              <span v-else>${{ formatPrice(course.totalPrice) }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatPrice } from '@/utils/apiHelper';

export default {
  name: 'RecommendedCourses',
  props: {
    courses: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    formatPrice,
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
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

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 15px;
}

.course-card {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.course-header h4 {
  margin: 0;
  color: #2A3B5F;
  font-size: 16px;
  flex-grow: 1;
}

.badge {
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  margin-left: 8px;
}

.badge.free {
  background-color: #28a745;
}

.badge.discount {
  background-color: #fd7e14;
}

.course-description {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 15px;
  height: 60px;
  overflow: hidden;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-price {
  font-weight: 600;
  color: #2A3B5F;
}

.discounted-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.discounted-price .original {
  text-decoration: line-through;
  color: #6c757d;
  font-size: 12px;
  font-weight: normal;
}

.discounted-price .current {
  color: #2E8B57;
}

.btn {
  padding: 8px 16px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
  text-decoration: none;
}

.btn.sm {
  padding: 5px 10px;
  font-size: 12px;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover {
  background-color: #3AA870;
}

.empty-state {
  text-align: center;
  padding: 20px 0;
  color: #6c757d;
}
</style>
