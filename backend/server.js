const express = require('express');
const app = express();
const PORT = 5172;

// Middleware
app.use(express.json());  // Parse JSON bodies

// CORS handling - needed for frontend to connect
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// Test route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});

module.exports = app;  // Export for testing with supertest
