# PowerShell Deployment Script for User Management System
# Docker deployment that builds from current source code

Write-Host "Deploying User Management System with Docker..." -ForegroundColor Blue

# Check Docker
try {
    docker info >$null 2>&1
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not running! Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Stop and remove existing containers and images to ensure fresh build
Write-Host "Cleaning up old containers and images..." -ForegroundColor Yellow
docker-compose down --remove-orphans 2>$null
docker system prune -f 2>$null

# Create docker-compose.yml for building from source
Write-Host "Creating docker-compose configuration..." -ForegroundColor Cyan
$dockerCompose = @"
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
"@

# Write docker-compose file
$dockerCompose | Out-File -FilePath "docker-compose.yml" -Encoding UTF8
Write-Host "✅ Created docker-compose.yml" -ForegroundColor Green

# Build and start services
Write-Host "Building and starting services..." -ForegroundColor Blue
Write-Host "This will build fresh images from your current code..." -ForegroundColor Yellow

# Force rebuild all images
docker-compose build --no-cache
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Start services
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start services!" -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check service status
Write-Host ""
Write-Host "🎉 User Management System deployed with Docker!" -ForegroundColor Green
Write-Host ""
Write-Host "Application URLs:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend API: http://localhost:5000/api" -ForegroundColor White
Write-Host ""
Write-Host "Features:" -ForegroundColor Yellow
Write-Host "  ✅ 5 User Operations: Get, Add, Update, Delete, Get by ID" -ForegroundColor White
Write-Host "  ✅ MongoDB Database + Redis Cache" -ForegroundColor White
Write-Host "  ✅ Built from current source code" -ForegroundColor White
Write-Host "  ✅ Docker containerized deployment" -ForegroundColor White
Write-Host ""
Write-Host "Container Status:" -ForegroundColor Yellow
docker-compose ps
Write-Host ""
Write-Host "To stop:" -ForegroundColor Yellow
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host ""
Write-Host "To rebuild with code changes:" -ForegroundColor Yellow
Write-Host "  docker-compose build --no-cache && docker-compose up -d" -ForegroundColor White

# Open browser
Write-Host "Opening browser..." -ForegroundColor Blue
Start-Process "http://localhost:3000"
Write-Host "To check status:" -ForegroundColor Yellow
Write-Host "  Get-Job" -ForegroundColor White