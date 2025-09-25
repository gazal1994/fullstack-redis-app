# Remote Installation Script for Full-Stack Application
# Downloads and runs the complete deployment automatically

Write-Host "Full-Stack Application Installer" -ForegroundColor Green
Write-Host "Downloading and deploying complete application..." -ForegroundColor Yellow

# Set installation directory
$installPath = "C:\fullstack-app"

# Create installation directory
if (Test-Path $installPath) {
    Write-Host "Directory $installPath already exists. Removing old installation..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $installPath
}

# Clone the repository
Write-Host "Cloning repository..." -ForegroundColor Cyan
git clone https://github.com/gazal1994/fullstack-redis-app.git $installPath

if (-not (Test-Path $installPath)) {
    Write-Host "Failed to clone repository. Please check your internet connection and Git installation." -ForegroundColor Red
    exit 1
}

# Navigate to installation directory
Set-Location $installPath

# Run deployment script
Write-Host "Starting deployment..." -ForegroundColor Green
& .\deploy.ps1

Write-Host "Installation complete! Application should be running at http://localhost:3000" -ForegroundColor Green