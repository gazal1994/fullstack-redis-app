const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB, isConnected, getConnectionStatus } = require('./config/mongodb');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Environment variables with defaults
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/myapp?authSource=admin';

app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api', require('./routes/api'));

// Health check endpoint
app.get('/health', (req, res) => {
  const mongoStatus = getConnectionStatus();
  const isMongoConnected = isConnected();
  
  res.status(200).json({
    status: isMongoConnected ? 'OK' : 'Partial',
    timestamp: new Date().toISOString(),
    services: {
      server: 'Connected',
      mongodb: {
        status: mongoStatus,
        connected: isMongoConnected
      }
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to User Management Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB only
    const mongoConnection = await connectDB();
    
    if (mongoConnection) {
      console.log('✓ MongoDB connected successfully');
    } else {
      console.log('⚠ Server starting without MongoDB connection');
    }
    
    app.listen(PORT, () => {
      console.log(`✓ User Management Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API endpoints: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});