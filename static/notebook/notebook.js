(() => {
  'use strict';
  // DOM references. Dates, sheets and dots are generated from the same entries list.
  const notebook = document.querySelector('.notebook');
  if (!notebook) return;
  const reader = notebook.querySelector('.notebook-reader');
  const sheets = [...notebook.querySelectorAll('[data-sheet]')];
  const dates = [...notebook.querySelectorAll('.notebook-date')];
  if (!reader || !sheets.length || dates.length !== sheets.length) return;
  const dots = [...notebook.querySelectorAll('.notebook-dots span')];
  const status = notebook.querySelector('.notebook-status');
  const previousButton = notebook.querySelector('.notebook-prev');
  const nextButton = notebook.querySelector('.notebook-next');
  if (!previousButton || !nextButton || !status) return;

  const compactScreen = matchMedia('(max-width: 700px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const SWORD_DURATION_MS = 560;
  const SWORD_LEFT_OFFSET_PX = 34;
  const DATE_FADE_PX = 28;
  let active = 0;
  const timeline = notebook.querySelector('.notebook-timeline');
  const movingSword = timeline?.querySelector('.notebook-sword');
  let swordAnimation;
  const dateViewport = timeline?.querySelector('.notebook-date-viewport');
  let scrollFrame;
  // Date reel and sword animation are decoration; page selection is handled below.
  function stopTimelineAnimation() {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = undefined;
    if (swordAnimation) swordAnimation.cancel();
  }

  function positionSword(index) {
    const bounds = timeline.getBoundingClientRect();
    const date = dates[index].getBoundingClientRect();
    const viewport = dateViewport.getBoundingClientRect();
    movingSword.style.left = `${date.left - bounds.left - SWORD_LEFT_OFFSET_PX}px`;
    movingSword.style.top = `${date.top - bounds.top + date.height / 2}px`;
    const center = date.top + date.height / 2;
    movingSword.style.opacity = String(Math.max(0, Math.min(1,
      (center - viewport.top) / DATE_FADE_PX, (viewport.bottom - center) / DATE_FADE_PX)));
  }
  function moveSword(index, animate) {
    if (!dateViewport || !movingSword) return;
    stopTimelineAnimation();
    if (compactScreen.matches) {
      dateViewport.scrollTop = 0;
      return;
    }
    const reduced = reducedMotion.matches;
    const viewportBounds = dateViewport.getBoundingClientRect();
    const dateBounds = dates[index].getBoundingClientRect();
    const startScroll = dateViewport.scrollTop;
    const targetScroll = Math.max(0, Math.min(
      dateViewport.scrollHeight - dateViewport.clientHeight,
      startScroll + dateBounds.top - viewportBounds.top + dateBounds.height / 2 - dateViewport.clientHeight / 2
    ));
    if (!animate || reduced || typeof movingSword.animate !== 'function') {
      dateViewport.scrollTop = targetScroll;
      positionSword(index);
      return;
    }
    const duration = SWORD_DURATION_MS;
    const started = performance.now();
    const startTop = parseFloat(movingSword.style.top) || 0;
    swordAnimation = movingSword.animate([
      { transform: 'translate(0, -50%) rotate(0deg)' },
      { transform: 'translate(30px, calc(-50% - 12px)) rotate(-18deg)', offset: 0.25 },
      { transform: 'translate(30px, calc(-50% - 12px)) rotate(-18deg)', offset: 0.7 },
      { transform: 'translate(0, -50%) rotate(0deg)' }
    ], { duration, easing: 'ease-in-out' });
    function tick(now) {
      const progress = Math.min(1, (now - started) / duration);
      const phase = Math.max(0, Math.min(1, (progress - 0.2) / 0.6));
      const eased = phase * phase * (3 - 2 * phase);
      dateViewport.scrollTop = startScroll + (targetScroll - startScroll) * eased;
      positionSword(index);
      const destinationTop = parseFloat(movingSword.style.top);
      movingSword.style.top = `${startTop + (destinationTop - startTop) * eased}px`;
      if (progress < 1) scrollFrame = requestAnimationFrame(tick);
      else scrollFrame = undefined;
    }
    scrollFrame = requestAnimationFrame(tick);
  }
  dateViewport?.addEventListener('scroll', () => {
    if (!scrollFrame) positionSword(active);
  }, { passive: true });
  dateViewport?.addEventListener('wheel', () => {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = undefined;
  }, { passive: true });
  function updateSheets() {
    sheets.forEach((sheet, index) => {
      const distance = index - active;
      sheet.dataset.position = String(Math.max(-3, Math.min(3, distance)));
      sheet.style.zIndex = String(10 - Math.min(3, Math.abs(distance)));
      sheet.setAttribute('aria-hidden', String(distance !== 0));
      sheet.inert = distance !== 0;
    });
  }

  function updateCurrentMarkers(elements, value) {
    elements.forEach((element, index) => {
      if (index === active) element.setAttribute('aria-current', value);
      else element.removeAttribute('aria-current');
    });
  }

  // Page state is updated first; animation must not control whether paging succeeds.
  function selectEntry(index) {
    const previous = active;
    const target = Math.max(0, Math.min(sheets.length - 1, index));
    if (target !== previous && sheets[previous].contains(document.activeElement)) reader.focus({ preventScroll: true });
    active = target;
    updateSheets();
    updateCurrentMarkers(dates, 'date');
    updateCurrentMarkers(dots, 'page');
    status.textContent = `Page ${active + 1} of ${sheets.length}, ${dates[active].querySelector('time').dateTime}`;
    previousButton.disabled = active === 0;
    nextButton.disabled = active === sheets.length - 1;
    // Decorative animation must never prevent the page state from updating.
    moveSword(target, target !== previous);
  }

  // Navigation: side buttons and blank space outside the paper.
  previousButton.addEventListener('click', () => selectEntry(active - 1));
  nextButton.addEventListener('click', () => selectEntry(active + 1));
  dates.forEach((date, index) => {
    date.addEventListener('click', () => selectEntry(index));
  });
  // The whole notebook's blank side space is a paging target, not just the button column.
  notebook.addEventListener('click', event => {
    if (event.target.closest('button, a, input, textarea, select, .notebook-timeline, .notebook-dots, .notebook-sheet')) return;
    const paper = sheets[active].getBoundingClientRect();
    if (event.clientX < paper.left && !previousButton.disabled) previousButton.click();
    else if (event.clientX > paper.right && !nextButton.disabled) nextButton.click();
  });
  // Re-measure after viewport or font changes, without replaying the animation.
  window.addEventListener('resize', () => moveSword(active, false));
  reducedMotion.addEventListener('change', () => moveSword(active, false));
  if (document.fonts) document.fonts.ready.then(() => moveSword(active, false));
  selectEntry(0);
})();
