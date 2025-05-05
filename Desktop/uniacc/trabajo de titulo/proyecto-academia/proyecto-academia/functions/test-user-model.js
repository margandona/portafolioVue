const User = require('./models/user');

async function testUserModel() {
  try {
    console.log('Verificando modelo de usuario...');
    
    // Probar la búsqueda de un usuario (incluso si no existe)
    console.log('1. Probando búsqueda de usuario...');
    const testEmail = 'test@example.com';
    const existingUser = await User.findOne({ where: { email: testEmail } });
    console.log(`   Usuario con email ${testEmail}: ${existingUser ? 'Encontrado' : 'No encontrado'}`);
    
    console.log('\n✅ Prueba completada. El modelo de usuario está funcionando correctamente.');
  } catch (error) {
    console.error('❌ Error verificando el modelo de usuario:', error);
  }
}

testUserModel();
