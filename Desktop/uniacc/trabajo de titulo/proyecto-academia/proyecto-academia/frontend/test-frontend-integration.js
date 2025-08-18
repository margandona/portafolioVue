/**
 * Script para probar la integración frontend-backend
 */

const puppeteer = require('puppeteer');

// Datos de prueba
const testUsers = [
  {
    name: 'Estudiante Frontend',
    email: `estudiante.frontend.${Date.now()}@test.com`,
    password: 'Frontend123!@#',
    confirmPassword: 'Frontend123!@#',
    phone: '+56912345678',
    role: 'student'
  },
  {
    name: 'Profesor Frontend',
    email: `profesor.frontend.${Date.now()}@test.com`,
    password: 'Frontend456!@#',
    confirmPassword: 'Frontend456!@#',
    phone: '+56987654321',
    role: 'teacher'
  }
];

async function testFrontendRegistration() {
  console.log('🌐 === PRUEBAS DE INTEGRACIÓN FRONTEND-BACKEND ===');
  console.log('');

  const browser = await puppeteer.launch({ 
    headless: false, // Mostrar el navegador
    slowMo: 50 // Ralentizar las acciones para poder verlas
  });
  
  try {
    const page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Ir a la página de registro
    console.log('📱 Navegando a la página de registro...');
    await page.goto('http://localhost:8080/register', { waitUntil: 'networkidle2' });
    
    for (const user of testUsers) {
      console.log(`📝 Probando registro: ${user.name} (${user.role})`);
      
      try {
        // Llenar el formulario
        await page.type('input[name="name"]', user.name);
        await page.type('input[name="email"]', user.email);
        await page.type('input[name="password"]', user.password);
        await page.type('input[name="confirmPassword"]', user.confirmPassword);
        
        if (user.phone) {
          await page.type('input[name="phone"]', user.phone);
        }
        
        // Seleccionar rol si existe el selector
        if (user.role !== 'student') {
          try {
            await page.select('select[name="role"]', user.role);
          } catch (e) {
            console.log('   ⚠️ Selector de rol no encontrado, usando valor por defecto');
          }
        }
        
        // Enviar formulario
        await page.click('button[type="submit"]');
        
        // Esperar respuesta
        await page.waitForTimeout(3000);
        
        // Verificar si hay errores en la consola
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));
        
        // Verificar si fue exitoso
        const currentUrl = page.url();
        if (currentUrl.includes('/dashboard') || currentUrl.includes('/login')) {
          console.log('   ✅ Registro exitoso - Redirigido a dashboard/login');
        } else {
          console.log('   ❌ Posible error en el registro');
        }
        
        // Limpiar formulario para el siguiente usuario
        await page.goto('http://localhost:8080/register', { waitUntil: 'networkidle2' });
        
      } catch (error) {
        console.log(`   ❌ Error durante el registro: ${error.message}`);
      }
      
      await page.waitForTimeout(2000);
    }
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  } finally {
    await browser.close();
  }
}

// Función alternativa sin Puppeteer (usando solo fetch)
async function testFrontendAPIConnection() {
  console.log('🔗 === PRUEBA DE CONEXIÓN API DESDE FRONTEND ===');
  console.log('');
  
  // Simular una solicitud desde el frontend
  const testData = {
    name: 'Test Connection',
    email: `connection.test.${Date.now()}@example.com`,
    password: 'TestConnection123!@#',
    confirmPassword: 'TestConnection123!@#',
    role: 'student'
  };
  
  try {
    console.log('📡 Probando conexión directa a la API...');
    
    const response = await fetch('https://us-central1-academy-bd619.cloudfunctions.net/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    console.log(`📡 Status: ${response.status}`);
    console.log('📄 Respuesta:', JSON.stringify(result, null, 2));
    
    if (response.status === 201) {
      console.log('✅ Conexión exitosa desde frontend simulado');
      console.log(`🆔 Usuario creado: ${result.user?.name} (${result.user?.role})`);
    } else {
      console.log('❌ Error en la conexión');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

// Ejecutar pruebas
if (require.main === module) {
  // Primero probar la conexión API
  testFrontendAPIConnection().then(() => {
    console.log('');
    console.log('💡 Para probar con navegador, instala Puppeteer:');
    console.log('   npm install puppeteer');
    console.log('');
    console.log('🎯 Ahora puedes probar manualmente en: http://localhost:8080/register');
  });
}

module.exports = {
  testFrontendRegistration,
  testFrontendAPIConnection,
  testUsers
};
