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

:: Build dev/ if missing. Prefer gulp (canonical Track-OOT build), fall back
:: to our custom raw-copy builder if gulp fails for any reason.
if not exist "dev\index.html" (
    echo Building app ^(gulp buildDev^)...
    call node_modules\.bin\gulp.cmd buildDev
    if errorlevel 1 (
        echo.
        echo gulp buildDev failed. Falling back to the custom builder.
        call node ./soh-integration/dev-build.cjs
        if errorlevel 1 (
            echo.
            echo ERROR: both builds failed. See output above.
            pause
            exit /b 1
        )
    )
    echo.
)

:: Start Electron
echo Starting SoH Rando Tracker...
echo.
echo First time: File menu -^> Choose Save File -^> pick file1.sav
echo.
call npx electron .
