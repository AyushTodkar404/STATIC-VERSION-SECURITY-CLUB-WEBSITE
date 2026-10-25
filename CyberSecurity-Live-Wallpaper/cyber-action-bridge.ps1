$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:38281/")
try {
    $listener.Start()
    Write-Host "Cyber Action Bridge active on http://127.0.0.1:38281/"
} catch {
    Write-Host "Bridge already active or port claimed: $_"
    exit 0
}

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class WinActions {
    [DllImport("user32.dll", SetLastError = true)]
    public static extern bool LockWorkStation();

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

    [DllImport("powrprof.dll", SetLastError = true)]
    public static extern bool SetSuspendState(bool hibernate, bool forceCritical, bool disableWakeEvent);

    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);

    public static void Sleep() {
        try { SendMessage((IntPtr)0xFFFF, 0x0112, (IntPtr)0xF170, (IntPtr)2); } catch {}
        try { SetSuspendState(false, true, false); } catch {}
    }

    public static void RestartGpu() {
        try {
            keybd_event(0x5B, 0, 0, 0); // Win down
            keybd_event(0x11, 0, 0, 0); // Ctrl down
            keybd_event(0x10, 0, 0, 0); // Shift down
            keybd_event(0x42, 0, 0, 0); // B down

            keybd_event(0x42, 0, 2, 0); // B up
            keybd_event(0x10, 0, 2, 0); // Shift up
            keybd_event(0x11, 0, 2, 0); // Ctrl up
            keybd_event(0x5B, 0, 2, 0); // Win up
        } catch {}
    }
}
"@ -ErrorAction SilentlyContinue

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "*")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        $cmd = $request.QueryString["cmd"]
        if (-not $cmd) {
            $cmd = $request.RawUrl.TrimStart("/").Split("?")[0]
        }

        switch ($cmd.ToLower()) {
            "lock" {
                [WinActions]::LockWorkStation()
            }
            "poweroff" {
                shutdown.exe /s /t 0
            }
            "shutdown" {
                shutdown.exe /s /t 0
            }
            "restart" {
                shutdown.exe /r /t 0
            }
            "sleep" {
                [WinActions]::Sleep()
            }
            "gpu-restart" {
                [WinActions]::RestartGpu()
            }
            "restart-gpu" {
                [WinActions]::RestartGpu()
            }
            "taskmgr" {
                Start-Process taskmgr.exe
            }
            "settings" {
                Start-Process ms-settings:
            }
        }

        $buffer = [System.Text.Encoding]::UTF8.GetBytes("{`"ok`":true,`"action`":`"$cmd`"}")
        $response.ContentType = "application/json"
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.Close()
    } catch {
        # Keep listening even on transient error
    }
}
