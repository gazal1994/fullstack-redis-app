const { getClient, isConnected } = require('../config/redis');

class RedisService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  // Initialize Redis client
  init() {
    try {
      if (isConnected()) {
        this.client = getClient();
        this.initialized = true;
        return true;
      }
    } catch (error) {
      console.warn('Redis service initialization failed:', error.message);
      this.initialized = false;
      this.client = null;
    }
    return false;
  }

  // Check if Redis is available
  isAvailable() {
    // Try to initialize if not already done
    if (!this.initialized) {
      this.init();
    }
    return isConnected() && this.client && this.client.isOpen;
  }

  // Ensure client is available before operations
  ensureClient() {
    if (!this.isAvailable()) {
      throw new Error('Redis client not available');
    }
  }

  // Basic key-value operations
  async set(key, value, options = {}) {
    this.ensureClient();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (options.ttl) {
      return await this.client.setEx(key, options.ttl, stringValue);
    } else {
      return await this.client.set(key, stringValue);
    }
  }

  async get(key, parseJson = true) {
    this.ensureClient();
    const value = await this.client.get(key);
    
    if (value === null) return null;
    
    if (parseJson) {
      try {
        return JSON.parse(value);
      } catch (error) {
        return value; // Return as string if JSON parsing fails
      }
    }
    
    return value;
  }

  async del(key) {
    this.ensureClient();
    return await this.client.del(key);
  }

  async exists(key) {
    this.ensureClient();
    return await this.client.exists(key);
  }

  async ttl(key) {
    this.ensureClient();
    return await this.client.ttl(key);
  }

  async expire(key, seconds) {
    this.ensureClient();
    return await this.client.expire(key, seconds);
  }

  // Hash operations
  async hset(hash, field, value) {
    this.ensureClient();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return await this.client.hSet(hash, field, stringValue);
  }

  async hget(hash, field, parseJson = true) {
    this.ensureClient();
    const value = await this.client.hGet(hash, field);
    
    if (value === null) return null;
    
    if (parseJson) {
      try {
        return JSON.parse(value);
      } catch (error) {
        return value;
      }
    }
    
    return value;
  }

  async hgetall(hash, parseJson = true) {
    this.ensureClient();
    const hashData = await this.client.hGetAll(hash);
    
    if (parseJson) {
      const parsedData = {};
      for (const [field, value] of Object.entries(hashData)) {
        try {
          parsedData[field] = JSON.parse(value);
        } catch (error) {
          parsedData[field] = value;
        }
      }
      return parsedData;
    }
    
    return hashData;
  }

  async hdel(hash, field) {
    this.ensureClient();
    return await this.client.hDel(hash, field);
  }

  // List operations
  async lpush(key, value) {
    this.ensureClient();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return await this.client.lPush(key, stringValue);
  }

  async rpush(key, value) {
    this.ensureClient();
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return await this.client.rPush(key, stringValue);
  }

  async lpop(key, parseJson = true) {
    this.ensureClient();
    const value = await this.client.lPop(key);
    
    if (value === null) return null;
    
    if (parseJson) {
      try {
        return JSON.parse(value);
      } catch (error) {
        return value;
      }
    }
    
    return value;
  }

  async rpop(key, parseJson = true) {
    this.ensureClient();
    const value = await this.client.rPop(key);
    
    if (value === null) return null;
    
    if (parseJson) {
      try {
        return JSON.parse(value);
      } catch (error) {
        return value;
      }
    }
    
    return value;
  }

  async llen(key) {
    this.ensureClient();
    return await this.client.lLen(key);
  }

  async lrange(key, start, stop, parseJson = true) {
    this.ensureClient();
    const values = await this.client.lRange(key, start, stop);
    
    if (parseJson) {
      return values.map(value => {
        try {
          return JSON.parse(value);
        } catch (error) {
          return value;
        }
      });
    }
    
    return values;
  }

  // Set operations
  async sadd(key, member) {
    this.ensureClient();
    const stringMember = typeof member === 'string' ? member : JSON.stringify(member);
    return await this.client.sAdd(key, stringMember);
  }

  async srem(key, member) {
    this.ensureClient();
    const stringMember = typeof member === 'string' ? member : JSON.stringify(member);
    return await this.client.sRem(key, stringMember);
  }

  async smembers(key, parseJson = true) {
    this.ensureClient();
    const members = await this.client.sMembers(key);
    
    if (parseJson) {
      return members.map(member => {
        try {
          return JSON.parse(member);
        } catch (error) {
          return member;
        }
      });
    }
    
    return members;
  }

  async scard(key) {
    this.ensureClient();
    return await this.client.sCard(key);
  }

  // Utility functions
  async keys(pattern = '*') {
    this.ensureClient();
    return await this.client.keys(pattern);
  }

  async flushall() {
    this.ensureClient();
    return await this.client.flushAll();
  }

  async ping() {
    this.ensureClient();
    return await this.client.ping();
  }

  // Cache helper functions
  async cache(key, fetchFunction, ttl = 3600) {
    const cachedValue = await this.get(key);
    
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    const freshValue = await fetchFunction();
    await this.set(key, freshValue, { ttl });
    
    return freshValue;
  }

  // Session management helpers
  async setSession(sessionId, sessionData, ttl = 86400) {
    return await this.set(`session:${sessionId}`, sessionData, { ttl });
  }

  async getSession(sessionId) {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId) {
    return await this.del(`session:${sessionId}`);
  }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;