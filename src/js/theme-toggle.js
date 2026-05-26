// Theme toggle (universal — works with SVG icons or text emoji buttons)
(function(){
  try {
    const stored = localStorage.getItem('theme');
    const saved = stored === 'dark' || stored === 'light' ? stored : 'light';
    document.documentElement.setAttribute('data-theme', saved);
  } catch(e) {}

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  function applyMotionPreference() {
    if (!reduceMotion) return;
    document.querySelectorAll('video[autoplay]').forEach(video => {
      if (reduceMotion.matches) {
        video.dataset.autoplayPaused = 'true';
        video.pause();
      } else if (video.dataset.autoplayPaused === 'true') {
        video.play().catch(() => {});
        delete video.dataset.autoplayPaused;
      }
    });
  }
  applyMotionPreference();
  if (reduceMotion && typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', applyMotionPreference);
  } else if (reduceMotion && typeof reduceMotion.addListener === 'function') {
    reduceMotion.addListener(applyMotionPreference);
  }

  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const useText = !toggle.querySelector('svg');

  function updateLabel() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (useText) toggle.textContent = isLight ? '\u263D' : '\u2600';
    toggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    toggle.setAttribute('title', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    toggle.setAttribute('aria-pressed', isLight ? 'true' : 'false');
  }
  updateLabel();

  toggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.classList.remove('theme-switching');
    void document.documentElement.offsetWidth;
    document.documentElement.classList.add('theme-switching');
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch(e) {}
    updateLabel();
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-switching');
    }, 760);
  });
})();
