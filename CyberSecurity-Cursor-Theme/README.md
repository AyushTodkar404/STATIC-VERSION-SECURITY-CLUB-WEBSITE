# 🎯 Cyber Security Reticle Cursor Suite & Desktop HUD (v3.0)

A 1:1 pixel-accurate Windows mouse cursor suite and desktop targeting HUD directly ported from the **DBIT Cyber Security Club** website.

---

## 🚀 Two Ways to Use

### 1. Dynamic Desktop HUD (`CyberReticleHUD.exe`) — *Matches Screenshots 1, 2, & 3!*
This provides the **exact dynamic element-selection behavior**:
- **When Idle (Screenshot 2 & 3)**: The 4 cyan corner brackets continuously rotate at 2.80s per revolution around the optic white center dot.
- **When Hovering Any Option (Screenshot 1)**: As you move over buttons, desktop icons, photos, or window controls anywhere on Windows, **the 4 corner brackets smoothly expand to frame and select the entire element**, while the white dot moves inside!
- **Click Feedback**: Holding left-click pulses the center dot to 0.7x scale.
- **Toggle Hotkey**: Press **`Ctrl + Shift + C`** anytime to toggle the HUD on/off.
- **Control**:
  - Run **[`Start-CyberReticle-HUD.bat`](file:///c:/SECURITY%20CLUB%20STATIC%20PAGE/CyberSecurity-Cursor-Theme/Start-CyberReticle-HUD.bat)** to launch.
  - Run **[`Stop-CyberReticle-HUD.bat`](file:///c:/SECURITY%20CLUB%20STATIC%20PAGE/CyberSecurity-Cursor-Theme/Stop-CyberReticle-HUD.bat)** to quit.
  - Or right-click the cyan reticle icon in your Windows system tray.

---

### 2. Standard Windows Mouse Cursors (`.ani` & `.cur`)
If you want the reticle as your default Windows pointer without running a background HUD:
- **Instant Live Apply**: Double-click **[`Apply-Cursor.bat`](file:///c:/SECURITY%20CLUB%20STATIC%20PAGE/CyberSecurity-Cursor-Theme/Apply-Cursor.bat)**.
- **Permanent Windows Dropdown**: Right-click **[`Install.inf`](file:///c:/SECURITY%20CLUB%20STATIC%20PAGE/CyberSecurity-Cursor-Theme/Install.inf)** → click **Install**; it permanently registers under `main.cpl` (Mouse Properties) → **Pointers** as `"Cyber Security Reticle"`.
- **To Revert Anytime**: Double-click **[`Restore-Default-Cursor.bat`](file:///c:/SECURITY%20CLUB%20STATIC%20PAGE/CyberSecurity-Cursor-Theme/Restore-Default-Cursor.bat)**.

---

## 🌐 Website Live Features
On the website itself ([`cursor.js`](file:///c:/SECURITY%20CLUB%20STATIC%20PAGE/cursor.js)):
- Hovering over **gallery photos**, **team photos**, **event cards**, or **segmented year toggles (like `[ 2026 ]`)** automatically expands the four corner brackets to fully frame that element.
