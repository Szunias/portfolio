// Scroll progress bar
(function(){
  const progress = document.getElementById('scrollProgress');
  if (!progress) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progress.style.width = pct + '%';
  }, { passive: true });
})();
