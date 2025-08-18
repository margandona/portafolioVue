<template>
  <div class="khipu-return">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card class="return-card" elevation="8">
            
            <!-- Loading State -->
            <div v-if="loading" class="text-center pa-8">
              <v-progress-circular
                :size="70"
                :width="7"
                color="primary"
                indeterminate
              ></v-progress-circular>
              <h3 class="mt-4">Verificando tu pago...</h3>
              <p class="text-subtitle-1">
                Estamos confirmando tu transferencia bancaria
              </p>
            </div>

            <!-- Success State -->
            <div v-else-if="paymentSuccess" class="text-center pa-8">
              <v-icon color="success" size="80" class="mb-4">
                mdi-check-circle
              </v-icon>
              
              <h2 class="success-title mb-4">
                🎉 ¡Pago Exitoso!
              </h2>
              
              <p class="text-h6 mb-4">
                Tu transferencia se procesó correctamente
              </p>

              <v-divider class="my-4"></v-divider>

              <div class="payment-details">
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="detail-item">
                      <strong>Curso:</strong>
                      <p>{{ paymentInfo.courseTitle }}</p>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="detail-item">
                      <strong>Monto:</strong>
                      <p class="amount">${{ paymentInfo.amount?.toLocaleString() }} CLP</p>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="detail-item">
                      <strong>Método:</strong>
                      <p>Transferencia Bancaria</p>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div class="detail-item">
                      <strong>Fecha:</strong>
                      <p>{{ formatDate(new Date()) }}</p>
                    </div>
                  </v-col>
                </v-row>
              </div>

              <v-alert type="success" variant="tonal" class="mt-4">
                <strong>✅ Ya tienes acceso al curso</strong><br>
                Puedes comenzar a estudiar inmediatamente
              </v-alert>

              <div class="action-buttons mt-6">
                <v-btn
                  color="primary"
                  size="large"
                  @click="goToCourse"
                  class="mr-4"
                >
                  <v-icon start>mdi-play-circle</v-icon>
                  Ir al Curso
                </v-btn>

                <v-btn
                  color="secondary"
                  size="large"
                  variant="outlined"
                  @click="goToMyCourses"
                >
                  <v-icon start>mdi-book-multiple</v-icon>
                  Mis Cursos
                </v-btn>
              </div>
            </div>

            <!-- Error State -->
            <div v-else class="text-center pa-8">
              <v-icon color="error" size="80" class="mb-4">
                mdi-alert-circle
              </v-icon>
              
              <h2 class="error-title mb-4">
                ⚠️ Problema con el Pago
              </h2>
              
              <p class="text-subtitle-1 mb-4">
                {{ errorMessage }}
              </p>

              <v-alert type="warning" variant="tonal" class="mt-4">
                <strong>¿Qué puedes hacer?</strong><br>
                1. Verificar tu cuenta bancaria<br>
                2. Intentar el pago nuevamente<br>
                3. Contactar soporte si el problema persiste
              </v-alert>

              <div class="action-buttons mt-6">
                <v-btn
                  color="primary"
                  size="large"
                  @click="retryPayment"
                  class="mr-4"
                >
                  <v-icon start>mdi-refresh</v-icon>
                  Intentar Nuevamente
                </v-btn>

                <v-btn
                  color="grey"
                  size="large"
                  variant="outlined"
                  @click="contactSupport"
                >
                  <v-icon start>mdi-help-circle</v-icon>
                  Contactar Soporte
                </v-btn>
              </div>
            </div>

          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'KhipuReturnView',

  data() {
    return {
      loading: true,
      paymentSuccess: false,
      errorMessage: '',
      paymentInfo: {}
    };
  },

  async mounted() {
    await this.processReturn();
  },

  methods: {
    async processReturn() {
      try {
        // Obtener parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const paymentId = urlParams.get('payment_id');
        const notificationId = urlParams.get('notification_id');
        
        console.log('🔍 Procesando retorno Khipu:', { paymentId, notificationId });

        if (!paymentId) {
          throw new Error('ID de pago no encontrado en la URL');
        }

        // Obtener información del pago desde el store
        this.paymentInfo = this.$store.getters.getPaymentInfo || {};
        
        // Verificar el pago con el backend
        const response = await this.$http.post('/api/payments/khipu/confirm', {
          paymentId: paymentId,
          saleId: this.paymentInfo.saleId
        });

        if (response.data.success && response.data.paymentConfirmed) {
          this.paymentSuccess = true;
          
          // Actualizar información del pago
          this.paymentInfo = {
            ...this.paymentInfo,
            ...response.data.sale
          };

          // Limpiar información de pago del store
          this.$store.dispatch('clearPaymentInfo');

          console.log('✅ Pago Khipu confirmado exitosamente');

        } else {
          throw new Error(response.data.message || 'Pago no confirmado');
        }

      } catch (error) {
        console.error('❌ Error procesando retorno:', error);
        this.paymentSuccess = false;
        this.errorMessage = error.response?.data?.message || error.message || 'Error verificando el pago';
      } finally {
        this.loading = false;
      }
    },

    goToCourse() {
      if (this.paymentInfo.courseId) {
        this.$router.push(`/course/${this.paymentInfo.courseId}`);
      } else {
        this.goToMyCourses();
      }
    },

    goToMyCourses() {
      this.$router.push('/my-courses');
    },

    retryPayment() {
      // Volver al checkout
      if (this.paymentInfo.courseId) {
        this.$router.push(`/checkout/${this.paymentInfo.courseId}`);
      } else {
        this.$router.push('/courses');
      }
    },

    contactSupport() {
      // Ir a página de contacto o abrir email
      this.$router.push('/contact');
    },

    formatDate(date) {
      return new Intl.DateTimeFormat('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  }
};
</script>

<style scoped>
.khipu-return {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 0;
}

.return-card {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.success-title {
  color: #2e7d32;
  font-weight: 600;
}

.error-title {
  color: #d32f2f;
  font-weight: 600;
}

.payment-details {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-item strong {
  color: #666;
  font-size: 14px;
  display: block;
}

.detail-item p {
  margin: 4px 0 0 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.amount {
  color: #2e7d32 !important;
  font-weight: 700 !important;
  font-size: 18px !important;
}

.action-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

@media (max-width: 600px) {
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .v-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>
