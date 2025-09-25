# 🐧 Linux Deployment Guide

Complete deployment guide for running the full-stack application on Linux distributions (Ubuntu, CentOS, Debian, Fedora, etc.).

## 🚀 Quick Start (One Command)

### Remote Installation
```bash
curl -fsSL https://raw.githubusercontent.com/gazal1994/fullstack-redis-app/main/install.sh | bash
```

This command works on all major Linux distributions and will:
1. Download the installation script
2. Clone the repository to `~/fullstack-app`
3. Run the deployment automatically
4. Display application URLs

## 📋 Prerequisites by Distribution

### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install Docker
sudo apt install docker.io docker-compose git curl -y

# Add user to docker group
sudo usermod -aG docker $USER

# Restart session or run:
newgrp docker

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

### CentOS/RHEL/Fedora
```bash
# Install Docker (CentOS/RHEL 8+)
sudo dnf install docker docker-compose git curl -y

# Or for older versions:
# sudo yum install docker docker-compose git curl -y

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Restart session
newgrp docker
```

### Arch Linux
```bash
# Install Docker
sudo pacman -S docker docker-compose git curl

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Restart session
newgrp docker
```

### Alpine Linux
```bash
# Install Docker
sudo apk add docker docker-compose git curl

# Add user to docker group
sudo addgroup $USER docker

# Start Docker service
sudo rc-service docker start
sudo rc-update add docker

# Restart session
newgrp docker
```

## 🔧 Linux-Specific Configuration

### Firewall Configuration
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 3000/tcp
sudo ufw allow 5000/tcp
sudo ufw allow 27017/tcp
sudo ufw allow 6379/tcp

# CentOS/RHEL/Fedora (firewalld)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --permanent --add-port=27017/tcp
sudo firewall-cmd --permanent --add-port=6379/tcp
sudo firewall-cmd --reload
```

### SELinux Configuration (RHEL/CentOS)
```bash
# Check SELinux status
sestatus

# If SELinux is enforcing, allow Docker
sudo setsebool -P container_manage_cgroup on
sudo setsebool -P container_use_cgroup on
```

## 📦 Manual Deployment

### Method 1: Using the Deployment Script
```bash
# Clone the repository
git clone https://github.com/gazal1994/fullstack-redis-app.git
cd fullstack-redis-app

# Make script executable and run
chmod +x deploy.sh
./deploy.sh
```

### Method 2: Direct Docker Compose
```bash
# Clone the repository
git clone https://github.com/gazal1994/fullstack-redis-app.git
cd fullstack-redis-app

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### Method 3: Systemd Service (Advanced)
Create a systemd service for automatic startup:

```bash
# Create service file
sudo tee /etc/systemd/system/fullstack-app.service > /dev/null <<EOF
[Unit]
Description=Full-Stack Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$HOME/fullstack-app
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable fullstack-app.service
sudo systemctl start fullstack-app.service
```

## 🛠️ Linux-Specific Management

### Service Management
```bash
# View all service status
docker-compose ps

# View logs with timestamps
docker-compose logs -f --timestamps

# View resource usage
docker stats

# Monitor system resources
htop
# or
top
```

### System Resource Monitoring
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check network connections
netstat -tlnp | grep -E '(3000|5000|27017|6379)'

# Check Docker space usage
docker system df
```

### Performance Optimization
```bash
# Set Docker to use systemd cgroup driver (Ubuntu 20.04+)
sudo tee /etc/docker/daemon.json > /dev/null <<EOF
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

# Restart Docker
sudo systemctl restart docker
```

## 🔍 Linux Troubleshooting

### Common Linux Issues

#### 1. Permission Denied (Docker)
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Or logout and login again
```

#### 2. Port Already in Use
```bash
# Find process using port
sudo netstat -tlnp | grep :3000
# or
sudo ss -tlnp | grep :3000

# Kill process by PID
sudo kill -9 <PID>

# Or kill by port
sudo fuser -k 3000/tcp
```

#### 3. Docker Service Issues
```bash
# Check Docker service status
sudo systemctl status docker

# Start Docker if not running
sudo systemctl start docker

# View Docker logs
sudo journalctl -u docker.service

# Restart Docker
sudo systemctl restart docker
```

#### 4. Memory Issues
```bash
# Check available memory
free -h

# Clear system cache
sudo sync
sudo echo 3 > /proc/sys/vm/drop_caches

# Set Docker memory limits in compose
# Add to docker-compose.yml:
# mem_limit: 512m
```

#### 5. Network Issues
```bash
# Check Docker networks
docker network ls

# Reset Docker networks
docker network prune -f

# Check iptables rules
sudo iptables -L DOCKER
```

## 🌐 Linux Distribution Testing

The deployment has been tested on:

- ✅ **Ubuntu 20.04 LTS**
- ✅ **Ubuntu 22.04 LTS**
- ✅ **Debian 11 (Bullseye)**
- ✅ **CentOS 8**
- ✅ **Red Hat Enterprise Linux 8**
- ✅ **Fedora 35+**
- ✅ **Arch Linux**
- ✅ **Alpine Linux**

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 1 core (2 cores recommended)
- **RAM**: 2GB (4GB recommended)
- **Storage**: 5GB free space
- **Network**: Internet connection for image downloads

### Recommended for Production
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 20GB+ SSD
- **Network**: High-speed internet

## 🔐 Security Considerations

### Container Security
```bash
# Run containers as non-root user
# Add to docker-compose.yml:
# user: "1000:1000"

# Limit container capabilities
# Add to docker-compose.yml:
# cap_drop:
#   - ALL
# cap_add:
#   - NET_BIND_SERVICE
```

### Network Security
```bash
# Use Docker secrets for passwords (Docker Swarm)
echo "password123" | docker secret create mongodb_password -

# Use environment files instead of hardcoded passwords
# Create .env file with:
# MONGO_PASSWORD=your_secure_password
# REDIS_PASSWORD=your_secure_redis_password
```

## 🚀 Advanced Linux Features

### Container Auto-Restart
```bash
# Add restart policies to docker-compose.yml
# restart: unless-stopped
```

### Log Rotation
```bash
# Configure logrotate for Docker
sudo tee /etc/logrotate.d/docker > /dev/null <<EOF
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  size=1M
  missingok
  delaycompress
  copytruncate
}
EOF
```

### Backup Script
```bash
#!/bin/bash
# backup.sh - Backup application data

BACKUP_DIR="/backup/fullstack-app-$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Backup MongoDB
docker exec fullstack-mongodb mongodump --out "$BACKUP_DIR/mongodb"

# Backup Redis
docker exec fullstack-redis redis-cli --rdb "$BACKUP_DIR/redis.rdb"

echo "Backup completed: $BACKUP_DIR"
```

## 📱 Accessing from Remote Linux Server

If deploying on a remote Linux server:

```bash
# Replace localhost with your server IP
# Frontend: http://YOUR_SERVER_IP:3000
# Backend:  http://YOUR_SERVER_IP:5000

# Configure reverse proxy (nginx)
sudo apt install nginx
sudo tee /etc/nginx/sites-available/fullstack > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/fullstack /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## 🎯 Next Steps

After successful deployment on Linux:

1. **Monitor Resources**: Use `htop`, `docker stats` to monitor performance
2. **Set up Backups**: Implement regular data backups
3. **Configure SSL**: Use Let's Encrypt for HTTPS
4. **Set up Monitoring**: Consider Prometheus + Grafana
5. **Log Management**: Set up centralized logging

Your full-stack application is now ready for Linux production deployment!