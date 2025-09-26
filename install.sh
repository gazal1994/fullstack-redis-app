#!/bin/bash

# Remote Installation Script for Full-Stack Application (macOS/Linux)
# Downloads and runs the complete deployment automatically

set -e

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
    echo "Full-Stack Application Installer (macOS/Linux)"
    echo "=============================================="
    echo -e "${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_header

print_info "Downloading and deploying complete application..."

# Set installation directory to the same location as the install script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_PATH="$SCRIPT_DIR/fullstack-redis-app"

# Check if Git is installed
if ! command_exists git; then
    print_error "Git is not installed!"
    echo "Please install Git first:"
    echo "  - Install Xcode Command Line Tools: xcode-select --install"
    echo "  - Or install Git from: https://git-scm.com/download/mac"
    exit 1
fi

# Remove existing repo directory if it exists
if [ -d "$REPO_PATH" ]; then
    print_warning "Directory $REPO_PATH already exists. Removing old installation..."
    rm -rf "$REPO_PATH"
fi

# Clone the repository to the same directory as the install script
print_info "Cloning repository to $REPO_PATH..."
if ! git clone https://github.com/gazal1994/fullstack-redis-app.git "$REPO_PATH"; then
    print_error "Failed to clone repository. Please check your internet connection."
    exit 1
fi

# Navigate to cloned repository directory
cd "$REPO_PATH"

print_status "Repository cloned successfully!"
print_info "Starting simple installation (Node.js only)..."

# Simple Node.js installation
{
    # Install backend dependencies
    print_info "Installing backend dependencies..."
    cd server
    npm install
    
    # Install frontend dependencies
    print_info "Installing frontend dependencies..."
    cd ../my-app
    npm install
    
    cd ..
    
    print_status "Installation complete! To start the application:"
    echo "1. Start backend: cd server && npm start"
    echo "2. Start frontend: cd my-app && npm run dev"
    echo ""
    print_status "Application URLs:"
    echo "  Frontend: http://localhost:5174"
    echo "  Backend API: http://localhost:5000/api"
} || {
    print_warning "Simple installation failed. You can run Docker deployment instead:"
    echo "./deploy.sh"
}