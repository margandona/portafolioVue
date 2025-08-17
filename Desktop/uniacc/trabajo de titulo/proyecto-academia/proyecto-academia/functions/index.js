const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('./config/firebase');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Configure CORS with specific allowed origins
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'https://www.arventis.cl',
  'https://arventis.cl',
  'https://www.neekworld.cl',
  'https://neekworld.cl',
  'https://academy-bd619.web.app',
  'https://academy-bd619.firebaseapp.com'
];

// CORS middleware with configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked request from:', origin);
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));

// JSON middleware
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const enrollmentRoutes = require('./routes/enrollment');
const evaluationRoutes = require('./routes/evaluation');
const responseRoutes = require('./routes/response');
const healthRoutes = require('./routes/health');
const protectedRoutes = require('./routes/protected');
const contactMessageRoutes = require('./routes/contactMessage');
const salesRoutes = require('./routes/sales');
const campaignRoutes = require('./routes/campaign');
const moodleRoutes = require('./routes/moodle');
const paymentsRoutes = require('./routes/payments');

// Define a base route
app.get('/', (req, res) => {
  res.status(200).send('API funcionando correctamente');
});

// Define simple test route
app.get('/hello', (req, res) => {
  res.status(200).send('Hello from Firebase!');
});

// Register routes with /api prefix to match Thunder Client tests
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/courses', courseRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use('/evaluations', evaluationRoutes);
app.use('/responses', responseRoutes);
app.use('/health', healthRoutes);
app.use('/protected', protectedRoutes);
app.use('/contact', contactMessageRoutes);
app.use('/sales', salesRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/moodle', moodleRoutes);
app.use('/api/payments', paymentsRoutes);

// Modified server startup with better port handling
const DEFAULT_PORT = 5006;
const startServer = (port = DEFAULT_PORT) => {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`API endpoints available at http://localhost:${port}/api`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is busy, trying port ${port + 1}`);
      // Try the next port
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
  
  return server;
};

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('Shutting down server gracefully...');
  server && server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server with port fallback capability when running locally
if (!process.env.FUNCTIONS_EMULATOR && !process.env.FUNCTION_NAME) {
  const server = startServer();
}

// Export the Express API for Firebase Functions
exports.api = functions.https.onRequest(app);

// Función programada para sincronizar con Moodle cada 24 horas
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
