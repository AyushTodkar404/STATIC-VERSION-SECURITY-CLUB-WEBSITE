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
    "flag": "SC{welcome_to_security_club}",
    "flagHash": "ea17cf5f9fdc0fb4c23e793fb3303fcf582f1a31003c6da75754d4f22d3ac0d6"
  },
  {
    "id": 2,
    "title": "Classical Cryptography: Caesar's Shift",
    "category": "crypto",
    "difficulty": "beginner",
    "points": 150,
    "description": "An intercepted transmission reads: 'VF{f0ee1_flskh4_un0fn}'. The message was encoded using a classical Caesar cipher with a shift of +3. Decrypt the ciphertext to retrieve the flag token.",
    "hint": "Shift each alphabetical character backward by 3 positions (V becomes S, F becomes C). Numbers and underscores remain in place.",
    "flagHash": "ca367ffcf333559a0ff4a031b1997bd143f748baff5cc91612e0a794777b9b9d"
  },
  {
    "id": 3,
    "title": "Header Analysis: Base64 Authorization Token",
    "category": "network",
    "difficulty": "intermediate",
    "points": 200,
    "description": "A perimeter packet capture recorded an HTTP authorization exchange containing: 'Authorization: Bearer U0N7aDM0ZDNyXzFuajNjdDEwbl9kM3QzY3QzZH0='. Decode the payload token to verify access.",
    "hint": "The bearer token is encoded in Base64. Decode the string following 'Bearer ' (e.g. using atob() in DevTools console or an online decoder).",
    "flagHash": "841df539bc0e0f267b01411cfb114337ea88af667f02376b6aad59c405cd32de"
  }
];
