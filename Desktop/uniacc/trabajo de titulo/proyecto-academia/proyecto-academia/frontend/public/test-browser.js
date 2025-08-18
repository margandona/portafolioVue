/**
 * Test simple para verificar la conexión frontend-backend
 */

// Simular una solicitud desde el frontend usando fetch
const testRegistrationFromBrowser = async () => {
  const testUser = {
    name: 'Usuario Frontend Test',
    email: `frontend.test.${Date.now()}@example.com`,
    password: 'Frontend123!@#',
    confirmPassword: 'Frontend123!@#',
    role: 'student'
  };

  console.log('🧪 Probando registro desde el frontend...');
  console.log('Usuario de prueba:', testUser);

  try {
    const response = await fetch('https://us-central1-academy-bd619.cloudfunctions.net/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8081'
      },
      body: JSON.stringify(testUser)
    });

    const result = await response.json();

    console.log('Status:', response.status);
    console.log('Respuesta:', result);

    if (response.status === 201) {
      console.log('✅ ¡Registro exitoso!');
      console.log('Usuario creado:', result.user);
      console.log('Token recibido:', result.token ? 'Sí' : 'No');
      
      // Probar login
      console.log('\n🔐 Probando login...');
      return await testLogin(testUser.email, testUser.password);
    } else {
      console.log('❌ Error en registro:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

const testLogin = async (email, password) => {
  try {
    const response = await fetch('https://us-central1-academy-bd619.cloudfunctions.net/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8081'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    console.log('Login Status:', response.status);
    console.log('Login Respuesta:', result);

    if (response.status === 200) {
      console.log('✅ ¡Login exitoso!');
      console.log('Usuario logueado:', result.user);
      return result;
    } else {
      console.log('❌ Error en login:', result.message);
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
  }
};

// Ejecutar si estamos en el navegador
if (typeof window !== 'undefined') {
  window.testFrontendBackend = testRegistrationFromBrowser;
  console.log('🌐 Test cargado. Ejecuta: testFrontendBackend()');
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testRegistrationFromBrowser, testLogin };
}
