require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from local development origins and file:// during local testing
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth', require('./api/auth/auth'));
app.use('/api/rooms', require('./api/rooms/rooms'));
app.use('/api/bookings', require('./api/bookings/bookings'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  Dred's Transient House API Server      ║
║  Running on: http://localhost:${PORT}     ║
║  Environment: ${process.env.NODE_ENV || 'development'}           ║
╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
