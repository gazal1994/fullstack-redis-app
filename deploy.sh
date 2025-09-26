#!/bin/bash

# User Management System Deployment Script for macOS/Linux
# Simplified deployment for MongoDB + Node.js only (no Redis, no Docker)

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
    echo "User Management System Deployment"
    echo "=============================================="
    echo -e "${NC}"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_header

# Check Node.js
if ! command_exists node; then
    print_error "Node.js not found! Please install Node.js from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version)
print_info "Node.js version: $NODE_VERSION"

# Check npm
if ! command_exists npm; then
    print_error "npm not found! Please install npm"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_info "npm version: $NPM_VERSION"

# Install backend dependencies
print_info "Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install backend dependencies!"
    exit 1
fi

# Install frontend dependencies
print_info "Installing frontend dependencies..."
cd ../my-app
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install frontend dependencies!"
    exit 1
fi

cd ..

print_info "Starting applications..."

# Start backend server in background
print_info "Starting backend server (port 5000)..."
cd server
nohup npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid

# Wait for backend to start
sleep 3

# Start frontend development server in background
print_info "Starting frontend server (port 5174)..."
cd ../my-app
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid

cd ..

# Wait for services to start
sleep 5

echo ""
print_status "🎉 User Management System is running!"
echo ""
echo -e "${YELLOW}Application URLs:${NC}"
echo "  Frontend: http://localhost:5174"
echo "  Backend API: http://localhost:5000/api"
echo ""
echo -e "${YELLOW}Features:${NC}"
echo "  ✅ 5 User Operations: Get, Add, Update, Delete, Get by ID"
echo "  ✅ MongoDB Database (simplified, no Redis)"
echo "  ✅ React + TypeScript + Redux Frontend"
echo ""
echo -e "${YELLOW}Process IDs:${NC}"
echo "  Backend PID: $BACKEND_PID (saved to backend.pid)"
echo "  Frontend PID: $FRONTEND_PID (saved to frontend.pid)"
echo ""
echo -e "${YELLOW}To stop applications:${NC}"
echo "  kill \$(cat backend.pid frontend.pid)"
echo ""
echo -e "${YELLOW}Log files:${NC}"
echo "  Backend: $(pwd)/backend.log"
echo "  Frontend: $(pwd)/frontend.log"
echo ""
print_status "Deployment completed!"