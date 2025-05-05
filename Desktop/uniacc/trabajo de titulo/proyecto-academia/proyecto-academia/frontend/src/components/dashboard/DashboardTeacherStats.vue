<template>
  <v-card class="dashboard-card">
    <v-card-title class="text-h6">
      <v-icon class="me-2">mdi-chart-box</v-icon>
      Estadísticas de Cursos
    </v-card-title>
    <v-card-text>
      <v-list density="compact">
        <v-list-item>
          <v-list-item-title>Cursos activos</v-list-item-title>
          <template v-slot:append>
            <v-chip color="primary">{{ teacherCourses.length }}</v-chip>
          </template>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Total de estudiantes</v-list-item-title>
          <template v-slot:append>
            <v-chip color="success">{{ totalStudentsCount }}</v-chip>
          </template>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Calificaciones pendientes</v-list-item-title>
          <template v-slot:append>
            <v-chip color="warning">{{ pendingEvaluationsCount }}</v-chip>
          </template>
        </v-list-item>
      </v-list>

      <v-btn color="primary" block class="mt-3" to="/teacher/stats">
        <v-icon start>mdi-chart-areaspline</v-icon>
        Ver estadísticas detalladas
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardTeacherStats',
  
  props: {
    teacherCourses: {
      type: Array,
      default: () => []
    },
    totalStudentsCount: {
      type: Number,
      default: 0
    },
    pendingEvaluationsCount: {
      type: Number,
      default: 0
    }
  }
}
</script>
