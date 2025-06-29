@echo off
echo.
echo ========================================
echo   Code with Morais - Quick Deploy
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and add your credentials
    echo.
    pause
    exit /b 1
)

echo 1. Validating deployment readiness...
python validate_deployment.py
if %ERRORLEVEL% neq 0 (
    echo.
    echo Validation failed! Please fix the issues above.
    pause
    exit /b 1
)

echo.
echo 2. Starting Flask application in production mode...
echo.
echo Starting server on http://localhost:8080
echo External access: http://192.168.3.170:8080
echo Production URL: https://dev.codewithmorais.com
echo.
echo Press Ctrl+C to stop the server
echo.

REM Set production environment and start Flask
set FLASK_ENV=production
set HOST=0.0.0.0
set PORT=8080
python app.py
