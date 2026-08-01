// Lazy autoplay for muted decorative video. Interactive videos own their
// playback state in their page-specific scripts.
(function () {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileLikeViewport = window.matchMedia && window.matchMedia('(max-width: 820px), (pointer: coarse)');
  const videos = Array.from(document.querySelectorAll('video[data-autoplay-src]'));

  function autoplayAllowed() {
    if (reduceMotion && reduceMotion.matches) return false;
    if (mobileLikeViewport && mobileLikeViewport.matches) return false;
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return true;
    if (connection.saveData) return false;
    return !/(^|\b)(slow-2g|2g|3g)$/.test(connection.effectiveType || '');
  }

  function load(video) {
    if (!video || video.dataset.autoplayLoaded === 'true') return;
    if (!autoplayAllowed()) return;
    const src = video.getAttribute('data-autoplay-src');
    if (!src) return;
    video.src = src;
    video.dataset.autoplayLoaded = 'true';
    video.autoplay = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(function () {});
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        load(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '240px 0px' });
    videos.forEach(function (video) { observer.observe(video); });
  } else {
    videos.forEach(load);
  }

  function applyMotionPreference() {
    if (!reduceMotion) return;
    videos.forEach(function (video) {
      if (reduceMotion.matches) {
        if (!video.paused) video.dataset.autoplayPaused = 'true';
        video.pause();
      } else if (video.dataset.autoplayPaused === 'true') {
        delete video.dataset.autoplayPaused;
        video.autoplay = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(function () {});
      }
    });
  }

  applyMotionPreference();
  if (reduceMotion && typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', applyMotionPreference);
  } else if (reduceMotion && typeof reduceMotion.addListener === 'function') {
    reduceMotion.addListener(applyMotionPreference);
  }
})();
