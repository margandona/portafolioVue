const { WebpayPlus, Options, Environment } = require('transbank-sdk');
const Stripe = require('stripe');

/**
 * Servicio de pago con Transbank - Configuración para Ambiente de Integración
 */
class TransbankPaymentService {
  constructor() {
    // Configurar ambiente específico - usar Integration para testing
    const environment = process.env.TRANSBANK_INTEGRATION_TYPE === 'LIVE' 
      ? Environment.Production 
      : Environment.Integration;
    
    // Credenciales para ambiente de integración
    const commerceCode = process.env.TRANSBANK_COMMERCE_CODE || '597055555532';
    const apiKey = process.env.TRANSBANK_API_KEY || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C';
    
    // Crear la instancia de transacción según el ambiente
    if (environment === Environment.Integration) {
      this.transaction = WebpayPlus.Transaction.buildForIntegration(commerceCode, apiKey);
    } else {
      this.transaction = WebpayPlus.Transaction.buildForProduction(commerceCode, apiKey);
    }
    
    console.log('🏦 Transbank configurado para ambiente de integración:', {
      environment: environment === Environment.Integration ? 'Integration' : 'Production',
      host: 'https://webpay3gint.transbank.cl',
      commerceCode: commerceCode,
      apiKeyPresent: !!apiKey
    });
  }

  /**
   * Crear una nueva transacción en Transbank
   */
  async createTransaction(saleId, amount, returnUrl) {
    try {
      console.log('🔄 Creando transacción Transbank:', { saleId, amount, returnUrl });
      
      // Generar identificadores más cortos (max 26 caracteres para buyOrder)
      const timestamp = Date.now().toString().slice(-8); // Últimos 8 dígitos del timestamp
      const sessionId = `s${saleId}_${timestamp}`.substring(0, 26);
      const buyOrder = `o${saleId}_${timestamp}`.substring(0, 26);
      
      console.log('📋 Identificadores generados:', { sessionId, buyOrder, lengths: { session: sessionId.length, buy: buyOrder.length } });
      
      // Crear transacción en Transbank usando la instancia configurada
      const response = await this.transaction.create(
        buyOrder,
        sessionId,
        amount,
        returnUrl
      );
      
      console.log('✅ Transacción Transbank creada:', {
        token: response.token,
        url: response.url,
        buyOrder,
        sessionId
      });
      
      return {
        success: true,
        token: response.token,
        url: response.url,
        buyOrder,
        sessionId
      };
      
    } catch (error) {
      console.error('❌ Error creando transacción Transbank:', error);
      throw new Error(`Error Transbank: ${error.message}`);
    }
  }

  /**
   * Confirmar una transacción de Transbank
   */
  async confirmTransaction(token) {
    try {
      console.log('🔍 Confirmando transacción Transbank:', { token });
      
      const response = await this.transaction.commit(token);
      
      console.log('✅ Transacción Transbank confirmada:', {
        authorizationCode: response.authorization_code,
        status: response.status,
        amount: response.amount,
        buyOrder: response.buy_order
      });
      
      return {
        success: true,
        status: response.status,
        authorizationCode: response.authorization_code,
        amount: response.amount,
        buyOrder: response.buy_order,
        transactionDate: response.transaction_date,
        cardDetail: {
          cardType: response.card_detail?.card_type,
          cardNumber: response.card_detail?.card_number
        },
        raw: response
      };
      
    } catch (error) {
      console.error('❌ Error confirmando transacción Transbank:', error);
      throw new Error(`Error confirmando Transbank: ${error.message}`);
    }
  }

  /**
   * Obtener el estado de una transacción
   */
  async getTransactionStatus(token) {
    try {
      const response = await this.transaction.status(token);
      return response;
    } catch (error) {
      console.error('Error obteniendo estado Transbank:', error);
      throw error;
    }
  }
}

/**
 * Servicio de pago con Stripe
 */
class StripePaymentService {
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('⚠️ Stripe no configurado - falta STRIPE_SECRET_KEY');
      return;
    }
    
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('💳 Stripe configurado correctamente');
  }

  /**
   * Crear un Payment Intent de Stripe
   */
  async createPaymentIntent(amount, saleId) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe no está configurado');
      }

      console.log('🔄 Creando Payment Intent Stripe:', { amount, saleId });

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Stripe uses cents
        currency: 'clp',
        metadata: {
          saleId: saleId.toString()
        },
        automatic_payment_methods: {
          enabled: true
        }
      });

      console.log('✅ Payment Intent creado:', paymentIntent.id);

      return paymentIntent;
    } catch (error) {
      console.error('❌ Error creando Payment Intent:', error);
      throw error;
    }
  }

  /**
   * Recuperar un Payment Intent de Stripe
   */
  async retrievePaymentIntent(paymentIntentId) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe no está configurado');
      }

      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error recuperando Payment Intent:', error);
      throw error;
    }
  }

  /**
   * Construir evento de webhook
   */
  constructWebhookEvent(body, signature, secret) {
    if (!this.stripe) {
      throw new Error('Stripe no está configurado');
    }
    
    return this.stripe.webhooks.constructEvent(body, signature, secret);
  }
}

/**
 * Servicio de pago simulado para desarrollo
 */
class SimulatorPaymentService {
  async processPayment(paymentData) {
    console.log('🧪 Procesando pago simulado:', paymentData);
    
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Validar número de tarjeta con algoritmo de Luhn
    if (paymentData.cardData && paymentData.cardData.cardNumber) {
      const isValid = this.validateCardNumber(paymentData.cardData.cardNumber);
      if (!isValid) {
        return {
          success: false,
          message: 'Número de tarjeta inválido',
          error: 'INVALID_CARD'
        };
      }
    }
    
    // Simular éxito/fallo basado en el número de tarjeta
    const lastDigit = parseInt(paymentData.cardData?.cardNumber?.slice(-1) || '0');
    const success = lastDigit !== 2; // Fallar si termina en 2
    
    if (success) {
      const transactionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        transactionId,
        message: 'Pago simulado exitoso',
        details: {
          amount: paymentData.amount,
          currency: paymentData.currency || 'CLP',
          method: 'simulator',
          timestamp: new Date().toISOString()
        }
      };
    } else {
      return {
        success: false,
        message: 'Pago simulado fallido',
        error: 'SIMULATION_DECLINED'
      };
    }
  }

  /**
   * Validar número de tarjeta usando algoritmo de Luhn
   */
  validateCardNumber(cardNumber) {
    const num = cardNumber.replace(/\s/g, '');
    let sum = 0;
    let alternate = false;
    
    for (let i = num.length - 1; i >= 0; i--) {
      let n = parseInt(num.charAt(i), 10);
      
      if (alternate) {
        n *= 2;
        if (n > 9) {
          n = (n % 10) + 1;
        }
      }
      
      sum += n;
      alternate = !alternate;
    }
    
    return (sum % 10) === 0;
  }
}

module.exports = {
  TransbankPaymentService,
  StripePaymentService,
  SimulatorPaymentService
};
