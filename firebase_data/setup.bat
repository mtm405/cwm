@echo off
echo 🔥 Firebase Database Cleanup & Seeding Tool
echo ==========================================
echo.
echo This will clean and re-populate your Firebase database
echo Project: code-with-morais-405
echo.
echo WARNING: This will DELETE ALL existing data!
echo.
pause

cd /d "%~dp0"
python quick_setup.py

echo.
echo ==========================================
echo Setup complete! Check the output above.
echo.
pause
