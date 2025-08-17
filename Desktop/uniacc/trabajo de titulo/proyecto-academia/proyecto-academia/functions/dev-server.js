/**
 * Servidor de desarrollo para probar APIs de pago
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');

console.log('🔍 Starting server setup...');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check (simple version first)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    transbank: {
      configured: !!process.env.TRANSBANK_COMMERCE_CODE,
      environment: process.env.TRANSBANK_INTEGRATION_TYPE || 'TEST'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Payment API Server',
    endpoints: [
      'GET /health',
      'GET /api/payments/methods'
    ]
  });
});

console.log('🔍 Setting up routes...');

try {
  // Import routes with error handling
  const paymentsRouter = require('./routes/payments');
  app.use('/api/payments', paymentsRouter);
  console.log('✅ Payment routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading payment routes:', error.message);
  
  // Create a basic payments route as fallback
  app.get('/api/payments/methods', (req, res) => {
    res.json({
      success: true,
      message: 'Fallback route - payment routes failed to load',
      error: error.message
    });
  });
}

// Error handling
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

console.log('🔍 Starting server...');
app.listen(PORT, () => {
  console.log(`🚀 Payment API Server running on http://localhost:${PORT}`);
  console.log(`🏦 Transbank configured: ${!!process.env.TRANSBANK_COMMERCE_CODE}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/api/payments/methods`);
});

module.exports = app;
