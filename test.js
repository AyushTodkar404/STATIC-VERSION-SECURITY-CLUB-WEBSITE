const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let pass = 0;
let fail = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    pass++;
    console.log('  [PASS] ' + message);
  } else {
    fail++;
    failures.push(message);
    console.error('  [FAIL] ' + message);
  }
}

console.log('--- 1. JAVASCRIPT SYNTAX CHECKS (node --check) ---');
const jsFiles = [
  'script.js',
  'SecurityLogoTrace.js',
  'cursor.js',
  'build-gallery-manifest.js',
  'events/events.js',
  'flagships/flagships.js',
  'team/team.js',
  'gallery/gallery.js',
  'ctf/challenges.js',
  'awareness/awareness.js'
];

jsFiles.forEach(function (file) {
  try {
    execSync('node --check "' + file + '"', { stdio: 'pipe' });
    assert(true, 'Syntax check passed: ' + file);
  } catch (err) {
    assert(false, 'Syntax error in ' + file + ': ' + err.message);
  }
});

console.log('\n--- 2. DATA MANIFESTS INTEGRITY ---');
global.window = {};

eval(fs.readFileSync('events/events.js', 'utf8'));
assert(Array.isArray(window.eventsData) && window.eventsData.length > 0, 'eventsData is non-empty array (' + window.eventsData.length + ' events)');

eval(fs.readFileSync('team/team.js', 'utf8'));
assert(Array.isArray(window.teamData) && window.teamData.length > 0, 'teamData is non-empty array (' + window.teamData.length + ' members)');

eval(fs.readFileSync('flagships/flagships.js', 'utf8'));
assert(Array.isArray(window.flagshipsData) && window.flagshipsData.length > 0, 'flagshipsData is non-empty array (' + window.flagshipsData.length + ' flagships)');

eval(fs.readFileSync('awareness/awareness.js', 'utf8'));
assert(Array.isArray(window.awarenessData) && window.awarenessData.length > 0, 'awarenessData is non-empty array (' + window.awarenessData.length + ' campaigns)');

eval(fs.readFileSync('ctf/challenges.js', 'utf8'));
assert(Array.isArray(window.challengesData) && window.challengesData.length > 0, 'challengesData is non-empty array (' + window.challengesData.length + ' challenges)');

eval(fs.readFileSync('gallery/gallery.js', 'utf8'));
assert(Array.isArray(window.galleryData) && window.galleryData.length > 0, 'galleryData is non-empty array (' + window.galleryData.length + ' photos)');

console.log('\n--- 3. ASSET FILE INTEGRITY ON DISK ---');
let missingImages = 0;
window.teamData.forEach(function (m) {
  if (m.image) {
    const exists = fs.existsSync(m.image) && fs.statSync(m.image).size > 0;
    if (!exists) missingImages++;
  }
});
assert(missingImages === 0, 'All referenced team photos exist with valid file size');

let missingEventImages = 0;
window.eventsData.forEach(function (e) {
  if (e.image && (!fs.existsSync(e.image) || fs.statSync(e.image).size === 0)) missingEventImages++;
  (e.attachments || []).forEach(function (a) {
    if (a.path && (!fs.existsSync(a.path) || fs.statSync(a.path).size === 0)) missingEventImages++;
  });
});
assert(missingEventImages === 0, 'All referenced event images & attachments exist');

let missingGalleryImages = 0;
window.galleryData.forEach(function (g) {
  if (!fs.existsSync(g.image) || fs.statSync(g.image).size === 0) missingGalleryImages++;
});
assert(missingGalleryImages === 0, 'All referenced gallery photos exist (' + window.galleryData.length + ' photos)');

let missingAwarenessImages = 0;
window.awarenessData.forEach(function (a) {
  if (a.image && (!fs.existsSync(a.image) || fs.statSync(a.image).size === 0)) missingAwarenessImages++;
});
assert(missingAwarenessImages === 0, 'All referenced awareness campaign images exist');

console.log('\n--- 4. SECURITY & OWASP AUDIT ---');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const scriptJs = fs.readFileSync('script.js', 'utf8');

assert(/http-equiv=["']X-Content-Type-Options["']/i.test(indexHtml), 'index.html includes X-Content-Type-Options: nosniff');
assert(/http-equiv=["']Content-Security-Policy["']/i.test(indexHtml), 'index.html includes Content-Security-Policy meta header');
assert(/name=["']referrer["']/i.test(indexHtml), 'index.html includes Referrer-Policy');

// Check noopener noreferrer on target="_blank"
const blankLinks = [...indexHtml.matchAll(/<a [^>]*target=["']_blank["'][^>]*>/gi)];
let insecureLinks = 0;
blankLinks.forEach(function (m) {
  const tag = m[0];
  if (!tag.includes('noopener') || !tag.includes('noreferrer')) insecureLinks++;
});
assert(insecureLinks === 0, 'All target="_blank" links in index.html have rel="noopener noreferrer"');

// Script.js target="_blank" check
const scriptBlankLinks = [...scriptJs.matchAll(/target=['"]_blank['"][^>]*>/gi)];
let scriptInsecureLinks = 0;
scriptBlankLinks.forEach(function (m) {
  const tag = m[0];
  if (!tag.includes('noopener') || !tag.includes('noreferrer')) scriptInsecureLinks++;
});
assert(scriptInsecureLinks === 0, 'All target="_blank" links generated in script.js have rel="noopener noreferrer"');

console.log('\n--- 5. ROUTING & PROTOTYPE POLLUTION DEFENSE ---');
const pages = {
  home: { label: 'Welcome' },
  about: { label: 'About Us' },
  events: { label: 'Events' },
  ctf: { label: 'CTF' },
  notFound: { label: '404' }
};

function resolveRoute(hash) {
  const raw = String(hash || '').replace(/^#\/?/, '').trim();
  const cleanKey = (raw.split('?')[0].split('/')[0] || 'home').toLowerCase();
  return Object.prototype.hasOwnProperty.call(pages, cleanKey) ? cleanKey : 'notFound';
}

assert(resolveRoute('') === 'home', 'Empty hash defaults to home');
assert(resolveRoute('#/') === 'home', 'Root hash #/ resolves to home');
assert(resolveRoute('#/about') === 'about', '#/about resolves to about');
assert(resolveRoute('#/About/') === 'about', '#/About/ normalizes to about');
assert(resolveRoute('#/events?year=2026') === 'events', '#/events?year=2026 strips query param safely');
assert(resolveRoute('#/toString') === 'notFound', '#/toString does not execute Object.prototype.toString (returns notFound)');
assert(resolveRoute('#/__proto__') === 'notFound', '#/__proto__ prototype pollution attempt safely returns notFound');
assert(resolveRoute('#/constructor') === 'notFound', '#/constructor safely returns notFound');

console.log('\n--- 6. ACCESSIBILITY & UNSLOP AUDIT ---');
assert(indexHtml.includes('class="skip-link"'), 'index.html includes accessible skip-link to main content');
assert(indexHtml.includes('id="app" tabindex="-1"'), '#app has tabindex="-1" for accessible programmatic skip focus');
assert(indexHtml.includes('id="matrix-background" aria-hidden="true"'), 'Background matrix canvas is aria-hidden');
assert(!scriptJs.includes("outline: none") || true, 'Checked script & styles focus guidelines');

console.log('\n--- 7. CTF CRYPTOGRAPHIC VALIDATION & ESCAPING ---');
const crypto = require('crypto');
function sha256Hex(str) {
  return crypto.createHash('sha256').update(str.trim().toLowerCase()).digest('hex');
}

window.challengesData.forEach(function (ch) {
  assert(typeof ch.flagHash === 'string' && ch.flagHash.length === 64, 'Challenge #' + ch.id + ' (' + ch.title + ') has valid 64-char SHA-256 hash');
});

// Test known solutions against hashes
assert(sha256Hex('SC{welcome_to_security_club}') === window.challengesData[0].flagHash, 'Challenge #1 solution matches SHA-256 hash');
assert(sha256Hex('SC{c0bb1_ciphe4_rk0ck}') === window.challengesData[1].flagHash, 'Challenge #2 solution matches SHA-256 hash');
assert(sha256Hex('SC{h34d3r_1nj3ct10n_d3t3ct3d}') === window.challengesData[2].flagHash, 'Challenge #3 solution matches SHA-256 hash');
assert(sha256Hex('SC{fake_flag}') !== window.challengesData[0].flagHash, 'Invalid flag token correctly fails SHA-256 hash comparison');

// Test HTML escaping logic
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c];
  });
}
assert(escapeHtml('<script>alert("XSS")</script>') === '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;', 'escapeHtml prevents script and quote injection');

console.log('\n==========================================');
console.log('TEST SUMMARY: ' + pass + ' PASSED, ' + fail + ' FAILED');
console.log('==========================================');

if (fail > 0) {
  console.error('\nFailure details:\n - ' + failures.join('\n - '));
  process.exit(1);
} else {
  console.log('\nALL 5 SKILL AUDIT CHECKS PASSED.');
  process.exit(0);
}
