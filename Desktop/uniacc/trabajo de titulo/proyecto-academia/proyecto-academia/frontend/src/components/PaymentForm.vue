<template>
  <v-card elevation="2">
    <v-card-title class="text-h5 pb-2">
      <v-icon class="me-2">mdi-credit-card</v-icon>
      Información de Pago
    </v-card-title>
    
    <v-divider></v-divider>
    
    <v-card-text class="pt-4">
      <!-- Payment Method Selection -->
      <div class="mb-6">
        <h3 class="text-h6 mb-3">Selecciona tu método de pago</h3>
        <v-row>
          <v-col cols="12" sm="6" v-for="method in paymentMethods" :key="method.id">
            <v-card
              :class="['payment-method-card', selectedPaymentMethod === method.id ? 'selected' : '']"
              @click="selectedPaymentMethod = method.id"
              :disabled="!method.enabled"
              elevation="1"
            >
              <v-card-text class="text-center py-4">
                <v-icon :color="method.enabled ? method.color : 'grey'" size="48" class="mb-2">
                  {{ method.icon }}
                </v-icon>
                <div class="text-body-1 font-weight-medium">{{ method.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ method.description }}</div>
                <div v-if="!method.enabled" class="text-caption text-disabled mt-1">
                  Próximamente
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Credit Card Form (Default) -->
      <div v-if="selectedPaymentMethod === 'credit_card'">
        <h3 class="text-h6 mb-4">Información de la Tarjeta</h3>
        
        <v-form ref="paymentForm" v-model="formValid" @submit.prevent="processPayment">
          <v-row>
            <!-- Card Number -->
            <v-col cols="12">
              <v-text-field
                v-model="cardForm.number"
                label="Número de tarjeta"
                placeholder="1234 5678 9012 3456"
                variant="outlined"
                :rules="cardNumberRules"
                maxlength="19"
                @input="formatCardNumber"
                prepend-inner-icon="mdi-credit-card"
                required
              ></v-text-field>
            </v-col>
            
            <!-- Cardholder Name -->
            <v-col cols="12">
              <v-text-field
                v-model="cardForm.name"
                label="Nombre del titular"
                placeholder="Juan Pérez"
                variant="outlined"
                :rules="nameRules"
                prepend-inner-icon="mdi-account"
                required
              ></v-text-field>
            </v-col>
            
            <!-- Expiry Date and CVV -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="cardForm.expiry"
                label="Fecha de vencimiento"
                placeholder="MM/YY"
                variant="outlined"
                :rules="expiryRules"
                maxlength="5"
                @input="formatExpiry"
                prepend-inner-icon="mdi-calendar"
                required
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="cardForm.cvv"
                label="CVV"
                placeholder="123"
                variant="outlined"
                :rules="cvvRules"
                maxlength="4"
                type="password"
                prepend-inner-icon="mdi-shield-lock"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Billing Address -->
          <div class="mt-4">
            <h4 class="text-subtitle-1 mb-3">Dirección de facturación</h4>
            
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="billingForm.firstName"
                  label="Nombre"
                  variant="outlined"
                  :rules="nameRules"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="billingForm.lastName"
                  label="Apellido"
                  variant="outlined"
                  :rules="nameRules"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="billingForm.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  :rules="emailRules"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="billingForm.address"
                  label="Dirección"
                  variant="outlined"
                  :rules="addressRules"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="billingForm.city"
                  label="Ciudad"
                  variant="outlined"
                  :rules="cityRules"
                  required
                ></v-text-field>
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-select
                  v-model="billingForm.country"
                  label="País"
                  :items="countries"
                  item-title="name"
                  item-value="code"
                  variant="outlined"
                  :rules="countryRules"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </div>

          <!-- Terms and Conditions -->
          <v-row class="mt-4">
            <v-col cols="12">
              <v-checkbox
                v-model="acceptTerms"
                :rules="termsRules"
                required
              >
                <template v-slot:label>
                  <div class="text-body-2">
                    Acepto los 
                    <a href="/terms" target="_blank" class="text-primary">términos y condiciones</a>
                    y la 
                    <a href="/privacy" target="_blank" class="text-primary">política de privacidad</a>
                  </div>
                </template>
              </v-checkbox>
            </v-col>
          </v-row>

          <!-- Payment Button -->
          <v-row class="mt-4">
            <v-col cols="12">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                :disabled="!formValid || !acceptTerms"
              >
                <v-icon start>mdi-lock</v-icon>
                Pagar ${{ formatPrice(totalAmount) }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </div>

      <!-- PayPal Form -->
      <div v-else-if="selectedPaymentMethod === 'paypal'">
        <div class="text-center py-8">
          <v-icon color="primary" size="64" class="mb-4">mdi-paypal</v-icon>
          <h3 class="text-h6 mb-4">Pago con PayPal</h3>
          <p class="text-body-1 mb-4">
            Serás redirigido a PayPal para completar tu pago de forma segura.
          </p>
          
          <v-btn
            color="primary"
            size="large"
            @click="processPayPalPayment"
            :loading="loading"
          >
            <v-icon start>mdi-paypal</v-icon>
            Continuar con PayPal
          </v-btn>
        </div>
      </div>

      <!-- Transbank Form -->
      <div v-else-if="selectedPaymentMethod === 'transbank'">
        <div class="text-center py-8">
          <v-icon color="red" size="64" class="mb-4">mdi-bank</v-icon>
          <h3 class="text-h6 mb-4">Pago con Transbank</h3>
          <p class="text-body-1 mb-4">
            Utiliza tu tarjeta de débito o crédito chilena a través de Transbank WebPay Plus.
            Serás redirigido a una página segura para completar tu pago.
          </p>
          
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-body-2">
              <strong>Tarjetas aceptadas:</strong>
              <br>• Redcompra (débito)
              <br>• Visa y Mastercard (crédito)
              <br>• Prepago
            </div>
          </v-alert>
          
          <v-btn
            color="red"
            size="large"
            @click="processTransbankPayment"
            :loading="loading"
          >
            <v-icon start>mdi-bank</v-icon>
            Continuar con Transbank
          </v-btn>
        </div>
      </div>

      <!-- Stripe Form -->
      <div v-else-if="selectedPaymentMethod === 'stripe'">
        <div class="text-center py-8">
          <v-icon color="primary" size="64" class="mb-4">mdi-credit-card</v-icon>
          <h3 class="text-h6 mb-4">Pago Internacional</h3>
          <p class="text-body-1 mb-4">
            Paga de forma segura con tu tarjeta de crédito o débito internacional.
            Procesado por Stripe con la máxima seguridad.
          </p>
          
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="text-body-2">
              <strong>Tarjetas aceptadas:</strong>
              <br>• Visa y Mastercard
              <br>• American Express
              <br>• Tarjetas internacionales
            </div>
          </v-alert>
          
          <v-btn
            color="primary"
            size="large"
            @click="processStripePayment"
            :loading="loading"
          >
            <v-icon start>mdi-credit-card</v-icon>
            Pagar con Tarjeta
          </v-btn>
        </div>
      </div>

      <!-- Security Information -->
      <v-alert type="info" variant="tonal" class="mt-6">
        <template v-slot:prepend>
          <v-icon>mdi-shield-check</v-icon>
        </template>
        <div class="text-body-2">
          <strong>Tu información está segura:</strong>
          Utilizamos encriptación SSL de 256 bits y nunca almacenamos 
          información de tarjetas de crédito en nuestros servidores.
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex';
import paymentService from '@/services/paymentService';

export default {
  name: 'PaymentForm',
  
  props: {
    course: {
      type: Object,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      selectedPaymentMethod: 'credit_card',
      formValid: false,
      acceptTerms: false,
      
      // Payment methods available
      paymentMethods: [
        {
          id: 'transbank',
          name: 'Transbank (Chile)',
          icon: 'mdi-bank',
          color: 'red',
          enabled: true,
          description: 'Tarjetas chilenas (Redcompra, Visa, Mastercard)'
        },
        {
          id: 'stripe',
          name: 'Tarjeta Internacional',
          icon: 'mdi-credit-card',
          color: 'primary',
          enabled: true,
          description: 'Visa, Mastercard, American Express'
        },
        {
          id: 'credit_card',
          name: 'Simulador de Pago',
          icon: 'mdi-credit-card-outline',
          color: 'grey',
          enabled: true,
          description: 'Solo para testing y desarrollo'
        },
        {
          id: 'paypal',
          name: 'PayPal',
          icon: 'mdi-paypal',
          color: 'blue',
          enabled: false,
          description: 'Próximamente disponible'
        }
      ],
      
      // Card form data
      cardForm: {
        number: '',
        name: '',
        expiry: '',
        cvv: ''
      },
      
      // Billing form data
      billingForm: {
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        country: 'CL'
      },
      
      // Countries list
      countries: [
        { name: 'Chile', code: 'CL' },
        { name: 'Argentina', code: 'AR' },
        { name: 'Brasil', code: 'BR' },
        { name: 'Colombia', code: 'CO' },
        { name: 'México', code: 'MX' },
        { name: 'Perú', code: 'PE' },
        { name: 'España', code: 'ES' },
        { name: 'Estados Unidos', code: 'US' }
      ],
      
      // Validation rules
      cardNumberRules: [
        v => !!v || 'El número de tarjeta es requerido',
        v => this.isValidCardNumber(v) || 'Número de tarjeta inválido'
      ],
      nameRules: [
        v => !!v || 'Este campo es requerido',
        v => (v && v.length >= 2) || 'Debe tener al menos 2 caracteres'
      ],
      expiryRules: [
        v => !!v || 'La fecha de vencimiento es requerida',
        v => this.isValidExpiry(v) || 'Fecha inválida (MM/YY)'
      ],
      cvvRules: [
        v => !!v || 'El CVV es requerido',
        v => /^\d{3,4}$/.test(v) || 'CVV debe tener 3 o 4 dígitos'
      ],
      emailRules: [
        v => !!v || 'El email es requerido',
        v => /.+@.+\..+/.test(v) || 'Email inválido'
      ],
      addressRules: [
        v => !!v || 'La dirección es requerida'
      ],
      cityRules: [
        v => !!v || 'La ciudad es requerida'
      ],
      countryRules: [
        v => !!v || 'El país es requerido'
      ],
      termsRules: [
        v => !!v || 'Debes aceptar los términos y condiciones'
      ]
    };
  },
  
  methods: {
    ...mapActions('courses', ['initiatePurchase']),
    
    async processPayment() {
      if (!this.formValid || !this.acceptTerms) return;
      
      this.$emit('payment-processing', true);
      
      try {
        // Prepare payment data
        const paymentData = {
          courseId: this.course.id,
          amount: this.totalAmount,
          paymentMethod: this.selectedPaymentMethod,
          cardData: {
            ...this.cardForm,
            // Remove spaces and format card number
            number: this.cardForm.number.replace(/\s/g, '')
          },
          billingAddress: this.billingForm
        };
        
        // Create sale and process payment
        const result = await this.initiatePurchase(this.course.id);
        
        // Simulate payment processing
        await this.simulatePaymentProcessing(paymentData);
        
        // Emit success event
        this.$emit('payment-success', {
          saleId: result.saleId,
          transactionId: this.generateTransactionId(),
          amount: this.totalAmount,
          courseId: this.course.id
        });
        
      } catch (error) {
        console.error('Payment processing error:', error);
        this.$emit('payment-error', error);
      } finally {
        this.$emit('payment-processing', false);
      }
    },
    
    async processPayPalPayment() {
      this.$emit('payment-processing', true);
      
      try {
        // TODO: Implement PayPal integration
        await new Promise(resolve => setTimeout(resolve, 2000));
        throw new Error('PayPal no está disponible aún');
      } catch (error) {
        this.$emit('payment-error', error);
      } finally {
        this.$emit('payment-processing', false);
      }
    },
    
    async processTransbankPayment() {
      this.$emit('payment-processing', true);
      
      try {
        console.log('🏦 Iniciando pago con Transbank...');
        
        // Crear venta si no existe
        const saleResult = await this.initiatePurchase(this.course.id);
        const saleId = saleResult.saleId;
        
        console.log('📋 Sale ID obtenido:', saleId);
        
        // Usar el servicio de pagos para crear transacción Transbank
        const result = await paymentService.createTransbankTransaction(
          saleId, 
          this.totalAmount,
          `${window.location.origin}/payment/transbank/return`
        );
        
        console.log('✅ Transacción Transbank creada:', result);
        
        // Guardar información para el retorno
        sessionStorage.setItem('transbankPayment', JSON.stringify({
          saleId: saleId,
          courseId: this.course.id,
          amount: this.totalAmount,
          courseTitle: this.course.title,
          token: result.token
        }));
        
        console.log('🔄 Redirigiendo a Transbank...');
        
        // Redirigir a Transbank
        window.location.href = result.redirectUrl;
        
      } catch (error) {
        console.error('❌ Error en pago Transbank:', error);
        
        this.$emit('payment-error', { 
          message: error.message || 'Error procesando el pago con Transbank' 
        });
      } finally {
        this.$emit('payment-processing', false);
      }
    },

    async processStripePayment() {
      this.$emit('payment-processing', true);
      
      try {
        // Crear venta si no existe
        const saleResult = await this.initiatePurchase(this.course.id);
        const saleId = saleResult.saleId;
        
        // Crear Payment Intent con Stripe
        const response = await this.$http.post('/api/payments/stripe/create-intent', {
          saleId: saleId,
          amount: this.totalAmount
        });
        
        const { clientSecret } = response.data;
        
        // Redirigir a página de Stripe con el client secret
        this.$router.push({
          name: 'StripeCheckout',
          params: {
            clientSecret,
            saleId,
            courseId: this.course.id
          }
        });
        
      } catch (error) {
        this.$emit('payment-error', error);
      } finally {
        this.$emit('payment-processing', false);
      }
    },
    
    async simulatePaymentProcessing(paymentData) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('💳 Simulando pago con datos:', paymentData);
      
      // Simulate success (90% success rate)
      if (Math.random() > 0.1) {
        return { success: true };
      } else {
        throw new Error('Pago rechazado. Verifica los datos de tu tarjeta.');
      }
    },
    
    formatCardNumber(value) {
      // Remove non-digits and format with spaces
      const cleaned = value.replace(/\D/g, '');
      const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
      this.cardForm.number = formatted;
    },
    
    formatExpiry(value) {
      // Format MM/YY
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length >= 2) {
        this.cardForm.expiry = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
      } else {
        this.cardForm.expiry = cleaned;
      }
    },
    
    isValidCardNumber(number) {
      // Basic Luhn algorithm validation
      const cleaned = number.replace(/\s/g, '');
      if (!/^\d{13,19}$/.test(cleaned)) return false;
      
      let sum = 0;
      let isEven = false;
      
      for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);
        
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        isEven = !isEven;
      }
      
      return sum % 10 === 0;
    },
    
    isValidExpiry(expiry) {
      if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
      
      const [month, year] = expiry.split('/').map(Number);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (month < 1 || month > 12) return false;
      if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
      
      return true;
    },
    
    generateTransactionId() {
      return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    }
  }
};
</script>

<style scoped>
.payment-method-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.payment-method-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.payment-method-card.selected {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.payment-method-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
