@echo off
title Stop Live Matrix Wallpaper
echo Stopping Cyber Security Club Live Matrix Wallpaper...
taskkill /F /IM CyberMatrixWallpaper.exe 2>nul
rundll32.exe user32.dll,UpdatePerUserSystemParameters
echo Live wallpaper stopped. Normal desktop restored.
timeout /t 2
