const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('./config/firebase'); // Import initialized admin from config/firebase.js

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Define routes
app.get('/hello', (req, res) => {
  res.status(200).send('Hello from Firebase!');
});

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const enrollmentRoutes = require('./routes/enrollment');
const evaluationRoutes = require('./routes/evaluation');
const responseRoutes = require('./routes/response');
const healthRoutes = require('./routes/health');
const protectedRoutes = require('./routes/protected');

// Rutas - CORREGIDO: Removiendo el prefijo '/api' duplicado
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/courses', courseRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use('/evaluations', evaluationRoutes);
app.use('/responses', responseRoutes);
app.use('/health', healthRoutes);
app.use('/protected', protectedRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.status(200).send('API funcionando correctamente');
});

// Exportar la aplicación como una función HTTP de Firebase
exports.api = functions.region('us-central1').https.onRequest(app);

// Local development only - use a different port than 8080 if needed
if (process.env.NODE_ENV === 'development') {
  const PORT = process.env.SERVER_PORT || 5003; // Using non-reserved variable name
  app.listen(PORT, () => console.log(`Local development server running on port ${PORT}`));
}

// You could also add a specific function just for the Moodle integration if needed
exports.moodleSync = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const moodleService = require('./services/moodleService');
  try {
    const courses = await moodleService.getCourses();
    console.log(`Successfully synced ${courses.length} courses from Moodle`);
    return null;
  } catch (error) {
    console.error('Error syncing courses from Moodle:', error);
    return null;
  }
});
