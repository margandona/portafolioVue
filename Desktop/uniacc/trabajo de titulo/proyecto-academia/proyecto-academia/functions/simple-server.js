/**
 * Servidor simple para testing básico
 */
require('dotenv').config();
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  
  if (req.url === '/health') {
    res.end(JSON.stringify({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      transbank: !!process.env.TRANSBANK_COMMERCE_CODE
    }));
  } else {
    res.end(JSON.stringify({ message: 'Simple server running', url: req.url }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🧪 Simple test server running on http://localhost:${PORT}`);
  console.log(`🏦 Transbank configured: ${!!process.env.TRANSBANK_COMMERCE_CODE}`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

module.exports = server;
