<template>
  <div class="khipu-payment">
    <v-card class="payment-card" elevation="8">
      <v-card-title class="payment-header">
        <v-icon class="mr-3" color="primary" size="32">mdi-bank-transfer</v-icon>
        <span>Pagar con Transferencia Bancaria</span>
      </v-card-title>
      
      <v-card-text>
        <!-- Información del pago -->
        <div class="payment-info mb-4">
          <v-row>
            <v-col cols="12" md="6">
              <div class="info-item">
                <strong>Curso:</strong>
                <p>{{ course.title }}</p>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="info-item">
                <strong>Precio:</strong>
                <p class="price">${{ totalAmount.toLocaleString() }} CLP</p>
              </div>
            </v-col>
          </v-row>
        </div>

        <!-- Ventajas de Khipu -->
        <v-alert 
          type="info" 
          variant="tonal" 
          class="mb-4"
        >
          <div class="khipu-benefits">
            <h4>✅ Ventajas de la Transferencia Bancaria:</h4>
            <ul>
              <li>🔒 <strong>Más Seguro</strong>: Sin exposición de datos de tarjeta</li>
              <li>💰 <strong>Sin Comisiones</strong>: Pagas exactamente el precio del curso</li>
              <li>⚡ <strong>Confirmación Inmediata</strong>: Acceso instantáneo al curso</li>
              <li>🏦 <strong>Todos los Bancos</strong>: BCI, Santander, Chile, Estado, etc.</li>
            </ul>
          </div>
        </v-alert>

        <!-- Bancos disponibles -->
        <div class="banks-section mb-4">
          <h4 class="mb-2">Bancos Disponibles:</h4>
          <div class="banks-grid">
            <v-chip
              v-for="bank in availableBanks"
              :key="bank.id"
              class="ma-1"
              color="primary"
              variant="outlined"
            >
              <v-icon start>mdi-bank</v-icon>
              {{ bank.name }}
            </v-chip>
          </div>
        </div>

        <!-- Proceso de pago -->
        <v-expansion-panels class="mb-4">
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-help-circle</v-icon>
              ¿Cómo funciona el pago?
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="payment-steps">
                <div class="step">
                  <v-icon color="success" class="mr-2">mdi-numeric-1-circle</v-icon>
                  <span>Haz clic en "Pagar con Transferencia"</span>
                </div>
                <div class="step">
                  <v-icon color="success" class="mr-2">mdi-numeric-2-circle</v-icon>
                  <span>Elige tu banco y te redirigiremos</span>
                </div>
                <div class="step">
                  <v-icon color="success" class="mr-2">mdi-numeric-3-circle</v-icon>
                  <span>Ingresa a tu banco online como siempre</span>
                </div>
                <div class="step">
                  <v-icon color="success" class="mr-2">mdi-numeric-4-circle</v-icon>
                  <span>Confirma la transferencia</span>
                </div>
                <div class="step">
                  <v-icon color="success" class="mr-2">mdi-numeric-5-circle</v-icon>
                  <span>¡Acceso inmediato al curso!</span>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Botones de acción -->
        <div class="action-buttons">
          <v-btn
            color="primary"
            size="large"
            block
            :loading="processing"
            @click="processKhipuPayment"
            class="mb-3"
          >
            <v-icon start>mdi-bank-transfer</v-icon>
            Pagar con Transferencia - ${{ totalAmount.toLocaleString() }} CLP
          </v-btn>

          <v-btn
            color="grey"
            variant="outlined"
            size="large"
            block
            @click="$emit('back')"
            :disabled="processing"
          >
            <v-icon start>mdi-arrow-left</v-icon>
            Volver a Métodos de Pago
          </v-btn>
        </div>

        <!-- Información de seguridad -->
        <div class="security-info text-center mt-4">
          <v-chip color="success" variant="tonal" size="small">
            <v-icon start>mdi-shield-check</v-icon>
            Protegido por Khipu
          </v-chip>
          <p class="text-caption mt-2">
            Tus datos bancarios se mantienen seguros en tu banco
          </p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'KhipuPayment',
  
  props: {
    course: {
      type: Object,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      processing: false,
      availableBanks: [
        { id: 'bci', name: 'Banco BCI' },
        { id: 'santander', name: 'Banco Santander' },
        { id: 'chile', name: 'Banco de Chile' },
        { id: 'estado', name: 'BancoEstado' },
        { id: 'scotiabank', name: 'Scotiabank' },
        { id: 'itau', name: 'Banco Itaú' },
        { id: 'security', name: 'Banco Security' },
        { id: 'falabella', name: 'Banco Falabella' }
      ]
    };
  },

  async mounted() {
    await this.loadAvailableBanks();
  },

  methods: {
    async loadAvailableBanks() {
      try {
        const response = await this.$http.get('/api/payments/khipu/banks');
        if (response.data.success && response.data.banks.length > 0) {
          this.availableBanks = response.data.banks;
        }
      } catch (error) {
        console.log('ℹ️ Usando bancos por defecto');
      }
    },

    async processKhipuPayment() {
      this.$emit('payment-processing', true);
      this.processing = true;

      try {
        console.log('🏦 Iniciando pago con Khipu...');

        // Crear venta si no existe
        const saleResult = await this.initiatePurchase(this.course.id);
        const saleId = saleResult.saleId;

        // Crear pago con Khipu
        const response = await this.$http.post('/api/payments/khipu/create', {
          saleId: saleId,
          amount: this.totalAmount,
          courseTitle: this.course.title
        });

        if (response.data.success) {
          // Guardar información del pago
          this.$store.dispatch('setPaymentInfo', {
            provider: 'khipu',
            saleId: saleId,
            paymentId: response.data.paymentId,
            amount: this.totalAmount,
            courseTitle: this.course.title
          });

          console.log('🔄 Redirigiendo a Khipu...');

          // Redirigir a Khipu para completar el pago
          window.location.href = response.data.paymentUrl;

        } else {
          throw new Error(response.data.message || 'Error creando pago con Khipu');
        }

      } catch (error) {
        console.error('❌ Error en pago Khipu:', error);

        this.$emit('payment-error', {
          message: error.response?.data?.message || error.message || 'Error procesando el pago con Khipu'
        });
      } finally {
        this.processing = false;
        this.$emit('payment-processing', false);
      }
    },

    async initiatePurchase(courseId) {
      try {
        const response = await this.$http.post('/api/sales/initiate', {
          courseId: courseId,
          amount: this.totalAmount,
          currency: 'CLP'
        });

        if (response.data.success) {
          return { saleId: response.data.sale.id };
        } else {
          throw new Error(response.data.message || 'Error iniciando compra');
        }
      } catch (error) {
        console.error('Error iniciando compra:', error);
        throw new Error('Error iniciando la compra. Intenta nuevamente.');
      }
    }
  }
};
</script>

<style scoped>
.khipu-payment {
  max-width: 600px;
  margin: 0 auto;
}

.payment-card {
  border-radius: 16px;
}

.payment-header {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  padding: 24px;
  border-radius: 16px 16px 0 0;
}

.payment-info {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
}

.info-item {
  margin-bottom: 8px;
}

.info-item strong {
  color: #1976d2;
  font-size: 14px;
}

.info-item p {
  margin: 4px 0 0 0;
  font-size: 16px;
  font-weight: 500;
}

.price {
  color: #2e7d32;
  font-size: 20px !important;
  font-weight: 700 !important;
}

.khipu-benefits h4 {
  color: #1976d2;
  margin-bottom: 12px;
}

.khipu-benefits ul {
  margin: 0;
  padding-left: 20px;
}

.khipu-benefits li {
  margin-bottom: 8px;
  line-height: 1.4;
}

.banks-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.payment-steps {
  padding: 16px 0;
}

.step {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.action-buttons {
  margin-top: 24px;
}

.security-info {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  margin-top: 16px;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .payment-header {
    padding: 16px;
  }
  
  .payment-info {
    padding: 12px;
  }

  .banks-grid {
    justify-content: center;
  }
}
</style>
