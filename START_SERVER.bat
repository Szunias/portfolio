@echo off
echo ========================================
echo  Starting Local Web Server
echo ========================================
echo.
echo Server will start on: http://localhost:8000
echo.
echo To test translations, open your browser to:
echo   http://localhost:8000/QUICK_TEST.html
echo   http://localhost:8000/projects/pawism.html
echo   http://localhost:8000/projects/akantilado.html
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

REM Start Python HTTP server
cd /d "%~dp0"
python -m http.server 8000

pause
