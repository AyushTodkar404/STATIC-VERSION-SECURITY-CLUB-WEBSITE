# Testing Patterns

**Analysis Date:** 2026-11-04

## Test Framework

**Runner:**
- Node.js built-in JavaScript compiler and verification runtime (`node --check`).
- Assert-based programmatic integrity verification scripts.

**Run Commands:**

```bash
# Automated 5-Skill Full Verification Suite (Syntax, Manifests, Assets, Security Headers, Routing, A11y, CTF Cryptography)
node test.js
```

## Test File Organization

**Location:**
- Manifest verification runs directly against source files in `events/`, `team/`, `flagships/`, `awareness/`, `ctf/`, and `gallery/`.
- No bloated auxiliary `node_modules` or `__tests__` folders are committed.

## Common Manual Test Verification Scenarios

### 1. Hash Navigation & Route Transitions
- **Action:** Click each navigation link in order: Home, About, Security Awareness, Events, Flagships, Team, Gallery, Membership, Submission, Contact, CTF.
- **Verification:**
  - View loads corresponding template inside `<main id="app">`.
  - Window scrolls to top `(0, 0)`.
  - Active link state updates in header navigation.
  - Invalid routes (e.g. `#/unknown`) render the clean 404 template with return button.

### 2. CTF Challenge Sandbox
- **Action:** Navigate to `#/ctf`.
- **Verification:**
  - Category filters ("All", "WEB", "RECON", "CRYPTO", "OSINT") filter challenge cards.
  - Clicking "View Hint" expands hint accordion.
  - Entering invalid flag displays red error feedback.
  - Entering correct flag (e.g. `SC{welcome_to_security_club}`) displays success card, updates HUD score (+100 PTS), and persists progress across page reloads via `sessionStorage`.

### 3. Gallery Lightbox & Keyboard Trap
- **Action:** Navigate to `#/gallery` and click any photo.
- **Verification:**
  - Lightbox modal opens with full image, caption, and folder tag.
  - Pressing `Escape` key closes the lightbox.
  - Clicking outside the modal content or clicking `×` closes the lightbox.
  - Focus is trapped within modal while open.

### 4. Weak / Throttled Connection Resilience
- **Action:** Open Chrome DevTools > Network > Throttling > "Slow 3G" or "Fast 3G".
- **Verification:**
  - Splash screen progress bar advances smoothly.
  - Hard timeout ceiling (1.6s) triggers to prevent stalled loading state.
  - Matrix background stream remains smooth or gracefully falls back.
  - WebP images load asynchronously without blocking main thread.

### 5. Touch & Mobile Devices (Down to 320px)
- **Action:** Open Chrome DevTools Device Mode (iPhone SE 375px, Galaxy S8 360px).
- **Verification:**
  - Desktop custom cursor (`cursor.js`) is automatically hidden; native touch cursor remains active.
  - Header displays hamburger menu button.
  - Clicking hamburger toggles mobile slide-down menu cleanly.
  - Stream toggle button is hidden on small mobile viewports to prevent clutter.

---

*Testing analysis: 2026-11-04*
