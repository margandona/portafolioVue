<template>
  <div class="user-dashboard">
    <div class="welcome-header">
      <h2>Panel de Administración</h2>
      <p class="subtitle">Estadísticas generales de la plataforma</p>
    </div>
    
    <div class="dashboard-summary">
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="summary-content">
          <h3>{{ adminStats.totalStudents || 0 }}</h3>
          <p>Estudiantes Registrados</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-chalkboard"></i>
        </div>
        <div class="summary-content">
          <h3>{{ adminStats.totalCourses || 0 }}</h3>
          <p>Cursos Disponibles</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="summary-content">
          <h3>${{ formatPrice(adminStats.totalRevenue || 0) }}</h3>
          <p>Ingresos Totales</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-certificate"></i>
        </div>
        <div class="summary-content">
          <h3>{{ adminStats.totalEnrollments || 0 }}</h3>
          <p>Inscripciones Totales</p>
        </div>
      </div>
    </div>
    
    <div class="dashboard-sections">
      <!-- Recent Sales -->
      <div class="dashboard-section">
        <div class="section-header">
          <h3>Ventas Recientes</h3>
          <router-link to="/admin/sales" class="view-all">Ver Todas</router-link>
        </div>
        
        <div class="section-content">
          <div v-if="recentSales.length === 0" class="empty-state">
            <p>No hay ventas recientes para mostrar.</p>
          </div>
          
          <table v-else class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Curso</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in recentSales" :key="sale.id">
                <td>{{ sale.id.substring(0, 8) }}...</td>
                <td>{{ sale.user?.name || 'Usuario' }}</td>
                <td>{{ sale.course?.title || 'Curso' }}</td>
                <td>${{ formatPrice(sale.amount) }}</td>
                <td>{{ formatDate(sale.updatedAt) }}</td>
                <td>
                  <span :class="`status-badge ${sale.status}`">
                    {{ formatSaleStatus(sale.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- System Status -->
      <div class="dashboard-section">
        <div class="section-header">
          <h3>Estado del Sistema</h3>
        </div>
        
        <div class="section-content">
          <div class="status-grid">
            <div class="status-card">
              <div class="status-header">
                <h4>Base de datos</h4>
                <span class="status-indicator online">Online</span>
              </div>
              <p>Última sincronización: {{ formatDate(new Date()) }}</p>
            </div>
            
            <div class="status-card">
              <div class="status-header">
                <h4>API</h4>
                <span class="status-indicator online">Online</span>
              </div>
              <p>Tiempo de respuesta: {{ apiResponseTime }}ms</p>
            </div>
            
            <div class="status-card">
              <div class="status-header">
                <h4>Almacenamiento</h4>
                <span class="status-indicator online">Online</span>
              </div>
              <p>Espacio utilizado: {{ adminStats.storageUsed || '0' }} GB</p>
            </div>
            
            <div class="status-card">
              <div class="status-header">
                <h4>Backend</h4>
                <span class="status-indicator online">Online</span>
              </div>
              <p>Versión: {{ adminStats.version || '1.0.0' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatPrice } from '@/utils/apiHelper';

export default {
  name: 'AdminDashboard',
  props: {
    adminStats: {
      type: Object,
      default: () => ({})
    },
    recentSales: {
      type: Array,
      default: () => []
    },
    apiResponseTime: {
      type: Number,
      default: 0
    }
  },
  methods: {
    formatPrice,
    formatDate(date) {
      if (!date) return 'No disponible';
      return new Date(date).toLocaleDateString('es-CL');
    },
    formatSaleStatus(status) {
      const statuses = {
        'pending': 'Pendiente',
        'processing': 'Procesando',
        'completed': 'Completado',
        'failed': 'Fallido',
        'cancelled': 'Cancelado',
        'refunded': 'Reembolsado'
      };
      return statuses[status] || status;
    }
  }
};
</script>

<style scoped>
.user-dashboard {
  width: 100%;
}

.welcome-header {
  margin-bottom: 30px;
  text-align: center;
}

.welcome-header h2 {
  color: #2A3B5F;
  font-family: "Playfair Display", serif;
  margin-bottom: 5px;
}

.welcome-header .subtitle {
  color: #6c757d;
  font-size: 16px;
}

/* Dashboard Summary Section */
.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.summary-icon {
  width: 50px;
  height: 50px;
  background-color: rgba(46, 139, 87, 0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
}

.summary-icon i {
  font-size: 22px;
  color: #2E8B57;
}

.summary-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #2A3B5F;
  margin: 0;
}

.summary-content p {
  margin: 5px 0 0;
  color: #6c757d;
  font-size: 14px;
}

/* Dashboard Sections */
.dashboard-sections {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

@media (min-width: 992px) {
  .dashboard-sections {
    grid-template-columns: 1fr 1fr;
  }
}

.dashboard-section {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eaeaea;
}

.section-header h3 {
  font-family: "Playfair Display", serif;
  color: #2A3B5F;
  margin: 0;
  font-size: 18px;
}

.view-all {
  color: #2E8B57;
  text-decoration: none;
  font-size: 14px;
}

.section-content {
  padding: 20px;
}

/* Data Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 10px;
  text-align: left;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 500;
  color: #2A3B5F;
}

.data-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: white;
  display: inline-block;
}

.status-badge.completed {
  background-color: #28a745;
}

.status-badge.pending {
  background-color: #fd7e14;
}

.status-badge.failed {
  background-color: #dc3545;
}

.status-badge.processing {
  background-color: #0d6efd;
}

.status-badge.cancelled {
  background-color: #6c757d;
}

/* Status Cards */
.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.status-card {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 15px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-header h4 {
  margin: 0;
  color: #2A3B5F;
  font-size: 16px;
}

.status-indicator {
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-indicator.online {
  background-color: #28a745;
  color: white;
}

.status-indicator.offline {
  background-color: #dc3545;
  color: white;
}

.status-card p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 20px;
  color: #6c757d;
}
</style>
