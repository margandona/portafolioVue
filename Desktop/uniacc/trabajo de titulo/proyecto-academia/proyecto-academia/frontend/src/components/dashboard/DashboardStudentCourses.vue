<template>
  <v-card class="dashboard-card">
    <v-card-title class="text-h6">
      <v-icon class="me-2">mdi-book-open-page-variant</v-icon>
      Cursos en Progreso
    </v-card-title>
    <v-card-text v-if="inProgressCourses.length > 0">
      <v-list>
        <v-list-item v-for="course in inProgressCourses" :key="course.id" :to="`/courses/${course.id}/content`">
          <template v-slot:prepend>
            <v-avatar size="40">
              <v-img :src="course.imageUrl || defaultImage" alt="Course"></v-img>
            </v-avatar>
          </template>
          <v-list-item-title>{{ course.title }}</v-list-item-title>
          <template v-slot:append>
            <v-progress-linear
              :model-value="course.progress || 0"
              color="primary"
              height="8"
              rounded
              class="mt-2"
              style="width: 100px"
            ></v-progress-linear>
            <span class="ms-2">{{ course.progress || 0 }}%</span>
          </template>
        </v-list-item>
      </v-list>

      <div class="course-actions mt-4">
        <v-row>
          <v-col v-for="course in inProgressCourses.slice(0, 1)" :key="`actions-${course.id}`" cols="12">
            <div class="d-flex flex-wrap gap-2">
              <v-btn color="primary" size="small" :to="`/courses/${course.id}/content`">
                <v-icon start>mdi-book-open-variant</v-icon>
                Continuar
              </v-btn>
              <v-btn color="info" size="small" :to="`/courses/${course.id}/quizzes`">
                <v-icon start>mdi-file-document</v-icon>
                Evaluaciones
              </v-btn>
              <v-btn color="success" size="small" :to="`/courses/${course.id}/notes`">
                <v-icon start>mdi-notebook</v-icon>
                Mis notas
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>

      <div class="text-center mt-4">
        <v-btn to="/courses/enrolled" color="primary" variant="text">Ver todos mis cursos</v-btn>
      </div>
    </v-card-text>

    <div v-else class="text-center py-4 text-grey">
      No tienes cursos en progreso.
    </div>
  </v-card>
</template>

<script>
import { coursePlaceholder } from '@/assets/placeholders';

export default {
  name: 'DashboardStudentCourses',
  
  props: {
    inProgressCourses: {
      type: Array,
      default: () => []
    },
    enrolledCourses: {
      type: Array,
      default: () => []
    }
  },
  
  data() {
    return {
      defaultImage: coursePlaceholder
    }
  }
}
</script>

<style scoped>
.dashboard-card {
  grid-column: 1 / -1; /* span all columns */
}
</style>
