<template>
  <v-card class="dashboard-card sales-summary-card">
    <v-card-title class="text-h6">
      <v-icon class="me-2">mdi-finance</v-icon>
      Resumen de Ventas
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="6">
          <div class="text-overline">Ingresos Totales</div>
          <div class="text-h5">{{ formatPrice(stats.totalRevenue) }}</div>
        </v-col>
        <v-col cols="6">
          <div class="text-overline">Ventas este mes</div>
          <div class="text-h5">{{ stats.salesThisMonth }}</div>
        </v-col>
      </v-row>
      
      <v-divider class="my-3"></v-divider>
      
      <div class="text-subtitle-1 mb-2">Estado de Ventas</div>
      <v-list density="compact">
        <v-list-item v-for="(count, status) in stats.salesByStatus" :key="status">
          <v-list-item-title>{{ formatSaleStatus(status) }}</v-list-item-title>
          <template v-slot:append>
            <v-chip :color="getSaleStatusColor(status)" size="small">{{ count }}</v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="primary" to="/admin/sales/reports">
        <v-icon start>mdi-file-chart</v-icon>
        Reportes Detallados
      </v-btn>
      <!-- New buttons for sales actions -->
      <v-btn color="info" to="/admin/sales/pending" class="ms-2">
        <v-icon start>mdi-clock-outline</v-icon>
        Ventas pendientes
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'DashboardSalesSummary',
  
  props: {
    stats: {
      type: Object,
      required: true
    },
    formatPrice: {
      type: Function,
      required: true
    }
  },
  
  methods: {
    formatSaleStatus(status) {
      const statuses = {
        pending: 'Pendiente',
        paid: 'Pagado',
        completed: 'Completado',
        refunded: 'Reembolsado',
        cancelled: 'Cancelado',
        failed: 'Fallido'
      };
      
      return statuses[status] || status;
    },
    
    getSaleStatusColor(status) {
      const colors = {
        pending: 'warning',
        paid: 'info',
        completed: 'success',
        refunded: 'error',
        cancelled: 'grey',
        failed: 'error'
      };
      
      return colors[status] || 'grey';
    }
  }
}
</script>

<style scoped>
.sales-summary-card {
  grid-column: span 2;
}
</style>
