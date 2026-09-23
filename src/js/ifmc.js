/* IFMC reels: each score plays on its own over the loudness of the published
   track. The range input is the accessible scrubber; a cue button starts three
   seconds before its moment so the change is heard arriving. Nothing loads
   until the reader asks for it, and only one thing sounds at a time: starting
   a reel pauses the other reel and the films, and a film that opens or starts
   playing pauses the reels and the other film. */
(function () {
  var reels = [].slice.call(document.querySelectorAll('[data-reel]'));
  if (!reels.length) return;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var LEAD = 3;
  var YT = 'https://www.youtube-nocookie.com';
  var audios = [];
  var films = [];

  function pauseReels() {
    audios.forEach(function (a) { if (!a.paused) a.pause(); });
  }

  /* The films are YouTube embeds that video-facade.js mounts on click with
     enablejsapi=1, so they accept postMessage commands. After a "listening"
     handshake the player also reports its state (1 = playing). It starts by
     replaying, within a millisecond or two, the states it passed through
     before the handshake, so a state counts once it has held for 50 ms. */
  function post(film, msg) {
    msg.id = film.id;
    msg.channel = 'widget';
    try { film.frame.contentWindow.postMessage(JSON.stringify(msg), YT); } catch (e) {}
  }

  function pauseFilms(except) {
    films.forEach(function (film) {
      if (film === except) return;
      window.clearTimeout(film.settle);
      post(film, { event: 'command', func: 'pauseVideo', args: [] });
    });
  }

  function filmStarts(film) {
    pauseReels();
    pauseFilms(film);
  }

  function fmt(t) {
    t = Math.max(0, Math.floor(t || 0));
    return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2);
  }

  reels.forEach(function (reel) {
    var audio = reel.querySelector('audio');
    var btn = reel.querySelector('[data-play]');
    var label = reel.querySelector('[data-play-label]');
    var timeEl = reel.querySelector('[data-time]');
    var scrub = reel.querySelector('.if-scrub');
    var dur = Number(reel.getAttribute('data-dur')) || 0;
    var film = reel.closest('.if-film') || reel;
    if (!audio || !btn || !label || !timeEl || !scrub || !dur) return;
    var cues = [].slice.call(film.querySelectorAll('[data-at]'));
    var ticks = [].slice.call(reel.querySelectorAll('[data-tick]'));
    var pending = null;
    var raf = 0;
    // A clicked cue seeks to LEAD seconds before its own data-at, so during
    // the lead-in "last cue at or before t" below still resolves to the
    // previous cue. Pin the clicked index instead, until playback reaches
    // its moment (then the normal scan below picks it up on its own) or the
    // scrubber is moved by hand.
    var pinned = null;

    audios.push(audio);
    audio.removeAttribute('controls');
    reel.classList.add('is-live');
    film.classList.add('is-live');

    function paint(t) {
      reel.style.setProperty('--pos', Math.max(0, Math.min(1, t / dur)).toFixed(4));
      timeEl.textContent = fmt(t);
      scrub.value = String(Math.round(t));
      scrub.setAttribute('aria-valuetext', fmt(t) + ' of ' + fmt(dur));
      if (pinned !== null && Number(cues[pinned].getAttribute('data-at')) <= t + 0.05) pinned = null;
      var now = pinned === null ? -1 : pinned;
      if (pinned === null && reel.classList.contains('is-started')) {
        cues.forEach(function (c, i) { if (Number(c.getAttribute('data-at')) <= t + 0.05) now = i; });
      }
      cues.forEach(function (c, i) {
        var li = c.closest('li') || c;
        li.classList.toggle('is-now', i === now);
      });
      ticks.forEach(function (tk, i) { tk.classList.toggle('is-now', i === now); });
    }

    function loop() {
      paint(audio.currentTime);
      if (!audio.paused) raf = window.requestAnimationFrame(loop);
    }

    function start() {
      reel.classList.add('is-started');
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    }

    function seek(t, play) {
      t = Math.max(0, Math.min(dur, t));
      reel.classList.add('is-started');
      if (audio.readyState < 1) pending = t;
      try { audio.currentTime = t; } catch (e) { pending = t; }
      paint(t);
      if (play) start();
    }

    btn.addEventListener('click', function () {
      if (audio.paused) start(); else audio.pause();
    });
    scrub.addEventListener('input', function () { pinned = null; seek(Number(scrub.value), false); });
    cues.forEach(function (c, i) {
      c.addEventListener('click', function () { pinned = i; seek(Number(c.getAttribute('data-at')) - LEAD, true); });
    });

    audio.addEventListener('loadedmetadata', function () {
      if (pending !== null) { audio.currentTime = pending; pending = null; }
    });
    audio.addEventListener('play', function () {
      audios.forEach(function (other) { if (other !== audio && !other.paused) other.pause(); });
      pauseFilms(null);
      btn.classList.add('is-playing');
      label.textContent = 'Pause';
      window.cancelAnimationFrame(raf);
      if (!(mq && mq.matches)) loop();
    });
    audio.addEventListener('timeupdate', function () {
      if (mq && mq.matches) paint(audio.currentTime);
    });
    function stopped() {
      window.cancelAnimationFrame(raf);
      btn.classList.remove('is-playing');
      label.textContent = 'Play the score';
      paint(audio.currentTime);
    }
    audio.addEventListener('pause', stopped);
    audio.addEventListener('ended', stopped);

    paint(0);
  });

  [].slice.call(document.querySelectorAll('.ifmc [data-yt-facade]')).forEach(function (facade) {
    // A click that bubbles up to the facade has already passed the launch
    // button, where video-facade.js swaps the poster for the player.
    facade.addEventListener('click', function () {
      var frame = facade.querySelector('iframe');
      if (!frame || films.some(function (f) { return f.frame === frame; })) return;
      var film = { frame: frame, id: films.length + 1, state: -1, heard: false, hello: 0, settle: 0 };
      films.push(film);
      frame.addEventListener('load', function () {
        var tries = 0;
        function hello() {
          if (film.heard || tries++ >= 40) { window.clearInterval(film.hello); return; }
          post(film, { event: 'listening' });
        }
        film.heard = false;
        window.clearInterval(film.hello);
        film.hello = window.setInterval(hello, 250);
        hello();
      });
      filmStarts(film);
    });
  });

  window.addEventListener('message', function (e) {
    if (e.origin !== YT || !films.length) return;
    var film = null;
    films.forEach(function (f) { if (f.frame.contentWindow === e.source) film = f; });
    if (!film) return;
    film.heard = true;
    var data = e.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (err) { return; }
    }
    var info = data && data.info;
    if (!info || typeof info.playerState !== 'number') return;
    film.state = info.playerState;
    window.clearTimeout(film.settle);
    film.settle = window.setTimeout(function () { if (film.state === 1) filmStarts(film); }, 50);
  });
})();
