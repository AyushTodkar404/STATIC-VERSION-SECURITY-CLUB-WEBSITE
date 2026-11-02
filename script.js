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
    awareness: { label: 'Security Awareness', title: 'Empowering students with proactive cybersecurity alerts, tips, and campaigns.', eyebrow: 'Campus Cyber Awareness' },
    events: { label: 'Events', title: 'Learn together. Build together. Defend together.', eyebrow: 'Events archive' },
    flagships: { label: 'Flagships', title: 'Programs that turn curiosity into capability.', eyebrow: 'Our signature initiatives' },
    team: { label: 'Team', title: 'The people behind the signal.', eyebrow: 'Meet the club team' },
    gallery: { label: 'Gallery', title: 'Captured in the club.', eyebrow: 'Moments from our community' },
    membership: { label: 'Membership', title: 'Your route from visitor to contributor.', eyebrow: 'Join the community' },
    submission: { label: 'Submission', title: 'Submit your interest in the club.', eyebrow: 'Student submission' },
    contact: { label: 'Contact', title: 'Have a question? Start a conversation.', eyebrow: 'Reach the club' },
    ctf: { label: 'CTF', title: 'Think sideways. Solve carefully. Learn constantly.', eyebrow: 'Capture the flag' },
    privacy: { label: 'Privacy & Ethics', title: 'Responsible practice. Student privacy.', eyebrow: 'Code of conduct & disclosure' },
    notFound: { label: '404 - Not Found', title: 'Page not found.', eyebrow: 'Status · 404' }
  };

  const linkOrder = ['home', 'about', 'awareness', 'events', 'flagships', 'team', 'gallery', 'membership', 'submission', 'contact', 'ctf'];
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

    // Ordered extension attempts to recover mismatched case or file format variants
    const extensions = ['.webp', '.jpg', '.JPG', '.jpeg', '.png'];
    const currentSrc = failedImage.src || '';
    const triedCount = parseInt(failedImage.dataset.fallbackCount || '0', 10);

    if (triedCount < extensions.length) {
      const currentExtMatch = currentSrc.match(/\.(webp|jpg|jpeg|png)$/i);
      if (currentExtMatch) {
        const nextExt = extensions[(extensions.indexOf(currentExtMatch[0]) + 1) % extensions.length];
        failedImage.dataset.fallbackCount = String(triedCount + 1);
        failedImage.src = currentSrc.replace(/\.(webp|jpg|jpeg|png)$/i, nextExt);
        return;
      }
    }

    if (!failedImage.hasAttribute('data-image-fallback')) return;
    const fallback = document.createElement('div');
    fallback.className = (failedImage.className || 'card-image') + ' image-fallback-box';
    fallback.setAttribute('role', 'img');
    fallback.setAttribute('aria-label', failedImage.alt || 'Image unavailable');
    fallback.innerHTML = '<span class="image-fallback-symbol" aria-hidden="true">' + escapeHtml(failedImage.dataset.imageFallback || '◈') + '</span>';
    failedImage.replaceWith(fallback);
  }, true);

  function shell(key, content) {
    const page = pages[key];
    return '<div class="page section-shell"><section class="page-hero"><div><div class="hero-eyebrow-badge"><span class="eyebrow-indicator" aria-hidden="true"></span><p class="eyebrow">' + page.eyebrow + '</p></div><h1>' + page.title + '</h1><p class="hero-lede">' + content.lede + '</p></div></section>' + content.body + '</div>';
  }

  function teamCards(items) {
    return '<div class="card-grid team-grid">' + items.map(function (item, index) {
      const isTop = index < 3;
      const deptCode = item.department ? item.department.toUpperCase() : (item.role && /faculty|coordinator|mentor/i.test(item.role) ? 'FACULTY' : (item.role && /alumni/i.test(item.role) ? 'ALUMNI' : 'MEMBER'));
      const tenureTag = item.tenure || (item.role && /alumni/i.test(item.role) ? 'ALUMNI' : 'MENTOR');
      const isLeader = item.highlight || /president/i.test(item.role || '');

      const photo = item.image
        ? '<a class="team-image-link" href="' + escapeHtml(item.image) + '" target="_blank" rel="noopener noreferrer" aria-label="View full-size photo of ' + escapeHtml(item.name || 'team member') + '">'
          + '<div class="team-photo-wrapper">'
          + image(item.image, '+', item.name || item.role, 'team-photo', isTop)
          + '<div class="team-photo-scrim" aria-hidden="true"></div>'
          + '<span class="team-tenure-badge">' + escapeHtml(tenureTag) + '</span>'
          + '</div></a>'
        : '<div class="team-photo-wrapper team-photo-placeholder" aria-hidden="true"><div class="team-avatar-fallback">' + escapeHtml((item.name || 'SC').slice(0, 2).toUpperCase()) + '</div><span class="team-tenure-badge">' + escapeHtml(tenureTag) + '</span></div>';

      const departmentAttr = item.department ? ' data-team-department="' + escapeHtml(item.department) + '"' : '';
      const yearAttr = item.tenure ? ' data-team-year-target="' + escapeHtml(item.tenure) + '"' : '';
      const highlightClass = isLeader ? ' is-leadership' : '';

      const linkedinLink = item.linkedin
        ? '<a class="team-linkedin-link" href="' + escapeHtml(item.linkedin) + '" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile for ' + escapeHtml(item.name) + '" title="View LinkedIn Profile">'
          + '<svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14"><path fill="currentColor" d="M5.2 3.5a2.2 2.2 0 1 1-.1 4.4 2.2 2.2 0 0 1 .1-4.4ZM3.3 9.5h3.8v11.2H3.3zM9.2 9.5h3.6V11h.1a4 4 0 0 1 3.6-2c3.9 0 4.6 2.5 4.6 5.7v6h-3.8v-5.3c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9v5.4H9.2z"/></svg>'
          + '<span>LinkedIn</span><span class="team-link-arrow" aria-hidden="true">↗</span></a>'
        : '';

      return '<article class="card team-card' + highlightClass + '"' + departmentAttr + yearAttr + '>'
        + '<div class="team-card-header">'
        + '<span class="team-dept-pill">' + escapeHtml(deptCode) + '</span>'
        + '<span class="team-index-pill">#' + String(index + 1).padStart(2, '0') + '</span>'
        + '</div>'
        + photo
        + '<div class="card-body team-card-body">'
        + '<p class="team-role-tag">' + escapeHtml(item.role || 'Member') + '</p>'
        + '<h3 class="team-member-name">' + escapeHtml(item.name) + '</h3>'
        + '<div class="team-card-divider" aria-hidden="true"></div>'
        + '<p class="team-member-bio">' + escapeHtml(item.description || item.bio || 'Security Club DBIT team member.') + '</p>'
        + linkedinLink
        + '</div>'
        + '</article>';
    }).join('') + '</div>';
  }

  function cards(items, type) {
    return '<div class="card-grid ' + (type || '') + '">' + items.map(function (item, index) {
      const isTop = index < 2;
      const photo = item.image ? image(item.image, '+', item.name || item.title || item.alt, '', isTop) : '<div class="card-image card-placeholder" aria-hidden="true"></div>';
      const eventAttribute = type === 'event-grid' ? ' data-event-id="' + escapeHtml(item.title) + '"' : '';
      const eventHint = type === 'event-grid' ? '<p class="card-action-hint">Access Mission Brief →</p>' : '';
      const highlightClass = item.highlight ? ' card-highlight' : '';
      return '<article class="card' + (type === 'event-grid' ? ' event-card' : '') + highlightClass + '"' + eventAttribute + '>' + photo + '<div class="card-body">' + (item.meta ? '<p class="card-meta">' + item.meta + '</p>' : '') + '<h3>' + escapeHtml(item.name || item.title) + '</h3>' + (item.role ? '<p class="role">' + escapeHtml(item.role) + '</p>' : '') + '<p>' + escapeHtml(item.description || item.bio || '') + '</p>' + eventHint + '</div></article>';
    }).join('') + '</div>';
  }

  function extractYears(items, keyExtractor) {
    const years = items.map(keyExtractor).filter(function (y, i, all) {
      return y && all.indexOf(y) === i;
    }).sort().reverse();
    return years.length ? years : ['2026-27'];
  }

  function roleRank(role) {
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
    return /member/i.test(r) ? 50 : 60;
  }

  function departmentOf(role) {
    const r = String(role || '').toLowerCase();
    if (/president/i.test(r)) return 'leadership';
    if (/technical/i.test(r)) return 'technical';
    if (/research/i.test(r)) return 'research';
    if (/event|publicity/i.test(r)) return 'events';
    if (/editorial|design/i.test(r)) return 'design';
    return 'other';
  }

  function firstNameOf(member) {
    return String(member.name || '').trim().split(/\s+/)[0] || '';
  }

  function byFirstName(left, right) {
    return firstNameOf(left).localeCompare(firstNameOf(right), undefined, { sensitivity: 'base' })
      || String(left.name || '').localeCompare(String(right.name || ''), undefined, { sensitivity: 'base' });
  }

  function byLeadership(left, right) {
    const rankDiff = roleRank(left.role) - roleRank(right.role);
    return rankDiff !== 0 ? rankDiff : byFirstName(left, right);
  }

  function teamSections(items) {
    const mentors = items.filter(function (member) {
      return /faculty|mentor|teacher/i.test(member.role || '');
    }).slice().sort(byFirstName);

    const alumni = items.filter(function (member) {
      return /alumni/i.test(member.role || '');
    }).slice().sort(byFirstName);

    const coreTeam = items.filter(function (member) {
      return !/faculty|mentor|teacher|alumni/i.test(member.role || '');
    }).slice().sort(byLeadership).map(function (c) {
      return Object.assign({}, c, {
        department: departmentOf(c.role),
        highlight: /president/i.test(c.role || ''),
        tenure: c.tenure || '2026-27'
      });
    });

    const tenures = extractYears(coreTeam, function (member) {
      return String(member.tenure || '2026-27').trim();
    });
    const initialTenure = tenures[0];

    const tenureButtons = tenures.map(function (tenure) {
      const active = tenure === initialTenure;
      return '<button class="gallery-year-button team-year-button' + (active ? ' is-active' : '') + '" type="button" data-team-year="' + escapeHtml(tenure) + '" aria-pressed="' + active + '">' + escapeHtml(tenure) + '</button>';
    }).join('');

    const filterBar = '<div class="team-controls-bar">'
      + '<div class="team-years" role="group" aria-label="Select Core Team tenure year">' + tenureButtons + '</div>'
      + '<div class="team-filters" role="group" aria-label="Filter core team by department">'
      + '<button class="team-filter-button is-active" type="button" data-team-filter="all" aria-pressed="true">All</button>'
      + '<button class="team-filter-button" type="button" data-team-filter="leadership" aria-pressed="false">Leadership</button>'
      + '<button class="team-filter-button" type="button" data-team-filter="technical" aria-pressed="false">Technical</button>'
      + '<button class="team-filter-button" type="button" data-team-filter="research" aria-pressed="false">Research</button>'
      + '<button class="team-filter-button" type="button" data-team-filter="events" aria-pressed="false">Events & PR</button>'
      + '<button class="team-filter-button" type="button" data-team-filter="design" aria-pressed="false">Design & Editorial</button>'
      + '</div></div>';

    return '<section class="team-section" aria-labelledby="team-mentors-heading"><div class="team-section-heading"><div class="section-heading-meta"><span class="section-tag-dot" aria-hidden="true"></span><p class="eyebrow">Academic Advisory · DBIT</p></div><h2 id="team-mentors-heading">Mentors & Faculty Guidance</h2><p>Faculty coordinators and teachers supporting the club with institutional expertise.</p></div>'
      + (mentors.length ? teamCards(mentors) : '<p class="team-empty">Mentors will be listed here.</p>')
      + '</section><section class="team-section" aria-labelledby="team-alumni-heading"><div class="team-section-heading"><div class="section-heading-meta"><span class="section-tag-dot" aria-hidden="true"></span><p class="eyebrow">Our Foundation & Heritage</p></div><h2 id="team-alumni-heading">Alumni Network</h2><p>Former members who built the club and now defend systems across industry.</p></div>'
      + (alumni.length ? teamCards(alumni) : '<p class="team-empty">Alumni will be listed here.</p>')
      + '</section><section class="team-section" aria-labelledby="team-core-heading"><div class="team-section-heading"><div class="section-heading-meta"><span class="section-tag-dot" aria-hidden="true"></span><p class="eyebrow">Student Leadership Council</p></div><h2 id="team-core-heading">Core Team</h2><p>The student council and coordinators leading the Security Club initiatives.</p></div>'
      + filterBar
      + (coreTeam.length ? teamCards(coreTeam) : '<p class="team-empty">Core team members will be listed here.</p>')
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

  function bindPillGroup(buttons, onSelect) {
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
        onSelect(btn);
      });
    });
  }

  function closeActiveLightbox() {
    document.querySelectorAll('.gallery-lightbox, .awareness-lightbox').forEach(function (lb) {
      lb.hidden = true;
      const img = lb.querySelector('img');
      if (img) img.removeAttribute('src');
    });
    document.body.classList.remove('gallery-is-open');
  }

  function setupEvents(items) {
    const browser = document.querySelector('.event-browser');
    if (!browser) return;
    const yearButtons = browser.querySelectorAll('[data-event-year]');
    bindPillGroup(yearButtons, function (btn) {
      browser.querySelectorAll('[data-event-year-group]').forEach(function (group) {
        group.hidden = group.dataset.eventYearGroup !== btn.dataset.eventYear;
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
        const close = function () {
          modal.remove();
          document.body.classList.remove('event-is-open');
        };
        modal.querySelector('.event-detail-close').addEventListener('click', close);
        modal.addEventListener('click', function (eventTarget) { if (eventTarget.target === modal) close(); });
        modal.querySelector('.event-detail-close').focus();
        document.body.classList.add('event-is-open');
      };
      card.addEventListener('click', open);
      card.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
      });
    });
  }

  function setupTeam() {
    const yearButtons = document.querySelectorAll('[data-team-year]');
    const filterButtons = document.querySelectorAll('[data-team-filter]');
    const cards = document.querySelectorAll('[data-team-year-target]');
    if (!cards.length) return;

    let selectedYear = (yearButtons[0] && yearButtons[0].dataset.teamYear) || '2026-27';
    let selectedDept = 'all';

    function applyFilter() {
      cards.forEach(function (card) {
        const matchesYear = !card.dataset.teamYearTarget || card.dataset.teamYearTarget === selectedYear;
        const matchesDept = selectedDept === 'all' || card.dataset.teamDepartment === selectedDept;
        card.hidden = !(matchesYear && matchesDept);
      });
    }

    bindPillGroup(yearButtons, function (btn) { selectedYear = btn.dataset.teamYear; applyFilter(); });
    bindPillGroup(filterButtons, function (btn) { selectedDept = btn.dataset.teamFilter; applyFilter(); });
    applyFilter();
  }

  function awarenessMarkup(items) {
    items = items || [];
    const years = extractYears(items, function (item) {
      return String(item.year || item.tenure || '2026-27').trim();
    });
    const initialYear = years[0];

    const yearButtons = years.map(function (year) {
      const active = year === initialYear;
      return '<button class="gallery-year-button awareness-year-button' + (active ? ' is-active' : '') + '" type="button" data-awareness-year="' + escapeHtml(year) + '" aria-pressed="' + active + '">' + escapeHtml(year) + '</button>';
    }).join('');

    const controlsBar = '<div class="team-controls-bar awareness-controls-bar">'
      + '<div class="team-years awareness-years" role="group" aria-label="Select awareness campaign year">'
      + yearButtons
      + '</div>'
      + '<div class="team-filters awareness-filters" role="group" aria-label="Filter awareness campaigns">'
      + '<button class="team-filter-button is-active" type="button" data-awareness-filter="all" aria-pressed="true">All Campaigns</button>'
      + '<button class="team-filter-button" type="button" data-awareness-filter="advisory" aria-pressed="false">Advisories</button>'
      + '<button class="team-filter-button" type="button" data-awareness-filter="poster" aria-pressed="false">Posters</button>'
      + '<button class="team-filter-button" type="button" data-awareness-filter="guide" aria-pressed="false">Guides</button>'
      + '</div>'
      + '</div>';

    const cardsHtml = items.map(function (item, index) {
      const year = String(item.year || item.tenure || '2026-27').trim();
      const category = (item.category || item.tag || 'CYBER ADVISORY').toUpperCase();
      const catFilter = category.toLowerCase();
      const isTop = index < 2;

      const tipsList = Array.isArray(item.tips) && item.tips.length
        ? '<div class="awareness-tips"><p class="awareness-tips-title">Key Safety Rules:</p><ul class="awareness-tips-list">'
          + item.tips.map(function (tip) {
            return '<li><span class="awareness-tip-icon" aria-hidden="true">✔</span><span>' + escapeHtml(tip) + '</span></li>';
          }).join('')
          + '</ul></div>'
        : '';

      const photoHtml = item.image
        ? '<div class="awareness-image-wrapper">'
          + '<button class="awareness-image-btn" type="button" data-awareness-image="' + escapeHtml(item.image) + '" data-awareness-title="' + escapeHtml(item.title) + '" data-awareness-desc="' + escapeHtml(item.description || '') + '" aria-label="Enlarge ' + escapeHtml(item.title) + '">'
          + image(item.image, '+', item.title || item.alt, 'awareness-poster-img', isTop)
          + '<span class="awareness-image-overlay" aria-hidden="true"><span class="awareness-overlay-text"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg> View Poster</span></span>'
          + '</button>'
          + '</div>'
        : '<div class="awareness-image-wrapper awareness-image-placeholder" aria-hidden="true"><div class="awareness-placeholder-icon">🛡</div></div>';

      return '<article class="card awareness-card" data-awareness-year-target="' + escapeHtml(year) + '" data-awareness-cat="' + escapeHtml(catFilter) + '">'
        + '<div class="awareness-card-header">'
        + '<span class="awareness-cat-pill">' + escapeHtml(category) + '</span>'
        + '<span class="awareness-year-pill">' + escapeHtml(year) + '</span>'
        + '</div>'
        + photoHtml
        + '<div class="card-body awareness-card-body">'
        + (item.date ? '<p class="awareness-date">' + escapeHtml(item.date) + '</p>' : '')
        + '<h3 class="awareness-card-title">' + escapeHtml(item.title) + '</h3>'
        + '<div class="awareness-card-divider" aria-hidden="true"></div>'
        + '<p class="awareness-card-desc">' + escapeHtml(item.description || '') + '</p>'
        + tipsList
        + '<div class="awareness-card-actions">'
        + (item.image
          ? '<button class="button button-ghost button-sm awareness-preview-btn" type="button" data-awareness-image="' + escapeHtml(item.image) + '" data-awareness-title="' + escapeHtml(item.title) + '" data-awareness-desc="' + escapeHtml(item.description || '') + '">View Poster</button>'
            + '<a class="button button-primary button-sm" href="' + escapeHtml(item.image) + '" target="_blank" rel="noopener noreferrer">Full Res ↗</a>'
          : '')
        + '</div>'
        + '</div>'
        + '</article>';
    }).join('');

    const emptyNotice = '<div class="awareness-empty" hidden><p class="team-empty">No awareness posters found for this selection. Add new campaigns to <code>awareness/awareness.js</code>.</p></div>';

    const lightbox = '<div class="awareness-lightbox" hidden role="dialog" aria-modal="true" aria-label="Expanded awareness poster">'
      + '<button class="awareness-lightbox-close" type="button" aria-label="Close image">×</button>'
      + '<div class="awareness-lightbox-dialog">'
      + '<img alt="" class="awareness-lightbox-img">'
      + '<div class="awareness-lightbox-info">'
      + '<h3 class="awareness-lightbox-title"></h3>'
      + '<p class="awareness-lightbox-caption"></p>'
      + '<a class="button button-primary button-sm awareness-lightbox-link" href="#" target="_blank" rel="noopener noreferrer">Open Original ↗</a>'
      + '</div>'
      + '</div>'
      + '</div>';

    return '<div class="awareness-browser">'
      + controlsBar
      + '<div class="card-grid awareness-grid">' + cardsHtml + '</div>'
      + emptyNotice
      + lightbox
      + '</div>';
  }

  function setupAwareness() {
    const browser = document.querySelector('.awareness-browser');
    if (!browser) return;

    const yearButtons = browser.querySelectorAll('[data-awareness-year]');
    const filterButtons = browser.querySelectorAll('[data-awareness-filter]');
    const cards = browser.querySelectorAll('[data-awareness-year-target]');
    const emptyNotice = browser.querySelector('.awareness-empty');
    const lightbox = browser.querySelector('.awareness-lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.awareness-lightbox-img') : null;
    const lightboxTitle = lightbox ? lightbox.querySelector('.awareness-lightbox-title') : null;
    const lightboxCaption = lightbox ? lightbox.querySelector('.awareness-lightbox-caption') : null;
    const lightboxLink = lightbox ? lightbox.querySelector('.awareness-lightbox-link') : null;

    let selectedYear = (yearButtons[0] && yearButtons[0].dataset.awarenessYear) || '2026-27';
    let selectedCat = 'all';

    function applyFilter() {
      let visibleCount = 0;
      cards.forEach(function (card) {
        const matchesYear = !card.dataset.awarenessYearTarget || card.dataset.awarenessYearTarget === selectedYear;
        const cardCat = card.dataset.awarenessCat || '';
        const matchesCat = selectedCat === 'all' || cardCat.indexOf(selectedCat) !== -1;
        const isVisible = matchesYear && matchesCat;
        card.hidden = !isVisible;
        if (isVisible) visibleCount++;
      });
      if (emptyNotice) emptyNotice.hidden = visibleCount > 0;
    }

    bindPillGroup(yearButtons, function (btn) { selectedYear = btn.dataset.awarenessYear; applyFilter(); });
    bindPillGroup(filterButtons, function (btn) { selectedCat = btn.dataset.awarenessFilter; applyFilter(); });
    applyFilter();

    browser.querySelectorAll('[data-awareness-image]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = trigger.dataset.awarenessImage;
        lightboxImg.alt = trigger.dataset.awarenessTitle || '';
        if (lightboxTitle) lightboxTitle.textContent = trigger.dataset.awarenessTitle || '';
        if (lightboxCaption) lightboxCaption.textContent = trigger.dataset.awarenessDesc || '';
        if (lightboxLink) lightboxLink.href = trigger.dataset.awarenessImage;
        lightbox.hidden = false;
        document.body.classList.add('gallery-is-open');
      });
    });

    const closeBtn = lightbox && lightbox.querySelector('.awareness-lightbox-close');
    if (closeBtn) closeBtn.addEventListener('click', closeActiveLightbox);
    if (lightbox) {
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeActiveLightbox();
      });
    }
  }

  function flagshipsMarkup(items) {
    items = items || [];
    if (!items.length) {
      return '<p class="team-empty">Flagship programs will be announced soon.</p>';
    }

    const cardsHtml = items.map(function (item, index) {
      const numTag = 'FLAGSHIP 0' + (index + 1);
      const isSiege = item.badge === 'siege' || /siege/i.test(item.title);
      const emblemSvg = isSiege
        ? '<svg viewBox="0 0 48 48" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M24 4 L40 10 V22 C40 32 32 40 24 44 C16 40 8 32 8 22 V10 Z" stroke="var(--cyan)" fill="rgba(0,229,255,0.06)"/><path d="M24 14 L32 24 L24 34 L16 24 Z" stroke="var(--green)"/><circle cx="24" cy="24" r="3" fill="var(--green)"/></svg>'
        : '<svg viewBox="0 0 48 48" width="38" height="38" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="10" width="32" height="28" rx="3" stroke="var(--cyan)" fill="rgba(0,229,255,0.06)"/><path d="M16 20 L24 14 L32 20" stroke="var(--green)"/><path d="M16 28 L24 34 L32 28" stroke="var(--green)"/><circle cx="24" cy="24" r="2.5" fill="var(--cyan)"/></svg>';

      const pillars = (item.pillars || []).map(function (p) {
        return '<span class="flagship-pillar-tag"><span class="pillar-bullet" aria-hidden="true">◈</span>' + escapeHtml(p) + '</span>';
      }).join('');

      return '<article class="card flagship-card">'
        + '<div class="flagship-card-header">'
        + '<div class="flagship-meta-left">'
        + '<span class="flagship-num-pill">' + escapeHtml(numTag) + '</span>'
        + '<span class="flagship-status-pill">' + escapeHtml(item.status || item.cycle || '2026-27 Edition') + '</span>'
        + '</div>'
        + '<div class="flagship-emblem">' + emblemSvg + '</div>'
        + '</div>'
        + '<div class="card-body flagship-card-body">'
        + (item.format ? '<p class="flagship-format-tag">' + escapeHtml(item.format) + '</p>' : '')
        + '<h3 class="flagship-title">' + escapeHtml(item.title) + '</h3>'
        + '<div class="flagship-divider" aria-hidden="true"></div>'
        + '<p class="flagship-desc">' + escapeHtml(item.description) + '</p>'
        + (pillars ? '<div class="flagship-pillars">' + pillars + '</div>' : '')
        + '<div class="flagship-card-actions">'
        + '<a class="button button-primary button-sm" href="#/submission">Register Interest →</a>'
        + '<a class="button button-ghost button-sm" href="#/contact">Inquire Details ↗</a>'
        + '</div>'
        + '</div>'
        + '</article>';
    }).join('');

    return '<div class="flagship-browser">'
      + '<div class="flagship-overview-banner">'
      + '<div class="flagship-banner-meta"><span class="status-beacon" aria-hidden="true"></span><span class="flagship-badge-lead">Flagship Initiatives</span></div>'
      + '<p class="flagship-banner-text">Annual programs designed to guide students from introductory fundamentals to hands-on security practice.</p>'
      + '</div>'
      + '<div class="card-grid flagship-grid">' + cardsHtml + '</div>'
      + '</div>';
  }

  function ctfMarkup(challenges) {
    challenges = challenges || [];
    const categories = ['all'].concat(challenges.map(function (c) { return c.category; }).filter(function (cat, i, all) {
      return cat && all.indexOf(cat) === i;
    }));

    const categoryButtons = categories.map(function (cat) {
      const active = cat === 'all';
      const label = cat === 'all' ? 'All Challenges' : cat.toUpperCase();
      return '<button class="team-filter-button ctf-filter-btn' + (active ? ' is-active' : '') + '" type="button" data-ctf-filter="' + escapeHtml(cat) + '" aria-pressed="' + active + '">' + escapeHtml(label) + '</button>';
    }).join('');

    const cardsHtml = challenges.map(function (c) {
      return '<article class="card ctf-card" data-ctf-id="' + escapeHtml(c.id) + '" data-ctf-category="' + escapeHtml(c.category) + '" data-ctf-pts="' + escapeHtml(c.points) + '">'
        + '<div class="ctf-card-header">'
        + '<div class="ctf-category-group">'
        + '<span class="ctf-cat-pill ctf-cat-' + escapeHtml(c.category) + '">' + escapeHtml(c.category.toUpperCase()) + '</span>'
        + '<span class="ctf-diff-pill ctf-diff-' + escapeHtml(c.difficulty) + '">' + escapeHtml(c.difficulty.toUpperCase()) + '</span>'
        + '</div>'
        + '<span class="ctf-pts-badge">' + escapeHtml(c.points) + ' PTS</span>'
        + '</div>'
        + '<div class="card-body ctf-card-body">'
        + '<h3 class="ctf-card-title">' + escapeHtml(c.title) + '</h3>'
        + '<div class="ctf-card-divider" aria-hidden="true"></div>'
        + '<p class="ctf-card-desc">' + escapeHtml(c.description) + '</p>'
        + (c.hint ? '<button type="button" class="ctf-hint-toggle" data-ctf-hint-target="' + escapeHtml(c.id) + '" aria-expanded="false"><span class="ctf-hint-icon" aria-hidden="true">▶</span> View Hint</button><div class="ctf-hint-box" id="ctf-hint-' + escapeHtml(c.id) + '" hidden><p class="ctf-hint-body">' + escapeHtml(c.hint) + '</p></div>' : '')
        + '<form class="ctf-flag-form" data-ctf-form-id="' + escapeHtml(c.id) + '">'
        + '<div class="ctf-input-group">'
        + '<input type="text" class="ctf-flag-input" placeholder="SC{flag_token}" required aria-label="Enter flag for ' + escapeHtml(c.title) + '">'
        + '<button type="submit" class="button button-primary button-sm ctf-submit-btn">Submit Flag</button>'
        + '</div>'
        + '<div class="ctf-feedback" aria-live="polite"></div>'
        + '</form>'
        + '</div>'
        + '</article>';
    }).join('');

    return '<div class="ctf-browser">'
      + '<div class="ctf-terminal-hud">'
      + '<div class="ctf-hud-stat"><span class="hud-label">ENVIRONMENT</span><span class="hud-val hud-online"><span class="status-beacon" aria-hidden="true"></span>Active Labs</span></div>'
      + '<div class="ctf-hud-stat"><span class="hud-label">CHALLENGES</span><span class="hud-val" id="ctf-target-count">' + challenges.length + ' Available</span></div>'
      + '<div class="ctf-hud-stat"><span class="hud-label">SESSION SCORE</span><span class="hud-val hud-score" id="ctf-score-val">0 PTS</span></div>'
      + '<div class="ctf-hud-stat"><span class="hud-label">FLAGS SOLVED</span><span class="hud-val" id="ctf-solved-val">0 / ' + challenges.length + '</span></div>'
      + '</div>'
      + '<div class="team-controls-bar ctf-controls-bar"><div class="team-filters ctf-filters" role="group" aria-label="Filter CTF challenges by category">' + categoryButtons + '</div></div>'
      + '<div class="card-grid ctf-grid">' + cardsHtml + '</div>'
      + '</div>';
  }

  function setupCtf() {
    const browser = document.querySelector('.ctf-browser');
    if (!browser) return;

    const challenges = window.challengesData || [];
    const filterButtons = browser.querySelectorAll('[data-ctf-filter]');
    const cards = browser.querySelectorAll('[data-ctf-id]');
    const scoreVal = browser.querySelector('#ctf-score-val');
    const solvedVal = browser.querySelector('#ctf-solved-val');

    const storageKey = 'security-club-ctf-solved-v1';
    let solvedIds = [];
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) solvedIds = JSON.parse(stored);
    } catch (_) {}

    function updateHud() {
      let score = 0;
      challenges.forEach(function (c) {
        if (solvedIds.indexOf(c.id) !== -1) score += (c.points || 0);
      });
      if (scoreVal) scoreVal.textContent = score + ' PTS';
      if (solvedVal) solvedVal.textContent = solvedIds.length + ' / ' + challenges.length;
    }

    function syncSolvedCard(card, challenge) {
      card.classList.add('is-solved');
      const input = card.querySelector('.ctf-flag-input');
      const btn = card.querySelector('.ctf-submit-btn');
      const feedback = card.querySelector('.ctf-feedback');
      if (input) {
        input.value = challenge.flag || 'SC{...}';
        input.disabled = true;
      }
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Captured ✔';
      }
      if (feedback) {
        feedback.className = 'ctf-feedback is-success';
        feedback.innerHTML = '<strong>[✔] Solved:</strong> Flag token captured. +' + challenge.points + ' PTS';
      }
    }

    cards.forEach(function (card) {
      const cId = parseInt(card.dataset.ctfId, 10);
      const ch = challenges.find(function (c) { return c.id === cId; });
      if (ch && solvedIds.indexOf(cId) !== -1) syncSolvedCard(card, ch);
    });
    updateHud();

    let selectedCat = 'all';
    function applyCatFilter() {
      cards.forEach(function (card) {
        const matches = selectedCat === 'all' || card.dataset.ctfCategory === selectedCat;
        card.hidden = !matches;
      });
    }
    bindPillGroup(filterButtons, function (btn) {
      selectedCat = btn.dataset.ctfFilter;
      applyCatFilter();
    });

    browser.querySelectorAll('.ctf-hint-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const targetId = btn.dataset.ctfHintTarget;
        const box = browser.querySelector('#ctf-hint-' + targetId);
        if (!box) return;
        const willShow = box.hidden;
        box.hidden = !willShow;
        btn.setAttribute('aria-expanded', String(willShow));
        const icon = btn.querySelector('.ctf-hint-icon');
        if (icon) icon.textContent = willShow ? '▼' : '▶';
      });
    });

    browser.querySelectorAll('.ctf-flag-form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const formId = parseInt(form.dataset.ctfFormId, 10);
        const ch = challenges.find(function (c) { return c.id === formId; });
        if (!ch) return;

        const input = form.querySelector('.ctf-flag-input');
        const feedback = form.querySelector('.ctf-feedback');
        const entered = (input && input.value || '').trim();
        const expected = String(ch.flag || '').trim();
        const card = browser.querySelector('[data-ctf-id="' + formId + '"]');

        if (entered.toLowerCase() === expected.toLowerCase()) {
          if (solvedIds.indexOf(formId) === -1) {
            solvedIds.push(formId);
            try { sessionStorage.setItem(storageKey, JSON.stringify(solvedIds)); } catch (_) {}
          }
          if (card) syncSolvedCard(card, ch);
          updateHud();
        } else {
          if (feedback) {
            feedback.className = 'ctf-feedback is-error';
            feedback.innerHTML = '<strong>[✖] Incorrect:</strong> Flag mismatch. Ensure standard format SC{...} and re-verify.';
          }
        }
      });
    });
  }

  function submissionFormMarkup() {
    return '<form class="contact-panel contact-form submission-form-panel" id="student-submission-form">'
      + '<div class="form-section-header">'
      + '<span class="form-step-num">01</span>'
      + '<div class="form-step-meta">'
      + '<h3>Personal Details</h3>'
      + '<p>Your name and primary contact information.</p>'
      + '</div></div>'
      + '<div class="form-row-2">'
      + '<div class="form-field">'
      + '<label for="submission-name">Full Name <span class="req">*</span></label>'
      + '<input id="submission-name" name="name" autocomplete="name" placeholder="e.g. Aarav Sharma" required>'
      + '</div>'
      + '<div class="form-field">'
      + '<label for="submission-email">Gmail Address <span class="req">*</span></label>'
      + '<input id="submission-email" name="email" type="email" autocomplete="email" placeholder="aarav.sharma@gmail.com" required>'
      + '</div></div>'
      + '<div class="form-field">'
      + '<label for="submission-phone">WhatsApp / Phone Number <span class="req">*</span></label>'
      + '<input id="submission-phone" name="phone" type="tel" autocomplete="tel" placeholder="+91 98201 23456" required>'
      + '</div>'
      + '<div class="form-section-header">'
      + '<span class="form-step-num">02</span>'
      + '<div class="form-step-meta">'
      + '<h3>Academic Details</h3>'
      + '<p>Your current year and division at DBIT.</p>'
      + '</div></div>'
      + '<div class="submission-details">'
      + '<div class="form-field">'
      + '<label for="submission-year">Year of Study <span class="req">*</span></label>'
      + '<div class="select-wrapper"><select id="submission-year" name="year" required>'
      + '<option value="">Choose your year</option>'
      + '<option value="FE">FE (First Year)</option>'
      + '<option value="SE">SE (Second Year)</option>'
      + '<option value="TE">TE (Third Year)</option>'
      + '<option value="BE">BE (Fourth Year)</option>'
      + '</select></div></div>'
      + '<div class="form-field">'
      + '<label for="submission-division">Division <span class="req">*</span></label>'
      + '<div class="select-wrapper"><select id="submission-division" name="division" required>'
      + '<option value="">Choose your division</option>'
      + '<option value="A">Division A</option>'
      + '<option value="B">Division B</option>'
      + '<option value="C">Division C</option>'
      + '<option value="Other">Other / not listed</option>'
      + '</select></div></div></div>'
      + '<div class="form-section-header">'
      + '<span class="form-step-num">03</span>'
      + '<div class="form-step-meta">'
      + '<h3>Your Interests</h3>'
      + '<p>What topics, tools, or goals would you like to explore?</p>'
      + '</div></div>'
      + '<div class="form-field">'
      + '<label for="submission-reason">Reason to Join the Club <span class="req">*</span></label>'
      + '<textarea id="submission-reason" name="reason" rows="4" placeholder="I want to learn web security, participate in CTFs, and build practical defense skills." required></textarea>'
      + '</div>'
      + '<div class="form-field">'
      + '<label for="submission-query">Query or Specific Question <span class="form-optional">(optional)</span></label>'
      + '<textarea id="submission-query" name="query" rows="2" placeholder="e.g. Timings of upcoming labs, or beginner requirements."></textarea>'
      + '</div>'
      + '<div class="form-dispatch-notice">'
      + '<span class="status-beacon" aria-hidden="true"></span>'
      + '<p class="form-help">Your details are not stored on any server. Clicking below opens a message draft in your chosen app so you can review before sending.</p>'
      + '</div>'
      + '<div class="submission-actions">'
      + '<button class="button button-primary" type="submit" name="destination" value="gmail">Send on Gmail ↗</button>'
      + '<button class="button button-ghost" type="submit" name="destination" value="whatsapp">Send on WhatsApp ↗</button>'
      + '</div></form>';
  }

  function contactMarkup() {
    return '<div class="contact-layout"><div class="contact-panel"><p class="eyebrow">Contact Information</p>'
      + '<span class="contact-email">securityclubdbit@gmail.com</span>'
      + '<p>WhatsApp / Call: <a href="https://wa.me/918369448072" target="_blank" rel="noopener noreferrer">+91 83694 48072</a></p>'
      + '<p>Location: Don Bosco Institute of Technology, Kurla, Mumbai</p>'
      + '<p>For meeting times, sessions, or collaboration questions, feel free to reach out.</p>'
      + '<div class="home-actions">'
      + '<a class="button button-primary" href="https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=securityclubdbit%40gmail.com" target="_blank" rel="noopener noreferrer">Compose in Gmail ↗</a>'
      + '<a class="button button-ghost" href="https://wa.me/918369448072" target="_blank" rel="noopener noreferrer">Open WhatsApp ↗</a>'
      + '</div></div>'
      + '<form class="contact-panel contact-form" id="contact-form">'
      + '<div class="form-section-header">'
      + '<span class="form-step-num">01</span>'
      + '<div class="form-step-meta">'
      + '<h3>Send a Message</h3>'
      + '<p>Questions, event collaborations, or workshop inquiries.</p>'
      + '</div></div>'
      + '<div class="form-field">'
      + '<label for="contact-name">Your Name <span class="req">*</span></label>'
      + '<input id="contact-name" name="name" placeholder="e.g. Rohan Desai" required>'
      + '</div>'
      + '<div class="form-field">'
      + '<label for="contact-email">Email Address <span class="req">*</span></label>'
      + '<input id="contact-email" name="email" type="email" placeholder="rohan.desai@gmail.com" required>'
      + '</div>'
      + '<div class="form-field">'
      + '<label for="contact-message">Message <span class="req">*</span></label>'
      + '<textarea id="contact-message" name="message" rows="5" placeholder="Write your message, workshop proposal, or question here..." required></textarea>'
      + '</div>'
      + '<p class="form-help">Opens a Gmail draft in your browser. Sign in if prompted, then review and send it from Gmail. The message is not sent automatically.</p>'
      + '<button class="button button-primary" type="submit">Open Gmail draft →</button>'
      + '</form></div>';
  }

  function galleryMarkup(items) {
    const years = extractYears(items, function (item) { return item.folder.split('/')[0]; });
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
    browser.querySelectorAll('[data-gallery-image]').forEach(function (button) {
      button.addEventListener('click', function () {
        lightboxImage.src = button.dataset.galleryImage;
        lightboxImage.alt = button.dataset.galleryAlt;
        lightboxCaption.textContent = button.dataset.galleryAlt;
        lightbox.hidden = false;
        document.body.classList.add('gallery-is-open');
      });
    });
    lightbox.querySelector('.gallery-lightbox-close').addEventListener('click', closeActiveLightbox);
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeActiveLightbox();
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
        body: '<div class="home-hero-visual"></div><div class="home-actions"><a class="button button-primary" href="#/events">Explore events →</a><a class="button button-ghost" href="#/about">Meet the club</a></div><section class="intro"><p class="eyebrow">A club for first steps</p><h2>You do not need to be a hacker to start.</h2><p>We make the first step practical, social and fun. Find your people, try a lab and build real skills at your own pace.</p></section><section class="opportunities"><div class="stat"><strong>Community</strong><span>learn together</span></div><div class="stat"><strong>Questions</strong><span>always welcome</span></div><div class="stat"><strong>Hands-on</strong><span>build real skills</span></div></section>'
      };
    } else if (key === 'events') {
      content = { lede: 'Browse Security Club events by year. Select a year to see that year’s workshops, bootcamps and community sessions.', body: eventsMarkup(window.eventsData || []) };
    } else if (key === 'team') {
      content = { lede: 'Meet the faculty mentors and student core team who make cybersecurity approachable, practical and collaborative.', body: teamSections(window.teamData || []) };
    } else if (key === 'gallery') {
      content = { lede: 'Browse the original folder arrangement, then open any photo for a closer look.', body: galleryMarkup(window.galleryData || []) };
    } else if (key === 'about') {
      content = { lede: 'A student-led space to understand technology, question assumptions and practise defending the systems we depend on.', body: aboutMarkup() };
    } else if (key === 'awareness') {
      content = {
        lede: 'Visual alerts, campaign posters, and practical security advisories published by the club to cultivate campus-wide digital defense.',
        body: awarenessMarkup(window.awarenessData || [])
      };
    } else if (key === 'flagships') {
      content = {
        lede: 'Our recurring initiatives create clear ways to learn, practise and contribute throughout the academic year.',
        body: flagshipsMarkup(window.flagshipsData || [])
      };
    } else if (key === 'ctf') {
      content = {
        lede: 'Hands-on offensive and defensive cybersecurity labs. Solve challenges, discover vulnerabilities, and capture the flag.',
        body: ctfMarkup(window.challengesData || [])
      };
    } else if (key === 'membership') {
      content = { lede: 'Open to all students across DBIT. Join our technical sessions, participate in CTF labs, and build real-world security skills.', body: '<div class="split-content"><article class="info-panel"><p class="eyebrow">Start here</p><h2>Show up curious.</h2><p>Join an open session, ask questions and find the area of cybersecurity that excites you. Prior experience is never required.</p><a class="button button-primary" href="#/submission">Register your interest →</a></article><article class="info-panel"><p class="eyebrow">What you can explore</p><ul class="clean-list"><li>Security fundamentals</li><li>CTFs and practical labs</li><li>Secure development</li><li>Research and community projects</li></ul></article></div>' };
    } else if (key === 'submission') {
      content = {
        lede: 'Share your details and motivation with the club coordinators. Choose Gmail or WhatsApp to review and dispatch your registration.',
        body: submissionFormMarkup()
      };
    } else if (key === 'contact') {
      content = {
        lede: 'For collaborations, event invites, workshop partnerships or club questions, reach us directly by email or WhatsApp.',
        body: contactMarkup()
      };
    } else if (key === 'privacy') {
      content = {
        lede: 'Our commitments to student privacy, data minimization, and responsible cybersecurity research.',
        body: '<div class="split-content"><article class="info-panel"><p class="eyebrow">Data & Privacy</p><h2>Zero Tracking. Zero Storage.</h2><p>This static website does not set tracking cookies, load third-party analytics pixels, or store data on any server. Any details you enter in the submission or contact forms are compiled locally and handed directly to your own Gmail or WhatsApp client. We never monetize or distribute student data.</p></article><article class="info-panel"><p class="eyebrow">Ethics & Conduct</p><h2>Defend. Disclose. Do No Harm.</h2><p>Security Club DBIT teaches defensive security, ethical research, and collaborative problem-solving. All club activities, labs, and CTFs operate within designated sandbox environments. Members pledge to respect digital boundaries, comply with institutional codes, and uphold professional integrity.</p></article></div>'
      };
    } else if (key === 'notFound') {
      content = {
        lede: 'The requested page was not found.',
        body: '<div class="split-content"><article class="info-panel"><p class="eyebrow">Status · 404</p><h2>Page Not Found</h2><p>The link you followed may be broken or the page may have been moved. Return to the home page or contact the team.</p><div class="home-actions" style="margin-top:1.5rem"><a class="button button-primary" href="#/">Return to Home →</a><a class="button button-ghost" href="#/contact">Contact the club</a></div></article></div>'
      };
    } else {
      content = { lede: 'This page is presented as a public static information page. There is no login, account system or private data in this version.', body: '<div class="split-content"><article class="info-panel"><p class="eyebrow">Static workspace</p><h2>' + pages[key].label + '</h2><p>Use this space to publish the club’s current work, resources and updates directly from the GitHub repository.</p></article><article class="info-panel"><p class="eyebrow">How it works</p><h2>GitHub is the editor.</h2><p>Update the HTML, CSS, JavaScript and image folders, then commit and push. The hosted page reflects the repository contents.</p></article></div>' };
    }
    app.innerHTML = shell(key, content);
    const splashActive = document.body.classList.contains('splash-active');
    if (key === 'home' && !splashActive) mountSecurityLogo(app.querySelector('.home-hero-visual'));
    if (key === 'gallery') setupGallery();
    if (key === 'events') setupEvents(window.eventsData || []);
    if (key === 'team') setupTeam();
    if (key === 'awareness') setupAwareness(window.awarenessData || []);
    if (key === 'ctf') setupCtf();
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
    if (!splashActive) decodeText(app.querySelector('h1'));
    app.querySelectorAll('img').forEach(function (img) {
      if (img.complete) img.classList.add('is-loaded');
    });
    app.focus({ preventScroll: true });
  }

  function decodeText(element, force) {
    if (!element) return;
    if (scrambleInterval) {
      window.clearInterval(scrambleInterval);
      scrambleInterval = 0;
    }
    // sessionStorage is shared by route changes and survives reloads in this tab.
    // If storage is unavailable, keep a page-lifetime guard as a safe fallback.
    let alreadyAnimated = false;
    try {
      alreadyAnimated = !force && sessionStorage.getItem(scrambleSessionKey) === 'done';
      sessionStorage.setItem(scrambleSessionKey, 'done');
    } catch (_) {
      alreadyAnimated = !force && window.headingScramblePlayed === true;
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
    const isMobile = window.innerWidth < 768;
    const fontSize = isMobile ? 15 : 14;
    let width = 0;
    let height = 0;
    let drops = [];
    let animationFrame = 0;
    let animationTimer = 0;
    let isStreamActive = !reducedMotion.matches;
    let isScrolling = false;
    let scrollResumeTimer = 0;

    function resize() {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      if (newWidth === width && Math.abs(newHeight - height) < 120) return;
      // On mobile / low power devices, lock pixel ratio to 1.0 to eliminate fillRect overhead. Desktop max 1.25.
      const pixelRatio = newWidth < 768 ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25);
      width = newWidth;
      height = newHeight;
      matrixCanvas.width = Math.round(width * pixelRatio);
      matrixCanvas.height = Math.round(height * pixelRatio);
      matrixCanvas.style.width = '100%';
      matrixCanvas.style.height = '100%';
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drops = new Array(Math.floor(width / fontSize)).fill(1);
    }

    function draw() {
      animationFrame = 0;
      if (document.hidden || !isStreamActive || isScrolling) return;
      context.fillStyle = 'rgba(3, 7, 8, 0.14)';
      context.fillRect(0, 0, width, height);
      context.font = fontSize + "px 'JetBrains Mono', monospace";
      drops.forEach(function (drop, index) {
        const char = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = index * fontSize;
        const y = drop * fontSize;

        // Lead character glows in luminous mint-white
        context.fillStyle = '#E8FAF4';
        context.fillText(char, x, y);

        // Previous character in refined emerald matrix green
        if (drop > 1) {
          const prevChar = characters.charAt(Math.floor(Math.random() * characters.length));
          context.fillStyle = '#00C982';
          context.fillText(prevChar, x, (drop - 1) * fontSize);
        }

        if (y > height && Math.random() > 0.985) drops[index] = 0;
        drops[index] += 1;
      });
      animationTimer = window.setTimeout(function () {
        animationTimer = 0;
        animationFrame = window.requestAnimationFrame(draw);
      }, 80);
    }

    function pause() {
      if (animationTimer) window.clearTimeout(animationTimer);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationTimer = 0;
      animationFrame = 0;
    }

    function resume() {
      if (!document.hidden && isStreamActive && !reducedMotion.matches && !isScrolling && !animationFrame && !animationTimer) {
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
    window.addEventListener('scroll', function () {
      if (!isScrolling) {
        isScrolling = true;
        pause();
      }
      if (scrollResumeTimer) window.clearTimeout(scrollResumeTimer);
      scrollResumeTimer = window.setTimeout(function () {
        isScrolling = false;
        resume();
      }, 100);
    }, { passive: true });

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
    if (event.key !== 'Escape') return;
    const modal = document.querySelector('.event-detail-overlay');
    if (modal) {
      modal.remove();
      document.body.classList.remove('event-is-open');
      return;
    }
    if (document.body.classList.contains('gallery-is-open')) {
      closeActiveLightbox();
      return;
    }
    if (navigation.classList.contains('open')) {
      closeNav();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1180 && navigation.classList.contains('open')) {
      closeNav();
    }
  }, { passive: true });

  function setupSplashLoader() {
    const splash = document.querySelector('#splash-loader');
    if (!splash) return;

    document.body.classList.add('splash-active');

    const progressBar = splash.querySelector('.splash-progress-bar');
    const percentEl = splash.querySelector('.splash-percent');
    const statusEl = splash.querySelector('.splash-status');

    let isWindowLoaded = document.readyState === 'complete';
    if (!isWindowLoaded) {
      window.addEventListener('load', function () {
        isWindowLoaded = true;
      }, { once: true });
    }

    let isFontsReady = !document.fonts;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        isFontsReady = true;
      }).catch(function () {
        isFontsReady = true;
      });
    }

    const isSlowConnection = typeof navigator !== 'undefined' && ((navigator.connection && (navigator.connection.saveData || /2g|3g|slow/i.test(navigator.connection.effectiveType || ''))) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4));
    const duration = isSlowConnection ? 1100 : 1600; // Ultra-fast responsive entry: 1.1s on slow/poor connections, 1.6s on fast
    const maxTimeout = isSlowConnection ? 1600 : 2000; // Strict fallback ceiling so weak connections never wait or stall
    const startTime = performance.now();
    let isDone = false;
    let animId = null;

    function finish() {
      if (isDone) return;
      isDone = true;
      if (animId) cancelAnimationFrame(animId);
      if (progressBar) progressBar.style.width = '100%';
      if (percentEl) percentEl.textContent = '100%';
      if (statusEl) statusEl.textContent = 'CORE READY · WELCOME TO DBIT';
      splash.setAttribute('aria-valuenow', '100');

      setTimeout(function () {
        splash.classList.add('is-finished');
        document.body.classList.remove('splash-active');

        // Splash completed: trigger logo tracing animation & heading scramble live
        const heroVisual = app.querySelector('.home-hero-visual');
        if (heroVisual) {
          window.securityClubLogoMotionPlayed = false;
          mountSecurityLogo(heroVisual);
        }
        decodeText(app.querySelector('h1'), true);

        setTimeout(function () {
          splash.style.display = 'none';
          splash.setAttribute('aria-hidden', 'true');
        }, 450);
      }, 150);
    }

    // Fast-path dismiss: clicking/tapping anywhere dismisses splash immediately on slow networks
    splash.addEventListener('click', finish, { passive: true });
    // Hard fallback guarantees splash will never hang regardless of background throttling
    window.setTimeout(finish, 2200);

    function step(now) {
      if (isDone) return;
      const elapsed = now - startTime;
      const timeRatio = elapsed / duration;
      const isTimedOut = elapsed >= maxTimeout;

      // Ensure full asset and font readiness before passing 98%, with fallback ceiling for weak internet
      const assetsReady = (isWindowLoaded && isFontsReady) || isTimedOut;
      const effectiveRatio = (!assetsReady && timeRatio >= 0.98) ? 0.98 : Math.min(1, timeRatio);
      const percent = Math.floor(effectiveRatio * 100);

      if (progressBar) progressBar.style.width = percent + '%';
      if (percentEl) percentEl.textContent = percent + '%';
      splash.setAttribute('aria-valuenow', String(percent));

      if (statusEl) {
        if (effectiveRatio < 0.25) {
          statusEl.textContent = 'Loading club assets...';
        } else if (effectiveRatio < 0.50) {
          statusEl.textContent = 'Preparing workshop modules...';
        } else if (effectiveRatio < 0.75) {
          statusEl.textContent = 'Setting up labs and sessions...';
        } else if (effectiveRatio < 0.98) {
          statusEl.textContent = 'Loading fonts and styles...';
        } else if (!assetsReady) {
          statusEl.textContent = 'Connecting...';
        } else {
          statusEl.textContent = 'Welcome to Security Club DBIT';
        }
      }

      if ((timeRatio >= 1 && assetsReady) || isTimedOut) {
        finish();
      } else {
        animId = requestAnimationFrame(step);
      }
    }

    animId = requestAnimationFrame(step);
  }

  function route() {
    render(location.hash.replace(/^#\/?/, '') || 'home');
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', route);
  document.querySelector('#current-year').textContent = new Date().getFullYear();
  setupSplashLoader();
  setupMatrix();
  route();
}());
