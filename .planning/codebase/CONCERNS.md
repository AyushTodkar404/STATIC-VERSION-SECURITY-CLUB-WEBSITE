# Codebase Concerns

**Analysis Date:** 2026-11-04

## Tech Debt

**Monolithic Single-File Controller:**
- Issue: `script.js` (~1340 lines) contains all routing, page templates, event delegation, and interactive handlers in a single file.
- Files: `script.js`
- Impact: While advantageous for zero-bundler static web hosting (reducing HTTP requests and eliminating compile steps), large single files can become difficult to maintain as new academic year features are added in 2027+.
- Fix approach: If the codebase grows significantly, modularize view builders into separate ES module files (e.g. `src/views/ctf.js`, `src/views/gallery.js`) imported by `script.js`.

**Manual Cache-Busting Parameters:**
- Issue: Query parameters on asset links in `index.html` (e.g. `styles.css?v=11`, `script.js?v=7`) must be manually incremented when modifying CSS or JavaScript.
- Files: `index.html`, `404.html`
- Impact: If an engineer updates styles without incrementing the query version, users with cached assets may see older layouts until doing a hard browser refresh (`Ctrl+F5`).
- Fix approach: Keep a strict protocol to bump the version query parameter whenever deploying core visual changes, or automate via a lightweight pre-commit hook.

**Client-Side Plaintext CTF Flags:**
- Issue: Flags are stored in plaintext inside `ctf/challenges.js`.
- Files: `ctf/challenges.js`
- Impact: Any student who inspects developer tools or views source can read expected flag strings.
- Note: For the club's educational introductory campus labs, this is partially by design (Challenge #1 explicitly instructs students to inspect source code for the flag). However, for competitive or graded CTFs, flags would need cryptographic hashing (SHA-256) or server-side validation.
- Fix approach: Store SHA-256 hashes of flags in `challenges.js` and hash user input client-side before comparison: `Crypto.subtle.digest('SHA-256', ...)`.

## Performance Considerations

**Canvas Animation on Low-Power Mobile Hardware:**
- Area: Continuous Matrix digital rain background canvas.
- Files: `script.js` (`setupMatrix()`), `index.html` (`#matrix-background`)
- Impact: 60fps canvas rendering can increase GPU and battery consumption on budget smartphones.
- Current mitigation:
  - Canvas rendering automatically pauses when window is scrolled beyond the hero viewport.
  - A toggle button in the desktop header allows users to switch `STREAM: OFF`.
  - Low-power mode and `prefers-reduced-motion` reduce canvas tick rate.

**Gallery Asset Scalability:**
- Area: High-resolution student event photographs.
- Files: `gallery/`, `build-gallery-manifest.js`, `optimize-images.py`
- Impact: Uncompressed raw camera JPEG files (3-8 MB each) would severely degrade page performance on weak 3G networks.
- Current mitigation:
  - `optimize-images.py` converts photos to modern WebP format (~80-150 KB).
  - All gallery images use native `loading="lazy"` and `decoding="async"`.
  - Only visible year and album groups are rendered to DOM at any time.

## Security Considerations

**Cross-Site Scripting (XSS) Mitigation:**
- Risk: Injecting arbitrary HTML via dynamically rendered event titles, team names, or awareness descriptions.
- Files: `script.js` (`escapeHtml()`)
- Current mitigation: All dynamic strings pass through `escapeHtml()` which replaces `&`, `<`, `>`, `"`, and `'` with HTML entities prior to template interpolation.
- Recommendation: Maintain the rule that no raw unescaped user input or unsanitized strings are ever placed into `innerHTML`.

**Student Data Privacy & Trust Boundaries:**
- Risk: Leaking student applicant contact details or phone numbers.
- Files: `script.js` (`submissionFormMarkup()`, `contactMarkup()`), `index.html`
- Current mitigation:
  - Zero server storage: form data is compiled completely client-side.
  - The site sets zero tracking cookies, loads no third-party telemetry, and uses no backend databases.
  - Submission opens directly in the student's personal Gmail draft or WhatsApp client for review before dispatch.

---

*Concerns analysis: 2026-11-04*
