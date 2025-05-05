<template>
  <v-card class="dashboard-card">
    <v-card-title class="text-h6">
      <v-icon class="me-2">mdi-account-group</v-icon>
      Actividad Reciente de Estudiantes
    </v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item v-for="(activity, i) in activities" :key="i">
          <v-list-item-title>{{ activity.student }} {{ activity.action }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ activity.course }}
          </v-list-item-subtitle>
          <template v-slot:append>
            <v-chip size="small" color="grey">{{ activity.time }}</v-chip>
          </template>
        </v-list-item>
      </v-list>
      
      <div v-if="activities.length === 0" class="text-center py-4 text-grey">
        No hay actividad reciente de estudiantes.
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardStudentActivity',
  
  props: {
    activities: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.dashboard-card {
  grid-column: 1 / -1; /* span all columns */
}
</style>
