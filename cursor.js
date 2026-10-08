(function () {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!finePointer.matches || reducedMotion.matches) return;

  const targetSelector = 'a, button, input, textarea, select, [role="button"], .cursor-target';
  const cursor = document.createElement('div');
  cursor.className = 'target-cursor-root';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span class="target-cursor-dot"></span><span class="target-cursor-frame"><span class="target-cursor-corner corner-tl"></span><span class="target-cursor-corner corner-tr"></span><span class="target-cursor-corner corner-br"></span><span class="target-cursor-corner corner-bl"></span></span>';
  document.body.appendChild(cursor);
  document.body.classList.add("has-target-cursor");

  const corners = Array.from(cursor.querySelectorAll('.target-cursor-corner'));
  const idlePositions = [
    [-18, -18], [6, -18], [6, 6], [-18, 6]
  ];
  const cornerSize = 12;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let activeTarget = null;
  let frame = 0;

  function moveCursor(event) {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursor.style.transform = 'translate3d(' + pointerX + 'px, ' + pointerY + 'px, 0) translate(-50%, -50%)';
    if (activeTarget) positionCorners(activeTarget);
  }

  function positionCorners(target) {
    const rect = target.getBoundingClientRect();
    const positions = [
      [rect.left - 3, rect.top - 3],
      [rect.right + 3 - cornerSize, rect.top - 3],
      [rect.right + 3 - cornerSize, rect.bottom + 3 - cornerSize],
      [rect.left - 3, rect.bottom + 3 - cornerSize]
    ];
    corners.forEach(function (corner, index) {
      corner.style.transform = 'translate3d(' + (positions[index][0] - pointerX) + 'px, ' + (positions[index][1] - pointerY) + 'px, 0)';
    });
  }

  function returnToIdle() {
    if (!activeTarget) return;
    activeTarget = null;
    cursor.classList.remove('is-targeting');
    corners.forEach(function (corner, index) {
      corner.style.transform = 'translate3d(' + idlePositions[index][0] + 'px, ' + idlePositions[index][1] + 'px, 0)';
    });
  }

  function findTarget(node) {
    return node instanceof Element ? node.closest(targetSelector) : null;
  }

  function onPointerOver(event) {
    if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const target = findTarget(event.target);
    if (!target || target === activeTarget) return;
    activeTarget = target;
    cursor.classList.add('is-targeting');
    positionCorners(target);
  }

  function onPointerOut(event) {
    if ((event.pointerType !== 'mouse' && event.pointerType !== 'pen') || !activeTarget) return;
    const nextTarget = findTarget(event.relatedTarget);
    if (nextTarget === activeTarget) return;
    if (nextTarget) {
      activeTarget = nextTarget;
      positionCorners(nextTarget);
    } else {
      returnToIdle();
    }
  }

  function syncTarget() {
    if (!activeTarget) return;
    if (!activeTarget.isConnected) returnToIdle();
    else positionCorners(activeTarget);
  }

  function scheduleSync() {
    if (frame) return;
    frame = window.requestAnimationFrame(function () {
      frame = 0;
      syncTarget();
    });
  }

  window.addEventListener('pointermove', moveCursor, { passive: true });
  document.addEventListener('pointerover', onPointerOver);
  document.addEventListener('pointerout', onPointerOut);
  window.addEventListener('scroll', scheduleSync, { passive: true });
  window.addEventListener('resize', scheduleSync, { passive: true });
  window.addEventListener('pointerdown', function (event) { if (event.pointerType !== 'touch') cursor.classList.add('is-clicking'); });
  window.addEventListener('pointerup', function (event) { if (event.pointerType !== 'touch') cursor.classList.remove('is-clicking'); });
  window.addEventListener('pointercancel', function (event) { if (event.pointerType !== 'touch') cursor.classList.remove('is-clicking'); });
}());