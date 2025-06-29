# Code with Morais - PowerShell Deploy Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Code with Morais - Quick Deploy" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and add your credentials" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "1. Validating deployment readiness..." -ForegroundColor Green
python validate_deployment.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Validation failed! Please fix the issues above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "2. Starting Flask application in production mode..." -ForegroundColor Green
Write-Host ""
Write-Host "Starting server on http://localhost:8080" -ForegroundColor Yellow
Write-Host "External access: http://192.168.3.170:8080" -ForegroundColor Yellow
Write-Host "Production URL: https://dev.codewithmorais.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

# Set production environment and start Flask
$env:FLASK_ENV = "production"
$env:HOST = "0.0.0.0"
$env:PORT = "8080"
python app.py
