<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="mx-auto" max-width="600">
          <!-- Loading State -->
          <div v-if="loading" class="text-center pa-8">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <h3 class="mt-4">Procesando pago...</h3>
            <p class="text-grey">Confirmando tu transacción con Transbank</p>
          </div>

          <!-- Success State -->
          <div v-else-if="success && paymentData" class="text-center pa-8">
            <v-icon color="success" size="64" class="mb-4">
              mdi-check-circle
            </v-icon>
            
            <h2 class="mb-4">¡Pago Exitoso!</h2>
            
            <v-card-text>
              <div class="mb-4">
                <h4>Detalles de la transacción:</h4>
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Curso</v-list-item-title>
                      <v-list-item-subtitle>{{ paymentData.courseTitle }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Monto</v-list-item-title>
                      <v-list-item-subtitle>${{ formatCurrency(paymentData.amount) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  
                  <v-list-item v-if="transactionDetails">
                    <v-list-item-content>
                      <v-list-item-title>Código de autorización</v-list-item-title>
                      <v-list-item-subtitle>{{ transactionDetails.authorizationCode }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  
                  <v-list-item v-if="transactionDetails">
                    <v-list-item-content>
                      <v-list-item-title>Fecha de transacción</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(transactionDetails.transactionDate) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>
              
              <v-btn 
                color="primary" 
                large 
                @click="goToCourse"
                :disabled="!paymentData.courseId"
              >
                Acceder al Curso
              </v-btn>
              
              <v-btn 
                text 
                @click="goToMyCourses"
                class="ml-2"
              >
                Ver Mis Cursos
              </v-btn>
            </v-card-text>
          </div>

          <!-- Error State -->
          <div v-else class="text-center pa-8">
            <v-icon color="error" size="64" class="mb-4">
              mdi-alert-circle
            </v-icon>
            
            <h2 class="mb-4">Error en el Pago</h2>
            
            <v-card-text>
              <p class="text-error mb-4">{{ errorMessage }}</p>
              
              <v-btn 
                color="primary" 
                @click="retryPayment"
              >
                Intentar Nuevamente
              </v-btn>
              
              <v-btn 
                text 
                @click="goHome"
                class="ml-2"
              >
                Volver al Inicio
              </v-btn>
            </v-card-text>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import paymentService from '@/services/paymentService'

export default {
  name: 'TransbankReturnView',
  data() {
    return {
      loading: true,
      success: false,
      errorMessage: '',
      paymentData: null,
      transactionDetails: null
    }
  },
  
  async mounted() {
    await this.processTransbankReturn();
  },
  
  methods: {
    async processTransbankReturn() {
      try {
        // Obtener parámetros de la URL de retorno de Transbank
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token_ws');
        
        if (!token) {
          throw new Error('Token de transacción no encontrado');
        }
        
        console.log('🔍 Token recibido de Transbank:', token);
        
        // Recuperar datos de la sesión
        const sessionData = sessionStorage.getItem('transbankPayment');
        if (!sessionData) {
          throw new Error('Datos de la transacción no encontrados');
        }
        
        this.paymentData = JSON.parse(sessionData);
        console.log('📋 Datos de sesión recuperados:', this.paymentData);
        
        // Usar el servicio de pagos para confirmar la transacción
        const result = await paymentService.confirmTransbankTransaction(
          token, 
          this.paymentData.saleId
        );
        
        console.log('✅ Transacción confirmada:', result);
        
        this.success = true;
        this.transactionDetails = result.transactionDetails;
        
        // Limpiar datos de sesión
        sessionStorage.removeItem('transbankPayment');
        
        // Actualizar el estado del curso en el store si es necesario
        if (this.$store.dispatch) {
          try {
            await this.$store.dispatch('courses/enrollInCourse', {
              courseId: this.paymentData.courseId,
              saleId: this.paymentData.saleId
            });
            
            console.log('✅ Estado del curso actualizado en store');
          } catch (error) {
            console.warn('⚠️ Error updating course enrollment status:', error);
          }
        }
        
      } catch (error) {
        console.error('❌ Error processing Transbank return:', error);
        this.success = false;
        this.errorMessage = error.message || 'Error procesando el pago';
      } finally {
        this.loading = false;
      }
    },
    
    formatCurrency(amount) {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(amount);
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    goToCourse() {
      if (this.paymentData && this.paymentData.courseId) {
        this.$router.push(`/courses/${this.paymentData.courseId}`);
      }
    },
    
    goToMyCourses() {
      this.$router.push('/my-courses');
    },
    
    retryPayment() {
      if (this.paymentData && this.paymentData.courseId) {
        this.$router.push(`/checkout/${this.paymentData.courseId}`);
      } else {
        this.goHome();
      }
    },
    
    goHome() {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-list-item-title {
  font-weight: 600;
}

.v-list-item-subtitle {
  color: rgba(0, 0, 0, 0.7);
}
</style>
