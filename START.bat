@echo off
title SoH Rando Tracker
cd /d "%~dp0"

:: First-run: install dependencies
if not exist "node_modules\" (
    echo First-run setup: installing dependencies...
    echo This can take 3-5 minutes, please wait.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed. Make sure Node.js is installed.
        echo Download from: https://nodejs.org
        pause
        exit /b 1
    )
    echo.
)

:: Build the app into dev/ if needed (fast - about 10s)
if not exist "dev\index.html" (
    echo Building app...
    call node ./soh-integration/dev-build.js
    if errorlevel 1 (
        echo.
        echo ERROR: build failed.
        pause
        exit /b 1
    )
    echo.
)

:: Start Electron
echo Starting SoH Rando Tracker...
echo.
echo (If this is your first time, open File -> Choose Save File
echo  and pick your Ship of Harkinian file1.sav)
echo.
call npx electron .
