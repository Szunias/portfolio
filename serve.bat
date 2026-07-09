@echo off
title Igor Szuniewicz - local preview server
rem Always run from the folder this .bat lives in (the repo root)
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install it from https://nodejs.org and try again.
    pause
    exit /b 1
)

echo.
echo === 1/2 Building site into dist\ ===
call node build.cjs
if errorlevel 1 (
    echo.
    echo [ERROR] Build failed - see the errors above.
    pause
    exit /b 1
)

echo.
echo === 2/2 Starting server ===
echo   http://localhost:8080            (home)
echo   http://localhost:8080/music.html (music timeline)
echo   http://localhost:8080/ifmc.html  (IFMC case study)
echo.
echo Press Ctrl+C to stop the server.
call npx --yes http-server dist -p 8080 -c-1 -o

pause
