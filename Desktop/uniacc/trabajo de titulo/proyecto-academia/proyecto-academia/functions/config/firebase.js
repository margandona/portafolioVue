const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Inicializar Firebase Admin SDK
let firebaseConfig = {};

// Para entornos de producción, Firebase Functions ya tiene las credenciales
// Para desarrollo local, usa el archivo de credenciales o variables de entorno
try {
  if (process.env.NODE_ENV === 'development' && process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Usar credenciales desde variables de entorno (preferido) o archivo local
    try {
      // Intentar usar JSON parseado de la variable de entorno
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      firebaseConfig = {
        credential: admin.credential.cert(serviceAccount),
      };
    } catch (e) {
      // Si falla el parsing, intentar cargar desde archivo
      console.log('Usando archivo de credenciales local');
      const serviceAccount = require('./academy.json');
      firebaseConfig = {
        credential: admin.credential.cert(serviceAccount),
      };
    }
  } else {
    // En entorno de Firebase Functions, no se requiere credencial explícita
    // Firebase Functions proporciona automáticamente las credenciales
  }

  admin.initializeApp(firebaseConfig);
  console.log('Firebase Admin inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar Firebase Admin:', error);
}

module.exports = admin;
