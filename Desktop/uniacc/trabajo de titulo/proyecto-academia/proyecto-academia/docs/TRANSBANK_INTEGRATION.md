# 🏦 Integración Transbank WebPay Plus

## Configuración Inicial

### 1. Registro en Transbank
1. Ir a [transbank.cl](https://www.transbank.cl)
2. Crear cuenta de desarrollador
3. Obtener credenciales de integración

### 2. Credenciales de Testing
```env
# Transbank Testing Environment
TRANSBANK_ENABLED=true
TRANSBANK_ENVIRONMENT=integration
TRANSBANK_API_KEY=597055555532
TRANSBANK_COMMERCE_CODE=597055555532
TRANSBANK_BASE_URL=https://webpay3gint.transbank.cl
```

### 3. Instalación de SDK
```bash
cd functions
npm install transbank-sdk
```

## Implementación

### Backend - Servicio Mejorado

```javascript
// functions/services/transbankService.js
const { WebpayPlus } = require('transbank-sdk');

class TransbankService {
  constructor() {
    this.webpay = new WebpayPlus.Transaction();
    
    // Configurar según ambiente
    if (process.env.TRANSBANK_ENVIRONMENT === 'production') {
      WebpayPlus.configureForProduction(
        process.env.TRANSBANK_COMMERCE_CODE,
        process.env.TRANSBANK_API_KEY
      );
    } else {
      WebpayPlus.configureForIntegration(
        process.env.TRANSBANK_COMMERCE_CODE,
        process.env.TRANSBANK_API_KEY
      );
    }
  }

  async createTransaction(amount, sessionId, buyOrder, returnUrl) {
    try {
      const response = await this.webpay.create(
        buyOrder,
        sessionId,
        amount,
        returnUrl
      );
      
      return {
        success: true,
        token: response.token,
        url: response.url
      };
    } catch (error) {
      throw new Error(`Error Transbank: ${error.message}`);
    }
  }

  async confirmTransaction(token) {
    try {
      const response = await this.webpay.commit(token);
      
      return {
        success: response.response_code === 0,
        authorizationCode: response.authorization_code,
        amount: response.amount,
        buyOrder: response.buy_order,
        sessionId: response.session_id,
        cardNumber: response.card_detail?.card_number,
        transactionDate: response.transaction_date
      };
    } catch (error) {
      throw new Error(`Error confirmando transacción: ${error.message}`);
    }
  }
}

module.exports = new TransbankService();
```

### Frontend - Componente Transbank

```vue
<!-- components/TransbankPayment.vue -->
<template>
  <div class="transbank-payment">
    <v-card>
      <v-card-title class="text-center">
        <v-img 
          src="/transbank-logo.png" 
          height="60" 
          contain 
          class="mb-2"
        ></v-img>
        <div>Pago Seguro con Transbank</div>
      </v-card-title>
      
      <v-card-text class="text-center">
        <p class="mb-4">
          Serás redirigido a Transbank para completar tu pago de forma segura.
        </p>
        
        <div class="payment-summary mb-4">
          <div class="text-h6">Total a pagar:</div>
          <div class="text-h4 text-primary font-weight-bold">
            ${{ formatAmount(amount) }}
          </div>
        </div>
        
        <v-btn
          color="primary"
          size="x-large"
          block
          :loading="processing"
          @click="initiatePayment"
          class="mb-3"
        >
          <v-icon start>mdi-credit-card</v-icon>
          Pagar con Transbank
        </v-btn>
        
        <div class="security-info">
          <v-chip color="success" variant="tonal" size="small">
            <v-icon start>mdi-shield-check</v-icon>
            Protegido por Transbank
          </v-chip>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'TransbankPayment',
  
  props: {
    saleId: String,
    amount: Number,
    courseTitle: String
  },
  
  data() {
    return {
      processing: false
    };
  },
  
  methods: {
    async initiatePayment() {
      this.processing = true;
      
      try {
        const response = await this.$store.dispatch('courses/processPayment', {
          saleId: this.saleId,
          paymentData: {
            paymentMethod: 'transbank',
            amount: this.amount,
            returnUrl: `${window.location.origin}/payment/transbank/return`
          }
        });
        
        if (response.redirectUrl) {
          // Guardar información para el retorno
          sessionStorage.setItem('transbankPayment', JSON.stringify({
            saleId: this.saleId,
            amount: this.amount,
            courseTitle: this.courseTitle
          }));
          
          // Redirigir a Transbank
          window.location.href = response.redirectUrl;
        }
      } catch (error) {
        this.$emit('payment-error', error);
      } finally {
        this.processing = false;
      }
    },
    
    formatAmount(amount) {
      return new Intl.NumberFormat('es-CL').format(amount);
    }
  }
};
</script>
```

### Ruta de Retorno Transbank

```vue
<!-- views/TransbankReturnView.vue -->
<template>
  <v-container class="transbank-return" max-width="600">
    <v-card v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
      <div class="text-h6 mt-4">Confirmando tu pago...</div>
      <div class="text-body-2 text-medium-emphasis mt-2">
        Por favor no cierres esta ventana
      </div>
    </v-card>
    
    <v-card v-else-if="success" color="success" variant="tonal" class="text-center pa-8">
      <v-icon size="80" color="success" class="mb-4">mdi-check-circle</v-icon>
      <div class="text-h5 font-weight-bold mb-2">¡Pago Exitoso!</div>
      <div class="text-body-1 mb-4">
        Tu pago ha sido procesado correctamente por Transbank.
      </div>
      
      <v-btn color="success" size="large" @click="goToCourse">
        Acceder al Curso
      </v-btn>
    </v-card>
    
    <v-card v-else color="error" variant="tonal" class="text-center pa-8">
      <v-icon size="80" color="error" class="mb-4">mdi-alert-circle</v-icon>
      <div class="text-h5 font-weight-bold mb-2">Pago No Completado</div>
      <div class="text-body-1 mb-4">
        {{ errorMessage }}
      </div>
      
      <v-btn color="primary" @click="retryPayment" class="me-2">
        Intentar Nuevamente
      </v-btn>
      <v-btn variant="outlined" @click="goToCheckout">
        Volver al Checkout
      </v-btn>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'TransbankReturnView',
  
  data() {
    return {
      loading: true,
      success: false,
      errorMessage: '',
      paymentInfo: null
    };
  },
  
  async created() {
    await this.processReturn();
  },
  
  methods: {
    async processReturn() {
      try {
        const token_ws = this.$route.query.token_ws;
        
        if (!token_ws) {
          throw new Error('Token de transacción no encontrado');
        }
        
        // Confirmar transacción con el backend
        const response = await this.$http.post('/api/payments/transbank/confirm', {
          token: token_ws
        });
        
        if (response.data.success) {
          this.success = true;
          this.paymentInfo = response.data;
        } else {
          throw new Error(response.data.message || 'Error en la transacción');
        }
        
      } catch (error) {
        this.success = false;
        this.errorMessage = error.message || 'Error al procesar el pago';
      } finally {
        this.loading = false;
      }
    },
    
    goToCourse() {
      const savedPayment = JSON.parse(sessionStorage.getItem('transbankPayment') || '{}');
      sessionStorage.removeItem('transbankPayment');
      
      this.$router.push(`/payment/success?transaction_id=${this.paymentInfo.transactionId}`);
    },
    
    retryPayment() {
      const savedPayment = JSON.parse(sessionStorage.getItem('transbankPayment') || '{}');
      this.$router.push(`/courses/${savedPayment.courseId}/checkout`);
    },
    
    goToCheckout() {
      this.$router.push('/courses');
    }
  }
};
</script>
```

## Testing con Transbank

### Datos de Prueba
```javascript
// Tarjetas de prueba Transbank
const testCards = {
  visa: {
    number: '4051885600446623',
    cvv: '123',
    expiry: '11/22'
  },
  mastercard: {
    number: '5186059559590568',
    cvv: '123', 
    expiry: '11/22'
  },
  // Tarjeta que simula rechazo
  rejected: {
    number: '4051885600446630',
    cvv: '123',
    expiry: '11/22'
  }
};
```

### Montos de Prueba
- `$1.000` - `$999.999`: Transacción aprobada
- `$1.000.000` - `$1.004.999`: Transacción rechazada

## Configuración de Rutas

```javascript
// router/index.js - Agregar ruta de retorno
{
  path: '/payment/transbank/return',
  name: 'TransbankReturn',
  component: () => import('@/views/TransbankReturnView.vue')
}
```

## Webhooks (Opcional para MVP)

```javascript
// functions/routes/transbank.js
router.post('/webhook', async (req, res) => {
  try {
    const { token_ws, TBK_TOKEN, TBK_ORDEN_COMPRA } = req.body;
    
    // Procesar notificación de Transbank
    const result = await transbankService.processWebhook(req.body);
    
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('ERROR');
  }
});
```
