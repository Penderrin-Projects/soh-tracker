@echo off
title SoH Rando Tracker - Build Portable EXE
cd /d "%~dp0"

echo.
echo === SoH Rando Tracker :: Portable EXE Builder ===
echo.

:: Make sure dev/ is present (electron-builder will bundle it)
if not exist "dev\index.html" (
    echo Downloading tracker assets ^(needed to bundle into the exe^)...
    powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://github.com/Penderrin-Projects/soh-tracker/releases/download/v1.0-dev/dev.zip' -OutFile 'dev.zip'"
    if errorlevel 1 (
        echo ERROR: download failed.
        pause
        exit /b 1
    )
    powershell -NoProfile -Command "Expand-Archive -Path 'dev.zip' -DestinationPath 'dev' -Force"
    del dev.zip
    echo.
)

:: Make sure deps are installed (electron + electron-builder)
if not exist "node_modules\electron-builder\" (
    echo Installing build dependencies ^(one-time, ~2 min^)...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed.
        pause
        exit /b 1
    )
    echo.
)

:: Build
echo Building portable exe ^(~2-4 min^)...
echo.
call npx electron-builder --win portable
if errorlevel 1 (
    echo.
    echo Build failed. See output above.
    pause
    exit /b 1
)

echo.
echo === Build complete ===
echo.
if exist "release\SoH-Rando-Tracker-1.0.0-portable.exe" (
    echo EXE: release\SoH-Rando-Tracker-1.0.0-portable.exe
    for %%A in ("release\SoH-Rando-Tracker-1.0.0-portable.exe") do echo Size: %%~zA bytes
)
echo.
pause
