/* Richter: the main theme's own player. The film and its cue sheet play in the
   hero through feature.js. Cue times come from the picture; 0:07 is where the
   released "Richter - Main Theme" lines up with the film mix (FFT
   cross-correlation, offset 6.92 s). One sound at a time: the film pauses the
   theme and the theme pauses the film. */
(function () {
  var audio = document.querySelector('[data-ri-audio]');
  var btn = document.querySelector('[data-ri-play]');
  if (!audio || !btn) return;
  var aTime = document.querySelector('[data-ri-atime]');
  var aBar = document.querySelector('[data-ri-abar]');

  function fmt(s) {
    s = Math.max(0, Math.floor(s + 0.001));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }
  function showTime() {
    var d = isFinite(audio.duration) && audio.duration ? audio.duration : 37.6;
    if (aTime) aTime.textContent = fmt(audio.currentTime) + ' / ' + fmt(d);
    if (aBar) aBar.style.width = (Math.min(1, audio.currentTime / d) * 100).toFixed(2) + '%';
  }

  audio.removeAttribute('controls');
  audio.hidden = true;
  btn.hidden = false;

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
    var film = document.querySelector('.ft-hero__film');
    if (film && film.tagName === 'VIDEO' && !film.paused) film.pause();
  });
  audio.addEventListener('pause', function () {
    btn.classList.remove('is-playing');
    btn.setAttribute('aria-label', 'Play the main theme');
  });
  audio.addEventListener('timeupdate', showTime);
  audio.addEventListener('ended', function () { audio.currentTime = 0; showTime(); });
  // The film is created by feature.js on the first press; media events do not bubble.
  document.addEventListener('play', function (e) {
    if (e.target && e.target.classList && e.target.classList.contains('ft-hero__film') && !audio.paused) audio.pause();
  }, true);
})();
