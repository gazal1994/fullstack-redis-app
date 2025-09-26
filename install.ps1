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
    
    Write-Host "Installation complete!" -ForegroundColor Green
    Write-Host "Starting applications..." -ForegroundColor Green
    
    # Start backend server in background
    Write-Host "Starting backend server..." -ForegroundColor Cyan
    $backendJob = Start-Job -ScriptBlock {
        Set-Location "$using:repoPath\server"
        npm start
    }
    
    # Wait a moment for backend to start
    Start-Sleep -Seconds 3
    
    # Start frontend development server in background
    Write-Host "Starting frontend development server..." -ForegroundColor Cyan
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location "$using:repoPath\my-app"
        npm run dev
    }
    
    # Wait for frontend to start
    Start-Sleep -Seconds 5
    
    Write-Host "" 
    Write-Host "🎉 Applications are now running!" -ForegroundColor Green
    Write-Host "Application URLs:" -ForegroundColor Green
    Write-Host "  Frontend: http://localhost:5174" -ForegroundColor White
    Write-Host "  Backend API: http://localhost:5000/api" -ForegroundColor White
    Write-Host ""
    Write-Host "Running Jobs:" -ForegroundColor Green
    Write-Host "  Backend Job ID: $($backendJob.Id)" -ForegroundColor White
    Write-Host "  Frontend Job ID: $($frontendJob.Id)" -ForegroundColor White
    Write-Host ""
    Write-Host "To stop the applications:" -ForegroundColor Yellow
    Write-Host "  Stop-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor White
    Write-Host "  Remove-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor White
    Write-Host ""
    Write-Host "To check job status:" -ForegroundColor Yellow
    Write-Host "  Get-Job" -ForegroundColor White
} catch {
    Write-Host "Simple installation failed. You can run Docker deployment instead:" -ForegroundColor Yellow
    Write-Host "& .\deploy.ps1" -ForegroundColor White
}