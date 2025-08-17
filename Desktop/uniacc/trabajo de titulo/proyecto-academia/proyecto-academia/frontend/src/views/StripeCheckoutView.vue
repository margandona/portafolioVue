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
            <p class="text-grey">Confirmando tu transacción con Stripe</p>
          </div>

          <!-- Stripe Elements Container -->
          <div v-else-if="!paymentProcessed" class="pa-6">
            <h2 class="text-center mb-4">Completa tu Pago</h2>
            
            <!-- Curso Info -->
            <v-card outlined class="mb-4">
              <v-card-text>
                <h4>{{ courseTitle }}</h4>
                <p class="text-h6 mt-2">${{ formatCurrency(amount) }}</p>
              </v-card-text>
            </v-card>
            
            <!-- Stripe Payment Element -->
            <div id="payment-element" class="mb-4">
              <!-- Stripe Elements se insertará aquí -->
            </div>
            
            <v-btn 
              id="submit-button"
              color="primary"
              large
              block
              :loading="processing"
              @click="handleSubmit"
            >
              <span v-if="processing">Procesando...</span>
              <span v-else>Confirmar Pago</span>
            </v-btn>
            
            <div v-if="errorMessage" class="mt-4">
              <v-alert type="error">
                {{ errorMessage }}
              </v-alert>
            </div>
          </div>

          <!-- Success State -->
          <div v-else-if="success" class="text-center pa-8">
            <v-icon color="success" size="64" class="mb-4">
              mdi-check-circle
            </v-icon>
            
            <h2 class="mb-4">¡Pago Exitoso!</h2>
            
            <v-card-text>
              <p class="mb-4">Tu pago ha sido procesado exitosamente.</p>
              
              <v-btn 
                color="primary" 
                large 
                @click="goToCourse"
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
export default {
  name: 'StripeCheckoutView',
  data() {
    return {
      loading: true,
      processing: false,
      success: false,
      paymentProcessed: false,
      errorMessage: '',
      stripe: null,
      elements: null,
      paymentElement: null,
      clientSecret: '',
      saleId: '',
      courseId: '',
      courseTitle: '',
      amount: 0
    }
  },
  
  async mounted() {
    await this.initializeStripe();
  },
  
  methods: {
    async initializeStripe() {
      try {
        // Obtener parámetros de la ruta
        this.clientSecret = this.$route.params.clientSecret;
        this.saleId = this.$route.params.saleId;
        this.courseId = this.$route.params.courseId;
        
        if (!this.clientSecret || !this.saleId || !this.courseId) {
          throw new Error('Parámetros de pago inválidos');
        }
        
        // Obtener información del curso
        const courseResponse = await this.$http.get(`/api/courses/${this.courseId}`);
        this.courseTitle = courseResponse.data.title;
        this.amount = courseResponse.data.price;
        
        // Cargar Stripe
        if (!window.Stripe) {
          const script = document.createElement('script');
          script.src = 'https://js.stripe.com/v3/';
          script.onload = () => this.setupStripeElements();
          document.head.appendChild(script);
        } else {
          this.setupStripeElements();
        }
        
      } catch (error) {
        console.error('Error initializing Stripe:', error);
        this.errorMessage = error.message || 'Error inicializando el pago';
        this.loading = false;
      }
    },
    
    setupStripeElements() {
      try {
        // Obtener clave pública de Stripe desde las variables de entorno
        const stripePublicKey = process.env.VUE_APP_STRIPE_PUBLIC_KEY;
        
        if (!stripePublicKey) {
          throw new Error('Clave pública de Stripe no configurada');
        }
        
        this.stripe = window.Stripe(stripePublicKey);
        
        const appearance = {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1976d2',
          }
        };
        
        this.elements = this.stripe.elements({
          clientSecret: this.clientSecret,
          appearance
        });
        
        this.paymentElement = this.elements.create('payment');
        
        this.$nextTick(() => {
          const paymentElementContainer = document.getElementById('payment-element');
          if (paymentElementContainer) {
            this.paymentElement.mount('#payment-element');
            this.loading = false;
          }
        });
        
      } catch (error) {
        console.error('Error setting up Stripe Elements:', error);
        this.errorMessage = error.message || 'Error configurando el formulario de pago';
        this.loading = false;
      }
    },
    
    async handleSubmit() {
      if (!this.stripe || !this.elements) {
        return;
      }
      
      this.processing = true;
      this.errorMessage = '';
      
      try {
        const { error, paymentIntent } = await this.stripe.confirmPayment({
          elements: this.elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment/stripe/success`,
          },
          redirect: 'if_required'
        });
        
        if (error) {
          this.errorMessage = error.message;
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          // Confirmar el pago en el backend
          await this.confirmPaymentInBackend(paymentIntent.id);
          this.success = true;
          this.paymentProcessed = true;
        }
        
      } catch (error) {
        console.error('Error processing payment:', error);
        this.errorMessage = error.message || 'Error procesando el pago';
      } finally {
        this.processing = false;
      }
    },
    
    async confirmPaymentInBackend(paymentIntentId) {
      try {
        const response = await this.$http.post('/api/payments/stripe/confirm', {
          paymentIntentId,
          saleId: this.saleId
        });
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Error confirmando el pago');
        }
        
        // Actualizar el estado del curso en el store
        if (this.$store.dispatch) {
          try {
            await this.$store.dispatch('courses/enrollInCourse', {
              courseId: this.courseId,
              saleId: this.saleId
            });
          } catch (error) {
            console.warn('Error updating course enrollment status:', error);
          }
        }
        
      } catch (error) {
        console.error('Error confirming payment in backend:', error);
        throw error;
      }
    },
    
    formatCurrency(amount) {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP'
      }).format(amount);
    },
    
    goToCourse() {
      this.$router.push(`/courses/${this.courseId}`);
    },
    
    goToMyCourses() {
      this.$router.push('/my-courses');
    },
    
    retryPayment() {
      this.$router.push(`/checkout/${this.courseId}`);
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

#payment-element {
  margin: 20px 0;
}

/* Estilo personalizado para los elementos de Stripe */
.StripeElement {
  background-color: white;
  padding: 10px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  box-shadow: 0 1px 3px 0 #e6ebf1;
  transition: box-shadow 150ms ease;
}

.StripeElement--focus {
  box-shadow: 0 1px 3px 0 #cfd7df;
}

.StripeElement--invalid {
  border-color: #fa755a;
}
</style>
