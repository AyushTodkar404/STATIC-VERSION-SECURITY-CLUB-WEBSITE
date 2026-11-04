# External Integrations

**Analysis Date:** 2026-11-04

## APIs & External Services

**Email Dispatch:**
- Google Gmail Web Compose API - Client-side draft compilation for student submissions and general inquiries.
  - Integration path: `script.js` (`gmailComposeUrl()`)
  - Target: `https://mail.google.com/mail/?view=cm&fs=1&to=securityclubdbit@gmail.com`
  - Auth: Handled natively by user's active Google account in their browser.

**Messaging & Chat:**
- WhatsApp Click-to-Chat Deep Linking - Instant dispatch for mobile and desktop student registrations.
  - Integration path: `script.js` (`submissionFormMarkup()`, `contactMarkup()`)
  - Target: `https://wa.me/918369448072?text={encoded_message}`
  - Auth: None (public WhatsApp web protocol).

**Fonts & CDN:**
- Google Fonts API - Web fonts delivery (`Inter`, `JetBrains Mono`, `Space Grotesk`).
  - Integration path: `index.html`, `404.html`
  - Endpoints: `https://fonts.googleapis.com`, `https://fonts.gstatic.com` (preconnect enabled).

**Social Media Channels:**
- LinkedIn Profile - Club professional network (`https://www.linkedin.com/in/security-club-dbit-801708404/`)
- Instagram Profile - Student activities and announcements (`https://www.instagram.com/securityclubdbit`)
- GitHub Repository - Source code and community contributions (`https://github.com/AyushTodkar404/STATIC-VERSION-SECURITY-CLUB-WEBSITE`)

## Data Storage

**Databases:**
- None. The application does not maintain a remote database, PostgreSQL, MySQL, or Firebase instance.

**Client-Side Browser Storage:**
- Web Storage API (`sessionStorage`):
  - Key: `security-club-ctf-solved-v1`
  - Used in: `script.js` (`setupCtf()`)
  - Purpose: Tracks solved CTF challenge IDs and updates user score HUD within the current browser session.
  - Lifetime: Cleared automatically when the user closes their browser tab.

**File Storage:**
- Local static file system only. All image assets, banners, team headshots, and gallery photos reside under `assets/`, `gallery/`, and `awareness/`.

**Caching:**
- Browser HTTP cache with manual versioning query parameters (e.g. `styles.css?v=11`, `script.js?v=7`, `gallery.js?v=3`) configured in `index.html` and `404.html`.

## Authentication & Identity

**Auth Provider:**
- None. The website is an open-access public resource. There is no user registration, password management, or JWT session state.

## Monitoring & Observability

**Error Tracking:**
- None. No third-party analytics (Google Analytics, Sentry, Mixpanel, Hotjar) are loaded.

**Client-Side Resilience:**
- Image loading errors are caught via `data-image-fallback` attributes and handled inline.
- Storage quota or private browsing exceptions are safeguarded via `try/catch` in `script.js`.

## CI/CD & Deployment

**Hosting:**
- GitHub Pages - Automated deployment from the `main` branch.
- Custom Domain DNS: Configured via `CNAME` pointing to `securityclub.dbit.in`.

**CI Pipeline:**
- Native GitHub Pages deployment pipeline.
- Local verification scripts: `node --check`, `build-gallery-manifest.js`.

## Environment Configuration

**Required Environment Variables:**
- None. No secrets or tokens exist in source code or production builds.

**Secrets Location:**
- Zero private credentials.

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None.

---

*Integration audit: 2026-11-04*
