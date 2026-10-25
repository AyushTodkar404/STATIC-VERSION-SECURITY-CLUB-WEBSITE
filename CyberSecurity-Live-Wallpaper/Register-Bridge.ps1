# 1. Register in HKCU Run registry key for permanent startup on login
$exePath = "c:\SECURITY CLUB STATIC PAGE\CyberSecurity-Live-Wallpaper\CyberActionBridge.exe"
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run' -Name 'CyberActionBridge' -Value "`"$exePath`""

# 2. Place shortcut in Windows Startup folder for double redundancy
$startupDir = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Startup)
$shortcutPath = Join-Path $startupDir "CyberActionBridge.lnk"
$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $exePath
$shortcut.WorkingDirectory = "c:\SECURITY CLUB STATIC PAGE\CyberSecurity-Live-Wallpaper"
$shortcut.Description = "CyberSecurity Live Wallpaper Action Bridge"
$shortcut.Save()

# 3. Ensure detached bridge process is running via WMI
$running = Get-Process -Name "CyberActionBridge" -ErrorAction SilentlyContinue
if (-not $running) {
    $wmi = [wmiclass]"Win32_Process"
    $wmi.Create("`"$exePath`"")
}

# 4. Sync updated index.html and files to all Lively Wallpaper instances and library directories
$sourceHtml = "c:\SECURITY CLUB STATIC PAGE\CyberSecurity-Live-Wallpaper\index.html"
$packagesPath = Join-Path $env:LOCALAPPDATA "Packages"
$livelyPackages = Get-ChildItem -Path $packagesPath -Filter "12030rocksdanister.LivelyWallpaper*" -ErrorAction SilentlyContinue

foreach ($pkg in $livelyPackages) {
    $htmlFiles = Get-ChildItem -Path $pkg.FullName -Recurse -Filter "index.html" -ErrorAction SilentlyContinue
    foreach ($f in $htmlFiles) {
        Copy-Item -Path $sourceHtml -Destination $f.FullName -Force
        Write-Host "Synchronized Lively copy: $($f.FullName)"
    }
}

Write-Host "Setup complete. CyberActionBridge is active and synchronized."
