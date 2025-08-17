<template>
  <v-container class="checkout-container" max-width="1200">
    <!-- Loading State -->
    <v-container v-if="loading" class="text-center my-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <div class="text-h6 mt-4">Cargando información del curso...</div>
    </v-container>

    <!-- Error State -->
    <v-container v-else-if="error" class="text-center my-8">
      <v-alert type="error" title="Error" variant="tonal">
        {{ error }}
      </v-alert>
      <v-btn color="primary" class="mt-4" @click="loadCheckoutData">Reintentar</v-btn>
    </v-container>

    <!-- Main Checkout Content -->
    <div v-else-if="course">
      <!-- Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
          <h1 class="text-h4 font-weight-bold mb-2">Finalizar Compra</h1>
          <p class="text-subtitle-1 text-medium-emphasis">
            Completa tu compra para acceder inmediatamente al curso
          </p>
        </v-col>
      </v-row>

      <v-row>
        <!-- Course Summary (Left Side) -->
        <v-col cols="12" md="8">
          <v-card class="mb-4" elevation="2">
            <v-card-title class="text-h5 pb-2">
              <v-icon class="me-2">mdi-cart</v-icon>
              Resumen de tu compra
            </v-card-title>
            
            <v-divider></v-divider>
            
            <v-card-text>
              <v-row align="center">
                <v-col cols="12" sm="4">
                  <v-img
                    :src="course.imageUrl || defaultImage"
                    height="120"
                    cover
                    class="rounded"
                  ></v-img>
                </v-col>
                
                <v-col cols="12" sm="8">
                  <div class="text-h6 font-weight-bold mb-2">{{ course.title }}</div>
                  <div class="text-body-2 text-medium-emphasis mb-2">
                    <v-icon size="small" class="me-1">mdi-account-tie</v-icon>
                    {{ course.instructorName || 'Instructor no disponible' }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis mb-2">
                    <v-icon size="small" class="me-1">mdi-clock-outline</v-icon>
                    {{ formatDuration(course.duration) }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    <v-icon size="small" class="me-1">mdi-tag</v-icon>
                    {{ course.category }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Payment Form -->
          <PaymentForm
            :course="course"
            :totalAmount="finalPrice"
            @payment-success="handlePaymentSuccess"
            @payment-error="handlePaymentError"
            :loading="processingPayment"
          />
        </v-col>

        <!-- Price Summary (Right Side) -->
        <v-col cols="12" md="4">
          <v-card elevation="2" class="sticky-card">
            <v-card-title class="text-h6">
              <v-icon class="me-2">mdi-calculator</v-icon>
              Resumen de precios
            </v-card-title>
            
            <v-divider></v-divider>
            
            <v-card-text>
              <v-row class="mb-2">
                <v-col cols="8">
                  <div class="text-body-1">Precio del curso:</div>
                </v-col>
                <v-col cols="4" class="text-right">
                  <div class="text-body-1">${{ formatPrice(course.price) }}</div>
                </v-col>
              </v-row>

              <v-row v-if="course.hasActiveDiscount" class="mb-2">
                <v-col cols="8">
                  <div class="text-body-2 text-success">
                    <v-icon size="small" class="me-1">mdi-tag-outline</v-icon>
                    Descuento ({{ course.discountPercentage }}%):
                  </div>
                </v-col>
                <v-col cols="4" class="text-right">
                  <div class="text-body-2 text-success">
                    -${{ formatPrice(discountAmount) }}
                  </div>
                </v-col>
              </v-row>

              <v-row v-if="appliedCoupon" class="mb-2">
                <v-col cols="8">
                  <div class="text-body-2 text-info">
                    <v-icon size="small" class="me-1">mdi-ticket-percent</v-icon>
                    Cupón: {{ appliedCoupon.code }}
                  </div>
                </v-col>
                <v-col cols="4" class="text-right">
                  <div class="text-body-2 text-info">
                    -${{ formatPrice(appliedCoupon.discount) }}
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-3"></v-divider>

              <v-row class="mb-3">
                <v-col cols="8">
                  <div class="text-h6 font-weight-bold">Total:</div>
                </v-col>
                <v-col cols="4" class="text-right">
                  <div class="text-h6 font-weight-bold text-primary">
                    ${{ formatPrice(finalPrice) }}
                  </div>
                </v-col>
              </v-row>

              <!-- Coupon Code Input -->
              <div class="mb-3">
                <v-text-field
                  v-model="couponCode"
                  label="Código de cupón"
                  placeholder="Ingresa tu código"
                  variant="outlined"
                  density="compact"
                  :loading="validatingCoupon"
                  :error="couponError"
                  :error-messages="couponError"
                >
                  <template v-slot:append-inner>
                    <v-btn
                      size="small"
                      color="primary"
                      variant="text"
                      @click="applyCoupon"
                      :disabled="!couponCode || validatingCoupon"
                    >
                      Aplicar
                    </v-btn>
                  </template>
                </v-text-field>
              </div>

              <!-- Security Badge -->
              <div class="text-center mt-4">
                <v-chip color="success" variant="tonal" size="small">
                  <v-icon start>mdi-shield-check</v-icon>
                  Pago 100% Seguro
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          <!-- Course Benefits -->
          <v-card class="mt-4" elevation="1">
            <v-card-title class="text-h6">
              <v-icon class="me-2">mdi-star-circle</v-icon>
              Qué obtienes
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Acceso de por vida</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Certificado de finalización</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Soporte del instructor</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>Acceso móvil y desktop</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Success Dialog -->
    <v-dialog v-model="showSuccessDialog" max-width="500" persistent>
      <v-card>
        <v-card-text class="text-center py-8">
          <v-icon color="success" size="64" class="mb-4">mdi-check-circle</v-icon>
          <div class="text-h5 font-weight-bold mb-2">¡Pago Exitoso!</div>
          <div class="text-body-1 text-medium-emphasis mb-4">
            Tu compra se ha procesado correctamente. Ya tienes acceso al curso.
          </div>
          <v-progress-linear v-if="redirecting" indeterminate color="primary" class="mb-4"></v-progress-linear>
        </v-card-text>
        <v-card-actions class="justify-center pb-6">
          <v-btn
            color="primary"
            size="large"
            @click="goToCourse"
            :loading="redirecting"
          >
            Ir al Curso
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import PaymentForm from '@/components/PaymentForm.vue';

export default {
  name: 'CheckoutView',
  components: {
    PaymentForm
  },
  
  data() {
    return {
      course: null,
      loading: true,
      error: null,
      processingPayment: false,
      showSuccessDialog: false,
      redirecting: false,
      
      // Coupon system
      couponCode: '',
      appliedCoupon: null,
      validatingCoupon: false,
      couponError: null,
      
      // Default image for courses
      defaultImage: require('@/assets/placeholders').coursePlaceholder
    };
  },
  
  computed: {
    ...mapGetters(['isAuthenticated', 'getUser']),
    
    courseId() {
      return this.$route.params.courseId;
    },
    
    breadcrumbs() {
      return [
        { title: 'Inicio', href: '/' },
        { title: 'Cursos', href: '/courses' },
        { title: this.course?.title || 'Curso', href: `/courses/${this.courseId}` },
        { title: 'Checkout', disabled: true }
      ];
    },
    
    discountAmount() {
      if (!this.course?.hasActiveDiscount) return 0;
      return (this.course.price * this.course.discountPercentage) / 100;
    },
    
    finalPrice() {
      let price = this.course?.price || 0;
      
      // Apply course discount
      if (this.course?.hasActiveDiscount) {
        price -= this.discountAmount;
      }
      
      // Apply coupon discount
      if (this.appliedCoupon) {
        price -= this.appliedCoupon.discount;
      }
      
      return Math.max(price, 0);
    }
  },
  
  async created() {
    // Check authentication
    if (!this.isAuthenticated) {
      this.$router.push('/login');
      return;
    }
    
    // Check if user is a student
    if (this.getUser?.role !== 'student') {
      this.$router.push('/');
      return;
    }
    
    await this.loadCheckoutData();
  },
  
  methods: {
    ...mapActions('courses', ['fetchCourse']),
    
    async loadCheckoutData() {
      this.loading = true;
      this.error = null;
      
      try {
        // Fetch course data
        const courseData = await this.fetchCourse(this.courseId);
        this.course = courseData;
        
        // Validate course is available for purchase
        if (this.course.isFree) {
          this.$router.push(`/courses/${this.courseId}`);
          return;
        }
        
      } catch (error) {
        console.error('Error loading checkout data:', error);
        this.error = error.message || 'Error al cargar la información del curso';
      } finally {
        this.loading = false;
      }
    },
    
    async applyCoupon() {
      if (!this.couponCode.trim()) return;
      
      this.validatingCoupon = true;
      this.couponError = null;
      
      try {
        // TODO: Implement coupon validation API call
        // const response = await courseService.validateCoupon(this.courseId, this.couponCode);
        
        // Mock validation for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful coupon application
        if (this.couponCode.toLowerCase() === 'descuento10') {
          this.appliedCoupon = {
            code: this.couponCode,
            discount: this.course.price * 0.1 // 10% discount
          };
          this.couponCode = '';
        } else {
          this.couponError = 'Código de cupón inválido';
        }
        
      } catch (error) {
        console.error('Error validating coupon:', error);
        this.couponError = 'Error al validar el cupón';
      } finally {
        this.validatingCoupon = false;
      }
    },
    
    async handlePaymentSuccess(paymentData) {
      console.log('Payment successful:', paymentData);
      this.showSuccessDialog = true;
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        this.goToCourse();
      }, 3000);
    },
    
    handlePaymentError(error) {
      console.error('Payment error:', error);
      this.error = error.message || 'Error al procesar el pago';
    },
    
    async goToCourse() {
      this.redirecting = true;
      
      try {
        // Redirect to course page
        await this.$router.push(`/courses/${this.courseId}`);
      } catch (error) {
        console.error('Error redirecting to course:', error);
      } finally {
        this.redirecting = false;
      }
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    },
    
    formatDuration(duration) {
      if (!duration) return 'Duración no especificada';
      return `${duration} horas`;
    }
  }
};
</script>

<style scoped>
.checkout-container {
  min-height: calc(100vh - 200px);
}

.sticky-card {
  position: sticky;
  top: 20px;
  z-index: 1;
}

@media (max-width: 960px) {
  .sticky-card {
    position: relative;
    top: 0;
  }
}
</style>
