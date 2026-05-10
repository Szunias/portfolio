// Scroll progress bar
(function(){
  const progress = document.getElementById('scrollProgress');
  if (!progress) return;

  progress.setAttribute('aria-hidden', 'true');

  let frame = null;

  function update() {
    frame = null;
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.width = pct + '%';
  }

  function scheduleUpdate() {
    if (frame) return;
    frame = requestAnimationFrame(update);
  }

  // Initial sync — handles anchor jumps, BFCache restore, page reload mid-scroll
  update();
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('pageshow', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.documentElement);
    if (document.body) observer.observe(document.body);
  }
})();
