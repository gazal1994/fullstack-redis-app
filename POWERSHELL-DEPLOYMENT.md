# 🚀 PowerShell Deployment Scripts for Full-Stack Application

This directory contains PowerShell scripts to automatically deploy the full-stack application from Docker Hub.

## 📦 Available Scripts

### 1. **quick-deploy.ps1** - Simple One-Click Deployment
```powershell
.\quick-deploy.ps1
```
**What it does:**
- ✅ Checks Docker availability
- ✅ Creates docker-compose.yml automatically  
- ✅ Stops any existing containers
- ✅ Pulls images from Docker Hub
- ✅ Starts the application
- ✅ Opens browser to the app
- ✅ Shows status and management commands

**Perfect for:** Quick deployment, demos, testing

---

### 2. **deploy-fullstack.ps1** - Advanced Deployment with Options
```powershell
# Basic deployment
.\deploy-fullstack.ps1

# Custom app name and port
.\deploy-fullstack.ps1 -AppName "myapp" -Port 8080

# Clean deployment (removes existing containers first)
.\deploy-fullstack.ps1 -Cleanup

# Skip prerequisite checks
.\deploy-fullstack.ps1 -SkipChecks

# Show help
.\deploy-fullstack.ps1 -Help
```

**Features:**
- 🎯 Configurable app name and ports
- 🧹 Cleanup existing containers option
- 🔍 Comprehensive prerequisite checking
- 📊 Detailed health monitoring
- 🛠️ Advanced error handling
- 📋 Complete status reporting

**Perfect for:** Production deployments, customization needs

---

### 3. **install.ps1** - One-Line Remote Install
```powershell
.\install.ps1
```
**What it does:**
- Downloads and executes the latest deployment script from GitHub
- No local files needed - completely remote

**Perfect for:** Sharing with others, minimal setup

---

## 🏃‍♂️ Quick Start

### Option 1: Download and Run Locally
```powershell
# Download this repository
git clone <your-repo-url>
cd fullstack-app

# Run the quick deploy
.\quick-deploy.ps1
```

### Option 2: One-Line Remote Execution
```powershell
# Run directly from PowerShell (no download needed)
Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/gazal94/fullstack-docker/main/quick-deploy.ps1'))
```

### Option 3: Manual Steps
```powershell
# Create docker-compose.yml file manually, then:
docker-compose up -d
```

## 🎯 What Gets Deployed

### Docker Images (from Docker Hub):
- `gazal94/fullstack-frontend:latest` - React app (80.3MB)
- `gazal94/fullstack-backend:latest` - Node.js API (263MB)  
- `gazal94/mongo:7.0` - MongoDB database
- `gazal94/redis:7-alpine` - Redis cache

### Services:
- **Frontend**: http://localhost:3000 (React + Redux + TypeScript)
- **Backend**: http://localhost:5000 (Node.js + Express API)
- **Database**: MongoDB with authentication
- **Cache**: Redis with password protection

## 🛠️ Management Commands

### After Deployment:
```powershell
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop application (keeps data)
docker-compose down

# Stop and remove all data
docker-compose down -v

# Restart services
docker-compose restart

# Update images
docker-compose pull && docker-compose up -d
```

## 🚨 Troubleshooting

### Common Issues:

**"Docker not found"**
```powershell
# Install Docker Desktop from: https://docker.com/products/docker-desktop
```

**"Port already in use"**  
```powershell
# Check what's using the port
netstat -aon | findstr :3000

# Kill the process
taskkill /PID [PID_NUMBER] /F
```

**"Containers failed to start"**
```powershell
# Check logs
docker-compose logs

# Restart Docker Desktop
# Try cleanup and redeploy
.\deploy-fullstack.ps1 -Cleanup
```

**"Permission denied"**
```powershell
# Run PowerShell as Administrator
# Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🔧 Customization

### Change Ports:
Edit the generated `docker-compose.yml` file:
```yaml
ports:
  - "8080:3000"  # Frontend on port 8080
  - "8081:5000"  # Backend on port 8081
```

### Environment Variables:
```powershell
# Set before running docker-compose up
$env:MONGODB_PASSWORD = "your-secure-password"
$env:REDIS_PASSWORD = "your-redis-password"
docker-compose up -d
```

## 📊 Performance Notes

- **Total Download**: ~1.5GB (first time only)
- **Startup Time**: 30-60 seconds
- **Memory Usage**: ~2GB RAM recommended
- **Disk Space**: ~3GB total

## 🌍 Production Deployment

For production use:
1. Change default passwords
2. Use environment variables for secrets
3. Configure SSL/TLS termination
4. Set up proper backup strategy
5. Configure monitoring and logging

---

**Ready to deploy anywhere with PowerShell! 🚀**