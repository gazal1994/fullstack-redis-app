# 🍎 macOS/Linux Deployment Guide

Complete deployment guide for running the full-stack application on macOS and Linux systems.

## 🚀 Quick Start (One Command)

### Remote Installation
```bash
curl -fsSL https://raw.githubusercontent.com/gazal1994/fullstack-redis-app/main/install.sh | bash
```

This command will:
1. Download the installation script
2. Clone the repository to `~/fullstack-app`
3. Run the deployment automatically
4. Open the application in your default browser

## 📋 Prerequisites

### Required Software
- **Docker Desktop**: Download from [docker.com](https://www.docker.com/products/docker-desktop)
- **Git**: Usually pre-installed, or install via `xcode-select --install`
- **Bash**: Pre-installed on macOS/Linux

### System Requirements
- macOS 10.15+ or Linux with Docker support
- 4GB RAM minimum (8GB recommended)
- 5GB free disk space
- Internet connection for Docker image downloads

### Port Requirements
The following ports must be available:
- `3000` - Frontend React application
- `5000` - Backend Node.js API
- `27017` - MongoDB database
- `6379` - Redis cache

## 📦 Manual Deployment

### Method 1: Using the Deployment Script
```bash
# Clone the repository
git clone https://github.com/gazal1994/fullstack-redis-app.git
cd fullstack-redis-app

# Make script executable and run
chmod +x deploy.sh
./deploy.sh
```

### Method 2: Direct Docker Compose
```bash
# Clone the repository
git clone https://github.com/gazal1994/fullstack-redis-app.git
cd fullstack-redis-app

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

## 🛠️ Management Commands

### Service Management
```bash
# View all service status
docker-compose ps

# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb
docker-compose logs redis

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend

# Stop all services (keeps data)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### Docker Image Management
```bash
# Update all images to latest versions
docker-compose pull

# Update and restart services
docker-compose pull && docker-compose up -d

# View downloaded images
docker images | grep gazal94
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Docker Not Running
```bash
# Check if Docker is running
docker info

# If not running, start Docker Desktop
open -a Docker
```

#### 2. Port Conflicts
```bash
# Check what's using a port (example: port 3000)
lsof -i :3000

# Kill process using port
kill -9 $(lsof -t -i:3000)
```

#### 3. Permission Issues
```bash
# Make scripts executable
chmod +x *.sh

# Fix Docker permissions (if needed)
sudo chown -R $USER:$USER ~/.docker
```

#### 4. Network Issues
```bash
# Reset Docker network
docker network prune -f

# Restart Docker completely
killall Docker && open -a Docker
```

### Health Checks
```bash
# Check application health
curl http://localhost:5000/health

# Check Redis connection
curl http://localhost:5000/api/redis/ping

# Check MongoDB connection (through API)
curl http://localhost:5000/api/users
```

## 🌐 Application URLs

After successful deployment, access your application at:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health
- **Redis Stats**: http://localhost:5000/api/redis/stats

## 📊 Service Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Node.js API   │
│   (Port 3000)   │────│   (Port 5000)   │
└─────────────────┘    └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌─────────────┐    ┌─────────────┐
            │  MongoDB    │    │   Redis     │
            │ (Port 27017)│    │ (Port 6379) │
            └─────────────┘    └─────────────┘
```

## 🔐 Default Credentials

### MongoDB
- Username: `admin`
- Password: `password123`
- Database: `fullstackdb`

### Redis
- Password: `redis123`

## 📱 Features Available

- ✅ User management (Create, Read, Update, Delete)
- ✅ Post management with MongoDB storage
- ✅ Redis caching for improved performance  
- ✅ Real-time API responses
- ✅ Responsive React frontend with Redux state management
- ✅ Health monitoring and status checks
- ✅ Automatic data persistence
- ✅ Container orchestration with Docker Compose

## 🚀 Development

### Local Development Setup
```bash
# For frontend development
cd my-app
npm install
npm run dev

# For backend development  
cd server
npm install
npm run dev
```

### Building Custom Images
```bash
# Build frontend image
cd my-app
docker build -t my-frontend .

# Build backend image
cd server
docker build -t my-backend .
```

## 🆘 Getting Help

If you encounter issues:

1. Check the [main README](README.md) for general information
2. Review Docker logs: `docker-compose logs -f`
3. Ensure all prerequisites are installed
4. Verify ports are not in use by other applications
5. Check Docker Desktop is running and has sufficient resources

## 🎯 Next Steps

After successful deployment:

1. Visit http://localhost:3000 to explore the application
2. Test the API endpoints at http://localhost:5000
3. Check the health status at http://localhost:5000/health
4. Explore the caching features by creating and retrieving data
5. Monitor performance through the Redux DevTools (if installed)

Your full-stack application is now ready for development and testing!