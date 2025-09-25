const express = require('express');
const router = express.Router();
const { User, Post } = require('../models');
const redisService = require('../services/redis');

// GET /api - API info
router.get('/', (req, res) => {
  res.json({
    message: 'My App API with MongoDB and Redis',
    version: '1.0.0',
    endpoints: {
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get user by ID',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user'
      },
      posts: {
        'GET /api/posts': 'Get all published posts',
        'GET /api/posts/:id': 'Get post by ID',
        'POST /api/posts': 'Create new post'
      },
      cache: {
        'GET /api/cache/:key': 'Get cached value by key',
        'POST /api/cache': 'Set cache key-value pair',
        'DELETE /api/cache/:key': 'Delete cached value',
        'GET /api/cache': 'Get cache statistics'
      },
      redis: {
        'GET /api/redis/ping': 'Ping Redis server',
        'GET /api/redis/keys': 'Get all Redis keys',
        'DELETE /api/redis/flush': 'Clear all Redis data'
      },
      ping: 'GET /api/ping'
    }
  });
});

// Simple ping endpoint
router.get('/ping', (req, res) => {
  res.json({
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// Example users endpoint (using MongoDB with Redis caching)
router.get('/users', async (req, res) => {
  try {
    const cacheKey = 'users:all';
    
    // Try to get from Redis cache first
    if (redisService.isAvailable()) {
      try {
        const cachedUsers = await redisService.get(cacheKey);
        if (cachedUsers) {
          return res.json({
            message: 'Users retrieved successfully (from cache)',
            count: cachedUsers.length,
            data: cachedUsers,
            cached: true,
            timestamp: new Date().toISOString()
          });
        }
      } catch (cacheError) {
        console.warn('Cache retrieval failed, falling back to database:', cacheError.message);
      }
    }
    
    // Get from MongoDB if not in cache
    const users = await User.findActiveUsers().select('-__v');
    
    // Cache the result for future requests (5 minutes TTL)
    if (redisService.isAvailable()) {
      try {
        await redisService.set(cacheKey, users, { ttl: 300 });
      } catch (cacheError) {
        console.warn('Failed to cache users data:', cacheError.message);
      }
    }
    
    res.json({
      message: 'Users retrieved successfully',
      count: users.length,
      data: users,
      cached: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Users GET error:', error);
    res.status(500).json({
      message: 'Error retrieving users',
      error: error.message
    });
  }
});

// Create a new user (with MongoDB validation)
router.post('/users', async (req, res) => {
  try {
    const { name, email, age, profile } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists',
        email
      });
    }
    
    // Create new user
    const newUser = new User({
      name,
      email,
      age,
      profile
    });
    
    const savedUser = await newUser.save();
    
    res.status(201).json({
      message: 'User created successfully',
      data: savedUser.getFullProfile(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Users POST error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      message: 'Error creating user',
      error: error.message
    });
  }
});

// Get a specific user by ID (with MongoDB)
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid user ID format'
      });
    }
    
    const user = await User.findById(id).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        id
      });
    }
    
    res.json({
      message: 'User retrieved successfully',
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('User GET error:', error);
    res.status(500).json({
      message: 'Error retrieving user',
      error: error.message
    });
  }
});

// Update user by ID
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid user ID format'
      });
    }
    
    // Don't allow email updates to prevent conflicts (you can modify this logic)
    delete updates.email;
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found',
        id
      });
    }
    
    res.json({
      message: 'User updated successfully',
      data: updatedUser,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('User PUT error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      message: 'Error updating user',
      error: error.message
    });
  }
});

// Delete user by ID
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid user ID format'
      });
    }
    
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({
        message: 'User not found',
        id
      });
    }
    
    res.json({
      message: 'User deleted successfully',
      data: { id, name: deletedUser.name },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('User DELETE error:', error);
    res.status(500).json({
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// Get all published posts
router.get('/posts', async (req, res) => {
  try {
    const { category, author } = req.query;
    let query = Post.findPublished();
    
    if (category) {
      query = Post.findByCategory(category);
    }
    
    if (author) {
      query = Post.findByAuthor(author);
    }
    
    const posts = await query.select('-__v');
    
    res.json({
      message: 'Posts retrieved successfully',
      count: posts.length,
      data: posts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Posts GET error:', error);
    res.status(500).json({
      message: 'Error retrieving posts',
      error: error.message
    });
  }
});

// Create a new post
router.post('/posts', async (req, res) => {
  try {
    const { title, content, author, tags, category } = req.body;
    
    // Validate required fields
    if (!title || !content || !author) {
      return res.status(400).json({
        message: 'Title, content, and author are required',
        required: ['title', 'content', 'author']
      });
    }
    
    // Verify author exists
    const authorExists = await User.findById(author);
    if (!authorExists) {
      return res.status(400).json({
        message: 'Author not found',
        author
      });
    }
    
    const newPost = new Post({
      title,
      content,
      author,
      tags,
      category
    });
    
    const savedPost = await newPost.save();
    await savedPost.populate('author', 'name email');
    
    res.status(201).json({
      message: 'Post created successfully',
      data: savedPost,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Posts POST error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      message: 'Error creating post',
      error: error.message
    });
  }
});

// ===============================
// REDIS ENDPOINTS
// ===============================

// Redis ping endpoint
router.get('/redis/ping', async (req, res) => {
  try {
    if (!redisService.isAvailable()) {
      return res.status(503).json({
        message: 'Redis service is not available',
        available: false,
        timestamp: new Date().toISOString()
      });
    }

    const pong = await redisService.ping();
    res.json({
      message: 'Redis ping successful',
      response: pong,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Redis ping error:', error);
    res.status(500).json({
      message: 'Redis ping failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all Redis keys
router.get('/redis/keys', async (req, res) => {
  try {
    if (!redisService.isAvailable()) {
      return res.status(503).json({
        message: 'Redis service is not available',
        timestamp: new Date().toISOString()
      });
    }

    const pattern = req.query.pattern || '*';
    const keys = await redisService.keys(pattern);
    
    res.json({
      message: 'Redis keys retrieved successfully',
      pattern,
      count: keys.length,
      keys,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Redis keys error:', error);
    res.status(500).json({
      message: 'Error retrieving Redis keys',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Clear all Redis data
router.delete('/redis/flush', async (req, res) => {
  try {
    if (!redisService.isAvailable()) {
      return res.status(503).json({
        message: 'Redis service is not available',
        timestamp: new Date().toISOString()
      });
    }

    await redisService.flushall();
    
    res.json({
      message: 'All Redis data cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Redis flush error:', error);
    res.status(500).json({
      message: 'Error clearing Redis data',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ===============================
// CACHE ENDPOINTS
// ===============================

// Get cache statistics
router.get('/cache', async (req, res) => {
  try {
    if (!redisService.isAvailable()) {
      return res.status(503).json({
        message: 'Redis service is not available',
        timestamp: new Date().toISOString()
      });
    }

    const keys = await redisService.keys('*');
    
    res.json({
      message: 'Cache statistics retrieved successfully',
      totalKeys: keys.length,
      available: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache statistics error:', error);
    res.status(500).json({
      message: 'Error retrieving cache statistics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get cached value by key
router.get('/cache/:key', async (req, res) => {
  try {
    if (!redisService.isAvailable()) {
      return res.status(503).json({
        message: 'Redis service is not available',
        timestamp: new Date().toISOString()
      });
    }

    const { key } = req.params;
    const value = await redisService.get(key);
    
    if (value === null) {
      return res.status(404).json({
        message: 'Cache key not found',
        key,
        timestamp: new Date().toISOString()
      });
    }
    
    const ttl = await redisService.ttl(key);
    
    res.json({
      message: 'Cache value retrieved successfully',
      key,
      value,
      ttl: ttl > 0 ? ttl : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache get error:', error);
    res.status(500).json({
      message: 'Error retrieving cache value',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Set cache key-value pair
router.post('/cache', async (req, res) => {
  try {
    if (!redisService.isAvailable()) {
      return res.status(503).json({
        message: 'Redis service is not available',
        timestamp: new Date().toISOString()
      });
    }

    const { key, value, ttl } = req.body;
    
    if (!key) {
      return res.status(400).json({
        message: 'Key is required',
        timestamp: new Date().toISOString()
      });
    }
    
    if (value === undefined) {
      return res.status(400).json({
        message: 'Value is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const options = ttl ? { ttl: parseInt(ttl) } : {};
    await redisService.set(key, value, options);
    
    res.status(201).json({
      message: 'Cache value set successfully',
      key,
      value,
      ttl: ttl || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache set error:', error);
    res.status(500).json({
      message: 'Error setting cache value',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Delete cached value
router.delete('/cache/:key', async (req, res) => {
  try {
    if (!redisService.isAvailable()) {
      return res.status(503).json({
        message: 'Redis service is not available',
        timestamp: new Date().toISOString()
      });
    }

    const { key } = req.params;
    const deleted = await redisService.del(key);
    
    if (deleted === 0) {
      return res.status(404).json({
        message: 'Cache key not found',
        key,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      message: 'Cache value deleted successfully',
      key,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache delete error:', error);
    res.status(500).json({
      message: 'Error deleting cache value',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;