<template>
  <v-card class="dashboard-card">
    <v-card-title class="text-h6 d-flex justify-space-between align-center">
      <div>
        <v-icon class="me-2">mdi-book-education</v-icon>
        Mis Cursos
      </div>
      <v-btn size="small" color="primary" to="/courses/create">
        <v-icon start>mdi-plus</v-icon>
        Crear curso
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item v-for="course in displayedCourses" :key="course.id">
          <template v-slot:prepend>
            <v-avatar size="40">
              <v-img :src="course.imageUrl || defaultImage" alt="Course"></v-img>
            </v-avatar>
          </template>
          <v-list-item-title>{{ course.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ course.enrollmentCount || 0 }} estudiantes inscritos</v-list-item-subtitle>
          <template v-slot:append>
            <v-chip
              size="small"
              :color="course.isActive ? 'success' : 'grey'"
            >
              {{ course.isActive ? 'Activo' : 'Inactivo' }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>

      <!-- Course Actions -->
      <div class="course-actions mt-4" v-if="displayedCourses.length > 0">
        <v-row>
          <v-col cols="12">
            <div class="text-subtitle-1 mb-2">Acciones rápidas para el curso</div>
            <div class="d-flex flex-wrap gap-2">
              <v-btn color="primary" size="small" :to="`/courses/${displayedCourses[0].id}/edit`">
                <v-icon start>mdi-pencil</v-icon>
                Editar curso
              </v-btn>
              <v-btn color="info" size="small" :to="`/courses/${displayedCourses[0].id}/students`">
                <v-icon start>mdi-account-group</v-icon>
                Ver estudiantes
              </v-btn>
              <v-btn color="warning" size="small" :to="`/courses/${displayedCourses[0].id}/evaluations`">
                <v-icon start>mdi-clipboard-text</v-icon>
                Evaluaciones
              </v-btn>
              <v-btn color="success" size="small" :to="`/courses/${displayedCourses[0].id}/stats`">
                <v-icon start>mdi-chart-bar</v-icon>
                Estadísticas
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>

      <div v-if="courses.length === 0" class="text-center py-4 text-grey">
        No tienes cursos creados.
      </div>

      <div class="text-center mt-4">
        <v-btn to="/teacher/courses" color="primary" variant="text">Ver todos mis cursos</v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { coursePlaceholder } from '@/assets/placeholders';

export default {
  name: 'DashboardTeacherCourses',
  
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
      return this.courses.slice(0, 5);
    }
  }
}
</script>

<style scoped>
.dashboard-card {
  grid-column: 1 / -1; /* span all columns on mobile */
}

@media (min-width: 768px) {
  .dashboard-card {
    grid-column: auto; /* reset to default for larger screens */
  }
}
</style>
