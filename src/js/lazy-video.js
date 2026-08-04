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

  // Returns true when the video is (already) loaded, so callers know whether
  // to keep watching it. A bail-out (reduced motion, save-data) must NOT stop
  // observation, or the video could never load once conditions change.
  function load(video) {
    if (!video) return false;
    if (video.dataset.autoplayLoaded === 'true') return true;
    if (!autoplayAllowed()) return false;
    const src = video.getAttribute('data-autoplay-src');
    if (!src) return false;
    video.src = src;
    video.dataset.autoplayLoaded = 'true';
    video.autoplay = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(function () {});
    return true;
  }

  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (load(entry.target)) observer.unobserve(entry.target);
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
      } else if (video.dataset.autoplayLoaded !== 'true') {
        // First seen while reduced motion was on, so it never loaded. Re-observe
        // to get a fresh intersection callback (loads it if currently in view).
        if (observer) {
          observer.unobserve(video);
          observer.observe(video);
        } else {
          load(video);
        }
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
