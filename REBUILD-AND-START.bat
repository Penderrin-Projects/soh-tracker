@echo off
title SoH Tracker - Rebuild
cd /d "%~dp0"

echo Rebuilding via gulp buildDev ...
if exist "dev\" rmdir /s /q dev
call node_modules\.bin\gulp.cmd buildDev
if errorlevel 1 (
    echo gulp failed - falling back to custom builder
    call node ./soh-integration/dev-build.cjs --clean
    if errorlevel 1 (
        echo Build failed.
        pause
        exit /b 1
    )
)
echo.
echo Build done. Starting tracker...
call npx electron .
