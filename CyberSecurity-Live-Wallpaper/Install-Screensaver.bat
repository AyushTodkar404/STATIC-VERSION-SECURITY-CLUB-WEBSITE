@echo off
title Install Cyber Security Club Screensaver
echo Installing Cyber Security Club Matrix Screensaver...
copy /Y "%~dp0CyberMatrixScreensaver.scr" "%SystemRoot%\System32\CyberMatrixScreensaver.scr" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Note: To install system-wide in System32, run as administrator.
    echo Opening Windows Screen Saver settings...
    control desk.cpl,,@screensaver
) else (
    echo Screensaver installed successfully to Windows System32!
    control desk.cpl,,@screensaver
)
timeout /t 3
