/* Ray: Colour strip of the whole film with light-shaft marks that cue the film.
   The strip image is the film averaged to one column per half second. The
   range input over it is the accessible scrubber; each scene button seeks to
   the timecode where its still appears in the film and starts playback. Beams
   from tick to still are drawn here, so without this script the strip, ticks
   and scene list still read on their own. The credits theme gets one
   play/pause button; the film and the theme never play at the same time. */
(function () {
  var page = document.querySelector('.cine.ray');
  if (!page) return;

  var DUR = 148.7; // ray-animation-h264.mp4
  var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function still() { return !!(motion && motion.matches); }
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
    var range = rig.querySelector('.ray-scrub');
    var out = rig.querySelector('[data-ray-time]');
    var track = rig.querySelector('.ray-strip__track');
    var svg = rig.querySelector('.ray-beams');
    var scenes = [].slice.call(rig.querySelectorAll('.ray-scene'));
    if (!range || !out || !track) return;

    var beams = [];
    var dragging = false;
    var raf = 0;
    var lastScene = -2;

    function sceneAt(t) {
      var k = -1;
      scenes.forEach(function (b, i) { if (t + 0.3 >= Number(b.getAttribute('data-t'))) k = i; });
      return k;
    }
    function paint(t) {
      t = Math.max(0, Math.min(DUR, t || 0));
      rig.style.setProperty('--ray-pos', (t / DUR * 100).toFixed(3) + '%');
      out.textContent = fmt(t) + ' / ' + fmt(DUR);
      if (!dragging) range.value = String(Math.round(t));
      range.setAttribute('aria-valuetext', fmt(t) + ' of ' + fmt(DUR));
      var k = sceneAt(t);
      if (k === lastScene) return;
      lastScene = k;
      scenes.forEach(function (b, i) {
        if (i === k) b.setAttribute('aria-current', 'time');
        else b.removeAttribute('aria-current');
      });
      beams.forEach(function (p, i) { p.classList.toggle('is-lit', i === k); });
    }

    // preload="none": the first seek asks for metadata, then lands on the time.
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

    function drawBeams() {
      if (!svg || getComputedStyle(svg).display === 'none') { beams = []; return; }
      var box = svg.getBoundingClientRect();
      var bar = track.getBoundingClientRect();
      var W = box.width, H = box.height;
      if (!W || !H) return;
      var ns = 'http://www.w3.org/2000/svg';
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      svg.setAttribute('viewBox', '0 0 ' + W.toFixed(1) + ' ' + H.toFixed(1));
      var defs = document.createElementNS(ns, 'defs');
      var grad = document.createElementNS(ns, 'linearGradient');
      grad.setAttribute('id', 'ray-beam-fill');
      grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
      grad.setAttribute('x2', '0'); grad.setAttribute('y2', '1');
      [['0', '.4'], ['.5', '.11'], ['1', '.03']].forEach(function (s) {
        var stop = document.createElementNS(ns, 'stop');
        stop.setAttribute('offset', s[0]);
        stop.setAttribute('stop-color', '#ebe7e3');
        stop.setAttribute('stop-opacity', s[1]);
        grad.appendChild(stop);
      });
      defs.appendChild(grad);
      svg.appendChild(defs);
      beams = scenes.map(function (b) {
        var t = Number(b.getAttribute('data-t'));
        var x = bar.left - box.left + (t / DUR) * bar.width;
        var frame = b.querySelector('.ray-scene__img');
        var img = (frame || b).getBoundingClientRect();
        var l = img.left - box.left, r = img.right - box.left;
        var poly = document.createElementNS(ns, 'polygon');
        poly.setAttribute('points', [x - 1, -6, x + 1, -6, r, H, l, H].map(function (n) { return n.toFixed(1); }).join(' '));
        poly.setAttribute('fill', 'url(#ray-beam-fill)');
        svg.appendChild(poly);
        return poly;
      });
      lastScene = -2;
      paint(video.currentTime);
    }

    // The playhead glides only while the film plays and motion is allowed;
    // otherwise it follows timeupdate in small steps.
    function loop() {
      paint(video.currentTime);
      raf = requestAnimationFrame(loop);
    }
    function follow() {
      cancelAnimationFrame(raf);
      raf = 0;
      if (!video.paused && !still()) raf = requestAnimationFrame(loop);
    }
    video.addEventListener('play', follow);
    video.addEventListener('pause', function () { follow(); paint(video.currentTime); });
    video.addEventListener('ended', function () { follow(); paint(video.currentTime); });
    video.addEventListener('timeupdate', function () { if (!raf && !dragging) paint(video.currentTime); });
    video.addEventListener('seeked', function () { if (!dragging) paint(video.currentTime); });
    if (motion) {
      if (motion.addEventListener) motion.addEventListener('change', follow);
      else if (motion.addListener) motion.addListener(follow);
    }

    range.addEventListener('pointerdown', function () { dragging = true; });
    range.addEventListener('input', function () { dragging = true; seek(Number(range.value), false); });
    range.addEventListener('change', function () { dragging = false; });
    window.addEventListener('pointerup', function () { dragging = false; });

    scenes.forEach(function (b, i) {
      function hot(on) { if (beams[i]) beams[i].classList.toggle('is-hot', on); }
      b.addEventListener('click', function () { seek(Number(b.getAttribute('data-t')), true); });
      b.addEventListener('pointerenter', function () { hot(true); });
      b.addEventListener('pointerleave', function () { hot(false); });
      b.addEventListener('focus', function () { hot(true); });
      b.addEventListener('blur', function () { hot(false); });
    });

    rig.classList.add('is-live');
    var pending = 0;
    function queueDraw() { cancelAnimationFrame(pending); pending = requestAnimationFrame(drawBeams); }
    if ('ResizeObserver' in window) new ResizeObserver(queueDraw).observe(rig);
    else window.addEventListener('resize', queueDraw);
    queueDraw();
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
