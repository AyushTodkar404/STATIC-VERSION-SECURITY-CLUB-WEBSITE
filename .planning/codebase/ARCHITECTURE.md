<!-- refreshed: 2026-11-04 -->
# Architecture

**Analysis Date:** 2026-11-04

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BROWSER ENTRYPOINT                              │
│                                `index.html`                                 │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│    Site Header/Nav   │  Splash Loader & HUD │    Background Matrix Canvas   │
│     `#site-nav`      │   `#splash-loader`   │     `#matrix-background`      │
└──────────┬───────────┴──────────┬───────────┴───────────────┬───────────────┘
           │                      │                           │
           ▼                      ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CORE RUNTIME CONTROLLER                             │
│                               `script.js`                                   │
│  - Hash Router: `route()` -> `render(pageKey)`                              │
│  - Shell Generator: `shell(pageKey, content)`                               │
│  - Interactive Modules: CTF sandbox, Gallery, Awareness, Events, Dispatch   │
└──────────┬──────────────────────┬───────────────────────────┬───────────────┘
           │                      │                           │
           ▼                      ▼                           ▼
┌──────────────────────┬──────────────────────┬───────────────────────────────┐
│   DATA MANIFESTS     │  SPECIALIZED VISUALS │     PERSISTENCE & OUTPUT      │
│ `events/events.js`   │ `SecurityLogoTrace`  │ - DOM Target: `<main id=app>` │
│ `team/team.js`       │ `SecurityLogoTrace.js│ - `sessionStorage` (CTF flags)│
│ `flagships/`         │ `SecurityLogoTrace.cs│ - External URI Dispatch       │
│ `gallery/gallery.js` │ `cursor.js` (HUD)    │   (Gmail Compose, WhatsApp)   │
│ `ctf/challenges.js`  │ `styles.css` (tokens)│                               │
│ `awareness/`         │                      │                               │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| **HTML Shell** | Defines document layout, accessibility structure, asset preloads, and root mount point | `index.html` |
| **Error Entrypoint** | Standalone GitHub Pages 404 handler with fallback navigation | `404.html` |
| **Router & Controller** | Single-page hash routing, page life-cycle hooks, event delegation | `script.js` |
| **Design System** | Global theme tokens, typography, grid system, animations, media queries | `styles.css` |
| **Vector Logo Engine** | Algorithmic SVG shield mesh generation and tracing animation | `SecurityLogoTrace.js` |
| **Logo Stylesheet** | Keyframes and layout constraints for dynamic vector logo | `SecurityLogoTrace.css` |
| **Custom Cursor HUD** | Cyber reticle cursor with interactive click bursts (touch-disabled) | `cursor.js` |
| **Events Data** | Chronological archive of workshops, bootcamps, and hackathons | `events/events.js` |
| **Flagships Data** | Signature annual programs and curriculums | `flagships/flagships.js` |
| **Team Directory** | Faculty mentors, core leads, and student council members | `team/team.js` |
| **Awareness Campaigns**| Security comics, campus posters, and educational guides | `awareness/awareness.js` |
| **CTF Challenges** | Hands-on challenge definitions, hints, point values, and flags | `ctf/challenges.js` |
| **Gallery Manifest** | Categorized folder image manifest for student events | `gallery/gallery.js` |

## Pattern Overview

**Overall:** Event-Driven Hash-Based Single Page Application (SPA).

**Key Characteristics:**
- **Zero Build Step:** Native ES Modules execute directly in modern browsers without compilation.
- **Declarative Data Binding:** Content data files expose structured arrays on `window.*Data`, decoupling visual rendering from content updates.
- **Progressive Enhancement:** Essential content renders cleanly if hardware canvas or custom cursors fail.
- **Fail-Safe Splash Sequence:** Splash screen finishes on asset load or falls back to a strict timer ceiling (1.1s–1.6s) to ensure instant usability on weak mobile connections.

## Layers

**1. Shell & Document Layer (`index.html`):**
- Purpose: Establishes document boundaries, meta headers, preloaded assets, sticky navigation, and initial splash loader.
- Location: `index.html`
- Contains: Semantic header, navigation drawer, background matrix canvas, `#app` mount container, footer.

**2. Client Controller Layer (`script.js`):**
- Purpose: Orchestrates routing, builds HTML page templates, and mounts interactive handlers.
- Location: `script.js`
- Contains:
  - `route()`: Parses `window.location.hash` (`#/events`, `#/team`, `#/ctf`, etc.).
  - `render(key)`: Selects markup generator for the route.
  - Interactive hooks: `setupGallery()`, `setupCtf()`, `setupAwareness()`, `setupEvents()`, `setupSplashLoader()`, `setupMatrix()`.

**3. Data Model Layer (`*/ *.js`):**
- Purpose: Separates content data from visual presentation.
- Locations: `events/events.js`, `team/team.js`, `flagships/flagships.js`, `awareness/awareness.js`, `gallery/gallery.js`, `ctf/challenges.js`.
- Contains: Pure JSON-like JavaScript objects attached to `window`.

**4. Visual Effects & Hardware Layer (`SecurityLogoTrace.js`, `cursor.js`, `styles.css`):**
- Purpose: Delivers cyber aesthetic (animated vector shield, Matrix digital rain, HUD reticle cursor).
- Locations: `SecurityLogoTrace.js`, `cursor.js`, `styles.css`, `SecurityLogoTrace.css`.

## Data Flow

### Primary Request / Route Path

1. User clicks navigation link or modifies URL hash (`index.html#/<page>`).
2. Global `hashchange` listener in `script.js` fires and triggers `route()`.
3. `route()` normalizes the key and calls `render(key)`.
4. `render(key)` executes the matching view generator (e.g., `eventsMarkup(window.eventsData)`).
5. The view generator builds HTML string and wraps it via `shell(key, content)`.
6. HTML string is assigned to `app.innerHTML`.
7. Post-mount setup routines execute (`setupEvents()`, `mountSecurityLogo()`, etc.).
8. View transitions scroll window to `(0, 0)`.

### CTF Flag Verification Flow

1. User enters flag token in challenge card form (`script.js:686`).
2. Form `submit` event intercepted; prevent default submission.
3. Entered flag compared against challenge definition (`ctf/challenges.js`).
4. If correct:
   - Challenge ID added to `solvedIds` array.
   - Solved state persisted to `window.sessionStorage` (`security-club-ctf-solved-v1`).
   - Card visually marked with success badge.
   - HUD score and solved counter updated in real-time.
5. If incorrect:
   - Form feedback shows immediate error prompt with hint reference.

## Key Abstractions

**Page Shell Abstraction:**
- Purpose: Standardizes consistent layout across all views (eyebrow, title, lede, actions, body).
- Implementation: `shell(key, content)` in `script.js`.

**Pill Group Filter Abstraction:**
- Purpose: Reusable segmented button controls for year filters, category tabs, and folder switches.
- Implementation: `bindPillGroup(buttons, callback)` in `script.js`.

**Image Resilient Loader:**
- Purpose: Handles lazy loading, decode priority, and error fallbacks.
- Implementation: `image(path, fallback, alt, className, priority)` in `script.js`.

## Entry Points

**Primary Entry Point:**
- Location: `index.html`
- Triggers: User loads root URL `https://securityclub.dbit.in/` or `index.html`.
- Responsibilities: Loads fonts, CSS, runs splash sequence, initializes canvas, executes `script.js`.

**404 Fallback Entry Point:**
- Location: `404.html`
- Triggers: Direct navigation to unrecognized static URL paths on GitHub Pages.
- Responsibilities: Provides graceful UI notice and redirect buttons back to `index.html#/`.

## Architectural Constraints

- **Single-Threaded Client Runtime:** All DOM manipulation and canvas animation operate on the main browser thread. Matrix animation uses `requestAnimationFrame` and pauses during scroll or off-screen visibility to preserve frame rates.
- **Zero Server State:** No server-side sessions, cookies, or remote databases. Form submissions open directly in the user's Gmail client or WhatsApp app.
- **Cross-Platform Touch Support:** Custom cursor (`cursor.js`) automatically disables itself on mobile/touch interfaces via `pointer: coarse` detection.

## Error Handling

**Strategy:** Graceful degradation and non-blocking fallbacks.
- **Missing route:** Unrecognized hash routes gracefully render `notFound` template within the main shell.
- **Image load failure:** Images listen to `onerror` and revert to `data-image-fallback`.
- **SessionStorage disabled:** Wrapped in `try/catch` to allow CTF sandbox usage even in restricted private/incognito modes.

---

*Architecture analysis: 2026-11-04*
