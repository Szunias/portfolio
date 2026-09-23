/* Amorak: Ear-to-ear balance strip that scrubs the film and lights the louder ear.
   data-lean holds one value per second of the published mix: right against
   left channel level between 1.5 and 8 kHz, in dB (negative = left ear
   louder); data-level is the level of the same second in dBFS. Both were
   measured from old/public/assets/videos/amorak.mp4, and the SVG line in the
   page is drawn from the same numbers, so the strip still reads without JS.
   The strip is a slider that seeks the video; the playhead, its dot and the
   ears on the head follow playback. The buttons with data-t start the film
   at that second, always from a click. */
(function () {
  var fig = document.querySelector('.am [data-am-ears]');
  var video = document.getElementById('am-video');
  if (!fig || !video) return;
  var track = fig.querySelector('.am-ears__track');
  if (!track) return;
  var earL = fig.querySelector('[data-ear="l"]');
  var earR = fig.querySelector('[data-ear="r"]');

  function numbers(name) {
    return (fig.getAttribute(name) || '').split(',').map(Number).filter(function (v) { return isFinite(v); });
  }
  var dur = parseFloat(fig.getAttribute('data-dur')) || 130;
  var lean = numbers('data-lean');
  var level = numbers('data-level');
  if (!lean.length) return;

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduce = !!(mq && mq.matches);

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function fmt(t) { t = Math.max(0, Math.round(t)); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }
  function at(list, i) { return list.length ? list[clamp(i, 0, list.length - 1)] : 0; }

  // Values sit in the middle of each second; interpolate between them.
  function leanAt(t) {
    var x = t - 0.5, i = Math.floor(x), f = clamp(x - i, 0, 1);
    var a = at(lean, i), b = at(lean, i + 1);
    return a + (b - a) * f;
  }

  function draw(t) {
    t = clamp(t || 0, 0, dur);
    var b = clamp(leanAt(t), -9, 9);
    fig.style.setProperty('--p', (t / dur).toFixed(4));
    fig.style.setProperty('--yf', ((50 + b * 44 / 9) / 100).toFixed(4));
    if (earL && earR) {
      // The louder ear brightens with the measured difference, less in quiet passages.
      var loud = clamp((at(level, Math.floor(t)) + 45) / 30, 0, 1);
      var k = clamp(Math.abs(b) / 6, 0, 1) * loud;
      earL.style.opacity = (0.35 + (b < 0 ? 0.65 * k : 0)).toFixed(2);
      earR.style.opacity = (0.35 + (b > 0 ? 0.65 * k : 0)).toFixed(2);
    }
    track.setAttribute('aria-valuenow', String(Math.round(t)));
    track.setAttribute('aria-valuetext', fmt(t) + ' of ' + fmt(dur));
  }

  function start() {
    // local-video.js keeps the poster and one play button until the first play.
    var shell = video.parentElement;
    var launch = shell && shell.querySelector('.local-video__launch');
    if (launch) { launch.click(); return; }
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () {});
  }

  function seek(t, play) {
    t = clamp(t, 0, dur - 0.05);
    try { video.currentTime = t; } catch (e) { /* not seekable yet; draw anyway */ }
    draw(t);
    if (!play) return;
    start();
    var r = video.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) {
      video.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
  }

  // Click, tap or drag across the strip. touch-action: pan-y keeps vertical swipes scrolling.
  var dragging = false;
  function timeFrom(e) {
    var r = track.getBoundingClientRect();
    return r.width ? clamp((e.clientX - r.left) / r.width, 0, 1) * dur : 0;
  }
  track.addEventListener('pointerdown', function (e) {
    if (typeof e.button === 'number' && e.button !== 0) return;
    dragging = true;
    try { track.setPointerCapture(e.pointerId); } catch (err) { /* capture is optional */ }
    seek(timeFrom(e), false);
  });
  track.addEventListener('pointermove', function (e) { if (dragging) seek(timeFrom(e), false); });
  function release() { dragging = false; }
  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);

  track.addEventListener('keydown', function (e) {
    var t = video.currentTime || 0, next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = t + 5;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = t - 5;
    else if (e.key === 'PageUp') next = t + 15;
    else if (e.key === 'PageDown') next = t - 15;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = dur;
    if (next === null) return;
    e.preventDefault();
    seek(next, false);
  });

  [].forEach.call(document.querySelectorAll('.am [data-t]'), function (btn) {
    btn.addEventListener('click', function () { seek(parseFloat(btn.getAttribute('data-t')) || 0, true); });
  });

  // Follow playback every frame, or only on timeupdate when motion is reduced.
  var raf = 0;
  function loop() { draw(video.currentTime); raf = window.requestAnimationFrame(loop); }
  function halt() {
    if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    draw(video.currentTime);
  }
  video.addEventListener('play', function () {
    if (!reduce && !raf) raf = window.requestAnimationFrame(loop);
  });
  video.addEventListener('pause', halt);
  video.addEventListener('ended', halt);
  video.addEventListener('timeupdate', function () { if (!raf) draw(video.currentTime); });
  video.addEventListener('seeked', function () { if (!raf) draw(video.currentTime); });

  function onMotionChange() {
    reduce = !!(mq && mq.matches);
    if (reduce) halt();
    else if (!video.paused && !raf) raf = window.requestAnimationFrame(loop);
  }
  if (mq) {
    if (mq.addEventListener) mq.addEventListener('change', onMotionChange);
    else if (mq.addListener) mq.addListener(onMotionChange);
  }

  draw(video.currentTime || 0);
})();
