(function () {
  const film = document.getElementById('sidarFilm');
  const sound = document.getElementById('sidarSound');
  const replay = document.getElementById('sidarReplay');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!film) return;

  function ensureFilmLoaded() {
    if (film.dataset.autoplayLoaded === 'true') return;
    const source = film.getAttribute('data-autoplay-src');
    if (!source) return;
    film.src = source;
    film.dataset.autoplayLoaded = 'true';
    film.load();
  }

  function playFilm() {
    ensureFilmLoaded();
    const promise = film.play();
    if (promise && typeof promise.catch === 'function') promise.catch(function () {});
  }

  function setSound(enabled) {
    film.muted = !enabled;
    if (!sound) return;
    sound.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    const label = sound.querySelector('.sidar-sound__label');
    if (label) label.textContent = enabled ? 'Sound on' : 'Enable sound';
  }

  if (sound) {
    sound.addEventListener('click', function () {
      const enable = film.muted;
      setSound(enable);
      playFilm();
    });
  }

  if (replay) {
    replay.addEventListener('click', function () {
      film.currentTime = 0;
      playFilm();
      window.scrollTo({ top: 0, behavior: reduceMotion && reduceMotion.matches ? 'auto' : 'smooth' });
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      film.pause();
    } else if (!reduceMotion || !reduceMotion.matches) {
      playFilm();
    }
  });
})();
