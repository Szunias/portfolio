(function () {
  const film = document.getElementById('sidarFilm');
  const playback = document.getElementById('sidarPlayback');
  const sound = document.getElementById('sidarSound');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  let pausedForVisibility = false;

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
          playFilm();
        } else {
          film.pause();
        }
      });
    }

    if (sound) {
      sound.addEventListener('click', function () {
        setSound(film.muted);
        playFilm();
      });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        pausedForVisibility = !film.paused;
        if (pausedForVisibility) film.pause();
      } else if (pausedForVisibility && (!reduceMotion || !reduceMotion.matches)) {
        pausedForVisibility = false;
        playFilm();
      }
    });

    if (reduceMotion && typeof reduceMotion.addEventListener === 'function') {
      reduceMotion.addEventListener('change', function (event) {
        if (event.matches) {
          film.pause();
        } else {
          playFilm();
        }
      });
    }

    if (!reduceMotion || !reduceMotion.matches) playFilm();
  }

  const prototypeVideo = document.querySelector('[data-sidar-video]');
  const prototypeLaunch = document.querySelector('[data-sidar-video-launch]');

  if (prototypeVideo && prototypeLaunch) {
    prototypeLaunch.addEventListener('click', function () {
      const videoId = prototypeVideo.getAttribute('data-video-id');
      if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;

      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0';
      iframe.title = 'SIDAR 2.0 prototyping week one';
      iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.addEventListener('load', function () {
        iframe.focus();
      }, { once: true });

      prototypeVideo.classList.add('is-playing');
      prototypeVideo.replaceChildren(iframe);
    });
  }
})();
