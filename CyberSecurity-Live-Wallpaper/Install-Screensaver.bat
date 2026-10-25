@echo off
title Install Live Hacker Screensaver
echo Installing Live Hacker Screensaver...
set "SOURCE=%~dp0CyberMatrixScreensaver.scr"
if not exist "%SOURCE%" set "SOURCE=%~dp0CyberMatrixWallpaper.exe"
copy /Y "%SOURCE%" "%SystemRoot%\System32\CyberMatrixScreensaver.scr" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Note: To install system-wide in System32, run as administrator.
    echo Opening Windows Screen Saver settings...
    control desk.cpl,,@screensaver
) else (
    echo Screensaver installed successfully to Windows System32!
    control desk.cpl,,@screensaver
)
timeout /t 3
