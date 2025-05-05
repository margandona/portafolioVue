<template>
  <v-card class="dashboard-card">
    <v-card-title class="text-h6">
      <v-icon class="me-2">mdi-calendar-check</v-icon>
      Actividad Reciente
    </v-card-title>
    <v-card-text>
      <v-list density="compact">
        <v-list-item v-for="(activity, i) in activities" :key="i" :prepend-icon="activity.icon">
          <v-list-item-title>{{ activity.title }}</v-list-item-title>
          <template v-slot:append>
            <v-chip size="small" :color="activity.color">{{ activity.time }}</v-chip>
          </template>
        </v-list-item>
      </v-list>
      
      <div v-if="!activities || activities.length === 0" class="text-center py-4 text-grey">
        No hay actividad reciente.
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardActivityCard',
  
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
  height: 100%;
}
</style>
