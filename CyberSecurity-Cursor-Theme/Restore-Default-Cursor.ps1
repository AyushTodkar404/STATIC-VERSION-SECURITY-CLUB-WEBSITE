# Restore standard Windows default cursor scheme
$ErrorActionPreference = "Stop"

Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "Arrow" -Value "C:\WINDOWS\cursors\aero_arrow.cur"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "Help" -Value "C:\WINDOWS\cursors\aero_helpsel.cur"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "AppStarting" -Value "C:\WINDOWS\cursors\aero_working.ani"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "Wait" -Value "C:\WINDOWS\cursors\aero_busy.ani"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "Crosshair" -Value ""
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "IBeam" -Value ""
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "NWPen" -Value "C:\WINDOWS\cursors\aero_pen.cur"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "No" -Value "C:\WINDOWS\cursors\aero_unavail.cur"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "SizeNS" -Value "C:\WINDOWS\cursors\aero_ns.cur"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "SizeWE" -Value "C:\WINDOWS\cursors\aero_ew.cur"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "SizeNWSE" -Value "C:\WINDOWS\cursors\aero_nwse.cur"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "SizeNESW" -Value "C:\WINDOWS\cursors\aero_nesw.cur"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "SizeAll" -Value "C:\WINDOWS\cursors\aero_move.cur"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "UpArrow" -Value "C:\WINDOWS\cursors\aero_up.cur"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "Hand" -Value "C:\WINDOWS\cursors\aero_link.cur"
Set-ItemProperty -Path "HKCU:\Control Panel\Cursors" -Name "(default)" -Value "Windows Default"

$code = @"
using System;
using System.Runtime.InteropServices;

public class WinCursorReset {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool SystemParametersInfo(uint uiAction, uint uiParam, IntPtr pvParam, uint fWinIni);
}
"@
if (-not ([System.Management.Automation.PSTypeName]'WinCursorReset').Type) {
    Add-Type -TypeDefinition $code
}
[WinCursorReset]::SystemParametersInfo(0x0057, 0, [IntPtr]::Zero, 3) | Out-Null

Write-Host "Restored standard Windows default cursor scheme." -ForegroundColor Yellow
