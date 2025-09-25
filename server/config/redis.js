const { createClient } = require('redis');

// Redis client instance
let redisClient = null;

// Redis connection configuration
const connectRedis = async () => {
  try {
    // Redis connection options
    const redisOptions = {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      // Optional: Add authentication if needed
      // password: process.env.REDIS_PASSWORD,
      // database: process.env.REDIS_DB || 0,
    };

    // Create Redis client
    redisClient = createClient(redisOptions);

    // Error handling
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client connecting...');
    });

    redisClient.on('ready', () => {
      console.log('Redis Client connected and ready');
    });

    redisClient.on('end', () => {
      console.log('Redis Client connection ended');
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis Client reconnecting...');
    });

    // Connect to Redis
    await redisClient.connect();
    
    console.log('Redis Connected successfully');
    return redisClient;
  } catch (error) {
    console.error('Redis connection error:', error.message);
    // Don't exit process, let the app continue without Redis if needed
    return null;
  }
};

// Graceful close on app termination
process.on('SIGINT', async () => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log('Redis connection closed through app termination');
  }
  process.exit(0);
});

// Redis helper functions
const redisHelpers = {
  // Check if Redis is connected
  isConnected: () => {
    return redisClient && redisClient.isOpen;
  },

  // Get connection status
  getConnectionStatus: () => {
    if (!redisClient) return 'Not initialized';
    if (redisClient.isOpen) return 'Connected';
    return 'Disconnected';
  },

  // Get Redis client instance
  getClient: () => {
    return redisClient;
  },

  // Disconnect Redis
  disconnect: async () => {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      console.log('Redis disconnected');
    }
  },

  // Ping Redis to check connectivity
  ping: async () => {
    if (!redisClient || !redisClient.isOpen) {
      throw new Error('Redis client not connected');
    }
    return await redisClient.ping();
  }
};

module.exports = {
  connectRedis,
  isConnected: redisHelpers.isConnected,
  getConnectionStatus: redisHelpers.getConnectionStatus,
  getClient: redisHelpers.getClient,
  disconnect: redisHelpers.disconnect,
  ping: redisHelpers.ping
};