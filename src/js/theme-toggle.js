// Theme toggle (universal - works with SVG icons or text emoji buttons)
(function(){
  // Dark theme only.
  document.documentElement.setAttribute('data-theme', 'dark');
  try { localStorage.setItem('theme', 'dark'); } catch(e) {}

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
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
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
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
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

  // Theme toggle removed: site is dark-only. Hide any leftover toggle button.
  const toggle = document.getElementById('themeToggle');
  if (toggle) toggle.remove();
})();
