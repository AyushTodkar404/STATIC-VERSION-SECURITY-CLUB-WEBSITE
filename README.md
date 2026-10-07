# Security Club Static Page

This folder is a completely static version of the Security Club website for
hosting on the college clubs page or GitHub Pages.

It intentionally has:

- no backend
- no database
- no login or registration
- no administrator panel
- no API calls

## Preview locally

Open `index.html` directly in a browser. For the most reliable local preview,
run any simple static server from this folder, for example:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080`.

To rebuild the gallery manifest after adding or moving image folders, run this
from the repository root:

```powershell
node "SECURITY CLUB STATIC PAGE\build-gallery-manifest.js"
```

## Updating content

### Events

1. Add event images inside `events/`.
2. Edit `events/events.js`.
3. Set each image path relative to the repository root, such as
   `events/annual-ctf.jpg`.

### Team members

1. Add member photos inside `team/`.
2. Edit `team/team.js`.
3. Update the member's name, role, biography, and image path.

### Event attachments

Each event can expose files from the repository through its `attachments`
array in `events/events.js`:

```js
attachments: [
  {
    label: 'Workshop notes',
    path: 'events/files/workshop-notes.pdf',
    type: 'PDF'
  },
  {
    label: 'Speaker brief',
    path: 'events/files/speaker-brief.docx',
    type: 'Word document'
  }
]
```

Add the file inside the static folder, add its relative path to the matching
event, and commit/push both changes. Clicking the event card opens its details
and provides links to open the attached PDF, Word document, image, or any other
browser-supported file type in a new tab. A browser may download file types it
cannot display directly.

### Gallery

1. Add photos inside the appropriate folder under `gallery/`, such as
   `gallery/2026/DSCI 2 DAY BOOTCAMP 2026/`.
2. Run `build-gallery-manifest.js`. It discovers supported image files inside
   year folders and writes their folder paths into `gallery/gallery.js`.
3. Update any generated `alt` text or caption when needed.

The gallery keeps the original folder arrangement and builds its controls from
the `folder` paths in `gallery/gallery.js`: All Photos, year buttons such as
`2026`, then that year's folders and their photos. Adding a new year requires
adding its folder and photo records to `gallery/gallery.js`; the year and
folder controls will appear automatically. A static browser page cannot scan
new directories by itself, so the generated data manifest is the source of
truth at runtime.
Images use native lazy loading and asynchronous decoding, and each image can be
opened in a lightweight fullscreen viewer. The viewer can be closed with the
close button, by clicking outside the image, or by pressing Escape.

The current static content includes the public records exported from the
original backend: 3 events, 2 flagships, 14 team profiles, 18 gallery photos,
and the currently published CTF challenge. Gallery and team images are stored
as ordinary files in their respective folders so the page does not depend on
the backend database. Replace or extend the JavaScript data files as the club
publishes new information.

The export intentionally excludes accounts, passwords, sessions, membership
applications, contact messages, leaderboard/private user data, and all other
non-public backend records.

The static navigation intentionally excludes Profile and Core Workspace. The
Contact page uses `mailto:` and WhatsApp links, so it opens the visitor's own
email or WhatsApp app without requiring a server.

The original Security Club logo is stored in `assets/security-club-logo.svg`
and `assets/security-club-logo.png`. The welcome page uses the original
shield-inspired visual in `assets/security-shield.svg`.

After committing and pushing the changes to GitHub, the static page will use
the updated files when the hosting page is rebuilt or refreshed.

## Automatic GitHub updates

The repository includes
[`.github/workflows/deploy-static-page.yml`](../.github/workflows/deploy-static-page.yml).
When changes are pushed to `SECURITY CLUB STATIC PAGE`, GitHub Actions:

1. checks out the latest repository contents;
2. rebuilds the gallery manifest from the year and folder directories;
3. uploads the complete static folder; and
4. deploys it to GitHub Pages.

Enable **Settings → Pages → Source: GitHub Actions** once in the repository
settings. After that, changes to events, team data, gallery folders/photos,
flagships, CTF data, styles, or scripts will be included in the next
deployment. The workflow deploys the static folder separately and does not
change the existing backend/frontend deployment.
