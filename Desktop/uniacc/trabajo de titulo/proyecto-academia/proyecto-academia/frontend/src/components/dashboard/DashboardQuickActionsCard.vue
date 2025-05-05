<template>
  <v-card class="dashboard-card">
    <v-card-title class="text-h6">
      <v-icon class="me-2">mdi-lightning-bolt</v-icon>
      Acciones Rápidas
    </v-card-title>
    <v-card-text>
      <div class="d-grid gap-2">
        <v-btn v-for="(action, i) in actions" :key="i" 
          :to="action.to" :color="action.color" block class="mb-2">
          <v-icon start>{{ action.icon }}</v-icon>
          {{ action.title }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardQuickActionsCard',
  
  props: {
    actions: {
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

.d-grid {
  display: grid;
}

.gap-2 {
  gap: 8px;
}
</style>
