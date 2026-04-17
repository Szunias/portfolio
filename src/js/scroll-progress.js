// Scroll progress bar
(function(){
  const progress = document.getElementById('scrollProgress');
  if (!progress) return;

  function update() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.width = pct + '%';
  }

  // Initial sync — handles anchor jumps, BFCache restore, page reload mid-scroll
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  window.addEventListener('pageshow', update);
})();
