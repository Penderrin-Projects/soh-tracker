@echo off
title SoH Tracker - Rebuild
cd /d "%~dp0"

echo Rebuilding app from src/ -> dev/ ...
call node ./soh-integration/dev-build.js --clean
if errorlevel 1 (
    echo.
    echo Build failed.
    pause
    exit /b 1
)
echo.
echo Build done. Starting tracker...
call npx electron .
