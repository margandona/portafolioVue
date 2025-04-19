const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const enrollmentRoutes = require('./routes/enrollment');
const evaluationRoutes = require('./routes/evaluation');
const responseRoutes = require('./routes/response');
const healthRoutes = require('./routes/health');
const protectedRoutes = require('./routes/protected');

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
app.use('/api/health', healthRoutes);
app.use('/api/protected', protectedRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.status(200).send('API funcionando correctamente');
});

// Exportar la aplicación como una función HTTP de Firebase
exports.api = functions.region('us-central1').https.onRequest(app);
