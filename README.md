# 🚀 Full-Stack Application with Docker

A complete containerized full-stack application featuring React frontend, Node.js backend, MongoDB database, and Redis cache.

## 🏗️ Architecture

- **Frontend**: React + Redux + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Redis + MongoDB integration  
- **Database**: MongoDB with authentication
- **Cache**: Redis with password protection
- **Deployment**: Docker containers with Docker Hub images

## 📦 Docker Hub Repository

All images are publicly available at: **https://hub.docker.com/repositories/gazal94**

- `gazal94/fullstack-frontend:latest` - React application (80.3MB)
- `gazal94/fullstack-backend:latest` - Node.js API server (263MB)
- `gazal94/mongo:7.0` - MongoDB with custom configuration
- `gazal94/redis:7-alpine` - Redis cache server (60.6MB)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 5000, 27017, 6379 available

### Deploy the Application

```bash
# Clone or download this repository
git clone <your-repo-url>
cd fullstack-app

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🛠️ Management Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs  
docker-compose logs backend
docker-compose logs frontend

# Stop services (keeps data)
docker-compose down

# Stop and remove all data
docker-compose down -v

# Update images
docker-compose pull && docker-compose up -d
```

## 🔍 API Endpoints

### Health & Monitoring
- `GET /health` - Application health check
- `GET /api/redis/ping` - Redis connection test
- `GET /api/redis/stats` - Redis server statistics

### User Management  
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Posts Management
- `GET /api/posts` - Get all posts  
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Cache Operations
- `GET /api/cache/keys` - List cache keys
- `GET /api/redis/keys` - Get Redis keys with pattern

## 🔐 Configuration

### Default Credentials (Development)
- **MongoDB**: `admin` / `password123`
- **Redis**: Password is `redis123`

### Environment Variables
You can customize the deployment by setting environment variables:

```bash
export MONGODB_PASSWORD=your-secure-password
export REDIS_PASSWORD=your-redis-password
docker-compose up -d
```

## 🌍 Production Deployment

For production deployment:

1. **Change default passwords** in environment variables
2. **Configure SSL/TLS termination** 
3. **Set up proper backup strategy**
4. **Configure monitoring and logging**
5. **Use environment-specific configurations**

## 🚨 Troubleshooting

### Port Conflicts
If ports are already in use, modify the port mappings in docker-compose.yml:
```yaml
ports:
  - "8080:3000"  # Frontend on port 8080
  - "8081:5000"  # Backend on port 8081
```

### Container Issues
```bash
# Restart specific service
docker-compose restart backend

# View container logs
docker-compose logs backend

# Reset everything
docker-compose down -v
docker system prune -a
docker-compose up -d
```

## 📊 Performance Monitoring

```bash
# Check resource usage
docker stats

# Check container health
docker-compose ps

# Monitor logs in real-time
docker-compose logs -f
```

## 🏗️ Development

### Local Development Setup
```bash
# Install dependencies
cd my-app && npm install
cd ../server && npm install

# Start in development mode
npm run dev
```

### Building Images Locally
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using Docker, React, Node.js, MongoDB, and Redis**

**Ready to deploy anywhere! 🌍**