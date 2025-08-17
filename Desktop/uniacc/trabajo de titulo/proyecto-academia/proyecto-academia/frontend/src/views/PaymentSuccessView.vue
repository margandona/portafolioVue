<template>
  <v-container class="payment-success-container" max-width="800">
    <!-- Success Header -->
    <v-row justify="center" class="mb-8">
      <v-col cols="12" class="text-center">
        <v-icon color="success" size="120" class="mb-4">mdi-check-circle</v-icon>
        <h1 class="text-h3 font-weight-bold text-success mb-2">¡Pago Exitoso!</h1>
        <p class="text-h6 text-medium-emphasis mb-4">
          Tu compra se ha procesado correctamente
        </p>
        <v-chip color="success" variant="tonal" size="large">
          <v-icon start>mdi-receipt</v-icon>
          Transacción #{{ transactionId }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- Purchase Summary -->
    <v-row justify="center" class="mb-6">
      <v-col cols="12" md="10">
        <v-card elevation="3">
          <v-card-title class="text-h5 bg-success text-white">
            <v-icon class="me-2">mdi-shopping-check</v-icon>
            Resumen de tu Compra
          </v-card-title>
          
          <v-card-text class="pa-6">
            <v-row v-if="course" align="center">
              <!-- Course Image -->
              <v-col cols="12" sm="4">
                <v-img
                  :src="course.imageUrl || defaultImage"
                  height="200"
                  cover
                  class="rounded"
                ></v-img>
              </v-col>
              
              <!-- Course Details -->
              <v-col cols="12" sm="8">
                <div class="text-h5 font-weight-bold mb-3">{{ course.title }}</div>
                
                <v-list density="compact" class="bg-transparent">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-account-tie</v-icon>
                    </template>
                    <v-list-item-title>{{ course.instructorName || 'Instructor' }}</v-list-item-title>
                    <v-list-item-subtitle>Instructor del curso</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-clock-outline</v-icon>
                    </template>
                    <v-list-item-title>{{ formatDuration(course.duration) }}</v-list-item-title>
                    <v-list-item-subtitle>Duración total</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-tag</v-icon>
                    </template>
                    <v-list-item-title>{{ course.category }}</v-list-item-title>
                    <v-list-item-subtitle>Categoría</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="success">mdi-currency-usd</v-icon>
                    </template>
                    <v-list-item-title class="text-h6 text-success font-weight-bold">
                      ${{ formatPrice(paidAmount) }}
                    </v-list-item-title>
                    <v-list-item-subtitle>Monto pagado</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Payment Details -->
    <v-row justify="center" class="mb-6">
      <v-col cols="12" md="10">
        <v-card elevation="2">
          <v-card-title class="text-h6">
            <v-icon class="me-2">mdi-receipt-text</v-icon>
            Detalles del Pago
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-list density="compact" class="bg-transparent">
                  <v-list-item>
                    <v-list-item-title class="font-weight-medium">Fecha de pago:</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(paymentDate) }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title class="font-weight-medium">Método de pago:</v-list-item-title>
                    <v-list-item-subtitle>{{ paymentMethod }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title class="font-weight-medium">Estado:</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip color="success" size="small">Completado</v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-list density="compact" class="bg-transparent">
                  <v-list-item>
                    <v-list-item-title class="font-weight-medium">ID de transacción:</v-list-item-title>
                    <v-list-item-subtitle>{{ transactionId }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title class="font-weight-medium">ID de venta:</v-list-item-title>
                    <v-list-item-subtitle>{{ saleId }}</v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <v-list-item-title class="font-weight-medium">Recibo:</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-btn size="small" variant="text" color="primary" @click="downloadReceipt">
                        <v-icon start>mdi-download</v-icon>
                        Descargar
                      </v-btn>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- What's Next Section -->
    <v-row justify="center" class="mb-6">
      <v-col cols="12" md="10">
        <v-card elevation="2" color="primary" variant="tonal">
          <v-card-title class="text-h6">
            <v-icon class="me-2">mdi-rocket-launch</v-icon>
            ¿Qué sigue ahora?
          </v-card-title>
          
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4" class="text-center">
                <v-icon color="primary" size="48" class="mb-2">mdi-play-circle</v-icon>
                <div class="text-subtitle-1 font-weight-medium mb-2">1. Comienza a aprender</div>
                <div class="text-body-2">Accede inmediatamente al contenido completo del curso</div>
              </v-col>
              
              <v-col cols="12" md="4" class="text-center">
                <v-icon color="primary" size="48" class="mb-2">mdi-account-group</v-icon>
                <div class="text-subtitle-1 font-weight-medium mb-2">2. Únete a la comunidad</div>
                <div class="text-body-2">Conecta con otros estudiantes y el instructor</div>
              </v-col>
              
              <v-col cols="12" md="4" class="text-center">
                <v-icon color="primary" size="48" class="mb-2">mdi-certificate</v-icon>
                <div class="text-subtitle-1 font-weight-medium mb-2">3. Obtén tu certificado</div>
                <div class="text-body-2">Completa el curso y recibe tu certificado oficial</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Action Buttons -->
    <v-row justify="center">
      <v-col cols="12" md="6" class="text-center">
        <v-btn
          color="primary"
          size="x-large"
          class="mb-3 me-3"
          @click="goToCourse"
          :loading="navigating"
        >
          <v-icon start>mdi-play</v-icon>
          Comenzar Curso
        </v-btn>
        
        <v-btn
          color="secondary"
          size="large"
          variant="outlined"
          class="mb-3"
          @click="goToDashboard"
        >
          <v-icon start>mdi-view-dashboard</v-icon>
          Ir al Dashboard
        </v-btn>
      </v-col>
    </v-row>

    <!-- Email Confirmation -->
    <v-row justify="center" class="mt-6">
      <v-col cols="12" md="8" class="text-center">
        <v-alert type="info" variant="tonal">
          <template v-slot:prepend>
            <v-icon>mdi-email</v-icon>
          </template>
          <div class="text-body-2">
            <strong>Confirmación enviada:</strong>
            Hemos enviado un email de confirmación con los detalles de tu compra 
            a <strong>{{ userEmail }}</strong>
          </div>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'PaymentSuccessView',
  
  data() {
    return {
      course: null,
      loading: true,
      navigating: false,
      error: null,
      
      // Payment info from route params
      transactionId: null,
      saleId: null,
      paidAmount: 0,
      paymentDate: new Date(),
      paymentMethod: 'Tarjeta de Crédito',
      
      // Default image for courses
      defaultImage: require('@/assets/placeholders').coursePlaceholder
    };
  },
  
  computed: {
    ...mapGetters(['getUser']),
    
    userEmail() {
      return this.getUser?.email || 'tu email';
    }
  },
  
  async created() {
    // Get payment info from route query params
    this.transactionId = this.$route.query.transaction_id || 'TXN_' + Date.now();
    this.saleId = this.$route.query.sale_id || 'SALE_' + Date.now();
    this.paidAmount = parseFloat(this.$route.query.amount) || 0;
    
    const courseId = this.$route.query.course_id;
    
    if (courseId) {
      await this.loadCourseData(courseId);
    } else {
      this.error = 'Información de curso no encontrada';
      this.loading = false;
    }
  },
  
  methods: {
    async loadCourseData(courseId) {
      try {
        // In a real app, you would fetch course data from the API
        // For now, we'll get it from the store or local storage
        const courseData = JSON.parse(localStorage.getItem('checkoutCourse') || '{}');
        
        if (courseData.id === courseId) {
          this.course = courseData;
        } else {
          // Fallback: fetch from API
          this.course = await this.$store.dispatch('courses/fetchCourse', courseId);
        }
        
      } catch (error) {
        console.error('Error loading course data:', error);
        this.error = 'Error al cargar información del curso';
      } finally {
        this.loading = false;
      }
    },
    
    async goToCourse() {
      if (!this.course) return;
      
      this.navigating = true;
      
      try {
        // Navigate to course detail page
        await this.$router.push(`/courses/${this.course.id}`);
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        this.navigating = false;
      }
    },
    
    async goToDashboard() {
      try {
        await this.$router.push('/dashboard');
      } catch (error) {
        console.error('Navigation error:', error);
      }
    },
    
    downloadReceipt() {
      // In a real app, this would generate and download a PDF receipt
      // For now, we'll show a placeholder message
      this.$toast.info('Función de descarga de recibo en desarrollo');
      
      // Mock download functionality
      const receiptData = {
        transactionId: this.transactionId,
        saleId: this.saleId,
        course: this.course,
        amount: this.paidAmount,
        date: this.paymentDate,
        user: this.getUser
      };
      
      console.log('Receipt data:', receiptData);
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    },
    
    formatDate(date) {
      return new Intl.DateTimeFormat('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    },
    
    formatDuration(duration) {
      if (!duration) return 'Duración no especificada';
      return `${duration} horas`;
    }
  }
};
</script>

<style scoped>
.payment-success-container {
  min-height: calc(100vh - 200px);
  padding-top: 2rem;
  padding-bottom: 2rem;
}

@media (max-width: 600px) {
  .payment-success-container {
    padding-top: 1rem;
  }
}
</style>
