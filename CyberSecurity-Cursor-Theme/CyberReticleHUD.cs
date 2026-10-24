using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Automation;
using System.Windows.Controls;
using System.Windows.Forms;
using System.Windows.Interop;
using System.Windows.Media;
using System.Windows.Media.Effects;
using System.Windows.Shapes;
using Application = System.Windows.Application;
using Point = System.Windows.Point;

namespace CyberSecurityClub.CursorHUD
{
    public class CyberHUDApp : Application
    {
        [STAThread]
        public static void Main()
        {
            try
            {
                File.AppendAllText("hud_debug.log", DateTime.Now + ": Main starting\n");
                CyberHUDApp app = new CyberHUDApp();
                app.ShutdownMode = ShutdownMode.OnExplicitShutdown;
                app.DispatcherUnhandledException += (s, ev) => {
                    File.AppendAllText("hud_debug.log", DateTime.Now + ": Dispatcher: " + ev.Exception + "\n");
                    ev.Handled = true;
                };
                AppDomain.CurrentDomain.UnhandledException += (s, ev) => {
                    File.AppendAllText("hud_debug.log", DateTime.Now + ": AppDomain: " + ev.ExceptionObject + "\n");
                };
                TaskScheduler.UnobservedTaskException += (s, ev) => {
                    File.AppendAllText("hud_debug.log", DateTime.Now + ": Task: " + ev.Exception + "\n");
                    ev.SetObserved();
                };
                app.Run();
                File.AppendAllText("hud_debug.log", DateTime.Now + ": app.Run() returned!\n");
            }
            catch (Exception ex)
            {
                File.AppendAllText("hud_debug.log", DateTime.Now + ": Main catch: " + ex + "\n");
            }
            finally
            {
                File.AppendAllText("hud_debug.log", DateTime.Now + ": Main finally block reached!\n");
            }
        }

        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            HUDWindow hud = new HUDWindow();
            hud.Show();
        }
    }

    public class HUDWindow : Window
    {
        #region Win32 Interop
        [StructLayout(LayoutKind.Sequential)]
        public struct POINT { public int X; public int Y; }

        [DllImport("user32.dll")]
        public static extern bool GetCursorPos(out POINT lpPoint);

        [DllImport("user32.dll")]
        public static extern short GetAsyncKeyState(int vKey);

        [DllImport("user32.dll")]
        public static extern int GetWindowLong(IntPtr hWnd, int nIndex);

        [DllImport("user32.dll")]
        public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

        [DllImport("user32.dll")]
        public static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

        [DllImport("user32.dll")]
        public static extern bool UnregisterHotKey(IntPtr hWnd, int id);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern bool SystemParametersInfo(uint uiAction, uint uiParam, IntPtr pvParam, uint fWinIni);

        [DllImport("user32.dll")]
        public static extern IntPtr LoadCursorFromFile(string lpFileName);

        [DllImport("user32.dll")]
        public static extern bool SetSystemCursor(IntPtr hcur, uint id);

        [DllImport("user32.dll")]
        public static extern IntPtr CopyIcon(IntPtr hIcon);

        [DllImport("user32.dll")]
        public static extern IntPtr WindowFromPoint(POINT Point);

        [DllImport("user32.dll")]
        public static extern IntPtr RealChildWindowFromPoint(IntPtr hwndParent, POINT ptParentClientCoords);

        [DllImport("user32.dll")]
        public static extern bool ScreenToClient(IntPtr hWnd, ref POINT lpPoint);

        [StructLayout(LayoutKind.Sequential)]
        public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }

        [DllImport("user32.dll")]
        public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);

        private const int WS_EX_TRANSPARENT = 0x00000020;
        private const int WS_EX_LAYERED     = 0x00080000;
        private const int WS_EX_TOOLWINDOW  = 0x00000080;
        private const int WS_EX_NOACTIVATE  = 0x08000000;
        private const int GWL_EXSTYLE       = -20;

        private const int VK_LBUTTON = 0x01;
        private const int VK_C       = 0x43;
        private const uint MOD_CONTROL = 0x0002;
        private const uint MOD_SHIFT   = 0x0004;
        private const int WM_HOTKEY    = 0x0312;
        private const uint SPI_SETCURSORS = 0x0057;
        #endregion

        private Canvas mainCanvas;
        private Ellipse centerDot;
        private ScaleTransform dotScale;
        private System.Windows.Shapes.Path[] corners = new System.Windows.Shapes.Path[4];
        private RotateTransform[] cornerRotations = new RotateTransform[4];

        private bool isHudActive = true;
        private bool isClicking = false;
        private bool isTargeting = false;
        private double idleAngle = 0;
        private DateTime lastFrameTime;

        private Point[] currentPositions = new Point[4];
        private Point[] targetPositions = new Point[4];
        private double currentDotScale = 1.0;

        private Rect currentTargetRect = Rect.Empty;
        private readonly object targetLock = new object();
        private CancellationTokenSource cts;

        private NotifyIcon trayIcon;
        private ContextMenuStrip trayMenu;
        private ToolStripMenuItem toggleItem;

        public HUDWindow()
        {
            WindowStyle = WindowStyle.None;
            AllowsTransparency = true;
            Background = System.Windows.Media.Brushes.Transparent;
            Topmost = true;
            ShowInTaskbar = false;

            // Cover full virtual desktop
            Left = SystemParameters.VirtualScreenLeft;
            Top = SystemParameters.VirtualScreenTop;
            Width = SystemParameters.VirtualScreenWidth;
            Height = SystemParameters.VirtualScreenHeight;

            mainCanvas = new Canvas();
            Content = mainCanvas;

            BuildVisuals();
            SetupTray();

            Loaded += OnWindowLoaded;
            Closed += OnWindowClosed;
        }

        private void BuildVisuals()
        {
            System.Windows.Media.Color cyanColor = System.Windows.Media.Color.FromArgb(255, 0, 229, 255);
            System.Windows.Media.Color whiteColor = System.Windows.Media.Color.FromArgb(255, 248, 250, 252);

            // Center Dot (6px diameter)
            centerDot = new Ellipse
            {
                Width = 6,
                Height = 6,
                Fill = new SolidColorBrush(whiteColor),
                Effect = new DropShadowEffect
                {
                    Color = cyanColor,
                    BlurRadius = 8,
                    ShadowDepth = 0,
                    Opacity = 0.95
                }
            };
            dotScale = new ScaleTransform(1.0, 1.0, 3.0, 3.0);
            centerDot.RenderTransform = dotScale;
            mainCanvas.Children.Add(centerDot);

            // 4 Corner Brackets (12px arm, 3px solid cyan border)
            // TL: corner-tl: 0 to 12
            // TR: corner-tr
            // BR: corner-br
            // BL: corner-bl
            string[] geoms = new string[]
            {
                "M 0,12 L 0,0 L 12,0",     // TL
                "M 0,0 L 12,0 L 12,12",    // TR
                "M 12,0 L 12,12 L 0,12",   // BR
                "M 12,12 L 0,12 L 0,0"     // BL
            };

            for (int i = 0; i < 4; i++)
            {
                corners[i] = new System.Windows.Shapes.Path
                {
                    Data = Geometry.Parse(geoms[i]),
                    Stroke = new SolidColorBrush(cyanColor),
                    StrokeThickness = 3.0,
                    StrokeStartLineCap = PenLineCap.Square,
                    StrokeEndLineCap = PenLineCap.Square,
                    Effect = new DropShadowEffect
                    {
                        Color = cyanColor,
                        BlurRadius = 10,
                        ShadowDepth = 0,
                        Opacity = 0.85
                    }
                };

                cornerRotations[i] = new RotateTransform(0, 6, 6);
                corners[i].RenderTransform = cornerRotations[i];
                mainCanvas.Children.Add(corners[i]);

                currentPositions[i] = new Point(0, 0);
                targetPositions[i] = new Point(0, 0);
            }
        }

        private void OnWindowLoaded(object sender, RoutedEventArgs e)
        {
            // Make transparent, click-through window
            IntPtr hwnd = new WindowInteropHelper(this).Handle;
            int exStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
            SetWindowLong(hwnd, GWL_EXSTYLE, exStyle | WS_EX_TRANSPARENT | WS_EX_LAYERED | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE);

            HwndSource source = HwndSource.FromHwnd(hwnd);
            if (source != null) source.AddHook(HwndHook);

            // Register Ctrl + Shift + C toggle hotkey
            RegisterHotKey(hwnd, 9001, MOD_CONTROL | MOD_SHIFT, VK_C);

            lastFrameTime = DateTime.Now;
            CompositionTarget.Rendering += OnRenderFrame;

            // Start background thread for UI Automation target detection
            cts = new CancellationTokenSource();
            Task.Factory.StartNew(() => TargetDetectionLoop(cts.Token), TaskCreationOptions.LongRunning);
        }

        private void OnWindowClosed(object sender, EventArgs e)
        {
            File.AppendAllText("hud_debug.log", DateTime.Now + ": OnWindowClosed called! StackTrace: " + Environment.StackTrace + "\n");
            CompositionTarget.Rendering -= OnRenderFrame;
            if (cts != null) cts.Cancel();

            IntPtr hwnd = new WindowInteropHelper(this).Handle;
            UnregisterHotKey(hwnd, 9001);

            if (trayIcon != null)
            {
                trayIcon.Visible = false;
                trayIcon.Dispose();
            }
        }

        private IntPtr HwndHook(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
        {
            if (msg == WM_HOTKEY && wParam.ToInt32() == 9001)
            {
                ToggleHUD();
                handled = true;
            }
            return IntPtr.Zero;
        }

        public void ToggleHUD()
        {
            isHudActive = !isHudActive;
            mainCanvas.Visibility = isHudActive ? Visibility.Visible : Visibility.Hidden;
            if (toggleItem != null) toggleItem.Checked = isHudActive;

            if (trayIcon != null)
            {
                trayIcon.ShowBalloonTip(1500, "Cyber Reticle HUD", isHudActive ? "HUD Active" : "HUD Paused (Press Ctrl+Shift+C to resume)", ToolTipIcon.Info);
            }
        }

        private void OnRenderFrame(object sender, EventArgs e)
        {
            if (!isHudActive) return;

            DateTime now = DateTime.Now;
            double dt = (now - lastFrameTime).TotalSeconds;
            lastFrameTime = now;
            if (dt <= 0 || dt > 0.1) dt = 0.016;

            POINT pt;
            if (!GetCursorPos(out pt)) return;

            // Check Left Click state
            bool clicking = (GetAsyncKeyState(VK_LBUTTON) & 0x8000) != 0;
            isClicking = clicking;

            // Relative to virtual screen
            double px = pt.X - Left;
            double py = pt.Y - Top;

            // Center dot follows mouse exactly
            Canvas.SetLeft(centerDot, px - 3);
            Canvas.SetTop(centerDot, py - 3);

            double targetScale = isClicking ? 0.70 : 1.0;
            currentDotScale += (targetScale - currentDotScale) * Math.Min(1.0, dt * 20.0);
            dotScale.ScaleX = currentDotScale;
            dotScale.ScaleY = currentDotScale;

            Rect targetRect;
            lock (targetLock) { targetRect = currentTargetRect; }

            bool hasTarget = !targetRect.IsEmpty;
            isTargeting = hasTarget;

            if (hasTarget)
            {
                // Expanding to frame the target element (Screenshot 1)
                double padding = 3.0;
                double cornerSize = 12.0;

                double left = targetRect.Left - Left - padding;
                double top = targetRect.Top - Top - padding;
                double right = targetRect.Right - Left + padding;
                double bottom = targetRect.Bottom - Top + padding;

                targetPositions[0] = new Point(left, top);                              // TL
                targetPositions[1] = new Point(right - cornerSize, top);                // TR
                targetPositions[2] = new Point(right - cornerSize, bottom - cornerSize);// BR
                targetPositions[3] = new Point(left, bottom - cornerSize);              // BL
            }
            else
            {
                // Free idle spinning reticle (Screenshot 2 & 3)
                // 1.00s per revolution
                idleAngle += dt * (360.0 / 1.00);
                if (idleAngle >= 360.0) idleAngle -= 360.0;

                double rad = idleAngle * (Math.PI / 180.0);
                double cosA = Math.Cos(rad);
                double sinA = Math.Sin(rad);

                // Idle corner offsets from center: [-18, 18]
                Point[] baseOffsets = new Point[]
                {
                    new Point(-18, -18),
                    new Point(6, -18),
                    new Point(6, 6),
                    new Point(-18, 6)
                };

                for (int i = 0; i < 4; i++)
                {
                    double rx = baseOffsets[i].X * cosA - baseOffsets[i].Y * sinA;
                    double ry = baseOffsets[i].X * sinA + baseOffsets[i].Y * cosA;
                    targetPositions[i] = new Point(px + rx, py + ry);
                }
            }

            // Snappy interpolation towards target positions
            double lerpSpeed = hasTarget ? 22.0 : 26.0;
            double factor = Math.Min(1.0, dt * lerpSpeed);

            for (int i = 0; i < 4; i++)
            {
                double nx = currentPositions[i].X + (targetPositions[i].X - currentPositions[i].X) * factor;
                double ny = currentPositions[i].Y + (targetPositions[i].Y - currentPositions[i].Y) * factor;
                currentPositions[i] = new Point(nx, ny);

                Canvas.SetLeft(corners[i], nx);
                Canvas.SetTop(corners[i], ny);

                // Rotate to 0 when targeting, or rotate with idle spin
                double curAngle = cornerRotations[i].Angle;
                double targetA = hasTarget ? 0.0 : idleAngle;
                cornerRotations[i].Angle = targetA;
            }
        }

        private void TargetDetectionLoop(CancellationToken token)
        {
            IntPtr ourHwnd = IntPtr.Zero;
            Dispatcher.Invoke(new Action(() => {
                ourHwnd = new WindowInteropHelper(this).Handle;
            }));

            while (!token.IsCancellationRequested)
            {
                try
                {
                    if (isHudActive)
                    {
                        POINT pt;
                        if (GetCursorPos(out pt))
                        {
                            Rect detected = Rect.Empty;
                            IntPtr hwnd = WindowFromPoint(pt);

                            if (hwnd != IntPtr.Zero && hwnd != ourHwnd)
                            {
                                // Check for child controls (buttons, edit boxes, tabs)
                                POINT clientPt = pt;
                                if (ScreenToClient(hwnd, ref clientPt))
                                {
                                    IntPtr child = RealChildWindowFromPoint(hwnd, clientPt);
                                    if (child != IntPtr.Zero && child != hwnd && child != ourHwnd)
                                    {
                                        hwnd = child;
                                    }
                                }

                                RECT r;
                                if (GetWindowRect(hwnd, out r))
                                {
                                    double w = r.Right - r.Left;
                                    double h = r.Bottom - r.Top;

                                    // Filter out whole screen/desktop
                                    if (w > 16 && h > 16 && w < 900 && h < 700)
                                    {
                                        detected = new Rect(r.Left, r.Top, w, h);
                                    }
                                }
                            }

                            lock (targetLock)
                            {
                                currentTargetRect = detected;
                            }
                        }
                    }
                }
                catch { }

                Thread.Sleep(30); // 33Hz UI detection polling
            }
        }

        private void SetupTray()
        {
            try
            {
                trayMenu = new ContextMenuStrip();
                toggleItem = new ToolStripMenuItem("Toggle HUD (Ctrl+Shift+C)", null, (s, e) => ToggleHUD());
                toggleItem.Checked = true;
                trayMenu.Items.Add(toggleItem);
                trayMenu.Items.Add(new ToolStripSeparator());
                trayMenu.Items.Add("Exit", null, (s, e) => Close());

                // Create a neat neon cyan tray icon
                Bitmap bmp = new Bitmap(16, 16);
                using (Graphics g = Graphics.FromImage(bmp))
                {
                    g.Clear(System.Drawing.Color.Transparent);
                    using (System.Drawing.Pen p = new System.Drawing.Pen(System.Drawing.Color.FromArgb(0, 229, 255), 2))
                    {
                        g.DrawRectangle(p, 2, 2, 11, 11);
                    }
                    using (System.Drawing.Brush b = new System.Drawing.SolidBrush(System.Drawing.Color.White))
                    {
                        g.FillEllipse(b, 6, 6, 4, 4);
                    }
                }

                trayIcon = new NotifyIcon
                {
                    Icon = System.Drawing.Icon.FromHandle(bmp.GetHicon()),
                    Text = "Cyber Security Reticle HUD",
                    ContextMenuStrip = trayMenu,
                    Visible = true
                };
                trayIcon.DoubleClick += (s, e) => ToggleHUD();
            }
            catch { }
        }
    }
}
