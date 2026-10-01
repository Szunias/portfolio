/* AI Audio Research: the sample table turns its native audio players into
   one play button per sample, with one sample playing at a time. Without this
   script the table keeps plain audio players; nothing plays until the reader
   presses a button. */
(function () {
  var matrix = document.querySelector('.ar [data-ar-matrix]');
  if (!matrix) return;
  var players = Array.prototype.slice.call(matrix.querySelectorAll('audio'));

  function stopOthers(except) {
    players.forEach(function (a) { if (a !== except && !a.paused) a.pause(); });
  }

  players.forEach(function (a) {
    if (!a.parentNode) return;
    var label = a.getAttribute('aria-label') || 'sample';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ar-play';
    btn.setAttribute('aria-label', 'Play ' + label);
    btn.innerHTML = '<span class="ar-play__icon" aria-hidden="true"></span>';
    a.removeAttribute('controls');
    a.hidden = true;
    a.parentNode.insertBefore(btn, a);

    function progress() {
      if (a.paused) return;
      var d = a.duration;
      btn.style.setProperty('--p', d && isFinite(d) ? (a.currentTime / d).toFixed(3) : '0');
      requestAnimationFrame(progress);
    }
    function off() {
      btn.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Play ' + label);
      btn.style.setProperty('--p', '0');
    }
    btn.addEventListener('click', function () {
      if (!a.paused) { a.pause(); return; }
      stopOthers(a);
      try { a.currentTime = 0; } catch (e) { /* not loaded yet */ }
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    });
    a.addEventListener('play', function () {
      btn.classList.add('is-playing');
      btn.setAttribute('aria-label', 'Stop ' + label);
      progress();
    });
    a.addEventListener('pause', off);
    a.addEventListener('ended', off);
  });
})();
