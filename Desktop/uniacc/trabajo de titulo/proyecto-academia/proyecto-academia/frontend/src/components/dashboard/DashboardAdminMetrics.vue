<template>
  <div class="admin-metrics-grid">
    <v-card class="metric-card" color="primary" theme="dark">
      <v-card-text>
        <div class="text-overline">Usuarios Registrados</div>
        <div class="text-h4">{{ stats?.usersCount || 0 }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" to="/admin/users">Ver detalle</v-btn>
        <v-btn variant="text" to="/admin/users/create" class="ms-2">Nuevo</v-btn>
      </v-card-actions>
    </v-card>
    
    <v-card class="metric-card" color="success" theme="dark">
      <v-card-text>
        <div class="text-overline">Cursos Activos</div>
        <div class="text-h4">{{ stats?.coursesCount || 0 }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" to="/admin/courses">Ver detalle</v-btn>
        <v-btn variant="text" to="/admin/courses/create" class="ms-2">Nuevo</v-btn>
      </v-card-actions>
    </v-card>
    
    <v-card class="metric-card" color="info" theme="dark">
      <v-card-text>
        <div class="text-overline">Inscripciones</div>
        <div class="text-h4">{{ stats?.enrollmentsCount || 0 }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" to="/admin/enrollments">Ver detalle</v-btn>
        <v-btn variant="text" to="/admin/enrollments/manual" class="ms-2">Nueva</v-btn>
      </v-card-actions>
    </v-card>
    
    <v-card class="metric-card" color="warning" theme="dark">
      <v-card-text>
        <div class="text-overline">Ventas Pendientes</div>
        <div class="text-h4">{{ stats?.pendingSalesCount || 0 }}</div>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" to="/admin/sales">Ver detalle</v-btn>
        <v-btn variant="text" to="/admin/sales/pending" class="ms-2">Gestionar</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'DashboardAdminMetrics',
  
  props: {
    stats: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.admin-metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  grid-column: 1 / -1; /* span all columns */
}

@media (min-width: 768px) {
  .admin-metrics-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.metric-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
