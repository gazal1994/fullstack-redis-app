# Remote Installation Script for Full-Stack Application
# Downloads and runs the complete deployment automatically

Write-Host "Full-Stack Application Installer" -ForegroundColor Green
Write-Host "Downloading and deploying complete application..." -ForegroundColor Yellow

# Set installation directory to the same location as the install script
$installPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoPath = Join-Path $installPath "fullstack-redis-app"

# Remove existing repo directory if it exists
if (Test-Path $repoPath) {
    Write-Host "Directory $repoPath already exists. Removing old installation..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $repoPath
}

# Clone the repository to the same directory as the install script
Write-Host "Cloning repository to $repoPath..." -ForegroundColor Cyan
git clone https://github.com/gazal1994/fullstack-redis-app.git $repoPath

if (-not (Test-Path $repoPath)) {
    Write-Host "Failed to clone repository. Please check your internet connection and Git installation." -ForegroundColor Red
    exit 1
}

# Navigate to cloned repository directory
Set-Location $repoPath

Write-Host "Repository cloned successfully!" -ForegroundColor Green
Write-Host "Starting simple installation (Node.js only)..." -ForegroundColor Green

# Simple Node.js installation
try {
    # Install backend dependencies
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Set-Location server
    npm install
    
    # Install frontend dependencies  
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Set-Location ..\my-app
    npm install
    
    Set-Location ..
    
    Write-Host "Installation complete! To start the application:" -ForegroundColor Green
    Write-Host "1. Start backend: cd server && npm start" -ForegroundColor White
    Write-Host "2. Start frontend: cd my-app && npm run dev" -ForegroundColor White
    Write-Host "" 
    Write-Host "Application URLs:" -ForegroundColor Green
    Write-Host "  Frontend: http://localhost:5174" -ForegroundColor White
    Write-Host "  Backend API: http://localhost:5000/api" -ForegroundColor White
} catch {
    Write-Host "Simple installation failed. You can run Docker deployment instead:" -ForegroundColor Yellow
    Write-Host "& .\deploy.ps1" -ForegroundColor White
}