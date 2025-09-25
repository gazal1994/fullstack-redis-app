# 🚀 PowerShell Deployment Scripts - Quick Reference

## Available Scripts for Your Docker Hub Full-Stack App

### 1. ⚡ **deploy.ps1** - Simple & Fast (RECOMMENDED)
```powershell
.\deploy.ps1
```
**What it does:**
- ✅ Checks Docker availability
- ✅ Creates docker-compose.yml automatically  
- ✅ Deploys all 4 services from Docker Hub
- ✅ Opens browser to the application
- ✅ Shows container status

**Perfect for:** Quick deployment, demos, testing

---

### 2. 🛠️ **deploy-fullstack.ps1** - Advanced with Options
```powershell
# Basic deployment
.\deploy-fullstack.ps1

# With custom settings
.\deploy-fullstack.ps1 -AppName "myapp" -Port 8080 -Cleanup

# Show all options
.\deploy-fullstack.ps1 -Help
```

**Features:**
- 🎯 Configurable app name and ports
- 🧹 Cleanup option for fresh deployments
- 🔍 Comprehensive health checking
- 📊 Detailed status reporting
- 🛡️ Advanced error handling

**Perfect for:** Production deployments, customization

---

### 3. 🌐 **install.ps1** - One-Line Remote Install
```powershell
.\install.ps1
```
**What it does:**
- Downloads latest deployment script from GitHub
- Executes automatically

**Perfect for:** Sharing with others, minimal setup

---

## 🎯 Quick Start Examples

### Option 1: Clone and Run
```powershell
git clone <your-repo>
cd fullstack-app
.\deploy.ps1
```

### Option 2: Manual Download
```powershell
# Download the deploy script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/gazal94/fullstack-docker/main/deploy.ps1" -OutFile "deploy.ps1"
.\deploy.ps1
```

### Option 3: One-Liner (No Files Needed)
```powershell
Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/gazal94/fullstack-docker/main/deploy.ps1'))
```

---

## 🔧 What Gets Deployed

### Docker Hub Images:
- **gazal94/fullstack-frontend:latest** - React app (80.3MB)
- **gazal94/fullstack-backend:latest** - Node.js API (263MB)
- **gazal94/mongo:7.0** - MongoDB database
- **gazal94/redis:7-alpine** - Redis cache

### URLs After Deployment:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000  
- **Health**: http://localhost:5000/health

---

## 🛠️ Management After Deployment

```powershell
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart
docker-compose restart

# Clean everything
docker-compose down -v
```

---

## 🚨 Troubleshooting

### "Docker not running"
```powershell
# Start Docker Desktop, then retry
```

### "Port already in use"
```powershell
netstat -aon | findstr :3000
# Kill the process using the port
```

### "Permission denied" 
```powershell
# Run as Administrator or:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

**All scripts tested and working on Windows 11 with PowerShell 5.1** ✅

**Ready for instant deployment anywhere! 🚀**