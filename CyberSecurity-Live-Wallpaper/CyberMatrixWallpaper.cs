using System;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace CyberSecurityClub.LiveWallpaper
{
    public class CyberMatrixForm : Form
    {
        #region Win32 API
        [DllImport("user32.dll", SetLastError = true)]
        private static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

        [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        private static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam, uint fuFlags, uint uTimeout, out IntPtr lpdwResult);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);

        [DllImport("user32.dll")]
        private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
        private delegate bool EnumWindowsProc(IntPtr tophandle, IntPtr topparamhandle);

        [DllImport("user32.dll")]
        private static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);

        [DllImport("user32.dll")]
        private static extern int GetWindowLong(IntPtr hWnd, int nIndex);

        [DllImport("user32.dll")]
        private static extern bool GetClientRect(IntPtr hWnd, out RECT lpRect);

        [StructLayout(LayoutKind.Sequential)]
        public struct RECT { public int Left, Top, Right, Bottom; }

        private const int GWL_EXSTYLE = -20;
        private const int WS_EX_TOOLWINDOW = 0x00000080;
        private const int WS_EX_APPWINDOW = 0x00040000;
        private const int WS_CHILD = 0x40000000;
        private const int GWL_STYLE = -16;
        #endregion

        private bool isScreensaver = false;
        private bool isPreview = false;
        private Point mouseLocation;
        private System.Windows.Forms.Timer animTimer;
        private NotifyIcon trayIcon;
        private Image hackerBackdrop = null;
        private readonly Random random = new Random();
        private float[] dataPositions;
        private float[] dataSpeeds;
        private int[] dataLengths;
        private string[][] dataTokens;
        private string liveIp = "10.24.81.106";
        private int lastIpSecond = -1;
        private static readonly string[] BACKGROUND_TOKENS = { "0", "1", "A", "F", "7", "C" };

        // Eye-friendly dark mode phosphor palette
        private readonly Color BG_COLOR = Color.FromArgb(2, 5, 8);

        [STAThread]
        public static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string mode = "wallpaper";
            IntPtr previewHwnd = IntPtr.Zero;

            if (args.Length > 0)
            {
                string firstArg = args[0].ToLower().Trim();
                if (firstArg.StartsWith("/s"))
                {
                    mode = "screensaver";
                }
                else if (firstArg.StartsWith("/p"))
                {
                    mode = "preview";
                    if (args.Length > 1)
                    {
                        long previewHandle;
                        if (long.TryParse(args[1], out previewHandle))
                        {
                            previewHwnd = new IntPtr(previewHandle);
                        }
                    }
                    else if (firstArg.Length > 2)
                    {
                        long previewHandle;
                        if (long.TryParse(firstArg.Substring(2).Trim(), out previewHandle))
                        {
                            previewHwnd = new IntPtr(previewHandle);
                        }
                    }
                }
                else if (firstArg.StartsWith("/c"))
                {
                    MessageBox.Show("Live Matrix Wallpaper\nVersion 2.0", "Live Matrix Wallpaper", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    return;
                }
            }

            string exeName = AppDomain.CurrentDomain.FriendlyName.ToLower();
            if (exeName.EndsWith(".scr") && mode == "wallpaper")
            {
                mode = "screensaver";
            }

            CyberMatrixForm form = new CyberMatrixForm(mode, previewHwnd);
            Application.Run(form);
        }

        public CyberMatrixForm(string mode, IntPtr previewHwnd)
        {
            SetStyle(ControlStyles.OptimizedDoubleBuffer | ControlStyles.AllPaintingInWmPaint | ControlStyles.UserPaint, true);
            UpdateStyles();

            DoubleBuffered = true;
            BackColor = BG_COLOR;
            FormBorderStyle = FormBorderStyle.None;
            ShowInTaskbar = false;

            // Load hacker background image if present
            string imgPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "hacker.jpg");
            if (File.Exists(imgPath))
            {
                try { hackerBackdrop = Image.FromFile(imgPath); } catch { }
            }

            if (mode == "preview" && previewHwnd != IntPtr.Zero)
            {
                isPreview = true;
                SetParent(this.Handle, previewHwnd);
                SetWindowLong(this.Handle, GWL_STYLE, GetWindowLong(this.Handle, GWL_STYLE) | WS_CHILD);
                RECT rect;
                GetClientRect(previewHwnd, out rect);
                Size = new Size(rect.Right - rect.Left, rect.Bottom - rect.Top);
                Location = new Point(0, 0);
            }
            else if (mode == "screensaver")
            {
                isScreensaver = true;
                StartPosition = FormStartPosition.Manual;
                Bounds = SystemInformation.VirtualScreen;
                TopMost = true;
                Cursor.Hide();
            }
            else
            {
                // Live Wallpaper Mode: attach behind desktop icons to WorkerW
                StartPosition = FormStartPosition.Manual;
                Bounds = SystemInformation.VirtualScreen;
                SetupTray();
            }

            animTimer = new System.Windows.Forms.Timer();
            animTimer.Interval = 45; // ~22 FPS: smooth, battery-efficient, authentic terminal cadence
            animTimer.Tick += (s, e) => Invalidate();
            animTimer.Start();
            InitializeBackgroundData();
        }

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            if (!isScreensaver && !isPreview)
            {
                AttachToDesktopWorkerW();
            }
        }

        private void InitializeBackgroundData()
            {
                int columns = Math.Max(12, Width / 56);
                dataPositions = new float[columns];
                dataSpeeds = new float[columns];
                dataLengths = new int[columns];
                dataTokens = new string[columns][];
                for (int i = 0; i < columns; i++)
                {
                    dataPositions[i] = random.Next(0, Math.Max(1, Height));
                    dataSpeeds[i] = 0.12f + (float)random.NextDouble() * 0.25f;
                    dataLengths[i] = random.Next(4, 11);
                    dataTokens[i] = CreateDataTokens(dataLengths[i]);
                }
            }

            private string[] CreateDataTokens(int length)
            {
                string[] tokens = new string[length];
                for (int i = 0; i < tokens.Length; i++)
                {
                    tokens[i] = BACKGROUND_TOKENS[random.Next(BACKGROUND_TOKENS.Length)];
                }
                return tokens;
            }

            private void DrawBackgroundData(Graphics g)
            {
                if (dataPositions == null) return;
                using (Font dataFont = new Font("Consolas", 11F, FontStyle.Bold))
                using (SolidBrush leadBrush = new SolidBrush(Color.FromArgb(105, 92, 236, 255)))
                using (SolidBrush trailBrush = new SolidBrush(Color.FromArgb(55, 0, 255, 136)))
                {
                    for (int i = 0; i < dataPositions.Length; i++)
                    {
                        float x = i * 56 + 8;
                        for (int row = 0; row < dataLengths[i]; row++)
                        {
                            float y = dataPositions[i] - row * 15;
                            if (y >= -15 && y <= Height + 15)
                            {
                                g.DrawString(dataTokens[i][row],
                                    dataFont, row == 0 ? leadBrush : trailBrush, x, y);
                            }
                        }
                        dataPositions[i] += dataSpeeds[i];
                        if (dataPositions[i] - dataLengths[i] * 15 > Height)
                        {
                            dataPositions[i] = -random.Next(30, 160);
                            dataLengths[i] = random.Next(4, 11);
                            dataTokens[i] = CreateDataTokens(dataLengths[i]);
                        }
                    }
                }
            }

        private void AttachToDesktopWorkerW()
        {
            try
            {
                IntPtr progman = FindWindow("Progman", null);
                IntPtr result = IntPtr.Zero;

                // Send 0x052C to Progman to spawn WorkerW
                SendMessageTimeout(progman, 0x052C, new IntPtr(0), IntPtr.Zero, 0, 1000, out result);

                IntPtr workerw = IntPtr.Zero;
                EnumWindows((tophandle, topparamhandle) =>
                {
                    IntPtr shellView = FindWindowEx(tophandle, IntPtr.Zero, "SHELLDLL_DefView", null);
                    if (shellView != IntPtr.Zero)
                    {
                        workerw = FindWindowEx(IntPtr.Zero, tophandle, "WorkerW", null);
                    }
                    return true;
                }, IntPtr.Zero);

                IntPtr target = (workerw != IntPtr.Zero) ? workerw : progman;
                if (target != IntPtr.Zero)
                {
                    SetParent(this.Handle, target);
                }

                // Keep toolwindow style to prevent appearing in Alt+Tab
                int exStyle = GetWindowLong(this.Handle, GWL_EXSTYLE);
                SetWindowLong(this.Handle, GWL_EXSTYLE, (exStyle | WS_EX_TOOLWINDOW) & ~WS_EX_APPWINDOW);
            }
            catch { }
        }

        private void SetupTray()
        {
            try
            {
                ContextMenuStrip menu = new ContextMenuStrip();
                menu.Items.Add("Live Matrix Wallpaper").Enabled = false;
                menu.Items.Add(new ToolStripSeparator());
                menu.Items.Add("Exit Wallpaper", null, (s, e) => Application.Exit());

                Bitmap iconBmp = new Bitmap(16, 16);
                using (Graphics g = Graphics.FromImage(iconBmp))
                {
                    g.Clear(Color.Transparent);
                    using (Pen p = new Pen(Color.FromArgb(0, 229, 255), 2))
                    {
                        g.DrawRectangle(p, 1, 1, 13, 13);
                    }
                    using (Brush b = new SolidBrush(Color.FromArgb(0, 255, 120)))
                    {
                        g.FillRectangle(b, 5, 5, 6, 6);
                    }
                }

                trayIcon = new NotifyIcon
                {
                    Icon = Icon.FromHandle(iconBmp.GetHicon()),
                    Text = "Live Matrix Wallpaper",
                    ContextMenuStrip = menu,
                    Visible = true
                };
            }
            catch { }
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            Graphics g = e.Graphics;

            // 1. Draw Hacker Backdrop
            if (hackerBackdrop != null)
            {
                g.DrawImage(hackerBackdrop, new Rectangle(0, 0, Width, Height));

                // Left vignette for desktop icon protection
                using (Brush darkL = new SolidBrush(Color.FromArgb(130, 2, 5, 8)))
                {
                    g.FillRectangle(darkL, 0, 0, (int)(Width * 0.35), Height);
                }
                using (Brush darkOverall = new SolidBrush(Color.FromArgb(45, 2, 5, 8)))
                {
                    g.FillRectangle(darkOverall, 0, 0, Width, Height);
                }
            }
            else
            {
                g.Clear(BG_COLOR);
            }

            // 2. Sparse moving data behind the hacker
            DrawBackgroundData(g);

            // 3. Clearly Visible Tactical Cyber Gridlines (52px spacing)
            int gridPulse = 34 + (int)(10 * (0.5 + 0.5 * Math.Sin(Environment.TickCount / 900.0)));
            using (Pen gridGlowPen = new Pen(Color.FromArgb(gridPulse / 2, 0, 229, 255), 3))
            using (Pen gridPen = new Pen(Color.FromArgb(gridPulse, 0, 229, 255), 1))
            {
                for (int x = 0; x < Width; x += 52)
                {
                    g.DrawLine(gridGlowPen, x, 0, x, Height);
                    g.DrawLine(gridPen, x, 0, x, Height);
                }
                for (int y = 0; y < Height; y += 52)
                {
                    g.DrawLine(gridGlowPen, 0, y, Width, y);
                    g.DrawLine(gridPen, 0, y, Width, y);
                }
            }

            // 4. Seven-segment digital clock
            if (!isPreview)
            {
                int currentSecond = DateTime.Now.Second;
                if (currentSecond != lastIpSecond)
                {
                    lastIpSecond = currentSecond;
                    liveIp = "10." + random.Next(20, 40) + "." + random.Next(0, 256) + "." + random.Next(10, 250);
                }
                string clockText = DateTime.Now.ToString("HH:mm:ss");
                // Query live laptop battery status via Windows PowerStatus
                PowerStatus power = SystemInformation.PowerStatus;
                int batPct = (int)(power.BatteryLifePercent * 100);
                if (batPct < 0 || batPct > 100) batPct = 100;
                bool isAc = (power.PowerLineStatus == PowerLineStatus.Online);
                string batText = isAc ? string.Format("BAT {0}% [AC]", batPct) : string.Format("BAT {0}%", batPct);

                const int digitWidth = 16;
                const int digitHeight = 28;
                const int digitGap = 4;
                const int colonWidth = 8;
                const int topbarHeight = 12;
                const int dateHeight = 12;
                int clockWidth = digitWidth * 6 + digitGap * 5 + colonWidth * 2;
                int clockX = Width - clockWidth - 30;
                int clockY = 28;
                int boxHeight = digitHeight + topbarHeight + dateHeight + 16;

                string dateText = DateTime.Now.ToString("ddd, dd MMM yyyy").ToUpper();

                using (SolidBrush bgB = new SolidBrush(Color.FromArgb(195, 2, 6, 12)))
                using (Pen bPen = new Pen(Color.FromArgb(100, 0, 229, 255), 1))
                using (Font batFont = new Font("Consolas", 6.8F, FontStyle.Bold))
                using (Font dateFont = new Font("Consolas", 6.6F, FontStyle.Bold))
                using (SolidBrush batBrush = new SolidBrush(isAc ? Color.FromArgb(240, 56, 189, 248) : (batPct <= 20 ? Color.FromArgb(245, 255, 42, 75) : Color.FromArgb(220, 0, 255, 136))))
                using (SolidBrush liveTagBrush = new SolidBrush(Color.FromArgb(220, 255, 42, 75)))
                using (SolidBrush dateBrush = new SolidBrush(Color.FromArgb(190, 141, 239, 255)))
                {
                    g.FillRectangle(bgB, clockX - 10, clockY - 18, clockWidth + 20, boxHeight);
                    g.DrawRectangle(bPen, clockX - 10, clockY - 18, clockWidth + 20, boxHeight);
                    g.DrawString("LIVE", batFont, liveTagBrush, clockX - 4, clockY - 15);
                    g.DrawString(batText, batFont, batBrush, clockX + clockWidth - 68, clockY - 15);
                    g.DrawString(dateText, dateFont, dateBrush, clockX - 4, clockY + digitHeight + 6);
                }

                int cursorX = clockX;
                for (int i = 0; i < clockText.Length; i++)
                {
                    if (clockText[i] == ':')
                    {
                        using (SolidBrush colonBrush = new SolidBrush(Color.FromArgb(245, 255, 42, 75)))
                        {
                            g.FillEllipse(colonBrush, cursorX + 2, clockY + 6, 4, 4);
                            g.FillEllipse(colonBrush, cursorX + 2, clockY + 16, 4, 4);
                        }
                        cursorX += colonWidth + digitGap;
                    }
                    else
                    {
                        DrawSevenSegmentDigit(g, clockText[i] - '0', cursorX, clockY, digitWidth, digitHeight);
                        cursorX += digitWidth + digitGap;
                    }
                }

                const int ipWidth = 164;
                const int ipHeight = 40;
                int ipX = Width - ipWidth - 30;
                int ipY = Height - ipHeight - 22;
                using (SolidBrush ipBg = new SolidBrush(Color.FromArgb(205, 2, 6, 12)))
                using (Pen ipBorder = new Pen(Color.FromArgb(120, 255, 42, 75), 1))
                using (Pen ipAccent = new Pen(Color.FromArgb(240, 255, 42, 75), 3))
                using (Font ipLabelFont = new Font("Consolas", 7F, FontStyle.Bold))
                using (Font ipFont = new Font("Consolas", 10F, FontStyle.Bold))
                using (SolidBrush ipLabelBrush = new SolidBrush(Color.FromArgb(180, 255, 133, 151)))
                using (SolidBrush ipBrush = new SolidBrush(Color.FromArgb(245, 255, 42, 75)))
                {
                    g.FillRectangle(ipBg, ipX, ipY, ipWidth, ipHeight);
                    g.DrawRectangle(ipBorder, ipX, ipY, ipWidth, ipHeight);
                    g.DrawLine(ipAccent, ipX + ipWidth - 2, ipY, ipX + ipWidth - 2, ipY + ipHeight);
                    g.DrawString("REMOTE NODE", ipLabelFont, ipLabelBrush, ipX + 10, ipY + 6);
                    g.DrawString(liveIp, ipFont, ipBrush, ipX + 10, ipY + 20);
                }
            }
        }

        private void DrawSevenSegmentDigit(Graphics g, int digit, int x, int y, int width, int height)
        {
            string[] patterns = {
                "abcdef", "bc", "abdeg", "abcdg", "bcfg",
                "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"
            };
            string active = patterns[digit];
            using (SolidBrush offBrush = new SolidBrush(Color.FromArgb(35, 75, 20, 25)))
            using (SolidBrush onBrush = new SolidBrush(Color.FromArgb(245, 255, 42, 75)))
            {
                Action<string, Point[]> draw = (segment, points) =>
                    g.FillPolygon(active.Contains(segment) ? onBrush : offBrush, points);

                int mid = y + height / 2 - 2;
                draw("a", new[] { new Point(x + 3, y), new Point(x + width - 3, y), new Point(x + width - 1, y + 3), new Point(x + width - 3, y + 5), new Point(x + 3, y + 5), new Point(x + 1, y + 3) });
                draw("g", new[] { new Point(x + 3, mid), new Point(x + width - 3, mid), new Point(x + width - 1, mid + 2), new Point(x + width - 3, mid + 4), new Point(x + 3, mid + 4), new Point(x + 1, mid + 2) });
                draw("d", new[] { new Point(x + 3, y + height - 5), new Point(x + width - 3, y + height - 5), new Point(x + width - 1, y + height - 2), new Point(x + width - 3, y + height), new Point(x + 3, y + height), new Point(x + 1, y + height - 2) });
                draw("f", new[] { new Point(x, y + 4), new Point(x + 4, y + 2), new Point(x + 5, y + 5), new Point(x + 5, mid - 3), new Point(x + 2, mid - 1), new Point(x, mid - 3) });
                draw("b", new[] { new Point(x + width - 5, y + 2), new Point(x + width - 1, y + 4), new Point(x + width - 1, mid - 3), new Point(x + width - 4, mid - 1), new Point(x + width - 5, mid - 3), new Point(x + width - 5, y + 5) });
                draw("e", new[] { new Point(x, mid + 3), new Point(x + 2, mid + 1), new Point(x + 5, mid + 3), new Point(x + 5, y + height - 5), new Point(x + 4, y + height - 2), new Point(x, y + height - 4) });
                draw("c", new[] { new Point(x + width - 5, mid + 3), new Point(x + width - 1, mid + 1), new Point(x + width - 1, y + height - 4), new Point(x + width - 4, y + height - 2), new Point(x + width - 5, y + height - 5), new Point(x + width - 5, mid + 3) });
            }
        }

        #region Screensaver Interactivity
        protected override void OnMouseMove(MouseEventArgs e)
        {
            if (isScreensaver)
            {
                if (mouseLocation.IsEmpty)
                {
                    mouseLocation = e.Location;
                }
                else if (Math.Abs(mouseLocation.X - e.X) > 12 || Math.Abs(mouseLocation.Y - e.Y) > 12)
                {
                    Application.Exit();
                }
            }
            base.OnMouseMove(e);
        }

        protected override void OnKeyDown(KeyEventArgs e)
        {
            if (isScreensaver)
            {
                Application.Exit();
            }
            base.OnKeyDown(e);
        }

        protected override void OnFormClosed(FormClosedEventArgs e)
        {
            if (animTimer != null) animTimer.Stop();
            if (trayIcon != null)
            {
                trayIcon.Visible = false;
                trayIcon.Dispose();
            }
            if (isScreensaver) Cursor.Show();
            if (hackerBackdrop != null) hackerBackdrop.Dispose();
            base.OnFormClosed(e);
        }
        #endregion
    }
}
