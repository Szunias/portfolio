// Theme toggle (universal — works with SVG icons or text emoji buttons)
(function(){
  try {
    const stored = localStorage.getItem('theme');
    const saved = stored === 'dark' || stored === 'light' ? stored : 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  } catch(e) {}

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  const lazyAutoplayVideos = Array.from(document.querySelectorAll('video[data-autoplay-src]'));

  function loadAutoplayVideo(video) {
    if (!video || video.dataset.autoplayLoaded === 'true') return;
    const src = video.getAttribute('data-autoplay-src');
    if (!src) return;
    const shouldAutoplay = !reduceMotion || !reduceMotion.matches;
    video.src = src;
    video.dataset.autoplayLoaded = 'true';
    if (shouldAutoplay) {
      video.autoplay = true;
      video.play().catch(() => {});
    } else {
      video.autoplay = false;
      video.removeAttribute('autoplay');
      video.dataset.autoplayPaused = 'true';
      video.pause();
    }
  }

  function setupLazyAutoplayVideos() {
    if (!lazyAutoplayVideos.length) return;
    if (!('IntersectionObserver' in window)) {
      lazyAutoplayVideos.forEach(loadAutoplayVideo);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        loadAutoplayVideo(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '240px 0px' });
    lazyAutoplayVideos.forEach(video => observer.observe(video));
  }

  function applyMotionPreference() {
    if (!reduceMotion) return;
    document.querySelectorAll('video[autoplay], video[data-autoplay-loaded="true"]').forEach(video => {
      if (reduceMotion.matches) {
        video.dataset.autoplayPaused = 'true';
        video.pause();
      } else if (video.dataset.autoplayPaused === 'true') {
        video.autoplay = true;
        video.play().catch(() => {});
        delete video.dataset.autoplayPaused;
      }
    });
  }
  setupLazyAutoplayVideos();
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
