# Coding Conventions

**Analysis Date:** 2026-11-04

## Naming Patterns

**Files:**
- HTML/CSS: kebab-case or standard web names (`index.html`, `404.html`, `styles.css`).
- JavaScript Modules: camelCase (`cursor.js`, `build-gallery-manifest.js`) or PascalCase for generative vector classes (`SecurityLogoTrace.js`).
- Data Manifests: lowercase matching parent directory (`team/team.js`, `events/events.js`, `ctf/challenges.js`, `awareness/awareness.js`, `gallery/gallery.js`).

**Functions:**
- camelCase with descriptive verb prefixes:
  - Template generators: `eventsMarkup()`, `teamSections()`, `ctfMarkup()`, `awarenessMarkup()`, `submissionFormMarkup()`.
  - DOM/Event setup: `setupGallery()`, `setupCtf()`, `setupEvents()`, `setupSplashLoader()`, `setupMatrix()`.
  - Utilities: `escapeHtml()`, `gmailComposeUrl()`, `bindPillGroup()`, `formatDate()`.

**Variables:**
- camelCase: `selectedYear`, `isSlowConnection`, `solvedIds`, `categoryButtons`.
- Booleans use `is` or `has` prefixes: `isWindowLoaded`, `isFontsReady`, `isTimedOut`, `splashActive`.

**Constants:**
- Uppercase SNAKE_CASE for mathematical constants and SVG path definitions:
  - `SHIELD_D` in `SecurityLogoTrace.js`.
  - `MAX_DIMENSION`, `WEBP_QUALITY` in `optimize-images.py`.
- camelCase for static lookup tables: `pages`, `linkOrder` in `script.js`.

**CSS Classes:**
- kebab-case: `.card-grid`, `.hud-toggle-btn`, `.site-header`, `.flagship-browser`.
- State classes prefixed with `is-`: `.is-active`, `.is-loaded`, `.is-animating`, `.is-error`, `.is-complete`.
- Utility badges: `.button`, `.button-primary`, `.button-ghost`, `.button-sm`.

## Code Style

**Formatting:**
- Indentation: 2 spaces (no tabs).
- Semicolons: Required at statement ends.
- Quotes: Single quotes `'...'` in JavaScript logic; double quotes `"..."` in HTML markup and JSON.
- Line length: Clean, readable function blocks. Long HTML template string concatenations formatted with leading `+` operators on each line.

**Encapsulation:**
- Global isolation: `script.js` executes inside an Immediately Invoked Function Expression (`(function () { ... }());`) to prevent variable leakage into the window scope.
- ES Module isolation: `SecurityLogoTrace.js` exports functions using standard ES module syntax (`export { mountSecurityLogo, createSecurityLogo };`).

## Import Organization

**JavaScript:**
- Module imports placed at top of file:
  ```javascript
  import { mountSecurityLogo } from './SecurityLogoTrace.js';
  ```
- Modular data files loaded declaratively via `<script defer>` in `index.html`:
  ```html
  <script defer src="events/events.js"></script>
  <script defer src="flagships/flagships.js"></script>
  <script defer src="ctf/challenges.js"></script>
  <script defer src="team/team.js"></script>
  <script defer src="awareness/awareness.js"></script>
  <script defer src="gallery/gallery.js?v=3"></script>
  <script type="module" src="script.js?v=7"></script>
  ```

**CSS (`styles.css`):**
- Custom Properties (`:root`) defined first for colors, fonts, and shadows.
- Reset and base element typography.
- Layout shells and navigation header.
- Component modules (cards, buttons, forms, filters, HUDs).
- Page-specific views (flagships, CTF sandbox, awareness, gallery).
- Media queries and responsive breakpoints at the bottom.

## Error Handling

**DOM Guard Clauses:**
- Every setup function checks for the presence of target elements before attaching listeners:
  ```javascript
  function setupCtf() {
    const browser = document.querySelector('.ctf-browser');
    if (!browser) return;
    // ...
  }
  ```

**Storage Protection:**
- `sessionStorage` and `localStorage` accesses are always wrapped in `try/catch` to prevent fatal exceptions in private browsing or when third-party storage is blocked:
  ```javascript
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) solvedIds = JSON.parse(stored);
  } catch (_) {}
  ```

**Image Fallbacks:**
- Images provide fallback data attributes (`data-image-fallback`) to swap sources automatically if a photo fails to load.

**Sanitization:**
- User-facing text injected into innerHTML passes through `escapeHtml()` to mitigate Cross-Site Scripting (XSS).

## Function Design

**Single Responsibility:**
- Markup generators (`*Markup()`) only return HTML strings.
- Setup functions (`setup*()`) only bind DOM events and manage component state.
- Pure helper functions handle formatting and conversions.

---

*Convention analysis: 2026-11-04*
