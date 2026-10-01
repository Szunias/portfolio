/* Richter: the cue sheet's timecodes and frames play the film from that cue,
   and the main theme has its own simple player.
   Cue times come from the picture. 0:07 is where the released "Richter - Main
   Theme" lines up with the film mix (FFT cross-correlation, offset 6.92 s).
   The timecodes in the cue sheet are the accessible buttons; the frames next
   to them are a pointer shortcut and stay aria-hidden. */
(function () {
  var film = document.querySelector('[data-ri-film]');
  if (!film) return;

  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var screen = film.closest('[data-ri-screen]') || film.parentElement;
  var rows = [].slice.call(document.querySelectorAll('[data-ri-cue]'));

  function fmt(s) {
    s = Math.max(0, Math.floor(s + 0.001));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }

  /* Start the film if it has not started (local-video.js keeps a poster
     button over it until then), then cue it to the second. */
  function seek(sec) {
    var launch = screen.querySelector('.local-video__launch');
    var back = document.activeElement;
    if (launch) launch.click();
    try { film.currentTime = sec; } catch (e) { /* not seekable yet */ }
    if (film.paused) {
      var p = film.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }
    if (launch && back && back !== document.body && back.focus) back.focus({ preventScroll: true });
  }

  rows.forEach(function (row) {
    var sec = Number(row.getAttribute('data-ri-cue'));
    [].forEach.call(row.querySelectorAll('[data-ri-seek]'), function (b) {
      b.addEventListener('click', function () {
        seek(sec);
        var r = screen.getBoundingClientRect();
        if (r.bottom < 60 || r.top > window.innerHeight - 60) {
          screen.scrollIntoView({ block: 'center', behavior: reduce.matches ? 'auto' : 'smooth' });
        }
      });
    });
  });

  /* The theme on its own. One sound at a time: the film pauses it and it pauses the film. */
  var audio = document.querySelector('[data-ri-audio]');
  var btn = document.querySelector('[data-ri-play]');
  var aTime = document.querySelector('[data-ri-atime]');
  var aBar = document.querySelector('[data-ri-abar]');
  if (!audio || !btn) return;
  audio.removeAttribute('controls');
  audio.hidden = true;
  btn.hidden = false;
  function showTime() {
    var d = isFinite(audio.duration) && audio.duration ? audio.duration : 37.6;
    if (aTime) aTime.textContent = fmt(audio.currentTime) + ' / ' + fmt(d);
    if (aBar) aBar.style.width = (Math.min(1, audio.currentTime / d) * 100).toFixed(2) + '%';
  }
  btn.addEventListener('click', function () {
    if (audio.paused) {
      var p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    } else {
      audio.pause();
    }
  });
  audio.addEventListener('play', function () {
    btn.classList.add('is-playing');
    btn.setAttribute('aria-label', 'Pause the main theme');
    if (!film.paused) film.pause();
  });
  audio.addEventListener('pause', function () {
    btn.classList.remove('is-playing');
    btn.setAttribute('aria-label', 'Play the main theme');
  });
  audio.addEventListener('timeupdate', showTime);
  audio.addEventListener('ended', function () { audio.currentTime = 0; showTime(); });
  film.addEventListener('play', function () { if (!audio.paused) audio.pause(); });
})();
