// Redis Usage Example
// This file demonstrates how Redis can be integrated into the application
// To enable Redis, uncomment the Redis connection in server/index.js

const express = require('express');
const router = express.Router();

// Example Redis usage for user caching
// Uncomment and use when Redis is enabled

/*
const { getRedisClient, redisUtils } = require('../config/redis');

// Cache user data for 1 hour
const cacheUser = async (userId, userData) => {
  const cacheKey = `user:${userId}`;
  await redisUtils.setKey(cacheKey, userData, 3600);
  console.log(`User ${userId} cached for 1 hour`);
};

// Get cached user data
const getCachedUser = async (userId) => {
  const cacheKey = `user:${userId}`;
  return await redisUtils.getKey(cacheKey);
};

// Example enhanced GET user by ID with Redis caching
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to get from cache first
    let user = await getCachedUser(id);
    
    if (user) {
      console.log(`User ${id} served from cache`);
      return res.json({
        success: true,
        message: 'User fetched from cache',
        data: user,
        source: 'cache'
      });
    }
    
    // If not in cache, get from database
    user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Cache the user data
    await cacheUser(id, user);
    
    res.json({
      success: true,
      message: 'User fetched from database',
      data: user,
      source: 'database'
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// Example session storage with Redis
const storeUserSession = async (userId, sessionData) => {
  const sessionKey = `session:${userId}`;
  await redisUtils.setWithTTL(sessionKey, sessionData, 24 * 60 * 60); // 24 hours
};

// Example rate limiting with Redis
const checkRateLimit = async (userId, limit = 100, windowSeconds = 3600) => {
  const key = `rate_limit:${userId}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;
  const client = getRedisClient();
  
  const count = await client.incr(key);
  if (count === 1) {
    await client.expire(key, windowSeconds);
  }
  
  return count <= limit;
};
*/

// Example usage instructions
const redisUsageExamples = {
  caching: {
    description: "Cache frequently accessed data to improve performance",
    example: "Cache user profiles, API responses, computed results"
  },
  sessions: {
    description: "Store user session data with automatic expiration",
    example: "User login state, shopping cart contents, temporary data"
  },
  rateLimit: {
    description: "Implement rate limiting for API endpoints",
    example: "Limit API calls per user per time window"
  },
  pubSub: {
    description: "Real-time messaging between different parts of the application",
    example: "Notifications, live updates, chat systems"
  },
  queues: {
    description: "Background job processing and task queues",
    example: "Email sending, image processing, data import/export"
  }
};

// Endpoint to show Redis integration examples
router.get('/redis-examples', (req, res) => {
  res.json({
    message: 'Redis Integration Examples',
    status: 'Redis container is running but not connected to application yet',
    howToEnable: [
      '1. Uncomment Redis import in server/index.js',
      '2. Uncomment Redis connection setup in startServer function',
      '3. Uncomment Redis health check in /health endpoint',
      '4. Use the example code in this file as reference'
    ],
    useCases: redisUsageExamples,
    redisConnection: {
      url: process.env.REDIS_URL || 'redis://:redis123@redis:6379',
      containerName: 'userdb-redis',
      status: 'Available but not connected'
    }
  });
});

module.exports = router;