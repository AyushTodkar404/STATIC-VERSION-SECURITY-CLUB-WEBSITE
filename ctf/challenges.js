// Security Club DBIT — CTF Challenge Sandbox
// Edit this file to add live practice challenges for students.
window.challengesData = [
  {
    "id": 1,
    "title": "Welcome Flag: Source Inspection",
    "category": "web",
    "difficulty": "beginner",
    "points": 100,
    "description": "A classic cyber reconnaissance challenge. Inspect the source of this website or explore the terminal logs to capture the first Security Club welcoming flag.",
    "hint": "Check the welcome terminal comments or try submitting: SC{welcome_to_security_club}",
    "flag": "SC{welcome_to_security_club}"
  },
  {
    "id": 2,
    "title": "Caesar's Cryptographic Shift",
    "category": "crypto",
    "difficulty": "beginner",
    "points": 150,
    "description": "An encrypted transmission was intercepted: 'VF{f0ee1_flph3u_un0fn}'. The cipher uses a classic Caesar shift of 3. Decrypt the message to reveal the true flag format (SC{...}).",
    "hint": "Shift each letter backward by 3 positions in the alphabet (V -> S, F -> C).",
    "flag": "SC{c0bb1_ciphe4_rk0ck}"
  },
  {
    "id": 3,
    "title": "Headers & Vectors: Trace Route",
    "category": "network",
    "difficulty": "intermediate",
    "points": 200,
    "description": "Analyze an HTTP transmission artifact. The security perimeter logged: 'X-Forwarded-For: 127.0.0.1; X-Flag: SC{h34d3r_1nj3ct10n_d3t3ct3d}'. Validate the token to prove defensive interception.",
    "hint": "The flag is directly visible in the custom security header string.",
    "flag": "SC{h34d3r_1nj3ct10n_d3t3ct3d}"
  }
];
