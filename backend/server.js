const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url} - server.js:13`);
  next();
});

// Test database connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully. - server.js:21');
    
    // Sync database
    await sequelize.sync();
    console.log('✅ Database synced successfully. - server.js:25');
  } catch (error) {
    console.error('❌ Unable to connect to the database: - server.js:27', error.message);
  }
}

// Import routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const commentRoutes = require('./routes/comments');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error: - server.js:52', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT} - server.js:73`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'} - server.js:74`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health - server.js:75`);
  });
}

startServer();

module.exports = app;