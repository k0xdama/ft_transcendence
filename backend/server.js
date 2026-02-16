const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5172;

// Middleware
app.use(express.json());  // Parse JSON bodies

// CORS handling - needed for frontend to connect
app.use(cors ({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

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

module.exports = app;
