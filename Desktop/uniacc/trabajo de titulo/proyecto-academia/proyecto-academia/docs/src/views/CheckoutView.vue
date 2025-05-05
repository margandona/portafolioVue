<template>
  <div class="checkout-page">
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando información de pago...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="$router.push('/courses')">
        Volver a cursos
      </button>
    </div>
    
    <div v-else class="checkout-container">
      <h1>Finalizar Compra</h1>
      
      <div class="order-summary">
        <h2>Resumen del Pedido</h2>
        <div class="course-info">
          <h3>{{ sale.course?.title || 'Curso' }}</h3>
          <p>{{ sale.course?.description || 'Sin descripción' }}</p>
          
          <div class="price-info">
            <div v-if="sale.course?.hasActiveDiscount" class="discount-price">
              <span class="original-price">${{ formatPrice(sale.course.totalPrice) }}</span>
              <span class="discount-badge">{{ sale.course.discount }}% OFF</span>
              <span class="final-price">${{ formatPrice(sale.course.discountedTotalPrice) }}</span>
            </div>
            <div v-else class="regular-price">
              <span class="final-price">${{ formatPrice(sale.amount) }}</span>
            </div>
          </div>
        </div>
        
        <div class="payment-details">
          <div class="detail-row">
            <span>Subtotal:</span>
            <span>${{ formatPrice(calculateSubtotal()) }}</span>
          </div>
          <div class="detail-row">
            <span>IVA (19%):</span>
            <span>${{ formatPrice(calculateTax()) }}</span>
          </div>
          <div v-if="sale.course?.hasActiveDiscount" class="detail-row discount">
            <span>Descuento:</span>
            <span>-${{ formatPrice(calculateDiscount()) }}</span>
          </div>
          <div class="detail-row total">
            <span>Total:</span>
            <span>${{ formatPrice(sale.amount) }}</span>
          </div>
        </div>
      </div>
      
      <div class="payment-methods">
        <h2>Método de Pago</h2>
        <div class="payment-options">
          <div 
            v-for="method in paymentMethods" 
            :key="method.id"
            :class="['payment-option', selectedPaymentMethod === method.id ? 'selected' : '']"
            @click="selectPaymentMethod(method.id)"
          >
            <img :src="method.icon" :alt="method.name" class="payment-icon">
            <span>{{ method.name }}</span>
          </div>
        </div>
        
        <div v-if="selectedPaymentMethod === 'credit_card'" class="credit-card-form">
          <div class="form-group">
            <label for="card_number">Número de Tarjeta</label>
            <input 
              id="card_number" 
              type="text" 
              v-model="paymentForm.cardNumber" 
              placeholder="XXXX XXXX XXXX XXXX"
              maxlength="19"
              @input="formatCardNumber"
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="card_date">Fecha de Vencimiento</label>
              <input 
                id="card_date" 
                type="text" 
                v-model="paymentForm.expiryDate" 
                placeholder="MM/AA"
                maxlength="5"
                @input="formatExpiryDate"
              >
            </div>
            
            <div class="form-group">
              <label for="card_cvv">Código de Seguridad</label>
              <input 
                id="card_cvv" 
                type="text" 
                v-model="paymentForm.cvv" 
                placeholder="CVV"
                maxlength="4"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label for="card_name">Nombre en la Tarjeta</label>
            <input 
              id="card_name" 
              type="text" 
              v-model="paymentForm.cardholderName" 
              placeholder="Nombre como aparece en la tarjeta"
            >
          </div>
        </div>
        
        <div v-if="selectedPaymentMethod === 'bank_transfer'" class="bank-transfer-info">
          <h3>Datos para Transferencia</h3>
          <p><strong>Banco:</strong> Banco Academia</p>
          <p><strong>Cuenta:</strong> 00123456789</p>
          <p><strong>Titular:</strong> Academia Online SpA</p>
          <p><strong>RUT:</strong> 76.123.456-7</p>
          <p><strong>Email:</strong> pagos@academia-online.com</p>
          <p class="note">Por favor incluya el número de referencia {{ sale.id }} en el comentario de la transferencia.</p>
        </div>
      </div>
      
      <div v-if="processingError" class="payment-error">
        {{ processingError }}
      </div>
      
      <div class="checkout-actions">
        <button class="btn btn-secondary" @click="$router.push('/courses')">
          Cancelar
        </button>
        <button 
          class="btn btn-primary" 
          :disabled="!isFormValid || isProcessingPayment" 
          @click="processPayment"
        >
          <span v-if="isProcessingPayment" class="spinner-small"></span>
          {{ isProcessingPayment ? 'Procesando...' : 'Pagar Ahora' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/utils/api';
import { formatPrice } from '@/utils/apiHelper';

export default {
  name: 'CheckoutView',
  data() {
    return {
      saleId: '',
      sale: {},
      isLoading: true,
      error: null,
      processingError: null,
      isProcessingPayment: false,
      selectedPaymentMethod: 'credit_card',
      paymentMethods: [
        {
          id: 'credit_card',
          name: 'Tarjeta de Crédito / Débito',
          icon: '/images/credit-card.png'
        },
        {
          id: 'bank_transfer',
          name: 'Transferencia Bancaria',
          icon: '/images/bank-transfer.png'
        }
      ],
      paymentForm: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      }
    };
  },
  computed: {
    isFormValid() {
      if (this.selectedPaymentMethod === 'credit_card') {
        return this.paymentForm.cardNumber.length >= 16 && 
               this.paymentForm.expiryDate.length === 5 &&
               this.paymentForm.cvv.length >= 3 &&
               this.paymentForm.cardholderName.trim().length > 0;
      }
      return true; // Bank transfer doesn't require form validation
    }
  },
  created() {
    this.saleId = this.$route.params.id;
    this.loadSaleDetails();
  },
  methods: {
    formatPrice,
    
    async loadSaleDetails() {
      this.isLoading = true;
      this.error = null;
      
      try {
        const response = await api.sales.getById(this.saleId);
        this.sale = response.data;
        
        // If sale is already completed, redirect to success page
        if (this.sale.status === 'completed') {
          this.$router.push(`/payment-success/${this.saleId}`);
          return;
        }
        
        // If sale has an issue, show error
        if (this.sale.status === 'cancelled' || this.sale.status === 'failed') {
          this.error = `Esta compra ha sido ${
            this.sale.status === 'cancelled' ? 'cancelada' : 'fallida'
          }. Por favor inicia una nueva compra.`;
        }
        
      } catch (error) {
        console.error('Error loading sale details:', error);
        this.error = error.response?.data?.message || 'Error al cargar los detalles de la compra';
      } finally {
        this.isLoading = false;
      }
    },
    
    calculateSubtotal() {
      if (!this.sale.amount) return 0;
      return Math.round(this.sale.amount / 1.19); // Remove IVA
    },
    
    calculateTax() {
      if (!this.sale.amount) return 0;
      return this.sale.amount - this.calculateSubtotal();
    },
    
    calculateDiscount() {
      if (!this.sale.course?.hasActiveDiscount) return 0;
      const originalTotal = this.sale.course.totalPrice;
      const discountedTotal = this.sale.course.discountedTotalPrice;
      return originalTotal - discountedTotal;
    },
    
    selectPaymentMethod(methodId) {
      this.selectedPaymentMethod = methodId;
    },
    
    formatCardNumber(e) {
      let value = e.target.value.replace(/\D/g, '');
      let formattedValue = '';
      
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
      
      this.paymentForm.cardNumber = formattedValue;
    },
    
    formatExpiryDate(e) {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
      }
      
      this.paymentForm.expiryDate = value;
    },
    
    async processPayment() {
      this.processingError = null;
      this.isProcessingPayment = true;
      
      try {
        const paymentData = {
          paymentMethod: this.selectedPaymentMethod,
          paymentId: `pay_${Date.now()}`,
          transactionDetails: {}
        };
        
        // Add payment method specific details
        if (this.selectedPaymentMethod === 'credit_card') {
          paymentData.transactionDetails = {
            card: this.paymentForm.cardNumber.replace(/\s/g, ''),
            expiryDate: this.paymentForm.expiryDate,
            cardholderName: this.paymentForm.cardholderName,
            amount: this.sale.amount
          };
        } else if (this.selectedPaymentMethod === 'bank_transfer') {
          paymentData.transactionDetails = {
            referenceNumber: this.sale.id,
            amount: this.sale.amount
          };
        }
        
        const response = await api.sales.processPayment(this.saleId, paymentData);
        
        // Redirect to success page
        this.$router.push(`/payment-success/${this.saleId}`);
        
      } catch (error) {
        console.error('Payment processing error:', error);
        this.processingError = error.response?.data?.message || 'Error al procesar el pago. Por favor intente nuevamente.';
      } finally {
        this.isProcessingPayment = false;
      }
    }
  }
};
</script>

<style scoped>
.checkout-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
}

h1, h2, h3 {
  color: #2A3B5F;
  font-family: "Playfair Display", serif;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
}

h2 {
  font-size: 22px;
  margin-bottom: 20px;
}

.checkout-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.order-summary, .payment-methods {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 25px;
}

.course-info {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.course-info h3 {
  margin-bottom: 10px;
  font-size: 18px;
}

.price-info {
  margin-top: 15px;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  margin-right: 10px;
  font-size: 16px;
}

.discount-badge {
  background-color: #fd7e14;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  margin-right: 10px;
}

.final-price {
  font-weight: bold;
  color: #2E8B57;
  font-size: 20px;
}

.payment-details {
  font-size: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 5px 0;
}

.detail-row.total {
  font-weight: bold;
  font-size: 18px;
  border-top: 1px solid #ddd;
  margin-top: 10px;
  padding-top: 10px;
}

.detail-row.discount {
  color: #28a745;
}

.payment-options {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.payment-option {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  flex: 1;
}

.payment-option:hover {
  border-color: #2E8B57;
}

.payment-option.selected {
  border-color: #2E8B57;
  background-color: #f0f9f4;
}

.payment-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.credit-card-form, .bank-transfer-info {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
}

.bank-transfer-info p {
  margin-bottom: 8px;
}

.bank-transfer-info .note {
  margin-top: 20px;
  padding: 10px;
  background-color: #fff8e1;
  border-left: 4px solid #ffc107;
  font-size: 14px;
}

.payment-error {
  color: #dc3545;
  background-color: #f8d7da;
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-weight: 500;
}

.checkout-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn {
  padding: 12px 25px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #2E8B57;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3AA870;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  border-top-color: #2E8B57;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .payment-options {
    flex-direction: column;
  }
  
  .checkout-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn {
    width: 100%;
  }
}
</style>
