/* Ray: the credits theme gets one play/pause button in place of the native
   audio controls. The film (the hero player, feature.js) and the theme never
   play at the same time. The scene stills are play-from cues of feature.js. */
(function () {
  var page = document.querySelector('.ft.ray');
  var holder = page ? page.querySelector('[data-ray-theme]') : null;
  var audio = holder ? holder.querySelector('audio') : null;
  if (!audio) return;

  function fmt(t) {
    t = Math.max(0, Math.floor(t));
    return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2);
  }
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 4.5v15l12-7.5L7 4.5Z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z"/></svg>';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ray-theme__btn';
  btn.setAttribute('aria-pressed', 'false');
  btn.innerHTML = '<span class="ray-theme__icon">' + PLAY + '</span><span>Credits theme</span>' +
    '<span class="ray-theme__bar" aria-hidden="true"><span></span></span><span class="ray-theme__time">0:22</span>';
  var icon = btn.querySelector('.ray-theme__icon');
  var bar = btn.querySelector('.ray-theme__bar');
  var time = btn.querySelector('.ray-theme__time');
  audio.removeAttribute('controls');
  audio.hidden = true;
  holder.appendChild(btn);

  function state(on) {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    icon.innerHTML = on ? PAUSE : PLAY;
  }
  btn.addEventListener('click', function () {
    if (audio.paused) {
      [].slice.call(page.querySelectorAll('video:not([data-poster-loop])')).forEach(function (v) {
        if (!v.paused) v.pause();
      });
      var p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(function () { state(false); });
    } else {
      audio.pause();
    }
  });
  audio.addEventListener('play', function () { state(true); });
  audio.addEventListener('pause', function () { state(false); });
  audio.addEventListener('ended', function () {
    state(false);
    bar.style.setProperty('--p', '0%');
    time.textContent = '0:22';
  });
  audio.addEventListener('timeupdate', function () {
    var d = audio.duration || 21.5;
    bar.style.setProperty('--p', (audio.currentTime / d * 100).toFixed(1) + '%');
    time.textContent = fmt(Math.max(0, d - audio.currentTime) + 0.5);
  });
  // The film is created later by feature.js; media events do not bubble, so listen in capture.
  page.addEventListener('play', function (e) {
    var v = e.target;
    if (v.tagName === 'VIDEO' && !v.hasAttribute('data-poster-loop') && !audio.paused) audio.pause();
  }, true);
})();
