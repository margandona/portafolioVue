const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const enrollmentRoutes = require('./routes/enrollment');
const evaluationRoutes = require('./routes/evaluation');
const responseRoutes = require('./routes/response');

// Inicializar Firebase Admin
admin.initializeApp();

// Inicializar Express
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/responses', responseRoutes);

// Ruta principal para verificar estado
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API funcionando correctamente' });
});

// Ruta para verificar conexión con Firebase
app.get('/api/firebase/check', (req, res) => {
  try {
    res.status(200).json({ message: `Firebase conectado: ${admin.app().name}` });
  } catch (error) {
    res.status(500).json({ error: 'Error de conexión con Firebase', details: error.message });
  }
});

// Middleware para manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

// Middleware global para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Error interno del servidor', details: err.message });
});

// Exportar la aplicación como una función HTTP de Firebase
exports.api = functions.https.onRequest(app);
