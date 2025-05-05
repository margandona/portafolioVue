<template>
  <div class="payment-success-page">
    <div class="success-container">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      
      <h1>¡Pago Exitoso!</h1>
      <p class="success-message">Tu compra se ha procesado correctamente.</p>
      
      <div class="order-details">
        <h2>Detalles de la Compra</h2>
        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Cargando detalles...</p>
        </div>
        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>
        <div v-else class="details-container">
          <div class="detail-row">
            <span>Número de orden:</span>
            <span>{{ sale.id }}</span>
          </div>
          <div class="detail-row">
            <span>Curso:</span>
            <span>{{ sale.course?.title || 'No disponible' }}</span>
          </div>
          <div class="detail-row">
            <span>Fecha:</span>
            <span>{{ formatDate(sale.updatedAt || sale.completedAt) }}</span>
          </div>
          <div class="detail-row">
            <span>Total pagado:</span>
            <span>${{ formatPrice(sale.amount) }}</span>
          </div>
          <div class="detail-row">
            <span>Método de pago:</span>
            <span>{{ formatPaymentMethod(sale.paymentMethod) }}</span>
          </div>
          <div class="detail-row">
            <span>Estado:</span>
            <span class="status-badge success">{{ formatStatus(sale.status) }}</span>
          </div>
        </div>
      </div>
      
      <div class="enrollment-info">
        <h2>¡Ya estás inscrito en el curso!</h2>
        <p>Ahora puedes comenzar a aprender en nuestra plataforma.</p>
        <div class="action-buttons">
          <button class="btn btn-primary" @click="goToCourse">
            Ir al Curso
          </button>
          <button class="btn btn-secondary" @click="$router.push('/dashboard')">
            Ir al Dashboard
          </button>
        </div>
      </div>
      
      <div class="support-info">
        <p>Si tienes alguna pregunta o necesitas ayuda, contáctanos a través de:</p>
        <p><strong>Email:</strong> soporte@academia-online.com</p>
        <p><strong>Teléfono:</strong> +56 22 123 4567</p>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api';
import { formatPrice } from '@/utils/apiHelper';

export default {
  name: 'PaymentSuccessView',
  data() {
    return {
      saleId: '',
      sale: {},
      isLoading: true,
      error: null
    };
  },
  created() {
    this.saleId = this.$route.params.id;
    this.loadSaleDetails();
  },
  methods: {
    formatPrice(price) {
      if (price === undefined || price === null) return '0';
      return formatPrice(price);
    },
    
    formatDate(date) {
      if (!date) return 'Fecha no disponible';
      return new Date(date).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    
    formatPaymentMethod(method) {
      const methods = {
        'credit_card': 'Tarjeta de Crédito',
        'debit_card': 'Tarjeta de Débito',
        'bank_transfer': 'Transferencia Bancaria',
        'paypal': 'PayPal'
      };
      
      return methods[method] || method;
    },
    
    formatStatus(status) {
      const statuses = {
        'pending': 'Pendiente',
        'processing': 'Procesando',
        'completed': 'Completado',
        'failed': 'Fallido',
        'cancelled': 'Cancelado'
      };
      
      return statuses[status] || status;
    },
    
    async loadSaleDetails() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await api.sales.getById(this.saleId);
        this.sale = response.data;
        
        if (this.sale.status !== 'completed') {
          this.error = 'Esta compra aún no ha sido completada';
        }
      } catch (error) {
        console.error('Error loading sale details:', error);
        this.error = error.response?.data?.message || 'Error al cargar los detalles de la compra';
      } finally {
        this.isLoading = false;
      }
    },
    
    goToCourse() {
      if (this.sale && this.sale.courseId) {
        this.$router.push(`/courses/${this.sale.courseId}`);
      } else {
        this.$router.push('/enrolled');
      }
    }
  }
};
</script>

<style scoped>
.payment-success-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
}

.success-container {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.success-icon {
  text-align: center;
  font-size: 80px;
  color: #28a745;
  margin-bottom: 20px;
}

h1 {
  color: #2A3B5F;
  text-align: center;
  font-size: 32px;
  font-family: "Playfair Display", serif;
  margin-bottom: 10px;
}

h2 {
  color: #2A3B5F;
  font-size: 22px;
  font-family: "Playfair Display", serif;
  margin: 25px 0 15px;
}

.success-message {
  text-align: center;
  color: #4a4a4a;
  font-size: 18px;
  margin-bottom: 30px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eaeaea;
}

.detail-row:last-child {
  border-bottom: none;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge.success {
  background-color: #28a745;
  color: white;
}

.enrollment-info {
  text-align: center;
  margin: 30px 0;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn {
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover {
  background-color: #3AA870;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.loading, .error-message {
  text-align: center;
  padding: 20px;
}

.spinner {
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #2E8B57;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.error-message {
  color: #dc3545;
}

.support-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eaeaea;
  text-align: center;
  font-size: 14px;
  color: #6c757d;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
