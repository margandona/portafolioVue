<template>
  <div class="system-status-grid">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Verificando estado del sistema...</p>
    </div>
    
    <div v-else class="status-grid">
      <div class="status-card">
        <div class="status-header">
          <h3 class="status-title">Base de datos</h3>
          <span :class="['status-indicator', systemStatus.database.status]">
            {{ formatStatus(systemStatus.database.status) }}
          </span>
        </div>
        <div class="status-body">
          <p class="status-details">{{ systemStatus.database.details }}</p>
          <div class="metric">
            <span class="metric-label">Tiempo de respuesta:</span>
            <span class="metric-value">{{ systemStatus.database.responseTime }}</span>
          </div>
        </div>
      </div>
      
      <div class="status-card">
        <div class="status-header">
          <h3 class="status-title">API</h3>
          <span :class="['status-indicator', systemStatus.api.status]">
            {{ formatStatus(systemStatus.api.status) }}
          </span>
        </div>
        <div class="status-body">
          <p class="status-details">{{ systemStatus.api.details }}</p>
          <div class="metric">
            <span class="metric-label">Tiempo de respuesta:</span>
            <span class="metric-value">{{ systemStatus.api.responseTime }}</span>
          </div>
        </div>
      </div>
      
      <div class="status-card">
        <div class="status-header">
          <h3 class="status-title">Almacenamiento</h3>
          <span :class="['status-indicator', systemStatus.storage.status]">
            {{ formatStatus(systemStatus.storage.status) }}
          </span>
        </div>
        <div class="status-body">
          <p class="status-details">{{ systemStatus.storage.details }}</p>
          <div class="metric">
            <span class="metric-label">Tiempo de respuesta:</span>
            <span class="metric-value">{{ systemStatus.storage.responseTime }}</span>
          </div>
        </div>
      </div>
      
      <div class="status-card">
        <div class="status-header">
          <h3 class="status-title">Servicios</h3>
          <span :class="['status-indicator', systemStatus.services.status]">
            {{ formatStatus(systemStatus.services.status) }}
          </span>
        </div>
        <div class="status-body">
          <p class="status-details">{{ systemStatus.services.details }}</p>
          <div class="metric">
            <span class="metric-label">Tiempo de respuesta:</span>
            <span class="metric-value">{{ systemStatus.services.responseTime }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="system-actions">
      <button class="btn btn-primary" @click="$emit('refresh')">
        <i class="fas fa-sync-alt"></i> Actualizar Estado
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemStatusGrid',
  props: {
    systemStatus: {
      type: Object,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatStatus(status) {
      const statusMap = {
        'online': 'En línea',
        'offline': 'Fuera de línea',
        'warning': 'Advertencia',
        'error': 'Error'
      };
      return statusMap[status] || status;
    }
  }
};
</script>

<style scoped>
.system-status-grid {
  padding: 20px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  text-align: center;
  color: #6c757d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #2E8B57;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.status-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.status-header {
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e9ecef;
}

.status-title {
  margin: 0;
  font-size: 16px;
  color: #2A3B5F;
}

.status-indicator {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  color: white;
}

.status-indicator.online {
  background-color: #28a745;
}

.status-indicator.offline {
  background-color: #dc3545;
}

.status-indicator.warning {
  background-color: #ffc107;
  color: #212529;
}

.status-indicator.error {
  background-color: #dc3545;
}

.status-body {
  padding: 15px;
}

.status-details {
  margin: 0 0 10px;
  font-size: 14px;
  color: #6c757d;
}

.metric {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.metric-label {
  color: #6c757d;
}

.metric-value {
  font-family: monospace;
}

.system-actions {
  margin-top: 20px;
  text-align: center;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover {
  background-color: #3AA870;
}

.btn i {
  margin-right: 5px;
}
</style>
