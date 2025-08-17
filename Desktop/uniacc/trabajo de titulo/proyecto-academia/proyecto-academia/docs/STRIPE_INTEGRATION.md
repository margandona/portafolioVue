# 💳 Integración Stripe 

## ¿Por qué Stripe?
- ✅ Excelente para mercado internacional
- ✅ Documentación superior
- ✅ SDK muy maduro
- ✅ Dashboard completo
- ✅ Fácil testing

## Configuración Inicial

### 1. Crear Cuenta Stripe
1. Ir a [stripe.com](https://stripe.com)
2. Crear cuenta
3. Obtener API keys

### 2. Credenciales
```env
# Stripe Configuration
STRIPE_ENABLED=true
STRIPE_SECRET_KEY=sk_test_... # Testing key
STRIPE_PUBLIC_KEY=pk_test_... # Frontend key
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signing secret
```

### 3. Instalación
```bash
# Backend
cd functions
npm install stripe

# Frontend  
cd frontend
npm install @stripe/stripe-js @stripe/vue-stripe
```

## Implementación Backend

### Servicio Stripe

```javascript
// functions/services/stripeService.js
const Stripe = require('stripe');

class StripeService {
  constructor() {
    this.stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createPaymentIntent(amount, currency = 'clp', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount), // Stripe uses cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      throw new Error(`Stripe Error: ${error.message}`);
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: paymentIntent.status === 'succeeded',
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method
      };
    } catch (error) {
      throw new Error(`Error confirmando pago Stripe: ${error.message}`);
    }
  }

  async processWebhook(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          return {
            type: 'payment.completed',
            paymentIntentId: event.data.object.id,
            amount: event.data.object.amount,
            metadata: event.data.object.metadata
          };
        case 'payment_intent.payment_failed':
          return {
            type: 'payment.failed',
            paymentIntentId: event.data.object.id,
            error: event.data.object.last_payment_error
          };
        default:
          console.log(`Unhandled Stripe event: ${event.type}`);
          return null;
      }
    } catch (error) {
      throw new Error(`Webhook error: ${error.message}`);
    }
  }

  async createRefund(paymentIntentId, amount = null) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount) : undefined
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status
      };
    } catch (error) {
      throw new Error(`Error procesando reembolso: ${error.message}`);
    }
  }
}

module.exports = new StripeService();
```

### Controlador de Stripe

```javascript
// functions/controllers/stripeController.js
const stripeService = require('../services/stripeService');
const SaleModel = require('../models/saleModel');

const createPaymentIntent = async (req, res) => {
  try {
    const { saleId, amount } = req.body;
    
    // Verificar que la venta existe
    const sale = await SaleModel.getById(saleId);
    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    // Crear Payment Intent
    const result = await stripeService.createPaymentIntent(
      amount,
      'clp',
      { saleId, userId: req.user.uid }
    );
    
    // Actualizar venta con Payment Intent ID
    await SaleModel.updateStatus(saleId, SaleModel.STATUS.PROCESSING, {
      stripePaymentIntentId: result.paymentIntentId
    });
    
    res.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId
    });
    
  } catch (error) {
    console.error('Error creando Payment Intent:', error);
    res.status(500).json({ message: error.message });
  }
};

const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    const result = await stripeService.confirmPayment(paymentIntentId);
    
    if (result.success) {
      // Buscar venta por Payment Intent ID y completarla
      const sales = await SaleModel.findByStripePaymentIntent(paymentIntentId);
      if (sales.length > 0) {
        const sale = sales[0];
        await SaleModel.updateStatus(sale.id, SaleModel.STATUS.COMPLETED, {
          stripePaymentStatus: result.status
        });
      }
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error confirmando pago Stripe:', error);
    res.status(500).json({ message: error.message });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const result = await stripeService.processWebhook(req.body, signature);
    
    if (result) {
      // Procesar evento...
      console.log('Stripe webhook procesado:', result);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook Stripe:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook
};
```

## Implementación Frontend

### Componente Stripe Payment

```vue
<!-- components/StripePayment.vue -->
<template>
  <div class="stripe-payment">
    <v-card>
      <v-card-title class="text-center">
        <v-img 
          src="/stripe-logo.png" 
          height="40" 
          contain 
          class="mb-2"
        ></v-img>
        <div>Pago Seguro Internacional</div>
      </v-card-title>
      
      <v-card-text>
        <div class="payment-summary text-center mb-4">
          <div class="text-h6">Total a pagar:</div>
          <div class="text-h4 text-primary font-weight-bold">
            ${{ formatAmount(amount) }}
          </div>
        </div>
        
        <!-- Stripe Elements Container -->
        <div id="stripe-elements" v-show="clientSecret">
          <div id="payment-element" class="mb-4"></div>
        </div>
        
        <v-btn
          v-if="clientSecret"
          color="primary"
          size="large"
          block
          :loading="processing"
          @click="confirmPayment"
          :disabled="!paymentElement"
          class="mb-3"
        >
          <v-icon start>mdi-credit-card</v-icon>
          Confirmar Pago
        </v-btn>
        
        <v-btn
          v-else
          color="primary"
          size="large"
          block
          :loading="initializing"
          @click="initializePayment"
        >
          <v-icon start>mdi-credit-card</v-icon>
          Pagar con Tarjeta
        </v-btn>
        
        <div class="security-info text-center">
          <v-chip color="success" variant="tonal" size="small">
            <v-icon start>mdi-shield-check</v-icon>
            Protegido por Stripe
          </v-chip>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { loadStripe } from '@stripe/stripe-js';

export default {
  name: 'StripePayment',
  
  props: {
    saleId: String,
    amount: Number,
    courseTitle: String
  },
  
  data() {
    return {
      stripe: null,
      elements: null,
      paymentElement: null,
      clientSecret: null,
      initializing: false,
      processing: false
    };
  },
  
  async mounted() {
    // Cargar Stripe
    this.stripe = await loadStripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY);
  },
  
  methods: {
    async initializePayment() {
      this.initializing = true;
      
      try {
        // Crear Payment Intent en el backend
        const response = await this.$http.post('/api/payments/stripe/create-intent', {
          saleId: this.saleId,
          amount: this.amount
        });
        
        this.clientSecret = response.data.clientSecret;
        
        // Configurar Stripe Elements
        await this.setupStripeElements();
        
      } catch (error) {
        this.$emit('payment-error', error);
      } finally {
        this.initializing = false;
      }
    },
    
    async setupStripeElements() {
      if (!this.stripe || !this.clientSecret) return;
      
      // Crear Elements instance
      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1976d2'
          }
        }
      });
      
      // Crear Payment Element
      this.paymentElement = this.elements.create('payment');
      this.paymentElement.mount('#payment-element');
    },
    
    async confirmPayment() {
      if (!this.stripe || !this.elements) return;
      
      this.processing = true;
      
      try {
        const { error, paymentIntent } = await this.stripe.confirmPayment({
          elements: this.elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment/success`
          },
          redirect: 'if_required'
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (paymentIntent.status === 'succeeded') {
          // Confirmar en el backend
          await this.$http.post('/api/payments/stripe/confirm', {
            paymentIntentId: paymentIntent.id
          });
          
          this.$emit('payment-success', {
            transactionId: paymentIntent.id,
            amount: this.amount,
            paymentMethod: 'stripe'
          });
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

<style scoped>
#payment-element {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}
</style>
```

### Variables de Entorno Frontend

```env
# frontend/.env
VUE_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

## Testing con Stripe

### Tarjetas de Prueba
```javascript
const stripeTestCards = {
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  // Tarjetas que simulan errores
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  lostCard: '4000000000009987'
};
```

### Webhooks de Testing
1. Instalar Stripe CLI: `stripe listen --forward-to localhost:5001/api/payments/stripe/webhook`
2. Copiar webhook secret al .env
3. Probar eventos: `stripe trigger payment_intent.succeeded`

## Rutas API

```javascript
// functions/routes/stripe.js
const express = require('express');
const { createPaymentIntent, confirmPayment, handleWebhook } = require('../controllers/stripeController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create-intent', verifyToken, createPaymentIntent);
router.post('/confirm', verifyToken, confirmPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
```
