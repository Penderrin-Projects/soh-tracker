@echo off
title SoH Rando Tracker
cd /d "%~dp0"

:: Download prebuilt dev/ from GitHub Release on first run
if not exist "dev\index.html" (
    echo Downloading tracker assets ^(first run, ~26 MB^)...
    powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://github.com/Penderrin-Projects/soh-tracker/releases/download/v1.0-dev/dev.zip' -OutFile 'dev.zip'"
    if errorlevel 1 (
        echo ERROR: download failed. Check internet connection.
        pause
        exit /b 1
    )
    echo Extracting...
    powershell -NoProfile -Command "Expand-Archive -Path 'dev.zip' -DestinationPath 'dev' -Force"
    del dev.zip
    echo.
)

:: Install electron on first run
if not exist "node_modules\" (
    echo Installing Electron ^(first run only^)...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed. Install Node.js from https://nodejs.org
        pause
        exit /b 1
    )
    echo.
)

:: Launch
echo Starting tracker...
echo First time: File ^> Choose Save File ^> pick your file1.sav
call npx electron .
