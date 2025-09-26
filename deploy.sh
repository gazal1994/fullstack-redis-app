#!/bin/bash

# User Management System Deployment Script for macOS/Linux
# Docker deployment that builds from current source code

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

print_header() {
    echo -e "${CYAN}"
    echo "=============================================="
    echo "User Management System Docker Deployment"
    echo "=============================================="
    echo -e "${NC}"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_header

# Check Docker
if ! command_exists docker; then
    print_error "Docker not found! Please install Docker"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    print_error "Docker not running! Please start Docker service"
    exit 1
fi

print_status "✅ Docker is running"

# Check Docker Compose
if ! command_exists docker-compose; then
    print_error "Docker Compose not found! Please install Docker Compose"
    exit 1
fi

# Stop and remove existing containers and images to ensure fresh build
print_info "Cleaning up old containers and images..."
docker-compose down --remove-orphans 2>/dev/null || true
docker system prune -f 2>/dev/null || true

# Create docker-compose.yml for building from source
print_info "Creating docker-compose configuration..."
cat > docker-compose.yml << 'EOF'
services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: userdb-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: myapp
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - user-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # Redis Cache
  redis:
    image: gazal94/redis:7-alpine
    container_name: userdb-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass redis123
    environment:
      REDIS_PASSWORD: redis123
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - user-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # Backend API (builds from current source)
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: userdb-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/myapp?authSource=admin
      REDIS_URL: redis://:redis123@redis:6379
    ports:
      - "5000:5000"
    networks:
      - user-network
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  # Frontend (builds from current source)
  frontend:
    build:
      context: ./my-app
      dockerfile: Dockerfile
    container_name: userdb-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    networks:
      - user-network
    depends_on:
      backend:
        condition: service_healthy

volumes:
  mongodb_data:
  redis_data:

networks:
  user-network:
    driver: bridge
EOF

print_status "✅ Created docker-compose.yml"

# Build and start services
print_info "Building and starting services..."
print_warning "This will build fresh images from your current code..."

# Force rebuild all images
docker-compose build --no-cache
if [ $? -ne 0 ]; then
    print_error "❌ Build failed!"
    exit 1
fi

# Start services
docker-compose up -d
if [ $? -ne 0 ]; then
    print_error "❌ Failed to start services!"
    exit 1
fi

# Wait for services to be ready
print_info "Waiting for services to start..."
sleep 15

# Check service status
echo ""
print_status "🎉 User Management System deployed with Docker!"
echo ""
echo -e "${YELLOW}Application URLs:${NC}"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000/api"
echo ""
echo -e "${YELLOW}Features:${NC}"
echo "  ✅ 5 User Operations: Get, Add, Update, Delete, Get by ID"
echo "  ✅ MongoDB Database + Redis Cache"
echo "  ✅ Built from current source code"
echo "  ✅ Docker containerized deployment"
echo ""
echo -e "${YELLOW}Container Status:${NC}"
docker-compose ps
echo ""
echo -e "${YELLOW}To stop:${NC}"
echo "  docker-compose down"
echo ""
echo -e "${YELLOW}To rebuild with code changes:${NC}"
echo "  docker-compose build --no-cache && docker-compose up -d"
echo ""
print_status "Deployment completed!"