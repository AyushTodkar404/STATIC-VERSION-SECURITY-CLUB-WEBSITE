import { mountSecurityLogo } from './SecurityLogoTrace.js';

(function () {
  const app = document.querySelector('#app');
  const navigation = document.querySelector('.site-nav');
  const menuButton = document.querySelector('.menu-toggle');
  const matrixCanvas = document.querySelector('#matrix-background');
  const scrambleSessionKey = 'security-club-heading-scramble-v1';
  let scrambleInterval = 0;

  const pages = {
    home: { label: 'Welcome', title: 'Curious about cybersecurity? You belong here.', eyebrow: 'Security Club · Welcome terminal' },
    about: { label: 'About Us', title: 'Learn how the digital world works—and how to protect it.', eyebrow: 'A club for first steps' },
    events: { label: 'Events', title: 'Learn together. Build together. Defend together.', eyebrow: 'Events archive' },
    flagships: { label: 'Flagships', title: 'Programs that turn curiosity into capability.', eyebrow: 'Our signature initiatives' },
    team: { label: 'Team', title: 'The people behind the signal.', eyebrow: 'Meet the club team' },
    gallery: { label: 'Gallery', title: 'Captured in the club.', eyebrow: 'Moments from our community' },
    membership: { label: 'Membership', title: 'Your route from visitor to contributor.', eyebrow: 'Join the community' },
    submission: { label: 'Submission', title: 'Submit your interest in the club.', eyebrow: 'Student submission' },
    contact: { label: 'Contact', title: 'Have a question? Start a conversation.', eyebrow: 'Reach the club' },
    ctf: { label: 'CTF', title: 'Think sideways. Solve carefully. Learn constantly.', eyebrow: 'Capture the flag' },
    privacy: { label: 'Privacy & Ethics', title: 'Responsible practice. Student privacy.', eyebrow: 'Code of conduct & disclosure' },
    notFound: { label: '404 - Not Found', title: 'Target vector not found in cyberspace.', eyebrow: 'Status · 404' }
  };

  const linkOrder = ['home', 'about', 'events', 'flagships', 'team', 'gallery', 'membership', 'submission', 'contact', 'ctf'];
  navigation.innerHTML = linkOrder.map(function (key) {
    return '<a href="#/' + key + '" data-page="' + key + '">' + pages[key].label + '</a>';
  }).join('');

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character];
    });
  }

  function gmailComposeUrl(subject, body) {
    const params = new URLSearchParams({ view: 'cm', fs: '1', to: 'securityclubdbit@gmail.com', su: subject, body: body || '' });
    return 'https://mail.google.com/mail/?' + params.toString();
  }

  function image(path, fallback, alt, className, priority) {
    const priorityAttr = priority ? ' fetchpriority="high"' : ' loading="lazy"';
    return '<img' + priorityAttr + ' decoding="async" class="' + (className || 'card-image') + '" src="' + escapeHtml(path) + '" alt="' + escapeHtml(alt) + '" data-image-fallback="' + escapeHtml(fallback) + '" onload="this.classList.add(\'is-loaded\')">';
  }

  app.addEventListener('error', function (event) {
    const failedImage = event.target;
    if (!(failedImage instanceof HTMLImageElement)) return;
    if (failedImage.src && failedImage.src.endsWith('.webp') && !failedImage.dataset.fallbackTried) {
      failedImage.dataset.fallbackTried = 'jpg';
      failedImage.src = failedImage.src.replace(/\.webp$/, '.jpg');
      return;
    }
    if (failedImage.src && failedImage.dataset.fallbackTried === 'jpg') {
      failedImage.dataset.fallbackTried = 'JPG';
      failedImage.src = failedImage.src.replace(/\.jpg$/, '.JPG');
      return;
    }
    if (!failedImage.hasAttribute('data-image-fallback')) return;
    const fallback = document.createElement('div');
    fallback.className = failedImage.className || 'card-image';
    fallback.setAttribute('role', 'img');
    fallback.setAttribute('aria-label', failedImage.alt || 'Image unavailable');
    fallback.textContent = failedImage.dataset.imageFallback;
    failedImage.replaceWith(fallback);
  }, true);

  function shell(key, content) {
    const page = pages[key];
    return '<div class="page section-shell"><section class="page-hero"><div><p class="eyebrow">' + page.eyebrow + '</p><h1>' + page.title + '</h1><p class="hero-lede">' + content.lede + '</p></div></section>' + content.body + '</div>';
  }

  function cards(items, type) {
    return '<div class="card-grid ' + (type || '') + '">' + items.map(function (item, index) {
      const isTop = index < 2;
      const photo = item.image ? (type === 'team-grid' ? '<a class="team-image-link" href="' + escapeHtml(item.image) + '" target="_blank" rel="noopener noreferrer" aria-label="View full-size photo of ' + escapeHtml(item.name || item.alt || 'team member') + '">' + image(item.image, '+', item.name || item.title || item.alt, '', isTop) + '</a>' : image(item.image, '+', item.name || item.title || item.alt, '', isTop)) : '<div class="card-image card-placeholder" aria-hidden="true"></div>';
      const eventAttribute = type === 'event-grid' ? ' data-event-id="' + escapeHtml(item.title) + '"' : '';
      const eventHint = type === 'event-grid' ? '<p class="card-action-hint">Open event details →</p>' : '';
      const departmentAttr = item.department ? ' data-team-department="' + escapeHtml(item.department) + '"' : '';
      const highlightClass = item.highlight ? ' card-highlight' : '';
      return '<article class="card' + (type === 'event-grid' ? ' event-card' : '') + highlightClass + '"' + eventAttribute + departmentAttr + '>' + photo + '<div class="card-body">' + (item.meta ? '<p class="card-meta">' + item.meta + '</p>' : '') + '<h3>' + escapeHtml(item.name || item.title) + '</h3>' + (item.role ? '<p class="role">' + escapeHtml(item.role) + '</p>' : '') + '<p>' + escapeHtml(item.description || item.bio || '') + '</p>' + eventHint + '</div></article>';
    }).join('') + '</div>';
  }

  function teamSections(items) {
    const roleRank = function (role) {
      const r = String(role || '').toLowerCase();
      if (/president\b/i.test(r) && !/vice/i.test(r)) return 10;
      if (/vice\s*president/i.test(r)) return 20;
      if (/research\s*head/i.test(r) && !/asst/i.test(r)) return 30;
      if (/technical\s*head/i.test(r)) return 31;
      if (/event\s*head/i.test(r) && !/asst/i.test(r)) return 32;
      if (/editorial.*head/i.test(r) && !/asst/i.test(r)) return 33;
      if (/publicity\s*head/i.test(r) && !/asst/i.test(r)) return 34;
      if (/asst.*research/i.test(r)) return 40;
      if (/asst.*event/i.test(r)) return 41;
      if (/asst.*editorial/i.test(r)) return 42;
      if (/asst.*publicity/i.test(r)) return 43;
      if (/member/i.test(r)) return 50;
      return 60;
    };

    const departmentOf = function (role) {
      const r = String(role || '').toLowerCase();
      if (/president/i.test(r)) return 'leadership';
      if (/technical/i.test(r)) return 'technical';
      if (/research/i.test(r)) return 'research';
      if (/event|publicity/i.test(r)) return 'events';
      if (/editorial|design/i.test(r)) return 'design';
      return 'other';
    };

    const byFirstName = function (left, right) {
      const firstName = function (member) {
        return String(member.name || '').trim().split(/\s+/)[0] || '';
      };
      return firstName(left).localeCompare(firstName(right), undefined, { sensitivity: 'base' })
        || String(left.name || '').localeCompare(String(right.name || ''), undefined, { sensitivity: 'base' });
    };

    const byLeadership = function (left, right) {
      const rankDiff = roleRank(left.role) - roleRank(right.role);
      if (rankDiff !== 0) return rankDiff;
      return byFirstName(left, right);
    };

    const mentors = items.filter(function (member) {
      return /faculty|mentor|teacher/i.test(member.role || '');
    }).slice().sort(byFirstName).map(function (m) {
      return Object.assign({}, m, { meta: m.meta || 'Faculty Mentor' });
    });

    const alumni = items.filter(function (member) {
      return /alumni/i.test(member.role || '');
    }).slice().sort(byFirstName).map(function (a) {
      return Object.assign({}, a, { meta: a.meta || 'Alumni' });
    });

    const coreTeam = items.filter(function (member) {
      return !/faculty|mentor|teacher|alumni/i.test(member.role || '');
    }).slice().sort(byLeadership).map(function (c) {
      const dept = departmentOf(c.role);
      const isLead = /president/i.test(c.role || '');
      let deptLabel = 'CORE TEAM';
      if (dept === 'leadership') deptLabel = 'EXECUTIVE LEADERSHIP';
      else if (dept === 'technical') deptLabel = 'TECHNICAL';
      else if (dept === 'research') deptLabel = 'RESEARCH';
      else if (dept === 'events') deptLabel = 'EVENTS & PR';
      else if (dept === 'design') deptLabel = 'DESIGN & EDITORIAL';
      return Object.assign({}, c, {
        department: dept,
        highlight: isLead,
        meta: c.meta || ('2026–27 · ' + deptLabel)
      });
    });

    const filterBar = '<div class="team-filters" role="group" aria-label="Filter core team 2026-27 by department">'
      + '<button class="team-filter-button is-active" type="button" data-team-filter="all" aria-pressed="true">All (' + coreTeam.length + ')</button>'
      + '<button class="team-filter-button" type="button" data-team-filter="leadership" aria-pressed="false">Leadership</button>'
      + '<button class="team-filter-button" type="button" data-team-filter="technical" aria-pressed="false">Technical</button>'
      + '<button class="team-filter-button" type="button" data-team-filter="research" aria-pressed="false">Research</button>'
      + '<button class="team-filter-button" type="button" data-team-filter="events" aria-pressed="false">Events & PR</button>'
      + '<button class="team-filter-button" type="button" data-team-filter="design" aria-pressed="false">Design & Editorial</button>'
      + '</div>';

    return '<section class="team-section" aria-labelledby="team-mentors-heading"><div class="team-section-heading"><p class="eyebrow">Guidance and support</p><h2 id="team-mentors-heading">Mentors</h2><p>Faculty coordinators and teachers supporting the club.</p></div>'
      + (mentors.length ? cards(mentors, 'team-grid') : '<p class="team-empty">Mentors will be listed here.</p>')
      + '</section><section class="team-section" aria-labelledby="team-alumni-heading"><div class="team-section-heading"><p class="eyebrow">Our foundation & heritage</p><h2 id="team-alumni-heading">Alumni</h2><p>Former members who helped shape the Security Club.</p></div>'
      + (alumni.length ? cards(alumni, 'team-grid') : '<p class="team-empty">Alumni will be listed here.</p>')
      + '</section><section class="team-section" aria-labelledby="team-core-2026-heading"><div class="team-section-heading team-heading-split"><div><p class="eyebrow">Student leadership · Tenure 2026–2027</p><h2 id="team-core-2026-heading">Core Team 2026–27</h2><p>The student council and coordinators leading Security Club DBIT for the 2026–2027 academic year.</p></div><span class="team-tenure-badge"><span class="team-pulse-dot" aria-hidden="true"></span>Active Tenure: 2026–27</span></div>'
      + filterBar
      + (coreTeam.length ? cards(coreTeam, 'team-grid') : '<p class="team-empty">Core team members will be listed here.</p>')
      + '</section>';
  }

  function aboutMarkup() {
    return '<div class="split-content"><article class="info-panel"><p class="eyebrow">Our purpose</p><h2>Security is a team sport.</h2><p>We believe cybersecurity grows through curiosity, responsible practice and people willing to share what they learn.</p></article><article class="info-panel"><p class="eyebrow">Our principles</p><h2>Learn openly. Build responsibly.</h2><p>We create beginner-friendly spaces for secure coding, digital safety, ethical hacking, research and defence.</p></article></div>'
      + '<div class="about-vision-mission"><section class="info-panel course-panel" aria-labelledby="about-vision-heading"><p class="eyebrow">Our Vision</p><h2 id="about-vision-heading">A secure and socially responsible digital ecosystem</h2><p>To establish a center in the field of security that develops ethically grounded, industry-ready professionals who innovate, research, and contribute to building a secure and socially responsible digital ecosystem.</p></section><section class="info-panel course-panel" aria-labelledby="about-mission-heading"><p class="eyebrow">Our Mission</p><h2 id="about-mission-heading">Learn, act ethically, and keep innovating</h2><ul class="mission-list"><li>To develop industry-ready security professionals through hands-on training, practical exposure, and modern tools.</li><li>To foster ethical practices, digital responsibility, and integrity in the use of technology.</li><li>To promote innovation, research, and continuous learning while preparing students for certifications, careers, and real-world challenges.</li></ul></section></div>'
      + '<div class="about-coursework"><section class="info-panel course-panel" aria-labelledby="course-objectives-heading"><p class="eyebrow">Course Objectives</p><h2 id="course-objectives-heading">Key objectives of the Security Club</h2><p>The key objectives of the Security Club are:</p><ol class="course-objectives"><li>To provide training in industry-relevant cybersecurity tools, frameworks, and methodologies.</li><li>To enhance students’ preparedness for internships, certifications, and placements in cybersecurity roles.</li><li>To encourage research, innovation, and project-based learning within security domains.</li><li>To promote ethical hacking practices through structured awareness programs and practical sessions.</li><li>To foster responsible digital conduct through interactive workshops and seminars.</li></ol></section>'
      + '<section class="info-panel course-panel" aria-labelledby="course-outcomes-heading"><p class="eyebrow">Course Outcomes (COs)</p><h2 id="course-outcomes-heading">Students will be able to:</h2><div class="course-outcomes"><article class="course-outcome"><h3>CO1</h3><p>Define fundamental digital security concepts, threats, vulnerabilities and ethical principles, and explain industry practices, commonly used cybersecurity tools and methodologies.</p></article><article class="course-outcome"><h3>CO2</h3><p>Apply digital security concepts, tools, and methodologies to implement security practices and address cybersecurity challenges through practical hands-on activities and competitions.</p></article><article class="course-outcome"><h3>CO3</h3><p>Analyze digital security threats, vulnerabilities, security solutions, and ethical implications to determine appropriate mitigation strategies and evaluate their effectiveness in practical scenarios.</p></article><article class="course-outcome"><h3>CO4</h3><p>Create innovative digital security solutions, awareness initiatives, and technical portfolios to address identified security challenges while demonstrating teamwork, effective communication, and responsible digital conduct.</p></article></div></section></div>';
  }
  function eventDetailsMarkup(event) {
    const files = (event.attachments || []).map(function (file) {
      return '<li><a class="button button-ghost attachment-link" href="' + escapeHtml(file.path) + '" target="_blank" rel="noopener">' + escapeHtml(file.label || file.path) + ' ↗</a><span>' + escapeHtml(file.type || 'File') + '</span></li>';
    }).join('');

    const objectivesHtml = (event.objectives && event.objectives.length) ? '<h3>Objectives</h3><ol class="event-objectives">' + event.objectives.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('') + '</ol>' : '';

    const outcomesHtml = (event.outcomes && event.outcomes.length) ? '<h3>Outcomes</h3><div class="event-outcomes">' + event.outcomes.map(function (item, index) {
      const code = typeof item === 'object' && item.code ? item.code : ('CO' + (index + 1));
      const text = typeof item === 'object' && item.text ? item.text : String(item).replace(/^CO\d+[:\s-]*/i, '');
      return '<div class="event-outcome-item"><span class="event-outcome-code">' + escapeHtml(code) + '</span><p>' + escapeHtml(text) + '</p></div>';
    }).join('') + '</div>' : '';

    const metaParts = [];
    if (event.dateLabel || event.date) metaParts.push(escapeHtml(event.dateLabel || event.date));
    if (event.venue) metaParts.push(escapeHtml(event.venue));
    if (event.speaker) metaParts.push('Speaker: ' + escapeHtml(event.speaker));

    return '<div class="event-detail-overlay" role="dialog" aria-modal="true" aria-label="Event details"><div class="event-detail"><button class="event-detail-close" type="button" aria-label="Close event details">×</button><p class="eyebrow">' + escapeHtml(event.type || 'Event') + '</p><h2>' + escapeHtml(event.title) + '</h2><p class="event-detail-meta">' + metaParts.join(' · ') + '</p><p>' + escapeHtml(event.description || '') + '</p>' + objectivesHtml + outcomesHtml + '<h3>Attached files</h3>' + (files ? '<ul class="attachment-list">' + files + '</ul>' : '<p class="muted">No files are attached to this event yet.</p>') + '</div></div>';
  }

  function eventYear(date) {
    const value = String(date || '').trim();
    const iso = value.match(/^(\d{4})[-/]/);
    const dayFirst = value.match(/^\d{1,2}[-/]\d{1,2}[-/](\d{4})$/);
    return (iso && iso[1]) || (dayFirst && dayFirst[1]) || 'Undated';
  }

  function eventsMarkup(items) {
    const years = items.map(function (item) { return eventYear(item.date); })
      .filter(function (year, index, all) { return all.indexOf(year) === index; })
      .sort(function (left, right) {
        if (left === 'Undated') return 1;
        if (right === 'Undated') return -1;
        return right.localeCompare(left);
      });
    if (!years.length) return '<p class="team-empty">Events will be listed here.</p>';
    const initialYear = years[0];
    const buttons = years.map(function (year) {
      return '<button class="gallery-year-button event-year-button' + (year === initialYear ? ' is-active' : '') + '" type="button" data-event-year="' + escapeHtml(year) + '" aria-pressed="' + (year === initialYear) + '">' + escapeHtml(year) + '</button>';
    }).join('');
    const groups = years.map(function (year) {
      const yearItems = items.filter(function (item) { return eventYear(item.date) === year; });
      return '<section class="event-year-group" data-event-year-group="' + escapeHtml(year) + '" aria-label="Events in ' + escapeHtml(year) + '"' + (year === initialYear ? '' : ' hidden') + '>' + cards(yearItems, 'event-grid') + '</section>';
    }).join('');
    return '<div class="event-browser"><div class="event-years" role="group" aria-label="Filter events by year">' + buttons + '</div>' + groups + '</div>';
  }

  function setupEvents(items) {
    const browser = document.querySelector('.event-browser');
    if (!browser) return;
    const yearButtons = browser.querySelectorAll('[data-event-year]');
    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        yearButtons.forEach(function (other) {
          const selected = other === button;
          other.classList.toggle('is-active', selected);
          other.setAttribute('aria-pressed', String(selected));
        });
        browser.querySelectorAll('[data-event-year-group]').forEach(function (group) {
          group.hidden = group.dataset.eventYearGroup !== button.dataset.eventYear;
        });
      });
    });
    const cards = document.querySelectorAll('[data-event-id]');
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

  function setupTeam() {
    const filterButtons = document.querySelectorAll('[data-team-filter]');
    const cards = document.querySelectorAll('[data-team-department]');
    if (!filterButtons.length) return;
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        filterButtons.forEach(function (b) {
          const active = b === button;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        const selected = button.dataset.teamFilter;
        cards.forEach(function (card) {
          card.hidden = (selected !== 'all' && card.dataset.teamDepartment !== selected);
        });
      });
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
        const item = items.find(function (entry) { return entry.folder === folder && entry.folderLabel; });
        const label = (item && item.folderLabel) || folder.split('/').slice(1).join(' / ');
        return '<button class="gallery-folder-button" type="button" data-gallery-folder="' + escapeHtml(folder) + '">' + escapeHtml(label) + '</button>';
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

  function showFormFeedback(formElement, url, serviceName) {
    const previous = formElement.querySelector('.form-feedback');
    if (previous) previous.remove();
    const feedback = document.createElement('div');
    feedback.className = 'form-feedback is-success';
    feedback.setAttribute('role', 'status');
    feedback.innerHTML = '<strong>Draft ready!</strong> Opening ' + escapeHtml(serviceName) + '… If your browser blocked popups, <a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">click here to open manually ↗</a>';
    formElement.append(feedback);
  }

  function render(key) {
    if (!pages[key]) key = 'notFound';
    if (scrambleInterval) {
      window.clearInterval(scrambleInterval);
      scrambleInterval = 0;
    }
    let content;
    if (key === 'home') {
      content = {
        lede: 'Security Club is a welcoming campus community for beginners, builders and problem-solvers. Explore cybersecurity through workshops, CTFs, projects and hands-on learning.',
        body: '<div class="home-hero-visual"></div><div class="home-actions"><a class="button button-primary" href="#/events">Explore events →</a><a class="button button-ghost" href="#/about">Meet the club</a></div><p class="hero-note">No prior knowledge. No gatekeeping. Just curiosity.</p><section class="intro"><p class="eyebrow">A club for first steps</p><h2>You do not need to be a hacker to start.</h2><p>We make the first step practical, social and fun. Find your people, try a lab and build real skills at your own pace.</p></section><section class="opportunities"><div class="stat"><strong>Community</strong><span>learn together</span></div><div class="stat"><strong>Questions</strong><span>always welcome</span></div><div class="stat"><strong>Hands-on</strong><span>build real skills</span></div></section>'
      };
    } else if (key === 'events') {
      content = { lede: 'Browse Security Club events by year. Select a year to see that year’s workshops, bootcamps and community sessions.', body: eventsMarkup(window.eventsData || []) };
    } else if (key === 'team') {
      content = { lede: 'Meet the faculty mentors and student core team who make cybersecurity approachable, practical and collaborative.', body: teamSections(window.teamData || []) };
    } else if (key === 'gallery') {
      content = { lede: 'Browse the original folder arrangement, then open any photo for a closer look.', body: galleryMarkup(window.galleryData || []) };
    } else if (key === 'about') {
      content = { lede: 'A student-led space to understand technology, question assumptions and practise defending the systems we depend on.', body: aboutMarkup() };
    } else if (key === 'flagships') {
      const flagships = window.flagshipsData || [];
      content = {
        lede: 'Our recurring initiatives create clear ways to learn, practise and contribute throughout the academic year.',
        body: flagships.length ? cards(flagships, 'flagship-grid') : '<p class="team-empty">Flagship programs will be announced soon.</p>'
      };
    } else if (key === 'ctf') {
      const challenges = (window.challengesData || []).map(function (challenge) {
        return Object.assign({}, challenge, { meta: challenge.category + ' · ' + challenge.difficulty + ' · ' + challenge.points + ' points' });
      });
      content = {
        lede: 'Choose a challenge, learn responsibly and practise the skills that make secure systems possible.',
        body: challenges.length ? cards(challenges, 'challenge-grid') : '<p class="team-empty">No active CTF challenges at this moment. Check back soon!</p>'
      };
    } else if (key === 'membership') {
      content = { lede: 'There is no account or login on this static page. Contact the club to ask about joining and upcoming sessions.', body: '<div class="split-content"><article class="info-panel"><p class="eyebrow">Start here</p><h2>Show up curious.</h2><p>Join an open session, ask questions and find the area of cybersecurity that excites you. Prior experience is never required.</p><a class="button button-primary" href="#/contact">Contact the club</a></article><article class="info-panel"><p class="eyebrow">What you can explore</p><ul class="clean-list"><li>Security fundamentals</li><li>CTFs and practical labs</li><li>Secure development</li><li>Research and community projects</li></ul></article></div>' };
    } else if (key === 'submission') {
      content = { lede: 'Share your details and tell us why you would like to join. Choose Gmail or WhatsApp to open a prepared message that you can review and send.', body: '<form class="contact-panel contact-form submission-form-panel" id="student-submission-form"><label for="submission-name">Name</label><input id="submission-name" name="name" autocomplete="name" required><label for="submission-email">Gmail address</label><input id="submission-email" name="email" type="email" autocomplete="email" required><label for="submission-phone">Phone number</label><input id="submission-phone" name="phone" type="tel" autocomplete="tel" required><label for="submission-reason">Reason to join the club</label><textarea id="submission-reason" name="reason" rows="4" required></textarea><label for="submission-query">Query or question <span class="form-optional">(optional)</span></label><textarea id="submission-query" name="query" rows="3"></textarea><div class="submission-details"><div><label for="submission-year">Year of study</label><select id="submission-year" name="year" required><option value="">Choose your year</option><option value="FE">FE (First Year)</option><option value="SE">SE (Second Year)</option><option value="TE">TE (Third Year)</option><option value="BE">BE (Fourth Year)</option></select></div><div><label for="submission-division">Division</label><select id="submission-division" name="division" required><option value="">Choose your division</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="Other">Other / not listed</option></select></div></div><p class="form-help">This static website does not store your details. A prepared message opens in your selected service; review and send it there.</p><div class="submission-actions"><button class="button button-primary" type="submit" name="destination" value="gmail">Send on Gmail ↗</button><button class="button button-ghost" type="submit" name="destination" value="whatsapp">Send on WhatsApp ↗</button></div></form>' };
    } else if (key === 'contact') {
      content = {
        lede: 'For collaborations, event invites, workshop partnerships or club questions, reach us directly by email or WhatsApp.',
        body: '<div class="contact-layout"><div class="contact-panel"><p class="eyebrow">Contact info</p><a class="contact-email" href="mailto:securityclubdbit@gmail.com" title="Direct mailto link">securityclubdbit@gmail.com</a><p>WhatsApp / Call: <a href="https://wa.me/918369448072" target="_blank" rel="noopener noreferrer">+91 83694 48072</a></p><p>Location: Don Bosco Institute of Technology, Kurla, Mumbai</p><p>For current meeting times and sessions, reach out directly or join our community.</p><div class="home-actions"><a class="button button-primary" href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=securityclubdbit%40gmail.com" target="_blank" rel="noopener noreferrer">Compose in Gmail ↗</a><a class="button button-ghost" href="mailto:securityclubdbit@gmail.com">Direct mailto</a><a class="button button-ghost" href="https://wa.me/918369448072" target="_blank" rel="noopener noreferrer">Open WhatsApp ↗</a></div></div><form class="contact-panel contact-form" id="contact-form"><p class="eyebrow">Message the club</p><label for="contact-name">Name</label><input id="contact-name" name="name" required><label for="contact-email">Email</label><input id="contact-email" name="email" type="email" required><label for="contact-message">Message</label><textarea id="contact-message" name="message" rows="5" required></textarea><p class="form-help">Opens a Gmail draft in your browser. Sign in if prompted, then review and send it from Gmail. The message is not sent automatically.</p><button class="button button-primary" type="submit">Open Gmail draft →</button></form></div>'
      };
    } else if (key === 'privacy') {
      content = {
        lede: 'Our commitments to student privacy, data minimization, and responsible cybersecurity research.',
        body: '<div class="split-content"><article class="info-panel"><p class="eyebrow">Data & Privacy</p><h2>Zero Tracking. Zero Storage.</h2><p>This static website does not set tracking cookies, load third-party analytics pixels, or store data on any server. Any details you enter in the submission or contact forms are compiled locally and handed directly to your own Gmail or WhatsApp client. We never monetize or distribute student data.</p></article><article class="info-panel"><p class="eyebrow">Ethics & Conduct</p><h2>Defend. Disclose. Do No Harm.</h2><p>Security Club DBIT teaches defensive security, ethical research, and collaborative problem-solving. All club activities, labs, and CTFs operate within designated sandbox environments. Members pledge to respect digital boundaries, comply with institutional codes, and uphold professional integrity.</p></article></div>'
      };
    } else if (key === 'notFound') {
      content = {
        lede: 'The requested vector does not exist or has been relocated in this terminal.',
        body: '<div class="split-content"><article class="info-panel"><p class="eyebrow">Status · 404</p><h2>Target Not Found</h2><p>The route you requested does not resolve to an active section. Re-route using the buttons below.</p><div class="home-actions" style="margin-top:1.5rem"><a class="button button-primary" href="#/">Return to Terminal →</a><a class="button button-ghost" href="#/contact">Contact the club</a></div></article></div>'
      };
    } else {
      content = { lede: 'This page is presented as a public static information page. There is no login, account system or private data in this version.', body: '<div class="split-content"><article class="info-panel"><p class="eyebrow">Static workspace</p><h2>' + pages[key].label + '</h2><p>Use this space to publish the club’s current work, resources and updates directly from the GitHub repository.</p></article><article class="info-panel"><p class="eyebrow">How it works</p><h2>GitHub is the editor.</h2><p>Update the HTML, CSS, JavaScript and image folders, then commit and push. The hosted page reflects the repository contents.</p></article></div>' };
    }
    app.innerHTML = shell(key, content);
    if (key === 'home') mountSecurityLogo(app.querySelector('.home-hero-visual'));
    setupGallery();
    if (key === 'events') setupEvents(window.eventsData || []);
    if (key === 'team') setupTeam();
    document.title = pages[key].label + ' | Security Club DBIT';
    navigation.querySelectorAll('a').forEach(function (link) { link.classList.toggle('active', link.dataset.page === key); });
    const contactForm = app.querySelector('#contact-form');
    if (contactForm) contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const form = new FormData(contactForm);
      const subject = 'Security Club DBIT enquiry from ' + form.get('name');
      const body = String(form.get('message')) + '\n\nFrom: ' + form.get('name') + '\nEmail: ' + form.get('email');
      const url = gmailComposeUrl(subject, body);
      window.open(url, '_blank', 'noopener,noreferrer');
      showFormFeedback(contactForm, url, 'Gmail');
    });
    const submissionForm = app.querySelector('#student-submission-form');
    if (submissionForm) submissionForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const form = new FormData(submissionForm);
      const lines = [
        'Student club submission',
        'Name: ' + form.get('name'),
        'Gmail: ' + form.get('email'),
        'Phone: ' + form.get('phone'),
        'Reason to join: ' + form.get('reason'),
        'Year of study: ' + form.get('year'),
        'Division: ' + form.get('division')
      ];
      if (form.get('query')) lines.push('Query: ' + form.get('query'));
      const message = lines.join('\n');
      const destination = event.submitter && event.submitter.value;
      const targetUrl = destination === 'whatsapp'
        ? 'https://wa.me/918369448072?text=' + encodeURIComponent(message)
        : gmailComposeUrl('Student submission to Security Club DBIT', message);
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      showFormFeedback(submissionForm, targetUrl, destination === 'whatsapp' ? 'WhatsApp' : 'Gmail');
    });
    decodeText(app.querySelector('h1'));
    app.querySelectorAll('img').forEach(function (img) {
      if (img.complete) img.classList.add('is-loaded');
    });
    app.focus({ preventScroll: true });
  }

  function decodeText(element) {
    if (!element) return;
    // sessionStorage is shared by route changes and survives reloads in this tab.
    // If storage is unavailable, keep a page-lifetime guard as a safe fallback.
    let alreadyAnimated = false;
    try {
      alreadyAnimated = sessionStorage.getItem(scrambleSessionKey) === 'done';
      if (!alreadyAnimated) sessionStorage.setItem(scrambleSessionKey, 'done');
    } catch (_) {
      alreadyAnimated = window.headingScramblePlayed === true;
      window.headingScramblePlayed = true;
    }
    if (alreadyAnimated) return;
    const finalText = element.textContent;
    const chars = "!@#$%^&*()_+{}:\"<>?|[];',./`~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let iteration = 0;
    scrambleInterval = window.setInterval(function () {
      element.textContent = finalText.split('').map(function (character, index) {
        if (index < iteration) return character;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      iteration += 1 / 3;
      if (iteration >= finalText.length) {
        element.textContent = finalText;
        window.clearInterval(scrambleInterval);
        scrambleInterval = 0;
      }
    }, 20);
  }

  function setupMatrix() {
    const context = matrixCanvas.getContext('2d');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const toggleButton = document.querySelector('#matrix-toggle');
    if (!context) return;
    const characters = '0101010123456789ABCDEF$#*+-<>/';
    const fontSize = 14;
    let width = 0;
    let height = 0;
    let drops = [];
    let animationFrame = 0;
    let animationTimer = 0;
    let isStreamActive = !reducedMotion.matches;

    function resize() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      matrixCanvas.width = Math.round(width * pixelRatio);
      matrixCanvas.height = Math.round(height * pixelRatio);
      matrixCanvas.style.width = '100%';
      matrixCanvas.style.height = '100%';
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drops = new Array(Math.floor(width / fontSize)).fill(1);
    }

    function draw() {
      animationFrame = 0;
      if (document.hidden || !isStreamActive) return;
      context.fillStyle = 'rgba(3, 7, 11, 0.12)';
      context.fillRect(0, 0, width, height);
      context.font = fontSize + "px 'JetBrains Mono', monospace";
      drops.forEach(function (drop, index) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = index * fontSize;
        const y = drop * fontSize;

        // Lead character glows in bright cyan/white
        context.fillStyle = '#e5f3f8';
        context.fillText(char, x, y);

        // Previous character in phosphor matrix green
        if (drop > 1) {
          const prevChar = characters.charAt(Math.floor(Math.random() * characters.length));
          context.fillStyle = '#00ff78';
          context.fillText(prevChar, x, (drop - 1) * fontSize);
        }

        if (y > height && Math.random() > 0.98) drops[index] = 0;
        drops[index] += 1;
      });
      animationTimer = window.setTimeout(function () {
        animationTimer = 0;
        animationFrame = window.requestAnimationFrame(draw);
      }, 70);
    }

    function pause() {
      if (animationTimer) window.clearTimeout(animationTimer);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationTimer = 0;
      animationFrame = 0;
    }

    function resume() {
      if (!document.hidden && isStreamActive && !reducedMotion.matches && !animationFrame && !animationTimer) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    }

    if (toggleButton) {
      toggleButton.setAttribute('aria-pressed', String(isStreamActive));
      toggleButton.classList.toggle('is-paused', !isStreamActive);
      const textSpan = toggleButton.querySelector('.hud-toggle-text');
      if (textSpan) textSpan.textContent = isStreamActive ? 'STREAM: ON' : 'STREAM: OFF';

      toggleButton.addEventListener('click', function () {
        isStreamActive = !isStreamActive;
        toggleButton.setAttribute('aria-pressed', String(isStreamActive));
        toggleButton.classList.toggle('is-paused', !isStreamActive);
        if (textSpan) textSpan.textContent = isStreamActive ? 'STREAM: ON' : 'STREAM: OFF';
        if (isStreamActive) {
          resume();
        } else {
          pause();
          context.clearRect(0, 0, width, height);
        }
      });
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause(); else resume();
    });
    if (typeof reducedMotion.addEventListener === 'function') {
      reducedMotion.addEventListener('change', function (event) {
        if (event.matches) {
          pause();
        } else if (isStreamActive) {
          resume();
        }
      });
    }
    resume();
  }

  function closeNav() {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }

  menuButton.addEventListener('click', function (event) {
    event.stopPropagation();
    const open = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  navigation.addEventListener('click', function (event) {
    if (event.target.matches('a')) closeNav();
  });

  document.addEventListener('click', function (event) {
    if (navigation.classList.contains('open') && !navigation.contains(event.target) && !menuButton.contains(event.target)) {
      closeNav();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navigation.classList.contains('open')) {
      closeNav();
    }
  });
  window.addEventListener('hashchange', function () { render(location.hash.replace('#/', '') || 'home'); window.scrollTo(0, 0); });
  document.querySelector('#current-year').textContent = new Date().getFullYear();
  setupMatrix();
  render(location.hash.replace('#/', '') || 'home');
}());
