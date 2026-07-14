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
  const prototypeLoading = document.querySelector('[data-sidar-video-loading]');
  const prototypeCancel = document.querySelector('[data-sidar-video-cancel]');

  if (prototypeVideo && prototypeLaunch) {
    const videoId = prototypeVideo.getAttribute('data-video-id');
    const launchLabel = prototypeLaunch.getAttribute('aria-label') || 'Play the SIDAR NULL prototype recording';
    const launchText = prototypeLaunch.querySelector('.sidar-prototype__play > span:last-child');
    let state = 'idle';
    let ytPlayer = null;
    let loadTimeout = null;
    let apiPromise = null;

    function loadYouTubeApi() {
      if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
      if (apiPromise) return apiPromise;
      apiPromise = new Promise(function (resolve, reject) {
        const previousReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
          if (typeof previousReady === 'function') previousReady();
          resolve(window.YT);
        };
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.onerror = reject;
        document.head.appendChild(script);
      });
      return apiPromise;
    }

    function resetToLaunch(failed) {
      state = 'idle';
      window.clearTimeout(loadTimeout);
      if (prototypeLoading) prototypeLoading.hidden = true;
      if (ytPlayer) {
        try { ytPlayer.destroy(); } catch (err) { /* player already gone */ }
        ytPlayer = null;
      }
      const mount = prototypeVideo.querySelector('[data-sidar-player-mount]');
      if (mount) mount.remove();
      prototypeLaunch.hidden = false;
      prototypeLaunch.removeAttribute('aria-busy');
      prototypeLaunch.setAttribute('aria-label', failed ? launchLabel + '. Loading failed, retry' : launchLabel);
      if (launchText) launchText.textContent = failed ? 'Retry recording' : 'Play recording';
      if (failed) prototypeLaunch.focus();
    }

    function startLoad() {
      if (state !== 'idle' || !videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;
      state = 'loading';
      prototypeLaunch.hidden = true;
      prototypeLaunch.setAttribute('aria-busy', 'true');
      if (prototypeLoading) prototypeLoading.hidden = false;

      const mount = document.createElement('div');
      mount.setAttribute('data-sidar-player-mount', '');
      mount.className = 'sidar-prototype__player';
      prototypeVideo.insertBefore(mount, prototypeLoading || null);

      loadTimeout = window.setTimeout(function () { resetToLaunch(true); }, 12000);

      loadYouTubeApi().then(function (YT) {
        if (state !== 'loading') return;
        ytPlayer = new YT.Player(mount, {
          host: 'https://www.youtube-nocookie.com',
          videoId: videoId,
          playerVars: { autoplay: 1, rel: 0 },
          events: {
            onReady: function (event) {
              if (state !== 'loading') return;
              state = 'ready';
              window.clearTimeout(loadTimeout);
              if (prototypeLoading) prototypeLoading.hidden = true;
              event.target.playVideo();
            },
            onError: function () { resetToLaunch(true); }
          }
        });
      }).catch(function () { resetToLaunch(true); });
    }

    prototypeLaunch.addEventListener('click', startLoad);
    if (prototypeCancel) {
      prototypeCancel.addEventListener('click', function () { resetToLaunch(false); });
    }
  }
})();
