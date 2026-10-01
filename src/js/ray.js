/* Ray: each scene still seeks the film to the timecode where it appears and
   starts playback; the scene under the playhead is marked aria-current. The
   credits theme gets one play/pause button; the film and the theme never play
   at the same time. */
(function () {
  var page = document.querySelector('.cine.ray');
  if (!page) return;

  var DUR = 148.7; // ray-animation-h264.mp4
  function fmt(t) {
    t = Math.max(0, Math.floor(t));
    return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2);
  }
  function quietPlay(media) {
    var p = media.play();
    if (p && typeof p.catch === 'function') p.catch(function () {});
    return p;
  }

  var rig = page.querySelector('[data-ray-film]');
  var video = rig ? rig.querySelector('video') : null;

  function setupFilm() {
    if (!rig || !video) return;
    var scenes = [].slice.call(rig.querySelectorAll('.ray-scene'));
    var lastScene = -2;

    function sceneAt(t) {
      var k = -1;
      scenes.forEach(function (b, i) { if (t + 0.3 >= Number(b.getAttribute('data-t'))) k = i; });
      return k;
    }
    function paint(t) {
      t = Math.max(0, Math.min(DUR, t || 0));
      var k = sceneAt(t);
      if (k === lastScene) return;
      lastScene = k;
      scenes.forEach(function (b, i) {
        if (i === k) b.setAttribute('aria-current', 'time');
        else b.removeAttribute('aria-current');
      });
    }

    // preload='none': the first seek asks for metadata, then lands on the time.
    function seek(t, play) {
      t = Math.max(0, Math.min(DUR, t));
      paint(t);
      if (video.readyState === 0) {
        video.addEventListener('loadedmetadata', function () {
          try { video.currentTime = t; } catch (e) {}
        }, { once: true });
        video.preload = 'metadata';
      }
      try { video.currentTime = t; } catch (e) {}
      if (!play) return;
      // local-video.js keeps a poster facade until the first play; use it so
      // the native controls come back exactly as with its own button.
      var launch = rig.querySelector('.local-video__launch');
      if (launch) launch.click();
      else quietPlay(video);
    }

    video.addEventListener('timeupdate', function () { paint(video.currentTime); });
    video.addEventListener('seeked', function () { paint(video.currentTime); });

    scenes.forEach(function (b) {
      b.addEventListener('click', function () { seek(Number(b.getAttribute('data-t')), true); });
    });
    paint(0);
  }

  function setupTheme() {
    var holder = page.querySelector('[data-ray-theme]');
    var audio = holder ? holder.querySelector('audio') : null;
    if (!audio) return;
    var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10.5-6.5L8 5.5Z"/></svg>';
    var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';

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
        if (video && !video.paused) video.pause();
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
    if (video) video.addEventListener('play', function () { if (!audio.paused) audio.pause(); });
  }

  setupFilm();
  setupTheme();
})();
