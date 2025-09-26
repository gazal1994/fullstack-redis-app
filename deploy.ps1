# PowerShell Deployment Script for User Management System
# Simplified deployment for MongoDB + Node.js only (no Redis, no Docker)

Write-Host "Deploying User Management System..." -ForegroundColor Blue

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found! Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm not found! Please install npm" -ForegroundColor Red
    exit 1
}

Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
Set-Location server
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install backend dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location ..\my-app
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install frontend dependencies!" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host "Starting applications..." -ForegroundColor Green

# Start backend server in background
Write-Host "Starting backend server (port 5000)..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\server"
    npm start
}

Start-Sleep -Seconds 3

# Start frontend development server in background
Write-Host "Starting frontend server (port 5174)..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PWD\my-app"
    npm run dev
}

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🎉 User Management System is running!" -ForegroundColor Green
Write-Host ""
Write-Host "Application URLs:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5174" -ForegroundColor White
Write-Host "  Backend API: http://localhost:5000/api" -ForegroundColor White
Write-Host ""
Write-Host "Features:" -ForegroundColor Yellow
Write-Host "  ✅ 5 User Operations: Get, Add, Update, Delete, Get by ID" -ForegroundColor White
Write-Host "  ✅ MongoDB Database (simplified, no Redis)" -ForegroundColor White
Write-Host "  ✅ React + TypeScript + Redux Frontend" -ForegroundColor White
Write-Host ""
Write-Host "Running Jobs:" -ForegroundColor Yellow
Write-Host "  Backend Job ID: $($backendJob.Id)" -ForegroundColor White
Write-Host "  Frontend Job ID: $($frontendJob.Id)" -ForegroundColor White
Write-Host ""
Write-Host "To stop applications:" -ForegroundColor Yellow
Write-Host "  Stop-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor White
Write-Host "  Remove-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor White
Write-Host ""
Write-Host "To check status:" -ForegroundColor Yellow
Write-Host "  Get-Job" -ForegroundColor White