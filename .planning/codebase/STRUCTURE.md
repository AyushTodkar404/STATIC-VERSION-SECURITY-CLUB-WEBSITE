# Codebase Structure

**Analysis Date:** 2026-11-04

## Directory Layout

```text
c:/SECURITY CLUB STATIC PAGE/
├── .github/
│   └── copilot-instructions.md       # Guidelines and coding standards for AI assistants
├── .planning/
│   └── codebase/                     # GSD codebase mapping documents
├── assets/                           # Core branding, logo icons, fallback images
│   ├── security-club-logo.png
│   ├── security-club-logo-small.png
│   └── security-logo.png
├── awareness/                        # Security awareness campaigns & comic series
│   ├── 2026-27/                      # Campaign images, comic episodes
│   └── awareness.js                  # Awareness items manifest (window.awarenessData)
├── ctf/                              # CTF challenge sandbox
│   └── challenges.js                 # Challenge questions, points, flags (window.challengesData)
├── CyberSecurity-Cursor-Theme/       # Windows desktop cursor theme package & installers
├── CyberSecurity-Live-Wallpaper/     # Windows desktop live wallpaper interactive suite
├── events/                           # Technical workshops & event records
│   ├── 2024/                         # Event poster images for 2024
│   ├── 2025/                         # Event poster images for 2025
│   ├── 2026/                         # Event poster images for 2026
│   └── events.js                     # Chronological events array (window.eventsData)
├── flagships/                        # Core club curriculum and annual initiatives
│   └── flagships.js                  # Flagship program definitions (window.flagshipsData)
├── gallery/                          # Event photo galleries organized by year & folder
│   ├── 2024/                         # Photos from 2024 events
│   ├── 2025/                         # Photos from 2025 events
│   ├── 2026/                         # Photos from 2026 events
│   └── gallery.js                    # Auto-generated photo manifest (window.galleryData)
├── team/                             # Student council and mentor directories
│   ├── 2024/                         # Headshots for 2024 council
│   ├── 2025/                         # Headshots for 2025 council
│   ├── 2026/                         # Headshots for 2026 council
│   └── team.js                       # Directory records by year (window.teamData)
├── 404.html                          # Standalone fallback page for unhandled GitHub Pages routes
├── AGENTS.md                         # Senior dev mode instructions and safety guardrails
├── build-gallery-manifest.js         # Node script that scans gallery/ and writes gallery/gallery.js
├── CNAME                             # Custom domain configuration (securityclub.dbit.in)
├── cursor.js                         # Custom cyberpunk HUD reticle cursor
├── image-optimizer.html              # In-browser image compressor tool
├── index.html                        # Application entry point, head meta, and HTML shell
├── optimize-images.py                # Python Pillow script to convert images to WebP
├── README.md                         # Project documentation, mission, and setup instructions
├── script.js                         # Core SPA router, template engine, and event handlers
├── SecurityLogoTrace.css             # Vector logo mesh animation styling
├── SecurityLogoTrace.js              # Algorithmic SVG vector shield generator
└── styles.css                        # Complete design system, theme variables, and layouts
```

## Directory Purposes

**`assets/`:**
- Purpose: Houses permanent brand identity assets (club shields, small logos, favicon sources).
- Key files: `assets/security-club-logo-small.png`, `assets/security-club-logo.png`.

**`awareness/`:**
- Purpose: Contains cybersecurity comic episodes, digital defense advisories, and campus campaign posters.
- Key files: `awareness/awareness.js`, `awareness/2026-27/*.jpg`.

**`ctf/`:**
- Purpose: Stores configuration for the hands-on CTF challenge sandbox.
- Key files: `ctf/challenges.js`.

**`events/`:**
- Purpose: Stores event posters and descriptive session records.
- Key files: `events/events.js`.

**`flagships/`:**
- Purpose: Stores details of signature annual events (Cyber Siege, Hack the Campus, Cryptic Hunt).
- Key files: `flagships/flagships.js`.

**`gallery/`:**
- Purpose: Stores compressed WebP event photos organized into year and album directories.
- Key files: `gallery/gallery.js`, `gallery/2026/`, `gallery/2025/`.

**`team/`:**
- Purpose: Houses student council member profiles, roles, social links, and photos.
- Key files: `team/team.js`.

**`CyberSecurity-Cursor-Theme/` & `CyberSecurity-Live-Wallpaper/`:**
- Purpose: Auxiliary standalone desktop enhancements created for club workstations and student labs.

## Key File Locations

**Entry Points:**
- `index.html`: Main site shell and single-page routing host.
- `404.html`: Standalone GitHub Pages error fallback.

**Configuration:**
- `CNAME`: Domain pointer (`securityclub.dbit.in`).
- `.github/copilot-instructions.md`: Assistant developer guidance.
- `AGENTS.md`: Code quality rules.

**Core Application Logic:**
- `script.js`: Hash routing, view builders, interactive modules, event delegation.
- `SecurityLogoTrace.js`: Algorithmic dynamic SVG vector shield animation.
- `cursor.js`: Interactive canvas reticle cursor tracking.

**Styles & Presentation:**
- `styles.css`: Complete application CSS architecture, color variables, grid systems.
- `SecurityLogoTrace.css`: Styling rules for the procedural SVG logo mesh.

**Asset Pipeline Tools:**
- `build-gallery-manifest.js`: Scans the `gallery/` tree and regenerates `gallery/gallery.js`.
- `optimize-images.py`: Compresses high-resolution images to WebP (~80-150 KB).

## Naming Conventions

**Files:**
- JavaScript modules: camelCase (`cursor.js`, `build-gallery-manifest.js`) or PascalCase for components (`SecurityLogoTrace.js`).
- Data manifests: match folder name (`team/team.js`, `events/events.js`, `awareness/awareness.js`, `gallery/gallery.js`).
- Images: kebab-case or standard descriptive labels (`photo-12.webp`, `security-club-logo-small.png`).

**Directories:**
- Content categories: lowercase singular/plural (`events`, `flagships`, `team`, `gallery`, `awareness`, `ctf`).
- Year archives: four-digit year (`2024`, `2025`, `2026`) or academic year (`2026-27`).

## Where to Add New Code

**New Event:**
- Add event poster image: `events/<year>/<poster.webp>`
- Add event metadata record to `window.eventsData` in `events/events.js`.

**New Team Member or Academic Year:**
- Add headshot photo: `team/<year>/<name.webp>`
- Add member entry to `window.teamData` in `team/team.js` with corresponding `year`.

**New Awareness Poster or Comic:**
- Add graphic: `awareness/<year>/<image.webp>`
- Add entry to `window.awarenessData` in `awareness/awareness.js`.

**New CTF Challenge:**
- Add challenge object (id, title, category, difficulty, points, hint, flag) to `window.challengesData` in `ctf/challenges.js`.

**New Gallery Album:**
- Add photo files to `gallery/<year>/<ALBUM_NAME>/`.
- Run `node build-gallery-manifest.js` to automatically index new photos into `gallery/gallery.js`.

**New Navigation Route / Page:**
- Register page in `pages` map in `script.js`.
- Add link key to `linkOrder` in `script.js`.
- Add route condition in `render(key)` in `script.js`.

---

*Structure analysis: 2026-11-04*
