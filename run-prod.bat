@echo off
title RouteVelo - Production Server
echo ===================================================
echo   RouteVelo Production Build ^& Preview Launch Script
echo ===================================================
echo.
echo [1/3] Checking node_modules and installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed. Please ensure Node.js is installed.
    pause
    exit /b %errorlevel%
)
echo.
echo [2/3] Building production bundle (Hiding Simulation console)...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Build failed. Cannot run production preview.
    pause
    exit /b %errorlevel%
)
echo.
echo [3/3] Starting Production Preview server for presentation...
echo.
call npm run preview
pause
