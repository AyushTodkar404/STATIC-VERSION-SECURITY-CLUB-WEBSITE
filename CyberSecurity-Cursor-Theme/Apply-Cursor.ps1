# Cyber Security Club - Live Cursor Applier (v2.1)
# Applies full cyber cursor suite (Normal, Link, Text I-Beam, Resizing, Move, Busy)

$ErrorActionPreference = "Stop"

$cursorDir = $PSScriptRoot
if (-not (Test-Path "$cursorDir\cyber_normal.ani")) {
    $cursorDir = "C:\SECURITY CLUB STATIC PAGE\CyberSecurity-Cursor-Theme"
}

# Target directory in LocalAppData for zero-admin persistent storage
$targetDir = "$env:LOCALAPPDATA\CyberSecurityReticle"
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

# Copy cursor files
Copy-Item -Path "$cursorDir\*.cur", "$cursorDir\*.ani" -Destination $targetDir -Force

$normal    = "$targetDir\cyber_normal.ani"
$link      = "$targetDir\cyber_link.cur"
$text      = "$targetDir\cyber_text.cur"
$ns        = "$targetDir\cyber_ns.cur"
$ew        = "$targetDir\cyber_ew.cur"
$nwse      = "$targetDir\cyber_nwse.cur"
$nesw      = "$targetDir\cyber_nesw.cur"
$move      = "$targetDir\cyber_move.cur"
$cross     = "$targetDir\cyber_crosshair.cur"
$unavail   = "$targetDir\cyber_unavail.cur"
$working   = "$targetDir\cyber_working.ani"
$busy      = "$targetDir\cyber_busy.ani"
$help      = "C:\WINDOWS\cursors\aero_helpsel.cur"
$pen       = "C:\WINDOWS\cursors\aero_pen.cur"

$schemeStr = "$normal,$help,$working,$busy,$cross,$text,$pen,$unavail,$ns,$ew,$nwse,$nesw,$move,$normal,$link,,"

# Ensure registry key exists
if (-not (Test-Path "HKCU:\Control Panel\Cursors\Schemes")) {
    New-Item -Path "HKCU:\Control Panel\Cursors\Schemes" -Force | Out-Null
}

# Save scheme
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors\Schemes" -Name "Cyber Security Reticle" -Value $schemeStr

# Apply to active cursor
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "Arrow" -Value $normal
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "Help" -Value $help
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "AppStarting" -Value $working
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "Wait" -Value $busy
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "Crosshair" -Value $cross
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "IBeam" -Value $text
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "NWPen" -Value $pen
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "No" -Value $unavail
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "SizeNS" -Value $ns
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "SizeWE" -Value $ew
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "SizeNWSE" -Value $nwse
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "SizeNESW" -Value $nesw
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "SizeAll" -Value $move
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "UpArrow" -Value $normal
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "Hand" -Value $link
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "(default)" -Value "Cyber Security Reticle"

# Trigger Windows API to reload cursors instantly
$code = @"
using System;
using System.Runtime.InteropServices;

public class WinCursorLive {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SystemParametersInfo(uint uiAction, uint uiParam, IntPtr pvParam, uint fWinIni);
}
"@
if (-not ([System.Management.Automation.PSTypeName]'WinCursorLive').Type) {
    Add-Type -TypeDefinition $code
}
[WinCursorLive]::SystemParametersInfo(0x0057, 0, [IntPtr]::Zero, 3) | Out-Null

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " CYBER SECURITY RETICLE FULL SUITE APPLIED!              " -ForegroundColor Green
Write-Host " Pointer: 1:1 Website Size (36px, 1.00s high-speed spin)  " -ForegroundColor Cyan
Write-Host " Links / Finger: Updated Emerald Cyber Targeting Lock     " -ForegroundColor Cyan
Write-Host " Text Bar: Updated Bracketed Cyber I-Beam                 " -ForegroundColor Cyan
Write-Host " Resizing: Updated 2-Way & 4-Way Cyber Directional Arrows " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
