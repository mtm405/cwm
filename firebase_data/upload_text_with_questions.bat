@echo off
echo Running Text with Questions Demo Uploader

cd %~dp0
cd ..

python firebase_data/upload_text_with_questions_demo.py

echo.
echo If successful, visit the test page at:
echo http://localhost:8080/test-text-with-questions
echo.
echo Press any key to exit...
pause > nul
