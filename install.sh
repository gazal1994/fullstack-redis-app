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

# Set installation directory
INSTALL_PATH="$HOME/fullstack-app"

# Check if Git is installed
if ! command_exists git; then
    print_error "Git is not installed!"
    echo "Please install Git first:"
    echo "  - Install Xcode Command Line Tools: xcode-select --install"
    echo "  - Or install Git from: https://git-scm.com/download/mac"
    exit 1
fi

# Create installation directory
if [ -d "$INSTALL_PATH" ]; then
    print_warning "Directory $INSTALL_PATH already exists. Removing old installation..."
    rm -rf "$INSTALL_PATH"
fi

# Clone the repository
print_info "Cloning repository..."
if ! git clone https://github.com/gazal1994/fullstack-redis-app.git "$INSTALL_PATH"; then
    print_error "Failed to clone repository. Please check your internet connection."
    exit 1
fi

# Navigate to installation directory
cd "$INSTALL_PATH"

# Make deploy.sh executable
chmod +x deploy.sh

# Run deployment script
print_info "Starting deployment..."
./deploy.sh

print_status "Installation complete! Application should be running at http://localhost:3000"