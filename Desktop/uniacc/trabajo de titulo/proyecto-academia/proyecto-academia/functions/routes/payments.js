const express = require('express');
const router = express.Router();
const { TransbankPaymentService, StripePaymentService } = require('../services/transbankPaymentService');

// Mock auth middleware for development
const mockAuth = (req, res, next) => {
  req.user = { uid: 'test_user_123', role: 'student' };
  next();
};

// Transbank Routes
router.post('/transbank/create', mockAuth, async (req, res) => {
  try {
    const { saleId, amount, returnUrl } = req.body;
    
    if (!saleId || !amount || !returnUrl) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parámetros requeridos'
      });
    }
    
    const result = await TransbankPaymentService.createTransaction(saleId, amount, returnUrl);
    
    res.json({
      success: true,
      redirectUrl: result.url,
      token: result.token
    });
    
  } catch (error) {
    console.error('Error creating Transbank transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando transacción con Transbank',
      error: error.message
    });
  }
});

router.post('/transbank/confirm', mockAuth, async (req, res) => {
  try {
    const { token, saleId } = req.body;
    
    if (!token || !saleId) {
      return res.status(400).json({
        success: false,
        message: 'Token y ID de venta son requeridos'
      });
    }
    
    const result = await TransbankPaymentService.confirmTransaction(token);
    
    if (result.status === 'AUTHORIZED') {
      // En un entorno real, aquí actualizarías la base de datos
      console.log('💳 Pago autorizado - simulando actualización de DB');
      
      res.json({
        success: true,
        transactionDetails: {
          authorizationCode: result.authorizationCode,
          transactionDate: result.transactionDate,
          cardType: result.cardDetail?.cardType,
          cardNumber: result.cardDetail?.cardNumber
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Transacción no autorizada',
        details: result
      });
    }
    
  } catch (error) {
    console.error('Error confirming Transbank transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirmando transacción',
      error: error.message
    });
  }
});

// Stripe Routes
router.post('/stripe/create-intent', mockAuth, async (req, res) => {
  try {
    const { saleId, amount } = req.body;
    
    if (!saleId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Sale ID y monto son requeridos'
      });
    }
    
    const paymentIntent = await StripePaymentService.createPaymentIntent(amount, saleId);
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
    
  } catch (error) {
    console.error('Error creating Stripe Payment Intent:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando Payment Intent',
      error: error.message
    });
  }
});

router.post('/stripe/confirm', mockAuth, async (req, res) => {
  try {
    const { paymentIntentId, saleId } = req.body;
    
    if (!paymentIntentId || !saleId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID y Sale ID son requeridos'
      });
    }
    
    const paymentIntent = await StripePaymentService.retrievePaymentIntent(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      // En un entorno real, aquí actualizarías la base de datos
      console.log('💳 Pago Stripe exitoso - simulando actualización de DB');
      
      res.json({
        success: true,
        transactionDetails: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Pago no completado',
        status: paymentIntent.status
      });
    }
    
  } catch (error) {
    console.error('Error confirming Stripe payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirmando pago',
      error: error.message
    });
  }
});

// Webhook para Stripe (para confirmación automática)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = StripePaymentService.constructWebhookEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Manejar el evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      
      // Aquí podrías actualizar el estado de la venta si es necesario
      // const saleId = paymentIntent.metadata.saleId;
      // await saleModel.updateStatus(saleId, 'PAID');
      
      break;
    
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Manejar pago fallido
      // const failedSaleId = failedPayment.metadata.saleId;
      // await saleModel.updateStatus(failedSaleId, 'FAILED');
      
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
});

// Obtener métodos de pago disponibles
router.get('/methods', (req, res) => {
  const paymentMethods = [
    {
      id: 'transbank',
      name: 'Transbank (Chile)',
      description: 'Pago con tarjetas chilenas',
      enabled: !!process.env.TRANSBANK_INTEGRATION_TYPE,
      supportedCards: ['visa', 'mastercard', 'american-express']
    },
    {
      id: 'stripe',
      name: 'Stripe (Internacional)',
      description: 'Pago internacional con tarjetas',
      enabled: !!process.env.STRIPE_SECRET_KEY,
      supportedCards: ['visa', 'mastercard', 'american-express', 'discover']
    },
    {
      id: 'simulator',
      name: 'Simulador de Pago',
      description: 'Solo para testing',
      enabled: process.env.NODE_ENV !== 'production',
      supportedCards: ['test']
    }
  ];
  
  res.json({
    success: true,
    methods: paymentMethods.filter(method => method.enabled)
  });
});

module.exports = router;
