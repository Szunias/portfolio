/* IFMC reels: each score plays on its own over the loudness of the published
   track. The range input is the accessible scrubber; a cue button starts three
   seconds before its moment so the change is heard arriving. One reel plays
   at a time and nothing loads until the reader asks for it. */
(function () {
  var reels = [].slice.call(document.querySelectorAll('[data-reel]'));
  if (!reels.length) return;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var LEAD = 3;
  var audios = [];

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

    audios.push(audio);
    audio.removeAttribute('controls');
    reel.classList.add('is-live');
    film.classList.add('is-live');

    function paint(t) {
      reel.style.setProperty('--pos', Math.max(0, Math.min(1, t / dur)).toFixed(4));
      timeEl.textContent = fmt(t);
      scrub.value = String(Math.round(t));
      scrub.setAttribute('aria-valuetext', fmt(t) + ' of ' + fmt(dur));
      var now = -1;
      if (reel.classList.contains('is-started')) {
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
    scrub.addEventListener('input', function () { seek(Number(scrub.value), false); });
    cues.forEach(function (c) {
      c.addEventListener('click', function () { seek(Number(c.getAttribute('data-at')) - LEAD, true); });
    });

    audio.addEventListener('loadedmetadata', function () {
      if (pending !== null) { audio.currentTime = pending; pending = null; }
    });
    audio.addEventListener('play', function () {
      audios.forEach(function (other) { if (other !== audio && !other.paused) other.pause(); });
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
})();
