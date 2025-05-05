<template>
  <div class="sales-table-container">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando ventas...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="sales.length === 0" class="empty-state">
      <p>No hay ventas recientes para mostrar.</p>
    </div>
    
    <table v-else class="sales-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Usuario</th>
          <th>Curso</th>
          <th>Monto</th>
          <th>Estado</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sale in sales" :key="sale.id" :class="getRowClass(sale)">
          <td class="sale-id">{{ formatSaleId(sale.id) }}</td>
          <td class="user-name">{{ sale.user?.name || 'Usuario' }}</td>
          <td class="course-title">{{ sale.course?.title || 'Curso' }}</td>
          <td class="amount">${{ formatPrice(sale.amount) }}</td>
          <td class="status">
            <span :class="['status-badge', sale.status]">
              {{ formatStatus(sale.status) }}
            </span>
          </td>
          <td class="date">{{ formatDate(sale.createdAt) }}</td>
          <td class="actions">
            <button class="btn btn-view" @click="$emit('view-sale', sale.id)" title="Ver Detalle">
              <i class="fas fa-eye"></i>
            </button>
            <button 
              v-if="sale.status === 'pending' || sale.status === 'processing'" 
              class="btn btn-process" 
              @click="$emit('process-payment', sale.id)"
              title="Procesar Pago"
            >
              <i class="fas fa-money-bill-wave"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'SalesTable',
  props: {
    sales: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  methods: {
    formatSaleId(id) {
      if (!id) return 'N/A';
      // Mostramos solo los primeros 8 caracteres
      return id.substring(0, 8) + '...';
    },
    
    formatPrice(price) {
      if (price === undefined || price === null) return '0';
      return Number(price).toLocaleString('es-CL');
    },
    
    formatDate(date) {
      if (!date) return 'Fecha no disponible';
      return new Date(date).toLocaleDateString('es-CL');
    },
    
    formatStatus(status) {
      const statusMap = {
        'pending': 'Pendiente',
        'processing': 'Procesando',
        'completed': 'Completado',
        'cancelled': 'Cancelado',
        'failed': 'Fallido',
        'refunded': 'Reembolsado'
      };
      return statusMap[status] || status;
    },
    
    getRowClass(sale) {
      return {
        'row-pending': sale.status === 'pending',
        'row-processing': sale.status === 'processing',
        'row-completed': sale.status === 'completed',
        'row-cancelled': sale.status === 'cancelled',
        'row-failed': sale.status === 'failed',
        'row-refunded': sale.status === 'refunded'
      };
    }
  }
};
</script>

<style scoped>
.sales-table-container {
  padding: 0;
  overflow-x: auto;
}

.loading-state, .error-state, .empty-state {
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

.sales-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.sales-table th, 
.sales-table td {
  padding: 10px;
  text-align: left;
}

.sales-table th {
  background-color: #f8f9fa;
  color: #2A3B5F;
  font-weight: 500;
  white-space: nowrap;
}

.sales-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

.sales-table tr:hover {
  background-color: #e9ecef;
}

/* Estilo para las filas según su estado */
.row-completed {
  background-color: rgba(40, 167, 69, 0.05);
}

.row-cancelled, .row-failed {
  background-color: rgba(220, 53, 69, 0.05);
}

.row-refunded {
  background-color: rgba(255, 193, 7, 0.05);
}

.row-pending {
  background-color: rgba(13, 110, 253, 0.05);
}

.row-processing {
  background-color: rgba(253, 126, 20, 0.05);
}

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  color: white;
}

.status-badge.pending {
  background-color: #0d6efd;
}

.status-badge.processing {
  background-color: #fd7e14;
}

.status-badge.completed {
  background-color: #28a745;
}

.status-badge.cancelled {
  background-color: #6c757d;
}

.status-badge.failed {
  background-color: #dc3545;
}

.status-badge.refunded {
  background-color: #ffc107;
}

.sale-id, .amount {
  font-family: monospace;
  white-space: nowrap;
}

.user-name, .course-title {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  white-space: nowrap;
}

.btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: white;
  margin-right: 5px;
}

.btn:last-child {
  margin-right: 0;
}

.btn-view {
  background-color: #6c757d;
}

.btn-view:hover {
  background-color: #5a6268;
}

.btn-process {
  background-color: #0d6efd;
}

.btn-process:hover {
  background-color: #0b5ed7;
}

@media (max-width: 768px) {
  .sales-table {
    min-width: 600px;
  }
}
</style>
