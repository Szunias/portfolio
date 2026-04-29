// Scroll progress bar
(function(){
  const progress = document.getElementById('scrollProgress');
  if (!progress) return;

  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '100');
  progress.setAttribute('aria-valuenow', '0');
  progress.setAttribute('aria-label', 'Scroll progress');

  function update() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.width = pct + '%';
    progress.setAttribute('aria-valuenow', Math.round(pct));
  }

  // Initial sync — handles anchor jumps, BFCache restore, page reload mid-scroll
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('pageshow', update);
})();
