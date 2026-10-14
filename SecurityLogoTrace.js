const CYAN = '#00eaff';
const SHIELD_D = 'M 537 245 L 774 330 L 774 555 C 774 690 700 775 537 830 C 374 775 300 690 300 555 L 300 330 Z';

let logoCount = 0;

function buildMesh(minX, maxX, minY, maxY, columns, rows) {
  const points = [];
  const edges = [];
  const stepX = (maxX - minX) / (columns - 1);
  const stepY = (maxY - minY) / (rows - 1);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = minX + column * stepX + (row % 2 === 1 ? stepX * 0.45 : 0);
      const y = minY + row * stepY;
      points.push([Math.round(x), Math.round(y)]);
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column;
      if (column < columns - 1) edges.push([index, index + 1]);
      if (row < rows - 1) {
        edges.push([index, index + columns]);
        if (row % 2 === 0 && column > 0) edges.push([index, index + columns - 1]);
        if (row % 2 === 1 && column < columns - 1) edges.push([index, index + columns + 1]);
      }
    }
  }

  return { points, edges };
}

function meshMarkup(mesh) {
  const edges = mesh.edges.map(function ([from, to], index) {
    const [x1, y1] = mesh.points[from];
    const [x2, y2] = mesh.points[to];
    return '<path class="trace-path mesh-edge" pathLength="1" style="--trace-delay:' + (index * 0.02).toFixed(2) + 's" d="M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2 + '"/>';
  }).join('');
  const nodes = mesh.points.map(function ([cx, cy], index) {
    return '<circle class="trace-path node-dot" style="--trace-delay:' + (index * 0.025).toFixed(2) + 's" cx="' + cx + '" cy="' + cy + '" r="3"/>';
  }).join('');
  return edges + nodes;
}

function polarPoint(radius, angle) {
  return [537 + radius * Math.cos(angle), 537 + radius * Math.sin(angle)];
}

function webMarkup() {
  const radials = Array.from({ length: 24 }, function (_, index) {
    const angle = index * Math.PI / 12 - Math.PI / 2;
    const [x1, y1] = polarPoint(151, angle);
    const [x2, y2] = polarPoint(525, angle);
    return '<path class="trace-path web-line" pathLength="1" style="--trace-delay:' + (index * 0.035).toFixed(2) + 's" d="M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' L ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '"/>';
  }).join('');

  const rings = [220, 295, 370, 445].map(function (radius, ringIndex) {
    return Array.from({ length: 24 }, function (_, index) {
      const start = index * Math.PI / 12 - Math.PI / 2;
      const end = (index + 1) * Math.PI / 12 - Math.PI / 2;
      const middle = (start + end) / 2;
      const [x1, y1] = polarPoint(radius, start);
      const [x2, y2] = polarPoint(radius, end);
      const [cx, cy] = polarPoint(radius - 12, middle);
      const delay = 0.2 + ringIndex * 0.35 + index * 0.025;
      return '<path class="trace-path web-line" pathLength="1" style="--trace-delay:' + delay.toFixed(2) + 's" d="M ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Q ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '"/>';
    }).join('');
  }).join('');

  return radials + rings;
}

function greenOrbitMarkup() {
  const radii = [345, 400, 455, 510];
  return radii.map(function (radius, index) {
    const direction = index % 2 === 0 ? '' : ' reverse';
    const startAngle = index * 90;
    return '<g class="green-orbit-spinner' + direction + '" style="--orbit-start:' + startAngle + 'deg">'
      + '<circle class="logo-orbit logo-orbit-green-track" cx="537" cy="537" r="' + radius + '"/>'
      + '<circle class="logo-orbit logo-orbit-green" cx="537" cy="537" r="' + radius + '" pathLength="100"/>'
      + '</g>';
  }).join('');
}

export function mountSecurityLogo(container, size = 420) {
  if (!container) return;

  logoCount += 1;
  const suffix = 'security-logo-' + logoCount;
  const meshTopLeft = buildMesh(305, 535, 250, 535, 5, 5);
  const meshBottomRight = buildMesh(540, 770, 540, 770, 5, 5);
  const logo = document.createElement('div');
  logo.className = 'security-logo';
  logo.style.setProperty('--logo-size', typeof size === 'number' ? size + 'px' : size);
  logo.innerHTML = '<svg viewBox="0 0 1074 1074" role="img" aria-label="Security Club network shield" xmlns="http://www.w3.org/2000/svg">'
    + '<defs>'
    + '<mask id="' + suffix + '-web-mask"><rect x="0" y="0" width="1074" height="1074" fill="white"/><path d="' + SHIELD_D + '" fill="black"/></mask>'
    + '<clipPath id="' + suffix + '-shield-clip"><path d="' + SHIELD_D + '"/></clipPath>'
    + '<clipPath id="' + suffix + '-top-left-clip"><rect x="298" y="243" width="240" height="295"/></clipPath>'
    + '<clipPath id="' + suffix + '-bottom-right-clip"><rect x="538" y="538" width="238" height="294"/></clipPath>'
    + '</defs>'
    + '<circle class="logo-orbit logo-orbit-outer" pathLength="1" transform="rotate(-90 537 537)" cx="537" cy="537" r="525"/>'
    + '<circle class="logo-orbit logo-orbit-inner" pathLength="1" transform="rotate(-90 537 537)" cx="537" cy="537" r="386"/>'
    + greenOrbitMarkup()
    + '<g class="web logo-web" mask="url(#' + suffix + '-web-mask)">' + webMarkup() + '</g>'
    + '<path d="' + SHIELD_D + '" fill="#050a14"/>'
    + '<path class="trace-path shield logo-divider logo-divider-vertical" pathLength="1" d="M 537 245 L 537 828"/>'
    + '<path class="trace-path shield logo-divider logo-divider-horizontal" pathLength="1" d="M 302 538 L 772 538"/>'
    + '<g class="logo-mesh" clip-path="url(#' + suffix + '-shield-clip)"><g clip-path="url(#' + suffix + '-top-left-clip)">' + meshMarkup(meshTopLeft) + '</g>'
    + '<g clip-path="url(#' + suffix + '-bottom-right-clip)">' + meshMarkup(meshBottomRight) + '</g></g>'
    + '<path class="trace-path shield logo-outline" pathLength="1" d="' + SHIELD_D + '"/>'
    + '</svg>';

  if (!window.securityClubLogoMotionPlayed) {
    logo.classList.add('is-animating');
    window.securityClubLogoMotionPlayed = true;
  }

  container.replaceChildren(logo);
  return logo;
}
