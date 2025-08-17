/**
 * Test directo de Transbank para Sprint 1
 */
require('dotenv').config();
const { TransbankPaymentService } = require('./services/transbankPaymentService');

async function testTransbankDirecto() {
  console.log('🧪 Test directo de Transbank - Sprint 1\n');
  
  try {
    // Crear servicio
    const tbk = new TransbankPaymentService();
    
    // Datos de prueba
    const saleId = 'sprint1_' + Date.now();
    const amount = 25000; // $25.000 CLP
    const returnUrl = 'http://localhost:8080/payment/transbank/return';
    
    console.log('📋 Creando transacción de prueba:');
    console.log(`   Sale ID: ${saleId}`);
    console.log(`   Monto: $${amount.toLocaleString('es-CL')} CLP`);
    console.log(`   Return URL: ${returnUrl}\n`);
    
    // Crear transacción
    const transaction = await tbk.createTransaction(saleId, amount, returnUrl);
    
    console.log('✅ ¡TRANSACCIÓN CREADA EXITOSAMENTE!\n');
    console.log('🔗 DATOS DE LA TRANSACCIÓN:');
    console.log(`   Token: ${transaction.token}`);
    console.log(`   URL de Pago: ${transaction.url}`);
    console.log(`   Buy Order: ${transaction.buyOrder}`);
    console.log(`   Session ID: ${transaction.sessionId}\n`);
    
    console.log('🌐 PRUEBA EL PAGO COMPLETO:');
    console.log('1. Abre esta URL en tu navegador:');
    console.log(`   ${transaction.url}`);
    console.log('\n2. Usa esta tarjeta de prueba:');
    console.log('   Número: 4051 8856 0829 0648');
    console.log('   CVV: 123');
    console.log('   Fecha: 12/26 (o cualquier fecha futura)');
    console.log('\n3. Autoriza el pago y serás redirigido a:');
    console.log(`   ${returnUrl}?token_ws=${transaction.token}`);
    
    console.log('\n🔄 Para confirmar la transacción después del pago:');
    console.log(`   node test-transbank-sprint1.js confirm ${transaction.token}`);
    
    return transaction.token;
    
  } catch (error) {
    console.error('❌ Error en test de Transbank:', error.message);
    return null;
  }
}

async function confirmarTransaccion(token) {
  console.log('🔍 Confirmando transacción...\n');
  
  try {
    const tbk = new TransbankPaymentService();
    const result = await tbk.confirmTransaction(token);
    
    console.log('✅ ¡TRANSACCIÓN CONFIRMADA EXITOSAMENTE!\n');
    console.log('💳 DETALLES DEL PAGO:');
    console.log(`   Estado: ${result.status}`);
    console.log(`   Código de Autorización: ${result.authorizationCode}`);
    console.log(`   Monto: $${result.amount?.toLocaleString('es-CL')} CLP`);
    console.log(`   Fecha: ${result.transactionDate}`);
    console.log(`   Orden de Compra: ${result.buyOrder}`);
    
    if (result.cardDetail) {
      console.log(`\n💳 DETALLES DE LA TARJETA:`);
      console.log(`   Tipo: ${result.cardDetail.cardType}`);
      console.log(`   Número: ***${result.cardDetail.cardNumber}`);
    }
    
    console.log('\n🎉 ¡EL SISTEMA DE PAGOS TRANSBANK ESTÁ FUNCIONANDO PERFECTAMENTE!');
    console.log('✅ Sprint 1 - Integración Transbank: COMPLETADO');
    
  } catch (error) {
    console.error('❌ Error confirmando transacción:', error.message);
    
    if (error.message.includes('Token not found') || error.message.includes('Transaction not found')) {
      console.log('\n💡 Esto puede significar que:');
      console.log('   • El token expiró (10 minutos)');
      console.log('   • El pago no se completó en Transbank');
      console.log('   • El usuario canceló el pago');
    }
  }
}

// Ejecutar
async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === 'confirm' && args[1]) {
    await confirmarTransaccion(args[1]);
  } else {
    await testTransbankDirecto();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testTransbankDirecto, confirmarTransaccion };
