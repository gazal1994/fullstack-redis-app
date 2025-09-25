#!/bin/bash

# 🚀 Full-Stack Application Deployment Script for macOS/Linux
# Deploys React+Redux+TypeScript frontend, Node.js+Express+Redis+MongoDB backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${CYAN}"
    echo "=============================================="
    echo "🚀 Full-Stack Application Deployment"
    echo "=============================================="
    echo -e "${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker installation
check_docker() {
    print_info "Checking Docker installation..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed!"
        echo "Please install Docker Desktop for Mac from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running!"
        echo "Please start Docker Desktop and try again."
        exit 1
    fi
    
    print_status "Docker is installed and running"
    docker --version
}

# Function to check Docker Compose
check_docker_compose() {
    print_info "Checking Docker Compose..."
    
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available!"
        echo "Please install Docker Compose or ensure Docker Desktop includes it."
        exit 1
    fi
    
    print_status "Docker Compose is available"
    
    # Check if we should use 'docker compose' or 'docker-compose'
    if docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        COMPOSE_CMD="docker-compose"
    fi
    
    echo "Using: $COMPOSE_CMD"
}

# Function to check available ports
check_ports() {
    print_info "Checking required ports..."
    
    local ports=(3000 5000 27017 6379)
    local blocked_ports=()
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            blocked_ports+=($port)
        fi
    done
    
    if [ ${#blocked_ports[@]} -gt 0 ]; then
        print_warning "The following ports are already in use: ${blocked_ports[*]}"
        echo "You may need to stop services on these ports or the deployment may fail."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Deployment cancelled."
            exit 1
        fi
    else
        print_status "All required ports (3000, 5000, 27017, 6379) are available"
    fi
}

# Function to create docker-compose.yml if it doesn't exist
create_docker_compose() {
    if [ ! -f "docker-compose.yml" ]; then
        print_info "Creating docker-compose.yml..."
        cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: gazal94/mongo:7.0
    container_name: fullstack-mongodb
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password123
      - MONGO_INITDB_DATABASE=fullstackdb
    volumes:
      - mongodb_data:/data/db
    networks:
      - fullstack-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s

  # Redis Cache
  redis:
    image: gazal94/redis:7-alpine
    container_name: fullstack-redis
    ports:
      - "6379:6379"
    command: redis-server --requirepass redis123 --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - fullstack-network
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "redis123", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 5s

  # Backend API Server
  backend:
    image: gazal94/fullstack-backend:latest
    container_name: fullstack-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password123@mongodb:27017/fullstackdb?authSource=admin
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=redis123
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - fullstack-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 15s
      timeout: 10s
      retries: 3
      start_period: 20s

  # Frontend React Application
  frontend:
    image: gazal94/fullstack-frontend:latest
    container_name: fullstack-frontend
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - fullstack-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 15s
      timeout: 10s
      retries: 3
      start_period: 10s

volumes:
  mongodb_data:
    driver: local
  redis_data:
    driver: local

networks:
  fullstack-network:
    driver: bridge
EOF
        print_status "docker-compose.yml created"
    fi
}

# Function to pull Docker images
pull_images() {
    print_info "Pulling Docker images from Docker Hub..."
    
    local images=(
        "gazal94/fullstack-frontend:latest"
        "gazal94/fullstack-backend:latest" 
        "gazal94/mongo:7.0"
        "gazal94/redis:7-alpine"
    )
    
    for image in "${images[@]}"; do
        echo "Pulling $image..."
        if ! docker pull "$image"; then
            print_error "Failed to pull image: $image"
            exit 1
        fi
    done
    
    print_status "All images pulled successfully"
}

# Function to deploy the application
deploy_application() {
    print_info "Deploying application stack..."
    
    # Stop and remove existing containers
    echo "Stopping any existing containers..."
    $COMPOSE_CMD down -v --remove-orphans 2>/dev/null || true
    
    # Start the application stack
    echo "Starting services..."
    if ! $COMPOSE_CMD up -d; then
        print_error "Failed to start services"
        echo "Check the logs with: $COMPOSE_CMD logs"
        exit 1
    fi
    
    print_status "Application stack deployed successfully"
}

# Function to wait for services to be healthy
wait_for_services() {
    print_info "Waiting for services to become healthy..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if $COMPOSE_CMD ps | grep -q "healthy"; then
            # Check if all services are healthy
            local unhealthy_count=$($COMPOSE_CMD ps --format table | grep -c "unhealthy" || echo "0")
            if [ "$unhealthy_count" -eq 0 ]; then
                print_status "All services are healthy!"
                return 0
            fi
        fi
        
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    print_warning "Some services may not be fully healthy yet. Check status with: $COMPOSE_CMD ps"
}

# Function to display service status
show_status() {
    echo -e "${CYAN}"
    echo "=============================================="
    echo "📊 Service Status"
    echo "=============================================="
    echo -e "${NC}"
    
    $COMPOSE_CMD ps
    
    echo ""
    echo -e "${CYAN}"
    echo "=============================================="
    echo "🌐 Application URLs"
    echo "=============================================="
    echo -e "${NC}"
    
    echo "Frontend Application: http://localhost:3000"
    echo "Backend API:         http://localhost:5000"
    echo "API Health Check:    http://localhost:5000/health"
    echo "API Documentation:   http://localhost:5000/api/docs (if available)"
}

# Function to open browser (macOS)
open_browser() {
    if command_exists open; then
        print_info "Opening application in default browser..."
        sleep 3  # Wait a moment for services to be ready
        open "http://localhost:3000" 2>/dev/null || true
    fi
}

# Function to show management commands
show_management_commands() {
    echo -e "${CYAN}"
    echo "=============================================="
    echo "🛠️  Management Commands"
    echo "=============================================="
    echo -e "${NC}"
    
    echo "View logs:           $COMPOSE_CMD logs -f"
    echo "View specific logs:  $COMPOSE_CMD logs backend"
    echo "Stop services:       $COMPOSE_CMD down"
    echo "Restart services:    $COMPOSE_CMD restart"
    echo "Update images:       $COMPOSE_CMD pull && $COMPOSE_CMD up -d"
    echo "Remove everything:   $COMPOSE_CMD down -v --remove-orphans"
}

# Main deployment function
main() {
    print_header
    
    # Pre-flight checks
    check_docker
    check_docker_compose
    check_ports
    
    # Setup
    create_docker_compose
    pull_images
    
    # Deploy
    deploy_application
    wait_for_services
    
    # Show results
    show_status
    show_management_commands
    
    # Open browser
    open_browser
    
    echo -e "${GREEN}"
    echo "=============================================="
    echo "🎉 Deployment Complete!"
    echo "=============================================="
    echo -e "${NC}"
    echo "Your full-stack application is now running!"
    echo "Visit: http://localhost:3000 to get started"
}

# Run main function
main "$@"