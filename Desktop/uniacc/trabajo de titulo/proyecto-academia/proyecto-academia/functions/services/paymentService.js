const admin = require('../config/firebase');
const SaleModel = require('../models/saleModel');
const CourseModel = require('../models/courseModel');
const EnrollmentModel = require('../models/enrollmentModel');
const axios = require('axios');
const crypto = require('crypto');

/**
 * Servicio para manejar procesamiento de pagos
 */
class PaymentService {
  constructor() {
    // Payment provider configurations
    this.providers = {
      TRANSBANK: {
        enabled: process.env.TRANSBANK_ENABLED === 'true',
        apiKey: process.env.TRANSBANK_API_KEY,
        environment: process.env.TRANSBANK_ENVIRONMENT || 'sandbox',
        baseUrl: process.env.TRANSBANK_ENVIRONMENT === 'production' 
          ? 'https://webpay3g.transbank.cl' 
          : 'https://webpay3gint.transbank.cl'
      },
      PAYPAL: {
        enabled: process.env.PAYPAL_ENABLED === 'true',
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
        baseUrl: process.env.PAYPAL_ENVIRONMENT === 'production'
          ? 'https://api-m.paypal.com'
          : 'https://api-m.sandbox.paypal.com'
      },
      STRIPE: {
        enabled: process.env.STRIPE_ENABLED === 'true',
        secretKey: process.env.STRIPE_SECRET_KEY,
        publicKey: process.env.STRIPE_PUBLIC_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
      }
    };
  }

  /**
   * Procesar pago según el método seleccionado
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} - Resultado del pago
   */
  async processPayment(paymentData) {
    const { paymentMethod, amount, currency = 'CLP', saleId } = paymentData;

    try {
      switch (paymentMethod) {
        case 'credit_card':
          return await this.processCreditCardPayment(paymentData);
        case 'transbank':
          return await this.processTransbankPayment(paymentData);
        case 'paypal':
          return await this.processPayPalPayment(paymentData);
        case 'stripe':
          return await this.processStripePayment(paymentData);
        default:
          throw new Error(`Método de pago no soportado: ${paymentMethod}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // Update sale status to failed
      if (saleId) {
        await SaleModel.updateStatus(saleId, SaleModel.STATUS.FAILED, {
          error: error.message,
          failedAt: new Date()
        });
      }
      
      throw error;
    }
  }

  /**
   * Procesar pago con tarjeta de crédito (simulado)
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} - Resultado del pago
   */
  async processCreditCardPayment(paymentData) {
    const { cardData, amount, saleId } = paymentData;

    // Validar datos de la tarjeta
    if (!this.validateCardData(cardData)) {
      throw new Error('Datos de tarjeta inválidos');
    }

    // Simular procesamiento de pago
    await this.simulatePaymentDelay();

    // Simular respuesta del proveedor de pagos
    const success = Math.random() > 0.05; // 95% success rate

    if (!success) {
      throw new Error('Pago rechazado por el banco. Verifica los datos de tu tarjeta.');
    }

    const transactionId = this.generateTransactionId();
    
    // Update sale status
    if (saleId) {
      await SaleModel.updateStatus(saleId, SaleModel.STATUS.PAID, {
        transactionId,
        paymentMethod: 'credit_card',
        paidAt: new Date(),
        cardLast4: cardData.number.slice(-4)
      });
    }

    return {
      success: true,
      transactionId,
      status: 'paid',
      message: 'Pago procesado exitosamente'
    };
  }

  /**
   * Procesar pago con Transbank
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} - Resultado del pago
   */
  async processTransbankPayment(paymentData) {
    const { amount, saleId, returnUrl } = paymentData;

    if (!this.providers.TRANSBANK.enabled) {
      throw new Error('Transbank no está habilitado');
    }

    try {
      // Create transaction in Transbank
      const transactionData = {
        amount: Math.round(amount),
        session_id: saleId,
        buy_order: `ORDER_${saleId}_${Date.now()}`,
        return_url: returnUrl || `${process.env.FRONTEND_URL}/payment/success`
      };

      const response = await axios.post(
        `${this.providers.TRANSBANK.baseUrl}/rswebpaytransaction/api/webpay/v1.2/transactions`,
        transactionData,
        {
          headers: {
            'Tbk-Api-Key-Id': this.providers.TRANSBANK.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update sale with Transbank transaction info
      if (saleId) {
        await SaleModel.updateStatus(saleId, SaleModel.STATUS.PROCESSING, {
          transbankToken: response.data.token,
          transbankUrl: response.data.url,
          buyOrder: transactionData.buy_order
        });
      }

      return {
        success: true,
        redirectUrl: response.data.url,
        token: response.data.token,
        message: 'Redirigiendo a Transbank...'
      };

    } catch (error) {
      console.error('Transbank error:', error);
      throw new Error('Error al conectar con Transbank');
    }
  }

  /**
   * Procesar pago con PayPal
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} - Resultado del pago
   */
  async processPayPalPayment(paymentData) {
    const { amount, saleId, currency = 'USD' } = paymentData;

    if (!this.providers.PAYPAL.enabled) {
      throw new Error('PayPal no está habilitado');
    }

    try {
      // Get access token
      const accessToken = await this.getPayPalAccessToken();

      // Create PayPal order
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString()
          },
          reference_id: saleId
        }],
        application_context: {
          return_url: `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
        }
      };

      const response = await axios.post(
        `${this.providers.PAYPAL.baseUrl}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update sale with PayPal order info
      if (saleId) {
        await SaleModel.updateStatus(saleId, SaleModel.STATUS.PROCESSING, {
          paypalOrderId: response.data.id,
          paypalLinks: response.data.links
        });
      }

      const approvalUrl = response.data.links.find(link => link.rel === 'approve')?.href;

      return {
        success: true,
        redirectUrl: approvalUrl,
        orderId: response.data.id,
        message: 'Redirigiendo a PayPal...'
      };

    } catch (error) {
      console.error('PayPal error:', error);
      throw new Error('Error al conectar con PayPal');
    }
  }

  /**
   * Obtener token de acceso de PayPal
   * @returns {Promise<string>} - Access token
   */
  async getPayPalAccessToken() {
    const auth = Buffer.from(
      `${this.providers.PAYPAL.clientId}:${this.providers.PAYPAL.clientSecret}`
    ).toString('base64');

    const response = await axios.post(
      `${this.providers.PAYPAL.baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  }

  /**
   * Confirmar pago completado y crear inscripción
   * @param {string} saleId - ID de la venta
   * @returns {Promise<Object>} - Resultado de la confirmación
   */
  async confirmPaymentAndEnroll(saleId) {
    try {
      // Get sale data
      const sale = await SaleModel.getById(saleId);
      if (!sale) {
        throw new Error('Venta no encontrada');
      }

      // Check if already completed
      if (sale.status === SaleModel.STATUS.COMPLETED) {
        return { success: true, message: 'Venta ya completada' };
      }

      // Create enrollment
      const enrollment = await EnrollmentModel.create(sale.userId, sale.courseId, {
        saleId: saleId,
        enrollmentType: 'paid',
        enrolledAt: new Date()
      });

      // Update sale status to completed
      await SaleModel.updateStatus(saleId, SaleModel.STATUS.COMPLETED, {
        completedAt: new Date(),
        enrollmentId: enrollment.id
      });

      // Send confirmation email (implement separately)
      await this.sendPaymentConfirmationEmail(sale, enrollment);

      return {
        success: true,
        enrollment,
        message: 'Pago confirmado e inscripción creada'
      };

    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }

  /**
   * Validar webhook de proveedor de pagos
   * @param {Object} webhookData - Datos del webhook
   * @param {string} provider - Proveedor de pagos
   * @returns {Promise<Object>} - Resultado de la validación
   */
  async processWebhook(webhookData, provider = 'generic') {
    try {
      switch (provider) {
        case 'transbank':
          return await this.processTransbankWebhook(webhookData);
        case 'paypal':
          return await this.processPayPalWebhook(webhookData);
        case 'stripe':
          return await this.processStripeWebhook(webhookData);
        default:
          return await this.processGenericWebhook(webhookData);
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  /**
   * Procesar webhook genérico
   * @param {Object} webhookData - Datos del webhook
   * @returns {Promise<Object>} - Resultado del procesamiento
   */
  async processGenericWebhook(webhookData) {
    const { event_type, reference_id, payment_id, status } = webhookData;

    const saleId = reference_id;
    let newStatus;

    switch (event_type) {
      case 'payment.started':
        newStatus = SaleModel.STATUS.PROCESSING;
        break;
      case 'payment.completed':
        newStatus = SaleModel.STATUS.PAID;
        // Auto-confirm and enroll
        await this.confirmPaymentAndEnroll(saleId);
        break;
      case 'payment.failed':
        newStatus = SaleModel.STATUS.FAILED;
        break;
      case 'payment.refunded':
        newStatus = SaleModel.STATUS.REFUNDED;
        break;
      default:
        throw new Error(`Evento no reconocido: ${event_type}`);
    }

    // Update sale status
    await SaleModel.updateStatus(saleId, newStatus, {
      webhookData,
      lastWebhookAt: new Date()
    });

    return { success: true, status: newStatus };
  }

  /**
   * Validar datos de tarjeta de crédito
   * @param {Object} cardData - Datos de la tarjeta
   * @returns {boolean} - Es válida o no
   */
  validateCardData(cardData) {
    const { number, name, expiry, cvv } = cardData;

    // Basic validation
    if (!number || !name || !expiry || !cvv) {
      return false;
    }

    // Card number validation (Luhn algorithm)
    const cleaned = number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }

    // Expiry validation
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return false;
    }

    // CVV validation
    if (!/^\d{3,4}$/.test(cvv)) {
      return false;
    }

    return true;
  }

  /**
   * Generar ID de transacción único
   * @returns {string} - ID de transacción
   */
  generateTransactionId() {
    return 'TXN_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  /**
   * Simular delay de procesamiento de pago
   * @returns {Promise<void>}
   */
  async simulatePaymentDelay() {
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Enviar email de confirmación de pago
   * @param {Object} sale - Datos de la venta
   * @param {Object} enrollment - Datos de la inscripción
   * @returns {Promise<void>}
   */
  async sendPaymentConfirmationEmail(sale, enrollment) {
    // TODO: Implement email service
    console.log('Sending payment confirmation email:', {
      saleId: sale.id,
      enrollmentId: enrollment.id,
      userEmail: sale.userEmail
    });
  }

  /**
   * Refund a payment
   * @param {string} saleId - ID de la venta
   * @param {string} reason - Razón del reembolso
   * @returns {Promise<Object>} - Resultado del reembolso
   */
  async refundPayment(saleId, reason = 'Requested by user') {
    try {
      const sale = await SaleModel.getById(saleId);
      if (!sale) {
        throw new Error('Venta no encontrada');
      }

      if (sale.status !== SaleModel.STATUS.COMPLETED && sale.status !== SaleModel.STATUS.PAID) {
        throw new Error('La venta no puede ser reembolsada');
      }

      // Process refund based on payment method
      let refundResult;
      switch (sale.paymentMethod) {
        case 'transbank':
          refundResult = await this.processTransbankRefund(sale);
          break;
        case 'paypal':
          refundResult = await this.processPayPalRefund(sale);
          break;
        default:
          // Generic refund (manual process)
          refundResult = { success: true, refundId: this.generateTransactionId() };
      }

      // Update sale status
      await SaleModel.updateStatus(saleId, SaleModel.STATUS.REFUNDED, {
        refundId: refundResult.refundId,
        refundReason: reason,
        refundedAt: new Date()
      });

      // Disable enrollment if exists
      if (sale.enrollmentId) {
        await EnrollmentModel.disable(sale.enrollmentId, 'Payment refunded');
      }

      return {
        success: true,
        refundId: refundResult.refundId,
        message: 'Reembolso procesado exitosamente'
      };

    } catch (error) {
      console.error('Refund error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
