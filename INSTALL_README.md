# User Management System - Quick Install

This installation script will clone the repository to the same directory where you run it from and then execute the deployment script.

## Quick Start

### Windows (PowerShell)
```powershell
# Download and run the install script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gazal1994/fullstack-redis-app/main/install.ps1" -OutFile "install.ps1"
.\install.ps1
```

### macOS/Linux (Bash)
```bash
# Download and run the install script
curl -O https://raw.githubusercontent.com/gazal1994/fullstack-redis-app/main/install.sh
chmod +x install.sh
./install.sh
```

## What the install script does

1. **Clones Repository**: Downloads the complete application to a `fullstack-redis-app` folder in the same directory as the install script
2. **Runs Deployment**: Automatically executes the deployment script from within the cloned repository
3. **Deployment Handling**: Uses the project's own deployment script (deploy.ps1 or deploy.sh) for proper setup

## Deployment Script Behavior

The install script will look for and run the deployment script in this order:
- **Windows**: `deploy.ps1` (PowerShell) → `deploy.sh` (Bash fallback)
- **Linux/macOS**: `deploy.sh` (Bash)

If no deployment script is found, it will fall back to simple dependency installation.

## Manual Installation

If you prefer to install manually:

```bash
# Clone the repository
git clone https://github.com/gazal1994/fullstack-redis-app.git
cd fullstack-redis-app

# Run deployment script
./deploy.sh        # Linux/macOS
# or
.\deploy.ps1       # Windows PowerShell

# Or manual setup
cd server && npm install && npm start &
cd ../my-app && npm install && npm run dev
```

## Application Features

✅ **5 User Operations Only**:
1. **Get Users** - View all users
2. **Add User** - Create new user
3. **Get User** - View single user by ID
4. **Update User** - Modify user information
5. **Delete User** - Remove user

✅ **Technologies**:
- Frontend: React + TypeScript + Redux + SASS
- Backend: Node.js + Express + MongoDB
- Database: MongoDB only (Redis removed for simplicity)

## Access URLs

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api/ (shows available endpoints)

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally (for database operations)
- Git (for cloning repository)