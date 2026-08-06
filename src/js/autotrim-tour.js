(function () {
  const frame = document.querySelector('[data-autotrim-tour]');
  if (!frame) return;

  const video = frame.querySelector('video[data-autoplay-src]');
  const toggle = frame.querySelector('[data-autotrim-tour-toggle]');
  if (!video || !toggle) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  function loadVideo() {
    if (video.dataset.autoplayLoaded === 'true') return;
    const src = video.getAttribute('data-autoplay-src');
    if (!src) return;
    video.src = src;
    video.dataset.autoplayLoaded = 'true';
  }

  function updateToggle() {
    const isPaused = video.paused;
    toggle.classList.toggle('is-paused', isPaused);
    toggle.setAttribute('aria-label', isPaused ? 'Play interface tour' : 'Pause interface tour');
  }

  function playVideo() {
    loadVideo();
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(updateToggle);
    }
  }

  toggle.hidden = false;
  video.addEventListener('play', updateToggle);
  video.addEventListener('pause', updateToggle);
  toggle.addEventListener('click', function () {
    if (video.paused) playVideo();
    else video.pause();
  });

  // Same gates as lazy-video.js: the tour is 1.1 MB of decoration, so it only
  // auto-starts on a wide precise-pointer layout with a fast connection. A
  // click on the toggle is explicit intent and still loads it regardless.
  function autostartAllowed() {
    if (reduceMotion && reduceMotion.matches) return false;
    const mobileLike = window.matchMedia && window.matchMedia('(max-width: 820px), (pointer: coarse)');
    if (mobileLike && mobileLike.matches) return false;
    if (!connection) return true;
    if (connection.saveData) return false;
    return !/(^|\b)(slow-2g|2g|3g)$/.test(connection.effectiveType || '');
  }

  if (autostartAllowed()) playVideo();
  updateToggle();
})();
