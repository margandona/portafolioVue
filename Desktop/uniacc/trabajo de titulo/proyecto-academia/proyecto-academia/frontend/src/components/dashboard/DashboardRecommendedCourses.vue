<template>
  <div class="recommended-courses-section dashboard-card">
    <h2 class="text-h5 mb-3">Cursos recomendados para ti</h2>
    <v-row>
      <v-col v-for="course in displayedCourses" :key="course.id" cols="12" md="4">
        <v-card :to="`/courses/${course.id}`" hover>
          <v-img :src="course.imageUrl || defaultImage" height="150" cover></v-img>
          <v-card-title class="text-h6">{{ course.title }}</v-card-title>
          <v-card-subtitle>
            <v-chip size="small" color="primary" class="me-2">{{ course.category }}</v-chip>
            <span>{{ course.isFree ? 'Gratis' : `$${course.price}` }}</span>
          </v-card-subtitle>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" :to="`/courses/${course.id}`">
              <v-icon start>mdi-information</v-icon>
              Detalles
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <div class="text-center mt-4">
      <v-btn to="/courses" color="primary" variant="text">Explorar más cursos</v-btn>
    </div>
  </div>
</template>

<script>
import { coursePlaceholder } from '@/assets/placeholders';

export default {
  name: 'DashboardRecommendedCourses',
  
  props: {
    courses: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      defaultImage: coursePlaceholder
    }
  },
  
  computed: {
    displayedCourses() {
      return this.courses.slice(0, 3);
    }
  }
}
</script>

<style scoped>
.recommended-courses-section {
  grid-column: 1 / -1; /* span all columns */
}
</style>
