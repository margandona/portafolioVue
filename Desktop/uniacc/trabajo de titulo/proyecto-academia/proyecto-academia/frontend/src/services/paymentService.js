/**
 * Servicio de pagos para el frontend
 * Maneja la comunicación con las APIs de pago
 */
import axios from 'axios'

class PaymentService {
  constructor() {
    this.baseURL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000'
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    // Interceptors para manejo de errores
    this.api.interceptors.response.use(
      response => response,
      error => {
        console.error('PaymentService Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  /**
   * Obtener métodos de pago disponibles
   */
  async getPaymentMethods() {
    try {
      const response = await this.api.get('/api/payments/methods')
      return response.data
    } catch (error) {
      throw new Error(`Error obteniendo métodos de pago: ${error.message}`)
    }
  }

  /**
   * Crear transacción con Transbank
   */
  async createTransbankTransaction(saleId, amount, returnUrl = null) {
    try {
      const data = {
        saleId,
        amount,
        returnUrl: returnUrl || `${window.location.origin}/payment/transbank/return`
      }
      
      console.log('🏦 Creando transacción Transbank:', data)
      
      const response = await this.api.post('/api/payments/transbank/create', data)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error creando transacción')
      }
      
      return response.data
    } catch (error) {
      throw new Error(`Error Transbank: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Confirmar transacción de Transbank
   */
  async confirmTransbankTransaction(token, saleId) {
    try {
      const data = { token, saleId }
      
      console.log('🔍 Confirmando transacción Transbank:', data)
      
      const response = await this.api.post('/api/payments/transbank/confirm', data)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error confirmando transacción')
      }
      
      return response.data
    } catch (error) {
      throw new Error(`Error confirmando Transbank: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Crear Payment Intent con Stripe
   */
  async createStripePaymentIntent(saleId, amount) {
    try {
      const data = { saleId, amount }
      
      console.log('💳 Creando Payment Intent Stripe:', data)
      
      const response = await this.api.post('/api/payments/stripe/create-intent', data)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error creando Payment Intent')
      }
      
      return response.data
    } catch (error) {
      throw new Error(`Error Stripe: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Confirmar pago de Stripe
   */
  async confirmStripePayment(paymentIntentId, saleId) {
    try {
      const data = { paymentIntentId, saleId }
      
      console.log('✅ Confirmando pago Stripe:', data)
      
      const response = await this.api.post('/api/payments/stripe/confirm', data)
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Error confirmando pago')
      }
      
      return response.data
    } catch (error) {
      throw new Error(`Error confirmando Stripe: ${error.response?.data?.message || error.message}`)
    }
  }

  /**
   * Procesar pago simulado (para desarrollo)
   */
  async processSimulatedPayment(saleId, paymentData) {
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Validación básica de tarjeta
      if (!paymentData.cardNumber || paymentData.cardNumber.length < 13) {
        throw new Error('Número de tarjeta inválido')
      }
      
      // Simular éxito/fallo basado en el último dígito
      const lastDigit = parseInt(paymentData.cardNumber.slice(-1))
      const success = lastDigit !== 2 // Fallar si termina en 2
      
      if (success) {
        return {
          success: true,
          transactionId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: 'Pago simulado exitoso'
        }
      } else {
        throw new Error('Pago simulado rechazado')
      }
    } catch (error) {
      throw new Error(`Error pago simulado: ${error.message}`)
    }
  }

  /**
   * Validar conectividad con el servidor de pagos
   */
  async checkServerHealth() {
    try {
      const response = await this.api.get('/health')
      return response.data
    } catch (error) {
      throw new Error(`Servidor de pagos no disponible: ${error.message}`)
    }
  }
}

// Crear instancia singleton
const paymentService = new PaymentService()

export default paymentService
export { PaymentService }
