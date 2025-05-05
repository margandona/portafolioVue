<template>
  <v-card class="dashboard-card">
    <v-card-title class="text-h6">
      <v-icon class="me-2">mdi-chart-line</v-icon>
      Métricas de Aprendizaje
    </v-card-title>
    <v-card-text>
      <div class="d-flex flex-column gap-4">
        <div class="metric-item">
          <div class="d-flex justify-space-between">
            <span>Cursos completados</span>
            <span class="font-weight-bold">{{ completedCoursesCount }}</span>
          </div>
          <v-progress-linear :model-value="completedCoursesPercentage" color="success" height="8" rounded></v-progress-linear>
        </div>

        <div class="metric-item">
          <div class="d-flex justify-space-between">
            <span>Evaluaciones aprobadas</span>
            <span class="font-weight-bold">{{ passedEvaluationsCount }}</span>
          </div>
          <v-progress-linear :model-value="passedEvaluationsPercentage" color="info" height="8" rounded></v-progress-linear>
        </div>

        <div class="metric-item">
          <div class="d-flex justify-space-between">
            <span>Certificados obtenidos</span>
            <span class="font-weight-bold">{{ certificatesCount }}</span>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardStudentMetrics',
  
  props: {
    completedCoursesCount: {
      type: Number,
      default: 0
    },
    completedCoursesPercentage: {
      type: Number,
      default: 0
    },
    passedEvaluationsCount: {
      type: Number,
      default: 0
    },
    passedEvaluationsPercentage: {
      type: Number,
      default: 0
    },
    certificatesCount: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style scoped>
.metric-item {
  margin-bottom: 16px;
}

.gap-4 {
  gap: 16px;
}
</style>
