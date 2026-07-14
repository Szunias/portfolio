(function () {
  const film = document.getElementById('sidarFilm');
  const playback = document.getElementById('sidarPlayback');
  const sound = document.getElementById('sidarSound');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  let pausedForVisibility = false;
  let pausedForMotion = false;
  let pausedByUser = false;

  function ensureFilmLoaded() {
    if (!film || film.dataset.autoplayLoaded === 'true') return;
    const source = film.getAttribute('data-autoplay-src');
    if (!source) return;
    film.src = source;
    film.dataset.autoplayLoaded = 'true';
    film.load();
  }

  function setPlaybackState(playing) {
    if (!playback) return;
    playback.setAttribute('aria-pressed', playing ? 'true' : 'false');
    const label = playback.querySelector('.sidar-playback__label');
    if (label) label.textContent = playing ? 'Pause teaser' : 'Play teaser';
  }

  function playFilm() {
    if (!film) return;
    ensureFilmLoaded();
    const promise = film.play();
    if (promise && typeof promise.then === 'function') {
      promise.then(function () {
        setPlaybackState(true);
      }).catch(function () {
        setPlaybackState(false);
      });
    }
  }

  function setSound(enabled) {
    if (!film) return;
    film.muted = !enabled;
    if (!sound) return;
    sound.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    const label = sound.querySelector('.sidar-sound__label');
    if (label) label.textContent = enabled ? 'Sound on' : 'Enable sound';
  }

  if (film) {
    if (playback) playback.hidden = false;
    if (sound) sound.hidden = false;

    film.addEventListener('play', function () {
      setPlaybackState(true);
    });

    film.addEventListener('pause', function () {
      setPlaybackState(false);
    });

    if (playback) {
      playback.addEventListener('click', function () {
        pausedForVisibility = false;
        if (film.paused) {
          pausedByUser = false;
          pausedForMotion = false;
          playFilm();
        } else {
          pausedByUser = true;
          film.pause();
        }
      });
    }

    if (sound) {
      sound.addEventListener('click', function () {
        pausedByUser = false;
        pausedForMotion = false;
        setSound(film.muted);
        playFilm();
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        pausedForVisibility = !film.paused;
        if (pausedForVisibility) film.pause();
      } else if (pausedForVisibility && !pausedByUser && (!reduceMotion || !reduceMotion.matches)) {
        pausedForVisibility = false;
        playFilm();
      }
    });

    if (reduceMotion && typeof reduceMotion.addEventListener === 'function') {
      reduceMotion.addEventListener('change', function (event) {
        if (event.matches) {
          pausedForMotion = !film.paused;
          if (pausedForMotion) film.pause();
        } else if (pausedForMotion && !pausedByUser) {
          pausedForMotion = false;
          playFilm();
        }
      });
    }

    if (!reduceMotion || !reduceMotion.matches) playFilm();
  }

  const prototypeVideo = document.querySelector('[data-sidar-video]');
  const prototypeLaunch = document.querySelector('[data-sidar-video-launch]');

  if (prototypeVideo && prototypeLaunch) {
    const prototypeLaunchText = prototypeLaunch.querySelector('.sidar-prototype__play > span:last-child');
    const prototypeLaunchLabel = prototypeLaunch.getAttribute('aria-label');
    let prototypeLoading = false;

    prototypeLaunch.addEventListener('click', function () {
      if (prototypeLoading) return;

      const videoId = prototypeVideo.getAttribute('data-video-id');
      if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;

      prototypeLoading = true;
      prototypeLaunch.setAttribute('aria-busy', 'true');
      prototypeLaunch.setAttribute('aria-label', 'Loading the SIDAR 2.0 prototype recording');
      if (prototypeLaunchText) prototypeLaunchText.textContent = 'Loading recording';

      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0';
      iframe.title = 'SIDAR 2.0 prototyping week one';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.tabIndex = 0;
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

      let loadTimeout;
      const restoreLaunch = function () {
        if (!prototypeLoading) return;
        prototypeLoading = false;
        window.clearTimeout(loadTimeout);
        iframe.remove();
        prototypeLaunch.removeAttribute('aria-busy');
        prototypeLaunch.setAttribute('aria-label', (prototypeLaunchLabel || 'Play the SIDAR 2.0 prototype recording') + '. Loading failed; retry');
        if (prototypeLaunchText) prototypeLaunchText.textContent = 'Retry recording';
        prototypeLaunch.focus();
      };

      iframe.addEventListener('load', function () {
        if (!prototypeLoading) return;
        prototypeLoading = false;
        window.clearTimeout(loadTimeout);
        iframe.focus();
        prototypeLaunch.remove();
      }, { once: true });
      iframe.addEventListener('error', restoreLaunch, { once: true });

      prototypeVideo.insertBefore(iframe, prototypeLaunch);
      loadTimeout = window.setTimeout(restoreLaunch, 12000);
    });
  }
})();
