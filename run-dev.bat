@echo off
title RouteVelo - Development Server
echo ===================================================
echo   RouteVelo Dev Launch Script
echo ===================================================
echo.
echo [1/2] Checking node_modules and installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed. Please ensure Node.js is installed.
    pause
    exit /b %errorlevel%
)
echo.
echo [2/2] Starting Development server with Developer simulation console...
echo.
call npm run dev
pause
