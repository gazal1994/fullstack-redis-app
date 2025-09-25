# Redis Integration Guide

## Overview
This application now includes Redis support for caching, session management, and data storage operations.

## Setup

### Local Redis Installation
1. **Windows**: Download and install Redis from the official website or use Windows Subsystem for Linux (WSL)
2. **macOS**: `brew install redis`
3. **Linux**: `sudo apt-get install redis-server` (Ubuntu/Debian)

### Starting Redis
- **Windows**: Run `redis-server.exe`
- **macOS/Linux**: `redis-server`
- **Docker**: `docker run -d -p 6379:6379 redis:alpine`

## Environment Variables

Add the following to your `.env` file:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379

# Optional Redis settings:
# REDIS_PASSWORD=your-password
# REDIS_DB=0
```

## API Endpoints

### Cache Operations
- `GET /api/cache` - Get cache statistics
- `GET /api/cache/:key` - Get cached value by key
- `POST /api/cache` - Set cache key-value pair
  ```json
  {
    "key": "my-key",
    "value": "my-value",
    "ttl": 3600
  }
  ```
- `DELETE /api/cache/:key` - Delete cached value

### Redis Management
- `GET /api/redis/ping` - Ping Redis server
- `GET /api/redis/keys?pattern=*` - Get all Redis keys (with optional pattern)
- `DELETE /api/redis/flush` - Clear all Redis data

## Usage Examples

### Basic Caching
```javascript
const redisService = require('./services/redis');

// Set a value with TTL
await redisService.set('user:123', userData, { ttl: 3600 });

// Get a value
const userData = await redisService.get('user:123');

// Delete a value
await redisService.del('user:123');
```

### Session Management
```javascript
// Set session data
await redisService.setSession('session-id', sessionData, 86400);

// Get session data
const sessionData = await redisService.getSession('session-id');

// Delete session
await redisService.deleteSession('session-id');
```

### Cache with Fallback
```javascript
const result = await redisService.cache('expensive-operation', async () => {
  // Expensive database query or API call
  return await performExpensiveOperation();
}, 3600); // Cache for 1 hour
```

## Features Included

### RedisService Methods
- **Basic Operations**: `set()`, `get()`, `del()`, `exists()`, `ttl()`, `expire()`
- **Hash Operations**: `hset()`, `hget()`, `hgetall()`, `hdel()`
- **List Operations**: `lpush()`, `rpush()`, `lpop()`, `rpop()`, `llen()`, `lrange()`
- **Set Operations**: `sadd()`, `srem()`, `smembers()`, `scard()`
- **Utility**: `keys()`, `flushall()`, `ping()`
- **Cache Helpers**: `cache()`, `setSession()`, `getSession()`, `deleteSession()`

### Health Check Integration
Redis status is included in the `/health` endpoint:
```json
{
  "status": "OK",
  "services": {
    "server": "Connected",
    "mongodb": {
      "status": "Connected",
      "connected": true
    },
    "redis": {
      "status": "Connected", 
      "connected": true
    }
  }
}
```

## Example: Cached Users Endpoint

The `/api/users` endpoint now includes Redis caching:
- First request hits MongoDB and caches the result
- Subsequent requests return cached data (faster response)
- Cache expires after 5 minutes
- Gracefully falls back to MongoDB if Redis is unavailable

## Error Handling

The Redis integration includes comprehensive error handling:
- Graceful degradation when Redis is unavailable
- Connection retry logic
- Proper cleanup on application shutdown
- Service availability checks before operations

## Best Practices

1. **TTL Management**: Always set appropriate TTL values for cached data
2. **Cache Invalidation**: Clear cache when underlying data changes
3. **Error Handling**: Always handle Redis unavailability gracefully
4. **Data Types**: Use appropriate Redis data types for different use cases
5. **Memory Management**: Monitor Redis memory usage in production

## Monitoring

Check Redis status:
- Health endpoint: `GET /health`
- Redis ping: `GET /api/redis/ping`
- Key count: `GET /api/cache`

## Production Considerations

1. Use Redis Cluster or Redis Sentinel for high availability
2. Configure appropriate memory policies
3. Monitor Redis metrics (memory, connections, operations)
4. Set up backup and persistence as needed
5. Use Redis AUTH for security
6. Configure SSL/TLS for encrypted connections