const admin = require('./config/firebase');
const jwt = require('jsonwebtoken');

// Función para probar conexión básica con Firebase
async function testFirebaseConnection() {
  console.log('------- PRUEBA DE CONEXIÓN A FIREBASE -------');
  
  try {
    // 1. Probar inicialización básica
    console.log(`1. Firebase inicializado: ${admin.app.name}`);
    
    // 2. Probar acceso a Firestore
    console.log('2. Intentando acceder a Firestore...');
    const snapshot = await admin.firestore().collection('test').add({
      test: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`   ✓ Firestore accesible - Documento creado: ${snapshot.id}`);
    
    // 3. Diagnosticar problema de permisos IAM
    try {
      console.log('3. Intentando crear un token personalizado (esto fallará si faltan permisos IAM)...');
      const customToken = await admin.auth().createCustomToken('test-user');
      console.log(`   ✓ Token personalizado creado: ${customToken.substring(0, 10)}...`);
    } catch (tokenError) {
      console.log(`   ✗ Error al crear token personalizado: ${tokenError.message}`);
      console.log('   → Este error confirma el problema de permisos IAM');
      console.log('   → Usaremos JWT estándar como alternativa');
    }
    
    // 4. Probar alternativa JWT
    console.log('4. Probando alternativa JWT...');
    const jwtToken = jwt.sign(
      { uid: 'test-user', email: 'test@example.com' },
      process.env.JWT_SECRET || 'clave_secreta_temporal',
      { expiresIn: '1h' }
    );
    console.log(`   ✓ Token JWT creado: ${jwtToken.substring(0, 20)}...`);
    
    // 5. Verificar decodificación JWT
    const decoded = jwt.verify(
      jwtToken,
      process.env.JWT_SECRET || 'clave_secreta_temporal'
    );
    console.log(`   ✓ Token JWT verificado correctamente: `, decoded);
    
  } catch (error) {
    console.error('Error durante prueba de conexión:', error);
  }
  
  console.log('-------------------------------------------');
}

// Ejecutar prueba
testFirebaseConnection().catch(console.error);
