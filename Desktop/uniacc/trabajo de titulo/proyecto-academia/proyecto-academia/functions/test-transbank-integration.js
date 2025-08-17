/**
 * Script de testing para Transbank en ambiente de integración
 * Ejecutar con: node test-transbank-integration.js
 */

require('dotenv').config();
const { TransbankPaymentService } = require('./services/transbankPaymentService');

async function testTransbankIntegration() {
  console.log('🧪 Iniciando test de Transbank en ambiente de integración...\n');
  
  try {
    // Crear instancia del servicio
    const tbkService = new TransbankPaymentService();
    
    // Datos de prueba
    const testData = {
      saleId: 'test_sale_' + Date.now(),
      amount: 10000, // $10.000 CLP
      returnUrl: 'http://localhost:8080/payment/transbank/return'
    };
    
    console.log('📋 Datos de prueba:', testData);
    console.log('\n1️⃣ Creando transacción...');
    
    // Crear transacción
    const transaction = await tbkService.createTransaction(
      testData.saleId,
      testData.amount,
      testData.returnUrl
    );
    
    console.log('✅ Transacción creada exitosamente:');
    console.log('   Token:', transaction.token);
    console.log('   URL de pago:', transaction.url);
    console.log('   Buy Order:', transaction.buyOrder);
    
    console.log('\n🌐 Para completar el test:');
    console.log('1. Abre esta URL en tu navegador:');
    console.log('   ' + transaction.url);
    console.log('\n2. Usa estos datos de tarjeta de prueba:');
    console.log('   Número: 4051 8856 0829 0648');
    console.log('   CVV: 123');
    console.log('   Fecha: cualquier fecha futura');
    console.log('\n3. La transacción te redirigirá de vuelta a:');
    console.log('   ' + testData.returnUrl + '?token_ws=' + transaction.token);
    
    console.log('\n⏳ Guardando token para confirmación posterior...');
    console.log('   Token guardado:', transaction.token);
    
    return transaction;
    
  } catch (error) {
    console.error('❌ Error en test de integración:', error.message);
    console.error('   Detalles:', error);
    
    // Diagnóstico de configuración
    console.log('\n🔍 Diagnóstico de configuración:');
    console.log('   TRANSBANK_HOST:', process.env.TRANSBANK_HOST);
    console.log('   TRANSBANK_COMMERCE_CODE:', process.env.TRANSBANK_COMMERCE_CODE);
    console.log('   TRANSBANK_API_KEY presente:', !!process.env.TRANSBANK_API_KEY);
    console.log('   TRANSBANK_INTEGRATION_TYPE:', process.env.TRANSBANK_INTEGRATION_TYPE);
  }
}

async function testTransactionConfirmation(token) {
  console.log('\n2️⃣ Probando confirmación de transacción...');
  
  try {
    const tbkService = new TransbankPaymentService();
    const result = await tbkService.confirmTransaction(token);
    
    console.log('✅ Transacción confirmada:');
    console.log('   Estado:', result.status);
    console.log('   Código de autorización:', result.authorizationCode);
    console.log('   Monto:', result.amount);
    console.log('   Orden de compra:', result.buyOrder);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error confirmando transacción:', error.message);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === 'confirm' && args[1]) {
    // Modo confirmación con token
    await testTransactionConfirmation(args[1]);
  } else {
    // Modo creación de transacción
    await testTransbankIntegration();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testTransbankIntegration, testTransactionConfirmation };
