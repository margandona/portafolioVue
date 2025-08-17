/**
 * Test HTTP para las APIs de pago
 */
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testHealthEndpoint() {
  console.log('🔍 Testing health endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', response.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function testPaymentMethods() {
  console.log('\n🔍 Testing payment methods...');
  try {
    const response = await axios.get(`${BASE_URL}/api/payments/methods`);
    console.log('✅ Payment methods:', response.data);
  } catch (error) {
    console.error('❌ Payment methods failed:', error.message);
  }
}

async function testTransbankCreate() {
  console.log('\n🔍 Testing Transbank transaction creation...');
  try {
    const requestData = {
      saleId: 'test_api_' + Date.now(),
      amount: 15000,
      returnUrl: 'http://localhost:8080/payment/transbank/return'
    };
    
    console.log('📤 Request data:', requestData);
    
    const response = await axios.post(`${BASE_URL}/api/payments/transbank/create`, requestData);
    console.log('✅ Transbank transaction created:');
    console.log('   Token:', response.data.token);
    console.log('   URL:', response.data.redirectUrl);
    
    return response.data;
  } catch (error) {
    console.error('❌ Transbank creation failed:', error.response?.data || error.message);
  }
}

async function testTransbankConfirm(token) {
  console.log('\n🔍 Testing Transbank transaction confirmation...');
  try {
    const requestData = {
      token: token,
      saleId: 'test_api_' + Date.now()
    };
    
    console.log('📤 Confirm request data:', requestData);
    
    const response = await axios.post(`${BASE_URL}/api/payments/transbank/confirm`, requestData);
    console.log('✅ Transbank transaction confirmed:');
    console.log('   Details:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Transbank confirmation failed:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🧪 Iniciando tests de API de pagos...\n');
  
  await testHealthEndpoint();
  await testPaymentMethods();
  
  const transactionResult = await testTransbankCreate();
  
  if (transactionResult && transactionResult.token) {
    console.log('\n💡 Para completar el flujo:');
    console.log('1. Ve a:', transactionResult.redirectUrl);
    console.log('2. Completa el pago con tarjeta de prueba: 4051 8856 0829 0648');
    console.log('3. Luego ejecuta:');
    console.log(`   node test-api.js confirm ${transactionResult.token}`);
  }
  
  // Si se pasa un token como argumento, confirmar la transacción
  const args = process.argv.slice(2);
  if (args[0] === 'confirm' && args[1]) {
    await testTransbankConfirm(args[1]);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testHealthEndpoint, testPaymentMethods, testTransbankCreate, testTransbankConfirm };
