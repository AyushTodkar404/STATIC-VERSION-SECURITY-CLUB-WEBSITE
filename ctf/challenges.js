// Security Club DBIT — CTF Challenge Sandbox
// Hands-on introductory cybersecurity lab challenges for DBIT students.
window.challengesData = [
  {
    "id": 1,
    "title": "Reconnaissance: Source Inspection",
    "category": "web",
    "difficulty": "beginner",
    "points": 100,
    "description": "Every security audit begins with reconnaissance. Inspect the underlying document source and meta headers of this website to discover the initial access flag.",
    "hint": "Open browser Developer Tools (Ctrl+Shift+I or right-click -> View Page Source) and search for the 'ctf-flag' meta tag in the head.",
    "flag": "SC{welcome_to_security_club}"
  },
  {
    "id": 2,
    "title": "Classical Cryptography: Caesar's Shift",
    "category": "crypto",
    "difficulty": "beginner",
    "points": 150,
    "description": "An intercepted transmission reads: 'VF{f0ee1_flskh4_un0fn}'. The message was encoded using a classical Caesar cipher with a shift of +3. Decrypt the ciphertext to retrieve the flag token.",
    "hint": "Shift each alphabetical character backward by 3 positions (V becomes S, F becomes C). Numbers and underscores remain in place.",
    "flag": "SC{c0bb1_ciphe4_rk0ck}"
  },
  {
    "id": 3,
    "title": "Header Analysis: Base64 Authorization Token",
    "category": "network",
    "difficulty": "intermediate",
    "points": 200,
    "description": "A perimeter packet capture recorded an HTTP authorization exchange containing: 'Authorization: Bearer U0N7aDM0ZDNyXzFuajNjdDEwbl9kM3QzY3QzZH0='. Decode the payload token to verify access.",
    "hint": "The bearer token is encoded in Base64. Decode the string following 'Bearer ' (e.g. using atob() in DevTools console or an online decoder).",
    "flag": "SC{h34d3r_1nj3ct10n_d3t3ct3d}"
  }
];
