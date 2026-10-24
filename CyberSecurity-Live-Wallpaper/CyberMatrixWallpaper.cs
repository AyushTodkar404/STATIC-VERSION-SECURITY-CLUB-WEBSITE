using System;
using System.Drawing;
using System.Drawing.Drawing2D;
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

        // Binary & English tokens
        private static readonly string[] BINARY_CHARS = { "0", "1", "0", "1", "0", "1", "1", "0" };
        private static readonly string[] HEX_CHARS = { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F" };
        private static readonly string[] SYMBOLS = { "$", "#", "*", "+", "-", "<", ">", "/", "_", ":", "|", "[", "]" };
        private static readonly string[] CYBER_WORDS = {
            "ROOT", "ACCESS", "BREACH", "CIPHER", "KERNEL", "PAYLOAD",
            "DECRYPT", "EXPLOIT", "BUFFER", "OVERFLOW", "SOCKET", "PACKET",
            "INTRUSION", "FIREWALL", "SECURITY", "DBIT", "AUTH", "HASH",
            "SHA256", "ZERO_DAY", "STEALTH", "SSH", "PORT", "NODE", "VULN",
            "SYSTEM", "INJECT", "MEMORY", "DAEMON", "PROXY", "SHELL"
        };

        private const int FONT_SIZE = 15;
        private int[] dropPositions;
        private string[] activeWordInCol;
        private int[] wordCharIndex;
        private Random random = new Random();
        private Font matrixFont;
        private Font hudFont;

        // Eye-friendly dark mode phosphor palette
        private readonly Color BG_COLOR = Color.FromArgb(2, 5, 8);
        private readonly Color GRID_COLOR = Color.FromArgb(24, 0, 229, 255);
        private readonly Color LEAD_COLOR = Color.FromArgb(110, 231, 183);      // Soft mint green
        private readonly Color WORD_LEAD_COLOR = Color.FromArgb(56, 189, 248);  // Crisp cyber cyan
        private readonly Color GREEN_CORE = Color.FromArgb(16, 185, 129);       // Muted emerald
        private readonly Color CYAN_TINT = Color.FromArgb(14, 165, 233);        // Calm sky blue
        private readonly Color GREEN_DIM = Color.FromArgb(5, 150, 105);
        private readonly Color GREEN_FAINT = Color.FromArgb(4, 120, 87);

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
                        previewHwnd = new IntPtr(long.Parse(args[1]));
                    }
                    else if (firstArg.Length > 2)
                    {
                        previewHwnd = new IntPtr(long.Parse(firstArg.Substring(2).Trim()));
                    }
                }
                else if (firstArg.StartsWith("/c"))
                {
                    MessageBox.Show("DBIT Cyber Security Club Live Matrix Wallpaper\nVersion 2.0 (Black Hat Edition)\nCreated for campus & desktop experience.", "Cyber Matrix Wallpaper", MessageBoxButtons.OK, MessageBoxIcon.Information);
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

            try { matrixFont = new Font("Consolas", 10.5F, FontStyle.Bold); }
            catch { matrixFont = new Font(FontFamily.GenericMonospace, 10.5F, FontStyle.Bold); }

            hudFont = new Font("Consolas", 8F, FontStyle.Bold);

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

            InitMatrix();

            animTimer = new System.Windows.Forms.Timer();
            animTimer.Interval = 45; // ~22 FPS: smooth, battery-efficient, authentic terminal cadence
            animTimer.Tick += (s, e) => {
                UpdateMatrix();
                Invalidate();
            };
            animTimer.Start();
        }

        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);
            if (!isScreensaver && !isPreview)
            {
                AttachToDesktopWorkerW();
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
                menu.Items.Add("DBIT Cyber Security Club Live Wallpaper").Enabled = false;
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
                    Text = "Security Club Live Matrix Wallpaper",
                    ContextMenuStrip = menu,
                    Visible = true
                };
            }
            catch { }
        }

        private void InitMatrix()
        {
            int cols = Math.Max(10, Width / FONT_SIZE);
            dropPositions = new int[cols];
            activeWordInCol = new string[cols];
            wordCharIndex = new int[cols];

            for (int i = 0; i < cols; i++)
            {
                dropPositions[i] = random.Next(-50, 0);
                activeWordInCol[i] = null;
                wordCharIndex[i] = 0;
            }
        }

        private string GetRandomToken()
        {
            double r = random.NextDouble();
            if (r < 0.70)
            {
                // 70% Binary numbers
                return BINARY_CHARS[random.Next(BINARY_CHARS.Length)];
            }
            else if (r < 0.88)
            {
                // 18% Hexadecimal
                return HEX_CHARS[random.Next(HEX_CHARS.Length)];
            }
            else
            {
                // 12% English cyber symbols
                return SYMBOLS[random.Next(SYMBOLS.Length)];
            }
        }

        private void UpdateMatrix()
        {
            int cols = dropPositions.Length;
            int maxRows = Height / FONT_SIZE;

            for (int i = 0; i < cols; i++)
            {
                dropPositions[i]++;

                // Occasionally drop an English cybersecurity word
                if (activeWordInCol[i] == null && random.NextDouble() < 0.008 && dropPositions[i] > 0)
                {
                    activeWordInCol[i] = CYBER_WORDS[random.Next(CYBER_WORDS.Length)];
                    wordCharIndex[i] = 0;
                }

                if (dropPositions[i] > maxRows && random.NextDouble() > 0.96)
                {
                    dropPositions[i] = random.Next(-30, 0);
                    activeWordInCol[i] = null;
                }
            }
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            Graphics g = e.Graphics;

            // 1. Draw Hacker Backdrop
            if (hackerBackdrop != null)
            {
                g.DrawImage(hackerBackdrop, new Rectangle(0, 0, Width, Height));

                // Left vignette for desktop icon protection
                using (Brush darkL = new SolidBrush(Color.FromArgb(170, 2, 5, 8)))
                {
                    g.FillRectangle(darkL, 0, 0, (int)(Width * 0.35), Height);
                }
                using (Brush darkOverall = new SolidBrush(Color.FromArgb(100, 2, 5, 8)))
                {
                    g.FillRectangle(darkOverall, 0, 0, Width, Height);
                }
            }
            else
            {
                g.Clear(BG_COLOR);
            }

            // 2. Clearly Visible Tactical Cyber Gridlines (52px spacing)
            using (Pen gridPen = new Pen(GRID_COLOR, 1))
            {
                for (int x = 0; x < Width; x += 52)
                {
                    g.DrawLine(gridPen, x, 0, x, Height);
                }
                for (int y = 0; y < Height; y += 52)
                {
                    g.DrawLine(gridPen, 0, y, Width, y);
                }
            }

            // 3. Falling Matrix Code Stream (Binary + English)
            using (SolidBrush leadBrush = new SolidBrush(LEAD_COLOR))
            using (SolidBrush wordLeadBrush = new SolidBrush(WORD_LEAD_COLOR))
            using (SolidBrush greenBrush = new SolidBrush(GREEN_CORE))
            using (SolidBrush cyanBrush = new SolidBrush(CYAN_TINT))
            using (SolidBrush dimBrush = new SolidBrush(GREEN_DIM))
            using (SolidBrush faintBrush = new SolidBrush(GREEN_FAINT))
            {
                for (int i = 0; i < dropPositions.Length; i++)
                {
                    int x = i * FONT_SIZE;
                    int y = dropPositions[i] * FONT_SIZE;

                    if (y >= -FONT_SIZE && y < Height + FONT_SIZE)
                    {
                        string charToDraw = GetRandomToken();
                        bool isWord = false;

                        if (activeWordInCol[i] != null && wordCharIndex[i] < activeWordInCol[i].Length)
                        {
                            charToDraw = activeWordInCol[i][wordCharIndex[i]].ToString();
                            wordCharIndex[i]++;
                            isWord = true;
                            if (wordCharIndex[i] >= activeWordInCol[i].Length)
                            {
                                activeWordInCol[i] = null;
                            }
                        }

                        // Lead glowing character
                        g.DrawString(charToDraw, matrixFont, isWord ? wordLeadBrush : leadBrush, x, y);

                        // Second character (Green)
                        int y1 = y - FONT_SIZE;
                        if (y1 >= 0 && y1 < Height)
                        {
                            g.DrawString(GetRandomToken(), matrixFont, greenBrush, x, y1);
                        }

                        // Third character (Cyan)
                        int y2 = y - FONT_SIZE * 2;
                        if (y2 >= 0 && y2 < Height)
                        {
                            g.DrawString(GetRandomToken(), matrixFont, cyanBrush, x, y2);
                        }

                        // Tail characters (Dim / Faint green)
                        for (int t = 3; t < 10; t++)
                        {
                            int yt = y - FONT_SIZE * t;
                            if (yt >= 0 && yt < Height)
                            {
                                g.DrawString(GetRandomToken(), matrixFont, (t < 6) ? dimBrush : faintBrush, x, yt);
                            }
                        }
                    }
                }
            }

            // 4. HUD Telemetry Header & Footer
            if (!isPreview)
            {
                // Top Header Box
                string topText = "DBIT SECURITY CLUB // BLACK HAT TERMINAL · FEED: BINARY_STREAM";
                SizeF topSize = g.MeasureString(topText, hudFont);
                using (SolidBrush bgB = new SolidBrush(Color.FromArgb(180, 2, 6, 10)))
                using (Pen bPen = new Pen(Color.FromArgb(100, 0, 229, 255), 1))
                using (SolidBrush tB = new SolidBrush(Color.FromArgb(220, 0, 229, 255)))
                {
                    g.FillRectangle(bgB, 20, 15, topSize.Width + 24, topSize.Height + 10);
                    g.DrawRectangle(bPen, 20, 15, topSize.Width + 24, topSize.Height + 10);
                    g.DrawString(topText, hudFont, tB, 32, 20);
                }

                // Bottom Badge
                string botText = "SYSTEM: ONLINE · STATUS: ARMED // ZERO_LOGS · 127.0.0.1:443";
                SizeF botSize = g.MeasureString(botText, hudFont);
                float bx = Width - botSize.Width - 35;
                float by = Height - botSize.Height - 20;

                using (SolidBrush bgB = new SolidBrush(Color.FromArgb(180, 2, 6, 10)))
                using (Pen bPen = new Pen(Color.FromArgb(100, 0, 255, 120), 1))
                using (SolidBrush tB = new SolidBrush(Color.FromArgb(220, 0, 255, 120)))
                using (SolidBrush dotB = new SolidBrush(Color.FromArgb(255, 0, 255, 120)))
                {
                    g.FillRectangle(bgB, bx - 14, by - 4, botSize.Width + 28, botSize.Height + 8);
                    g.DrawRectangle(bPen, bx - 14, by - 4, botSize.Width + 28, botSize.Height + 8);
                    g.FillEllipse(dotB, bx - 8, by + botSize.Height / 2 - 3, 6, 6);
                    g.DrawString(botText, hudFont, tB, bx + 4, by);
                }
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
            base.OnFormClosed(e);
        }
        #endregion
    }
}
