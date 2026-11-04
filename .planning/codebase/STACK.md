# Technology Stack

**Analysis Date:** 2026-11-04

## Languages

**Primary:**
- JavaScript (ES6+ Modules) - Client-side application routing, DOM rendering, interactive sandbox, canvas animations (`script.js`, `SecurityLogoTrace.js`, `cursor.js`)
- CSS3 - Core layout, styling, animations, responsive design, dark theme tokens (`styles.css`, `SecurityLogoTrace.css`)
- HTML5 - Semantic application shell, accessibility primitives, meta/SEO tags (`index.html`, `404.html`)

**Secondary:**
- Node.js (CommonJS) - Gallery manifest generation, static asset verification (`build-gallery-manifest.js`)
- Python 3 - Image processing and WebP conversion script (`optimize-images.py`)
- C# (.NET Framework) - Windows companion live wallpaper bridge and cursor HUD (`CyberSecurity-Live-Wallpaper/CyberActionBridge.cs`, `CyberSecurity-Cursor-Theme/CyberReticleHUD.cs`)
- PowerShell & Batch - Windows environment automation scripts (`CyberSecurity-Cursor-Theme/Apply-Cursor.ps1`, `CyberSecurity-Live-Wallpaper/Start-Live-Wallpaper.bat`)

## Runtime

**Environment:**
- Production: Modern web browsers supporting ES2020 modules, CSS Grid, custom properties, and Canvas 2D
- Development / Maintenance: Node.js v18+, Python 3.9+ (optional, for asset pipeline scripts)

**Package Manager:**
- None required for core web application runtime.
- Lockfile: Not applicable (zero runtime npm dependencies; runs directly as vanilla static web files).

## Frameworks

**Core:**
- Vanilla JavaScript SPA Architecture - Zero third-party web frameworks (no React, Vue, or Angular). Custom hash-based router (`#/events`, `#/team`, `#/gallery`, etc.) and template engine in `script.js`.

**Testing:**
- Built-in Node.js syntax checker (`node --check`) and custom assert-based DOM/asset integrity test scripts.

**Build/Dev:**
- Pure Static Web Architecture - No bundler, transpiler, or webpack/Vite build step required. Browser consumes source files directly with cache-busting query strings (`?v=11`).

## Key Dependencies

**Critical:**
- None (0 npm runtime dependencies). Fully self-contained static site.

**Fonts & External Assets (CDN):**
- Google Fonts - Space Grotesk (headings), Inter (body UI text), JetBrains Mono (code/CTF elements) loaded via `<link>` in `index.html`.

**Infrastructure:**
- GitHub Pages - Static hosting provider linked via `CNAME` (`securityclub.dbit.in`).

## Configuration

**Environment:**
- No server environment variables or `.env` files required for the public static website.
- Client-side runtime detection handles slow connections, reduced-motion media queries, and touch devices dynamically.

**Build & Domain:**
- `CNAME` - Custom domain DNS routing to `securityclub.dbit.in`.
- `.github/copilot-instructions.md` - Project architecture and coding constraints for assistant agents.
- `AGENTS.md` - Senior developer engineering rules (minimal diffs, privacy boundaries, zero unneeded code).

## Platform Requirements

**Development:**
- Any static HTTP file server (e.g. `python -m http.server`, VS Code Live Server, or Node `npx serve`).

**Production:**
- Any static web host supporting HTTPS and custom domains (GitHub Pages, Cloudflare Pages, Vercel, Netlify).

---

*Stack analysis: 2026-11-04*
