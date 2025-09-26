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
    # Stop any running processes in that directory first
    Get-Process | Where-Object { $_.Path -like "$repoPath*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    # Try to remove directory, if it fails, try to rename it instead
    try {
        Remove-Item -Recurse -Force $repoPath -ErrorAction Stop
    } catch {
        $backupPath = "$repoPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Write-Host "Cannot remove directory, renaming to $backupPath..." -ForegroundColor Yellow
        Rename-Item $repoPath $backupPath -ErrorAction SilentlyContinue
    }
}

# Clone the repository to the same directory as the install script
Write-Host "Cloning repository to $repoPath..." -ForegroundColor Cyan
$gitResult = git clone https://github.com/gazal1994/fullstack-redis-app.git $repoPath 2>&1

if (-not (Test-Path "$repoPath\.git")) {
    Write-Host "Failed to clone repository. Error:" -ForegroundColor Red
    Write-Host $gitResult -ForegroundColor Red
    Write-Host "Please check your internet connection and Git installation." -ForegroundColor Red
    exit 1
}

# Navigate to cloned repository directory
Set-Location $repoPath

Write-Host "Repository cloned successfully!" -ForegroundColor Green
Write-Host "Running deployment script..." -ForegroundColor Green

# Run the deployment script from the cloned repository
try {
    # Check if deploy.ps1 exists, if not use the bash version
    if (Test-Path ".\deploy.ps1") {
        Write-Host "Running deploy.ps1..." -ForegroundColor Cyan
        & .\deploy.ps1
    } elseif (Test-Path ".\deploy.sh") {
        Write-Host "Running deploy.sh..." -ForegroundColor Cyan
        bash .\deploy.sh
    } else {
        Write-Host "No deployment script found. Installing dependencies manually..." -ForegroundColor Yellow
        
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
    }
} catch {
    Write-Host "Deployment failed. Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "You can try running the deployment script manually:" -ForegroundColor Yellow
    Write-Host "  cd $repoPath" -ForegroundColor White
    Write-Host "  .\deploy.ps1  # or  bash deploy.sh" -ForegroundColor White
}