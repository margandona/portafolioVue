const admin = require('../config/firebase');

// Función para probar conectividad básica con Firebase
async function testFirebaseConnection() {
  try {
    console.log('Probando conexión a Firebase...');
    
    // Recuperar el nombre de la app Firebase (debe ser [DEFAULT])
    const appName = admin.app().name;
    console.log(`- Nombre de la aplicación Firebase: ${appName}`);
    
    // Intentar listar usuarios (operación básica que requiere autenticación)
    try {
      console.log('- Intentando listar usuarios (máximo 1)...');
      const listUsersResult = await admin.auth().listUsers(1);
      console.log(`  ✅ Listado de usuarios exitoso. Usuarios encontrados: ${listUsersResult.users.length}`);
    } catch (listError) {
      console.error(`  ❌ Error al listar usuarios: ${listError.message}`);
      console.error('  Este error sugiere un problema con los permisos de la cuenta de servicio');
    }
    
    console.log('\nResumen de la prueba:');
    console.log('Firebase Admin SDK inicializado correctamente');
    console.log('Para resolver el error de permisos:');
    console.log('1. Verifica que la cuenta de servicio tenga rol "Service Account Token Creator"');
    console.log('2. Considera usar Firebase Auth REST API como alternativa');
    
  } catch (error) {
    console.error('Error al conectar con Firebase:', error);
  }
}

// Ejecutar la prueba
testFirebaseConnection();
