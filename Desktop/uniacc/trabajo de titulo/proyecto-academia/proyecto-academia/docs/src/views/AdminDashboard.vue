<template>
  <div class="admin-dashboard">
    <h1>Panel de Administración</h1>
    
    <div class="dashboard-summary">
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="summary-content">
          <h3>{{ stats.totalUsers || 0 }}</h3>
          <p>Usuarios Registrados</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-chalkboard"></i>
        </div>
        <div class="summary-content">
          <h3>{{ stats.totalCourses || 0 }}</h3>
          <p>Cursos Disponibles</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-money-bill-wave"></i>
        </div>
        <div class="summary-content">
          <h3>${{ formatPrice(stats.totalRevenue || 0) }}</h3>
          <p>Ingresos Totales</p>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">
          <i class="fas fa-certificate"></i>
        </div>
        <div class="summary-content">
          <h3>{{ stats.totalEnrollments || 0 }}</h3>
          <p>Inscripciones Totales</p>
        </div>
      </div>
    </div>
    
    <div class="dashboard-sections">
      <div class="section">
        <div class="section-header">
          <h2>Ventas Recientes</h2>
          <router-link to="/admin/sales" class="view-all">Ver Todas</router-link>
        </div>
        <SalesTable 
          :isLoading="isLoading" 
          :sales="recentSales"
          @view-sale="viewSaleDetails"
          @process-payment="processPayment" 
        />
      </div>
      
      <div class="section">
        <div class="section-header">
          <h2>Estado del Sistema</h2>
        </div>
        <SystemStatusGrid 
          :isLoading="isLoading"
          :systemStatus="systemStatus" 
        />
      </div>
    </div>
    
    <div class="charts-section">
      <div class="section">
        <div class="section-header">
          <h2>Distribución de Usuarios</h2>
        </div>
        <div class="chart-container">
          <div class="chart-placeholder">
            <div class="chart">
              <div class="chart-segment students" :style="{ width: `${userDistribution.studentPercentage}%` }">
                {{ userDistribution.studentPercentage }}%
              </div>
              <div class="chart-segment teachers" :style="{ width: `${userDistribution.teacherPercentage}%` }">
                {{ userDistribution.teacherPercentage }}%
              </div>
              <div class="chart-segment admins" :style="{ width: `${userDistribution.adminPercentage}%` }">
                {{ userDistribution.adminPercentage }}%
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color students"></div>
                <span>Estudiantes ({{ stats.studentCount || 0 }})</span>
              </div>
              <div class="legend-item">
                <div class="legend-color teachers"></div>
                <span>Profesores ({{ stats.teacherCount || 0 }})</span>
              </div>
              <div class="legend-item">
                <div class="legend-color admins"></div>
                <span>Administradores ({{ stats.adminCount || 0 }})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-header">
          <h2>Acciones Rápidas</h2>
        </div>
        <div class="quick-actions">
          <button class="action-btn" @click="$router.push('/admin/users')">
            <i class="fas fa-user-plus"></i>
            <span>Gestionar Usuarios</span>
          </button>
          <button class="action-btn" @click="$router.push('/courses/create')">
            <i class="fas fa-plus"></i>
            <span>Crear Curso</span>
          </button>
          <button class="action-btn" @click="$router.push('/admin/reports')">
            <i class="fas fa-chart-bar"></i>
            <span>Reportes</span>
          </button>
          <button class="action-btn" @click="$router.push('/admin/settings')">
            <i class="fas fa-cog"></i>
            <span>Configuración</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SalesTable from '@/components/SalesTable.vue';
import SystemStatusGrid from '@/components/SystemStatusGrid.vue';
import api from '@/utils/api';
import { formatPrice } from '@/utils/apiHelper';

export default {
  name: 'AdminDashboard',
  components: {
    SalesTable,
    SystemStatusGrid
  },
  data() {
    return {
      isLoading: true,
      recentSales: [],
      stats: {},
      systemStatus: {
        database: { status: 'online', details: 'Operando normalmente', responseTime: '45ms' },
        api: { status: 'online', details: 'Todos los endpoints activos', responseTime: '120ms' },
        storage: { status: 'online', details: 'Espacio usado: 2.4GB / 10GB', responseTime: '60ms' },
        services: { status: 'online', details: 'Todos los servicios activos', responseTime: '85ms' }
      },
      error: null
    };
  },
  computed: {
    userDistribution() {
      const totalUsers = this.stats.totalUsers || 0;
      if (totalUsers === 0) {
        return { studentPercentage: 0, teacherPercentage: 0, adminPercentage: 0 };
      }
      
      return {
        studentPercentage: Math.round((this.stats.studentCount || 0) / totalUsers * 100),
        teacherPercentage: Math.round((this.stats.teacherCount || 0) / totalUsers * 100),
        adminPercentage: Math.round((this.stats.adminCount || 0) / totalUsers * 100)
      };
    }
  },
  async created() {
    await this.loadDashboardData();
  },
  methods: {
    formatPrice,
    async loadDashboardData() {
      this.isLoading = true;
      try {
        // Cargar estadísticas generales
        const statsResponse = await api.admin.getStats();
        this.stats = statsResponse.data || {};
        
        // Cargar ventas recientes
        const salesResponse = await api.sales.getAll({ limit: 10 });
        this.recentSales = salesResponse.data || [];
        
        // Verificar estado del sistema
        await this.checkSystemStatus();
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        this.error = error.response?.data?.message || 'Error al cargar los datos del dashboard';
      } finally {
        this.isLoading = false;
      }
    },
    
    async checkSystemStatus() {
      try {
        const healthResponse = await api.admin.getSystemHealth();
        this.systemStatus = healthResponse.data || this.systemStatus;
      } catch (error) {
        console.error('Error verificando estado del sistema:', error);
        this.systemStatus = {
          database: { status: 'warning', details: 'No se pudo verificar el estado', responseTime: 'N/A' },
          api: { status: 'warning', details: 'No se pudo verificar el estado', responseTime: 'N/A' },
          storage: { status: 'warning', details: 'No se pudo verificar el estado', responseTime: 'N/A' },
          services: { status: 'warning', details: 'No se pudo verificar el estado', responseTime: 'N/A' }
        };
      }
    },
    
    viewSaleDetails(saleId) {
      this.$router.push(`/admin/sales/${saleId}`);
    },
    
    processPayment(saleId) {
      this.$router.push(`/admin/sales/${saleId}/process`);
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2A3B5F;
  font-family: "Playfair Display", serif;
  margin-bottom: 30px;
  text-align: center;
}

.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

.dashboard-sections, .charts-section {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

@media (min-width: 992px) {
  .dashboard-sections, .charts-section {
    grid-template-columns: 1fr 1fr;
  }
}

.section {
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

.section-header h2 {
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

/* Estilos para el gráfico de distribución de usuarios */
.chart-container {
  padding: 20px;
}

.chart-placeholder {
  min-height: 180px;
}

.chart {
  display: flex;
  height: 40px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.chart-segment {
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: 500;
  font-size: 14px;
}

.chart-segment.students {
  background-color: #0d6efd;
}

.chart-segment.teachers {
  background-color: #fd7e14;
}

.chart-segment.admins {
  background-color: #dc3545;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-color {
  width: 15px;
  height: 15px;
  margin-right: 5px;
  border-radius: 3px;
}

.legend-color.students {
  background-color: #0d6efd;
}

.legend-color.teachers {
  background-color: #fd7e14;
}

.legend-color.admins {
  background-color: #dc3545;
}

/* Estilos para acciones rápidas */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 20px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #e9ecef;
  transform: translateY(-3px);
}

.action-btn i {
  font-size: 24px;
  color: #2E8B57;
  margin-bottom: 10px;
}

.action-btn span {
  color: #2A3B5F;
  font-weight: 500;
}
</style>
