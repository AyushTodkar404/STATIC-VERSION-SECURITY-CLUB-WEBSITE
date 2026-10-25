using System;
using System.Diagnostics;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace CyberActionBridge
{
    static class Program
    {
        [DllImport("user32.dll", SetLastError = true)]
        private static extern bool LockWorkStation();

        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        private static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

        [DllImport("powrprof.dll", SetLastError = true)]
        private static extern bool SetSuspendState(bool hibernate, bool forceCritical, bool disableWakeEvent);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

        [DllImport("user32.dll")]
        private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);

        // Win32 constants for monitor power / Modern Standby
        private const uint WM_SYSCOMMAND = 0x0112;
        private const int SC_MONITORPOWER = 0xF170;
        private const int MONITOR_OFF = 2;

        // Virtual key codes for Win + Ctrl + Shift + B (Graphics Driver Restart)
        private const int INPUT_KEYBOARD = 1;
        private const uint KEYEVENTF_KEYUP = 0x0002;
        private const byte VK_LWIN = 0x5B;
        private const byte VK_CONTROL = 0x11;
        private const byte VK_SHIFT = 0x10;
        private const byte VK_B = 0x42;

        [StructLayout(LayoutKind.Sequential)]
        private struct INPUT
        {
            public uint type;
            public KEYBDINPUT ki;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct KEYBDINPUT
        {
            public ushort wVk;
            public ushort wScan;
            public uint dwFlags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        private const string Prefix = "http://127.0.0.1:38281/";
        private static HttpListener listener;

        [STAThread]
        static void Main()
        {
            try
            {
                listener = new HttpListener();
                listener.Prefixes.Add(Prefix);
                listener.Start();
            }
            catch
            {
                // Port occupied or another instance already active
                return;
            }

            while (true)
            {
                try
                {
                    var ctx = listener.GetContext();
                    ThreadPool.QueueUserWorkItem(state => ProcessRequest((HttpListenerContext)state), ctx);
                }
                catch (ThreadAbortException)
                {
                    break;
                }
                catch
                {
                    Thread.Sleep(100);
                }
            }
        }

        private static void ProcessRequest(HttpListenerContext ctx)
        {
            try
            {
                var req = ctx.Request;
                var res = ctx.Response;

                res.AddHeader("Access-Control-Allow-Origin", "*");
                res.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                res.AddHeader("Access-Control-Allow-Headers", "*");

                if (req.HttpMethod == "OPTIONS")
                {
                    res.StatusCode = 200;
                    res.Close();
                    return;
                }

                string cmd = (req.QueryString["cmd"] ?? "").Trim().ToLower();
                if (string.IsNullOrEmpty(cmd))
                {
                    string raw = req.RawUrl ?? "";
                    int qIdx = raw.IndexOf('?');
                    if (qIdx >= 0) raw = raw.Substring(0, qIdx);
                    cmd = raw.Trim('/').ToLower();
                }

                string json = "{\"ok\":true,\"action\":\"" + cmd + "\"}";
                byte[] buf = Encoding.UTF8.GetBytes(json);
                res.ContentType = "application/json";
                res.ContentLength64 = buf.Length;
                res.OutputStream.Write(buf, 0, buf.Length);
                res.OutputStream.Flush();
                res.Close();

                if (!string.IsNullOrEmpty(cmd) && cmd != "status" && cmd != "ping")
                {
                    ThreadPool.QueueUserWorkItem(s => ExecuteCommand(cmd));
                }
            }
            catch
            {
                // Best effort response
            }
        }

        private static void ExecuteCommand(string cmd)
        {
            try
            {
                switch (cmd)
                {
                    case "lock":
                        LockWorkStation();
                        break;

                    case "poweroff":
                    case "shutdown":
                        Process.Start(new ProcessStartInfo
                        {
                            FileName = "shutdown.exe",
                            Arguments = "/s /t 0",
                            CreateNoWindow = true,
                            UseShellExecute = false
                        });
                        break;

                    case "restart":
                    case "reboot":
                        Process.Start(new ProcessStartInfo
                        {
                            FileName = "shutdown.exe",
                            Arguments = "/r /t 0",
                            CreateNoWindow = true,
                            UseShellExecute = false
                        });
                        break;

                    case "sleep":
                    case "standby":
                        TriggerSleep();
                        break;

                    case "gpu-restart":
                    case "restart-gpu":
                    case "restart-graphics":
                    case "gpureset":
                        RestartGraphicsDriver();
                        break;

                    case "taskmgr":
                        Process.Start(new ProcessStartInfo
                        {
                            FileName = "taskmgr.exe",
                            UseShellExecute = true
                        });
                        break;

                    case "settings":
                        Process.Start(new ProcessStartInfo
                        {
                            FileName = "ms-settings:",
                            UseShellExecute = true
                        });
                        break;
                }
            }
            catch
            {
            }
        }

        private static void TriggerSleep()
        {
            // 1. For Modern Standby (S0 Low Power Idle) on Windows 10/11 laptops, turning off the display immediately triggers S0 Sleep
            try
            {
                SendMessage((IntPtr)0xFFFF, WM_SYSCOMMAND, (IntPtr)SC_MONITORPOWER, (IntPtr)MONITOR_OFF);
            }
            catch { }

            // 2. Also call legacy SetSuspendState for traditional ACPI S3 desktops
            try
            {
                SetSuspendState(false, true, false);
            }
            catch { }
        }

        private static void RestartGraphicsDriver()
        {
            // Synthesize official Windows shortcut: Win + Ctrl + Shift + B
            try
            {
                INPUT[] inputs = new INPUT[]
                {
                    // Key Down: Win, Ctrl, Shift, B
                    CreateKeyInput(VK_LWIN, 0),
                    CreateKeyInput(VK_CONTROL, 0),
                    CreateKeyInput(VK_SHIFT, 0),
                    CreateKeyInput(VK_B, 0),

                    // Key Up: B, Shift, Ctrl, Win
                    CreateKeyInput(VK_B, KEYEVENTF_KEYUP),
                    CreateKeyInput(VK_SHIFT, KEYEVENTF_KEYUP),
                    CreateKeyInput(VK_CONTROL, KEYEVENTF_KEYUP),
                    CreateKeyInput(VK_LWIN, KEYEVENTF_KEYUP)
                };

                SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
            }
            catch { }

            // Secondary guarantee via keybd_event
            try
            {
                keybd_event(VK_LWIN, 0, 0, 0);
                keybd_event(VK_CONTROL, 0, 0, 0);
                keybd_event(VK_SHIFT, 0, 0, 0);
                keybd_event(VK_B, 0, 0, 0);

                keybd_event(VK_B, 0, KEYEVENTF_KEYUP, 0);
                keybd_event(VK_SHIFT, 0, KEYEVENTF_KEYUP, 0);
                keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0);
                keybd_event(VK_LWIN, 0, KEYEVENTF_KEYUP, 0);
            }
            catch { }
        }

        private static INPUT CreateKeyInput(byte vk, uint flags)
        {
            return new INPUT
            {
                type = INPUT_KEYBOARD,
                ki = new KEYBDINPUT
                {
                    wVk = vk,
                    wScan = 0,
                    dwFlags = flags,
                    time = 0,
                    dwExtraInfo = IntPtr.Zero
                }
            };
        }
    }
}
