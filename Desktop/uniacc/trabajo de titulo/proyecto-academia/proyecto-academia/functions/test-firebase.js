const admin = require('./config/firebase');

async function testFirebaseConnection() {
  try {
    console.log('=== PRUEBA DE CONEXIÓN A FIREBASE ===');
    
    // 1. Verificar que la app se ha inicializado correctamente
    console.log('1. Nombre de la app Firebase:', admin.app().name);
    
    // 2. Probar acceso a Firestore
    console.log('2. Intentando acceder a Firestore...');
    const testDoc = await admin.firestore().collection('test').add({
      test: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`   ✅ Éxito: Se creó el documento de prueba con ID: ${testDoc.id}`);
    
    // 3. Probar acceso a Authentication
    console.log('3. Intentando acceder a Authentication...');
    try {
      const listUsers = await admin.auth().listUsers(1);
      console.log(`   ✅ Éxito: Se encontraron ${listUsers.users.length} usuarios`);
    } catch (authError) {
      console.log(`   ❌ Error: ${authError.message}`);
      console.log('   ⚠️ Posible problema con los permisos de Authentication');
    }
    
    // 4. Verificar la cuenta de servicio
    const serviceAccount = require('./config/academy.json');
    console.log('4. Información de la cuenta de servicio:');
    console.log(`   - Project ID: ${serviceAccount.project_id}`);
    console.log(`   - Client Email: ${serviceAccount.client_email}`);
    
    console.log('\n=== PRUEBA COMPLETA ===');
    
  } catch (error) {
    console.error('Error general durante la prueba:', error);
  }
}

// Ejecutar la prueba
testFirebaseConnection();
