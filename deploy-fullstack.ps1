# 🚀 Full-Stack Application Auto-Deploy Script
# This script downloads and runs the complete application from Docker Hub
# Author: gazal94
# Repository: https://hub.docker.com/repositories/gazal94

param(
    [string]$AppName = "fullstack-app",
    [string]$Port = "3000",
    [switch]$SkipChecks,
    [switch]$Cleanup,
    [switch]$Help
)

# Colors for output
$Green = "Green"
$Red = "Red" 
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# Function to display help
function Show-Help {
    Write-Host "🚀 Full-Stack Application Deployment Script" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor $Green
    Write-Host "  .\deploy-fullstack.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor $Green
    Write-Host "  -AppName <name>    Set application name (default: fullstack-app)"
    Write-Host "  -Port <port>       Set frontend port (default: 3000)"
    Write-Host "  -SkipChecks        Skip prerequisite checks"
    Write-Host "  -Cleanup           Remove existing containers and start fresh"
    Write-Host "  -Help              Show this help message"
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor $Yellow
    Write-Host "  .\deploy-fullstack.ps1"
    Write-Host "  .\deploy-fullstack.ps1 -AppName myapp -Port 8080"
    Write-Host "  .\deploy-fullstack.ps1 -Cleanup"
    exit 0
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor $Blue
    
    # Check Docker
    try {
        $dockerVersion = docker --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor $Green
        } else {
            throw "Docker not found"
        }
    }
    catch {
        Write-Host "❌ Docker is not installed or not running!" -ForegroundColor $Red
        Write-Host "Please install Docker Desktop and make sure it's running." -ForegroundColor $Yellow
        exit 1
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor $Green
        } else {
            throw "Docker Compose not found"
        }
    }
    catch {
        Write-Host "❌ Docker Compose is not available!" -ForegroundColor $Red
        Write-Host "Please install Docker Compose or update Docker Desktop." -ForegroundColor $Yellow
        exit 1
    }
    
    # Check if Docker daemon is running
    try {
        docker info >$null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker daemon is running" -ForegroundColor $Green
        } else {
            throw "Docker daemon not running"
        }
    }
    catch {
        Write-Host "❌ Docker daemon is not running!" -ForegroundColor $Red
        Write-Host "Please start Docker Desktop." -ForegroundColor $Yellow
        exit 1
    }
    
    Write-Host ""
}

# Function to check port availability
function Test-PortAvailability {
    param([int]$Port)
    
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "⚠️  Port $Port is already in use!" -ForegroundColor $Yellow
        Write-Host "The application will attempt to use port $Port." -ForegroundColor $Yellow
        Write-Host "You may need to stop other services or change the port." -ForegroundColor $Yellow
    } else {
        Write-Host "✅ Port $Port is available" -ForegroundColor $Green
    }
}

# Function to create docker-compose.yml
function New-DockerComposeFile {
    $composeContent = @"
# 🐳 Full-Stack Application
# Frontend: React + Redux + TypeScript  
# Backend: Node.js + Express + Redis + MongoDB
# All images available on Docker Hub: https://hub.docker.com/repositories/gazal94

services:
  # MongoDB Database
  mongodb:
    image: gazal94/mongo:7.0
    container_name: fullstack-mongodb
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
      - fullstack-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  # Redis Cache
  redis:
    image: gazal94/redis:7-alpine
    container_name: fullstack-redis
    restart: unless-stopped
    command: redis-server --requirepass redis123 --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - fullstack-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API Server
  backend:
    image: gazal94/fullstack-backend:latest
    container_name: fullstack-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/myapp?authSource=admin
      REDIS_URL: redis://:redis123@redis:6379
    ports:
      - "5000:5000"
    networks:
      - fullstack-network
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  # Frontend React Application
  frontend:
    image: gazal94/fullstack-frontend:latest
    container_name: fullstack-frontend
    restart: unless-stopped
    ports:
      - "${Port}:3000"
    networks:
      - fullstack-network
    depends_on:
      backend:
        condition: service_healthy

# Persistent Data Storage
volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local

# Internal Network
networks:
  fullstack-network:
    driver: bridge
"@

    $composeContent | Out-File -FilePath "docker-compose.yml" -Encoding UTF8
    Write-Host "✅ Docker Compose file created" -ForegroundColor $Green
}

# Function to cleanup existing containers
function Invoke-Cleanup {
    Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor $Blue
    
    # Stop and remove containers
    docker-compose down -v 2>$null
    
    # Remove specific containers if they exist
    $containers = @("fullstack-mongodb", "fullstack-redis", "fullstack-backend", "fullstack-frontend")
    foreach ($container in $containers) {
        docker stop $container 2>$null
        docker rm $container 2>$null
    }
    
    Write-Host "✅ Cleanup completed" -ForegroundColor $Green
}

# Function to pull Docker images
function Get-DockerImages {
    Write-Host "📥 Pulling Docker images from Docker Hub..." -ForegroundColor $Blue
    
    $images = @(
        "gazal94/mongo:7.0",
        "gazal94/redis:7-alpine", 
        "gazal94/fullstack-backend:latest",
        "gazal94/fullstack-frontend:latest"
    )
    
    foreach ($image in $images) {
        Write-Host "Pulling $image..." -ForegroundColor $Cyan
        docker pull $image
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully pulled $image" -ForegroundColor $Green
        } else {
            Write-Host "❌ Failed to pull $image" -ForegroundColor $Red
            exit 1
        }
    }
    
    Write-Host ""
}

# Function to start the application
function Start-Application {
    Write-Host "🚀 Starting the application..." -ForegroundColor $Blue
    
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Application started successfully!" -ForegroundColor $Green
    } else {
        Write-Host "❌ Failed to start application!" -ForegroundColor $Red
        Write-Host "Check the logs with: docker-compose logs" -ForegroundColor $Yellow
        exit 1
    }
    
    # Wait a moment for services to initialize
    Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor $Blue
    Start-Sleep -Seconds 15
}

# Function to check application health
function Test-ApplicationHealth {
    Write-Host "🔍 Checking application health..." -ForegroundColor $Blue
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend is healthy and responding" -ForegroundColor $Green
            
            # Parse the JSON response to check services
            $healthData = $response.Content | ConvertFrom-Json
            Write-Host "📊 Service Status:" -ForegroundColor $Blue
            Write-Host "   - Server: $($healthData.services.server)" -ForegroundColor $Green
            Write-Host "   - MongoDB: $($healthData.services.mongodb.status)" -ForegroundColor $Green
            Write-Host "   - Redis: $($healthData.services.redis.status)" -ForegroundColor $Green
        }
    }
    catch {
        Write-Host "⚠️  Backend health check failed, but containers may still be starting..." -ForegroundColor $Yellow
    }
}

# Function to show application info
function Show-ApplicationInfo {
    Write-Host ""
    Write-Host "🎉 Deployment Complete!" -ForegroundColor $Green
    Write-Host "===========================================" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "🌐 Application URLs:" -ForegroundColor $Blue
    Write-Host "   Frontend:    http://localhost:$Port" -ForegroundColor $Cyan
    Write-Host "   Backend API: http://localhost:5000" -ForegroundColor $Cyan
    Write-Host "   Health:      http://localhost:5000/health" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "📊 Container Status:" -ForegroundColor $Blue
    docker-compose ps
    Write-Host ""
    Write-Host "🛠️  Management Commands:" -ForegroundColor $Blue
    Write-Host "   View logs:        docker-compose logs -f" -ForegroundColor $Yellow
    Write-Host "   Stop app:         docker-compose down" -ForegroundColor $Yellow
    Write-Host "   Restart:          docker-compose restart" -ForegroundColor $Yellow
    Write-Host "   Remove all:       docker-compose down -v" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "🚀 Your full-stack application is now running!" -ForegroundColor $Green
}

# Main execution
function Main {
    Write-Host ""
    Write-Host "🚀 Full-Stack Application Auto-Deploy" -ForegroundColor $Blue
    Write-Host "======================================" -ForegroundColor $Blue
    Write-Host ""
    
    # Show help if requested
    if ($Help) { Show-Help }
    
    # Check prerequisites unless skipped
    if (-not $SkipChecks) { 
        Test-Prerequisites 
        Test-PortAvailability -Port $Port
        Test-PortAvailability -Port 5000
    }
    
    # Cleanup if requested
    if ($Cleanup) { Invoke-Cleanup }
    
    # Create app directory
    $appDir = $AppName
    if (-not (Test-Path $appDir)) {
        New-Item -ItemType Directory -Path $appDir | Out-Null
        Write-Host "📁 Created directory: $appDir" -ForegroundColor $Green
    }
    
    # Change to app directory
    Push-Location $appDir
    
    try {
        # Create docker-compose file
        New-DockerComposeFile
        
        # Pull images
        Get-DockerImages
        
        # Start application
        Start-Application
        
        # Check health
        Test-ApplicationHealth
        
        # Show info
        Show-ApplicationInfo
    }
    finally {
        Pop-Location
    }
}

# Run the main function
Main