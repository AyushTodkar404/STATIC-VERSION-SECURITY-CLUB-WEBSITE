(function () {
  const app = document.querySelector('#app');
  const navigation = document.querySelector('.site-nav');
  const menuButton = document.querySelector('.menu-toggle');
  const themeToggle = document.querySelector('.theme-toggle');
  const matrixCanvas = document.querySelector('#matrix-background');

  const pages = {
    home: { label: 'Welcome', title: 'Curious about cybersecurity? You belong here.', eyebrow: 'Security Club · Welcome terminal' },
    about: { label: 'About Us', title: 'Learn how the digital world works—and how to protect it.', eyebrow: 'A club for first steps' },
    events: { label: 'Events', title: 'Learn together. Build together. Defend together.', eyebrow: 'What is happening' },
    flagships: { label: 'Flagships', title: 'Programs that turn curiosity into capability.', eyebrow: 'Our signature initiatives' },
    team: { label: 'Team', title: 'The people behind the signal.', eyebrow: 'Meet the club team' },
    gallery: { label: 'Gallery', title: 'Captured in the club.', eyebrow: 'Moments from our community' },
    membership: { label: 'Membership', title: 'Your route from visitor to contributor.', eyebrow: 'Join the community' },
    contact: { label: 'Contact', title: 'Have a question? Start a conversation.', eyebrow: 'Reach the club' },
    ctf: { label: 'CTF', title: 'Think sideways. Solve carefully. Learn constantly.', eyebrow: 'Capture the flag' },
  };

  const linkOrder = ['home', 'about', 'events', 'flagships', 'team', 'gallery', 'membership', 'contact', 'ctf'];
  navigation.innerHTML = linkOrder.map(function (key) {
    return '<a href="#/' + key + '" data-page="' + key + '">' + pages[key].label + '</a>';
  }).join('');

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character];
    });
  }

  function image(path, fallback, alt, className) {
    return '<img loading="lazy" decoding="async" class="' + (className || 'card-image') + '" src="' + escapeHtml(path) + '" alt="' + escapeHtml(alt) + '" onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'' + (className || 'card-image') + '\',textContent:\'' + fallback + '\'}))">';
  }

  function shell(key, content) {
    const page = pages[key];
    return '<div class="page section-shell"><section class="page-hero"><div><p class="eyebrow">' + page.eyebrow + '</p><h1>' + page.title + '</h1><p class="hero-lede">' + content.lede + '</p></div></section>' + content.body + '</div>';
  }

  function cards(items, type) {
    return '<div class="card-grid ' + (type || '') + '">' + items.map(function (item, index) {
      const photo = item.image ? image(item.image, '+', item.name || item.title || item.alt) : '<div class="card-image card-placeholder" aria-hidden="true"></div>';
      const eventAttribute = type === 'event-grid' ? ' data-event-id="' + escapeHtml(item.title) + '"' : '';
      const eventHint = type === 'event-grid' ? '<p class="card-action-hint">Open event details →</p>' : '';
      return '<article class="card' + (type === 'event-grid' ? ' event-card' : '') + '"' + eventAttribute + '>' + photo + '<div class="card-body">' + (item.meta ? '<p class="card-meta">' + item.meta + '</p>' : '') + '<h3>' + escapeHtml(item.name || item.title) + '</h3>' + (item.role ? '<p class="role">' + escapeHtml(item.role) + '</p>' : '') + '<p>' + escapeHtml(item.description || item.bio || '') + '</p>' + eventHint + '</div></article>';
    }).join('') + '</div>';
  }

  function eventDetailsMarkup(event) {
    const files = (event.attachments || []).map(function (file) {
      return '<li><a class="button button-ghost attachment-link" href="' + escapeHtml(file.path) + '" target="_blank" rel="noopener">' + escapeHtml(file.label || file.path) + ' ↗</a><span>' + escapeHtml(file.type || 'File') + '</span></li>';
    }).join('');
    return '<div class="event-detail-overlay" role="dialog" aria-modal="true" aria-label="Event details"><div class="event-detail"><button class="event-detail-close" type="button" aria-label="Close event details">×</button><p class="eyebrow">' + escapeHtml(event.type || 'Event') + '</p><h2>' + escapeHtml(event.title) + '</h2><p class="event-detail-meta">' + escapeHtml(event.date || '') + (event.venue ? ' · ' + escapeHtml(event.venue) : '') + '</p><p>' + escapeHtml(event.description || '') + '</p><h3>Attached files</h3>' + (files ? '<ul class="attachment-list">' + files + '</ul>' : '<p class="muted">No files are attached to this event yet.</p>') + '</div></div>';
  }

  function setupEvents(items) {
    const cards = document.querySelectorAll('[data-event-id]');
    if (!cards.length) return;
    cards.forEach(function (card) {
      card.setAttribute('tabindex', '0');
      const open = function () {
        const event = items.find(function (item) { return item.title === card.dataset.eventId; });
        if (!event) return;
        document.body.insertAdjacentHTML('beforeend', eventDetailsMarkup(event));
        const modal = document.querySelector('.event-detail-overlay');
        const close = function () { modal.remove(); document.body.classList.remove('event-is-open'); };
        modal.querySelector('.event-detail-close').addEventListener('click', close);
        modal.addEventListener('click', function (eventTarget) { if (eventTarget.target === modal) close(); });
        modal.addEventListener('keydown', function (eventTarget) { if (eventTarget.key === 'Escape') close(); });
        modal.querySelector('.event-detail-close').focus();
        document.body.classList.add('event-is-open');
      };
      card.addEventListener('click', open);
      card.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
    });
  }

  function galleryMarkup(items) {
    const years = items.map(function (item) { return item.folder.split('/')[0]; }).filter(function (year, index, all) { return all.indexOf(year) === index; }).sort().reverse();
    const initialYear = years[0] || '';
    const yearButtons = years.map(function (year) {
      return '<button class="gallery-year-button' + (year === initialYear ? ' is-active' : '') + '" type="button" data-gallery-year="' + escapeHtml(year) + '">' + escapeHtml(year) + '</button>';
    }).join('');
    const folderGroups = years.map(function (year) {
      const folders = items.map(function (item) { return item.folder; }).filter(function (folder, index, all) {
        return folder.split('/')[0] === year && all.indexOf(folder) === index;
      }).sort();
      return '<div class="gallery-folder-group" data-gallery-year-group="' + escapeHtml(year) + '"' + (year === initialYear ? '' : ' hidden') + '>' + folders.map(function (folder) {
        return '<button class="gallery-folder-button" type="button" data-gallery-folder="' + escapeHtml(folder) + '">' + escapeHtml(folder.split('/').slice(1).join(' / ')) + '</button>';
      }).join('') + '</div>';
    }).join('');
    const photos = items.map(function (item) {
      return '<figure class="gallery-item" data-gallery-item data-gallery-folder="' + escapeHtml(item.folder) + '"><button class="gallery-image-button" type="button" data-gallery-image="' + escapeHtml(item.image) + '" data-gallery-alt="' + escapeHtml(item.alt) + '" aria-label="Open ' + escapeHtml(item.alt) + '">' + image(item.image, '+', item.alt, '') + '</button><figcaption>' + escapeHtml(item.caption) + '</figcaption></figure>';
    }).join('');
    return '<div class="gallery-browser"><div class="gallery-level"><button class="gallery-all-button is-active" type="button" data-gallery-all>All photos</button><div class="gallery-years" role="group" aria-label="Gallery years">' + yearButtons + '</div></div><div class="gallery-folders" role="group" aria-label="Gallery folders">' + folderGroups + '</div><div class="gallery-grid">' + photos + '</div><div class="gallery-lightbox" hidden role="dialog" aria-modal="true" aria-label="Expanded gallery image"><button class="gallery-lightbox-close" type="button" aria-label="Close image">×</button><img alt=""><p></p></div></div>';
  }

  function setupGallery() {
    const browser = document.querySelector('.gallery-browser');
    if (!browser) return;
    const folderButtons = browser.querySelectorAll('[data-gallery-folder]');
    const yearButtons = browser.querySelectorAll('[data-gallery-year]');
    const allButton = browser.querySelector('[data-gallery-all]');
    function filterPhotos(folder, year) {
      browser.querySelectorAll('[data-gallery-item]').forEach(function (item) {
        item.hidden = folder ? item.dataset.galleryFolder !== folder : (year ? item.dataset.galleryFolder.split('/')[0] !== year : false);
      });
    }
    function setActive(buttons, active) {
      buttons.forEach(function (item) { item.classList.toggle('is-active', item === active); });
    }
    allButton.addEventListener('click', function () {
      setActive(yearButtons, null);
      setActive(folderButtons, null);
      allButton.classList.add('is-active');
      browser.querySelectorAll('[data-gallery-year-group]').forEach(function (group) { group.hidden = true; });
      filterPhotos('', '');
    });
    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const year = button.dataset.galleryYear;
        setActive(yearButtons, button);
        setActive(folderButtons, null);
        allButton.classList.remove('is-active');
        browser.querySelectorAll('[data-gallery-year-group]').forEach(function (group) { group.hidden = group.dataset.galleryYearGroup !== year; });
        filterPhotos('', year);
      });
    });
    folderButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        setActive(yearButtons, null);
        setActive(folderButtons, button);
        allButton.classList.remove('is-active');
        browser.querySelectorAll('[data-gallery-year-group]').forEach(function (group) { group.hidden = true; });
        filterPhotos(button.dataset.galleryFolder, '');
      });
    });
    browser.querySelectorAll('[data-gallery-year-group]').forEach(function (group) { group.hidden = group.dataset.galleryYearGroup !== (yearButtons[0] && yearButtons[0].dataset.galleryYear); });
    const lightbox = browser.querySelector('.gallery-lightbox');
    const lightboxImage = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('p');
    function closeLightbox() {
      lightbox.hidden = true;
      lightboxImage.removeAttribute('src');
      document.body.classList.remove('gallery-is-open');
    }
    browser.querySelectorAll('[data-gallery-image]').forEach(function (button) {
      button.addEventListener('click', function () {
        lightboxImage.src = button.dataset.galleryImage;
        lightboxImage.alt = button.dataset.galleryAlt;
        lightboxCaption.textContent = button.dataset.galleryAlt;
        lightbox.hidden = false;
        document.body.classList.add('gallery-is-open');
      });
    });
    lightbox.querySelector('.gallery-lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    browser.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });
  }

  function render(key) {
    if (!pages[key]) key = 'home';
    let content;
    if (key === 'home') {
      content = {
        lede: 'Security Club is a welcoming campus community for beginners, builders and problem-solvers. Explore cybersecurity through workshops, CTFs, projects and hands-on learning.',
        body: '<div class="home-hero-visual"><img src="assets/security-shield.svg" alt="Security Club shield" width="420" height="420"></div><div class="home-actions"><a class="button button-primary" href="#/events">Explore events →</a><a class="button button-ghost" href="#/about">Meet the club</a></div><p class="hero-note">No prior knowledge. No gatekeeping. Just curiosity.</p><section class="intro"><p class="eyebrow">A club for first steps</p><h2>You do not need to be a hacker to start.</h2><p>We make the first step practical, social and fun. Find your people, try a lab and build real skills at your own pace.</p></section><section class="opportunities"><div class="stat"><strong>Community</strong><span>learn together</span></div><div class="stat"><strong>Questions</strong><span>always welcome</span></div><div class="stat"><strong>Hands-on</strong><span>build real skills</span></div></section>'
      };
    } else if (key === 'events') {
      content = { lede: 'Workshops, bootcamps, community sessions and competitions designed around learning by doing.', body: cards(window.eventsData || [], 'event-grid') };
    } else if (key === 'team') {
      content = { lede: 'Meet the students and faculty who help make cybersecurity approachable, practical and collaborative.', body: cards(window.teamData || [], 'team-grid') };
    } else if (key === 'gallery') {
      content = { lede: 'Browse the original folder arrangement, then open any photo for a closer look.', body: galleryMarkup(window.galleryData || []) };
    } else if (key === 'about') {
      content = { lede: 'A student-led space to understand technology, question assumptions and practise defending the systems we depend on.', body: '<div class="split-content"><article class="info-panel"><p class="eyebrow">Our purpose</p><h2>Security is a team sport.</h2><p>We believe cybersecurity grows through curiosity, responsible practice and people willing to share what they learn.</p></article><article class="info-panel"><p class="eyebrow">Our principles</p><h2>Learn openly. Build responsibly.</h2><p>We create beginner-friendly spaces for secure coding, digital safety, ethical hacking, research and defence.</p></article></div>' };
    } else if (key === 'flagships') {
      content = { lede: 'Our recurring initiatives create clear ways to learn, practise and contribute throughout the academic year.', body: cards(window.flagshipsData || [], 'flagship-grid') };
    } else if (key === 'ctf') {
      const challenges = (window.challengesData || []).map(function (challenge) {
        return Object.assign({}, challenge, { meta: challenge.category + ' · ' + challenge.difficulty + ' · ' + challenge.points + ' points' });
      });
      content = { lede: 'Choose a challenge, learn responsibly and practise the skills that make secure systems possible.', body: cards(challenges, 'challenge-grid') };
    } else if (key === 'membership') {
      content = { lede: 'There is no account or login on this static page. To join, contact the club or visit us at an upcoming event.', body: '<div class="split-content"><article class="info-panel"><p class="eyebrow">Start here</p><h2>Show up curious.</h2><p>Join an open session, ask questions and find the area of cybersecurity that excites you. Prior experience is never required.</p><a class="button button-primary" href="#/events">See events →</a></article><article class="info-panel"><p class="eyebrow">What you can explore</p><ul class="clean-list"><li>Security fundamentals</li><li>CTFs and practical labs</li><li>Secure development</li><li>Research and community projects</li></ul></article></div>' };
    } else if (key === 'contact') {
      content = { lede: 'For collaborations, event invites, workshop partnerships or club questions, reach us directly by email or WhatsApp.', body: '<div class="contact-layout"><div class="contact-panel"><p class="eyebrow">Contact info</p><a class="contact-email" href="mailto:securityclubdbit@gmail.com">securityclubdbit@gmail.com</a><p>WhatsApp: <a href="https://wa.me/919819582340" target="_blank" rel="noreferrer">+91 98195 82340</a></p><p>Location: DBIT Innovation Lab</p><p>Office hours: Tuesday and Thursday, 4 PM to 6 PM</p><div class="home-actions"><a class="button button-primary" href="mailto:securityclubdbit@gmail.com">Send an email →</a><a class="button button-ghost" href="https://wa.me/919819582340" target="_blank" rel="noreferrer">Open WhatsApp ↗</a></div></div><form class="contact-panel contact-form" id="contact-form"><p class="eyebrow">Message the club</p><label for="contact-name">Name</label><input id="contact-name" name="name" required><label for="contact-email">Email</label><input id="contact-email" name="email" type="email" required><label for="contact-message">Message</label><textarea id="contact-message" name="message" rows="5" required></textarea><p class="form-help">Your email app will open with the message prepared. Nothing is stored on a server.</p><button class="button button-primary" type="submit">Prepare email →</button></form></div>' };
    } else {
      content = { lede: 'This page is presented as a public static information page. There is no login, account system or private data in this version.', body: '<div class="split-content"><article class="info-panel"><p class="eyebrow">Static workspace</p><h2>' + pages[key].label + '</h2><p>Use this space to publish the club’s current work, resources and updates directly from the GitHub repository.</p></article><article class="info-panel"><p class="eyebrow">How it works</p><h2>GitHub is the editor.</h2><p>Update the HTML, CSS, JavaScript and image folders, then commit and push. The hosted page reflects the repository contents.</p></article></div>' };
    }
    app.innerHTML = shell(key, content);
    setupGallery();
    if (key === 'events') setupEvents(window.eventsData || []);
    document.title = pages[key].label + ' | Security Club DBIT';
    navigation.querySelectorAll('a').forEach(function (link) { link.classList.toggle('active', link.dataset.page === key); });
    const contactForm = app.querySelector('#contact-form');
    if (contactForm) contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const form = new FormData(contactForm);
      const subject = encodeURIComponent('Security Club DBIT enquiry from ' + form.get('name'));
      const body = encodeURIComponent(String(form.get('message')) + '\n\nFrom: ' + form.get('name') + '\nEmail: ' + form.get('email'));
      window.location.href = 'mailto:securityclubdbit@gmail.com?subject=' + subject + '&body=' + body;
    });
    decodeText(app.querySelector('h1'));
    app.focus({ preventScroll: true });
  }

  function decodeText(element) {
    if (!element) return;
    const finalText = element.textContent;
    const chars = "!@#$%^&*()_+{}:\"<>?|[];',./`~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let iteration = 0;
    const interval = setInterval(function () {
      element.textContent = finalText.split('').map(function (character, index) {
        if (index < iteration) return character;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      iteration += 1 / 3;
      if (iteration >= finalText.length) {
        element.textContent = finalText;
        clearInterval(interval);
      }
    }, 30);
  }

  function setupMatrix() {
    const context = matrixCanvas.getContext('2d');
    if (!context) return;
    const characters = '01';
    const fontSize = 14;
    let width = 0;
    let height = 0;
    let drops = [];
    function resize() {
      width = matrixCanvas.width = window.innerWidth;
      height = matrixCanvas.height = window.innerHeight;
      drops = new Array(Math.floor(width / fontSize)).fill(1);
    }
    function draw() {
      context.fillStyle = 'rgba(0, 0, 0, 0.1)';
      context.fillRect(0, 0, width, height);
      context.fillStyle = '#00ff40';
      context.font = fontSize + "px 'JetBrains Mono', monospace";
      drops.forEach(function (drop, index) {
        context.fillText(characters.charAt(Math.floor(Math.random() * characters.length)), index * fontSize, drop * fontSize);
        if (drop * fontSize > height && Math.random() > .975) drops[index] = 0;
        drops[index] += 1;
      });
    }
    resize();
    window.addEventListener('resize', resize);
    window.setInterval(draw, 70);
  }

  menuButton.addEventListener('click', function () {
    const open = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  navigation.addEventListener('click', function (event) {
    if (event.target.matches('a')) { navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
  });
  window.addEventListener('hashchange', function () { render(location.hash.replace('#/', '') || 'home'); window.scrollTo(0, 0); });
  const storedTheme = localStorage.getItem('security-club-theme') === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = storedTheme;
  function updateTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('security-club-theme', theme);
    const isLight = theme === 'light';
    themeToggle.setAttribute('aria-label', 'Switch to ' + (isLight ? 'dark' : 'light') + ' theme');
    themeToggle.innerHTML = '<span aria-hidden="true">' + (isLight ? '☾' : '☀') + '</span><span>' + (isLight ? 'Dark' : 'Light') + '</span>';
  }
  themeToggle.addEventListener('click', function () {
    updateTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
  });
  updateTheme(storedTheme);
  document.querySelector('#current-year').textContent = new Date().getFullYear();
  setupMatrix();
  render(location.hash.replace('#/', '') || 'home');
}());
