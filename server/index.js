const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB, isConnected, getConnectionStatus } = require('./config/mongodb');
const { connectRedis, isConnected: isRedisConnected, getConnectionStatus: getRedisConnectionStatus } = require('./config/redis');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Environment variables with defaults
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

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
  const redisStatus = getRedisConnectionStatus();
  const isRedisConnectedStatus = isRedisConnected();
  
  const allServicesConnected = isMongoConnected && isRedisConnectedStatus;
  
  res.status(200).json({
    status: allServicesConnected ? 'OK' : 'Partial',
    timestamp: new Date().toISOString(),
    services: {
      server: 'Connected',
      mongodb: {
        status: mongoStatus,
        connected: isMongoConnected
      },
      redis: {
        status: redisStatus,
        connected: isRedisConnectedStatus
      }
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to My App Server',
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
    // Connect to MongoDB
    const mongoConnection = await connectDB();
    
    if (mongoConnection) {
      console.log('✓ MongoDB connected successfully');
    } else {
      console.log('⚠ Server starting without MongoDB connection');
    }
    
    // Connect to Redis
    const redisConnection = await connectRedis();
    
    if (redisConnection) {
      console.log('✓ Redis connected successfully');
    } else {
      console.log('⚠ Server starting without Redis connection');
    }
    
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
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