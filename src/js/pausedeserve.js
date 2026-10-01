/* Pause & Deserve: the jumps into the trailer.

   data-pd-seek (seconds) marks every jump into the trailer: the hero link and
   the chapter buttons. A click starts the video through local-video.js's own
   launch button, then seeks; sound only ever starts from a click. The playing
   chapter is marked with aria-current. Without JavaScript the chapter list
   stays hidden. */
(function () {
  'use strict';

  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = function () { return !!(reduce && reduce.matches); };

  /* ---------- Trailer jumps ---------- */
  var figure = document.getElementById('pd-trailer');
  var video = figure ? figure.querySelector('video') : null;
  var chapterBox = figure ? figure.querySelector('[data-pd-chapters]') : null;
  var chapters = chapterBox ? [].slice.call(chapterBox.querySelectorAll('button[data-pd-seek]')) : [];

  function seek(seconds) {
    if (!video) return;
    var launch = figure.querySelector('.local-video__launch');
    // local-video.js: restores the native controls and calls play().
    if (launch) launch.click();
    var go = function () { try { video.currentTime = seconds; } catch (e) { /* not seekable yet */ } };
    if (video.readyState >= 1) go();
    else video.addEventListener('loadedmetadata', go, { once: true });
    if (video.paused) {
      var started = video.play();
      if (started && typeof started.catch === 'function') started.catch(function () {});
    }
  }

  function jump(event) {
    var target = event.currentTarget;
    var seconds = parseFloat(target.getAttribute('data-pd-seek'));
    if (!video || isNaN(seconds)) return;
    event.preventDefault();
    seek(seconds);
    var box = figure.getBoundingClientRect();
    var visible = box.top >= 0 && box.bottom <= (window.innerHeight || document.documentElement.clientHeight);
    if (!visible) figure.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
  }

  if (video) {
    [].slice.call(document.querySelectorAll('[data-pd-seek]')).forEach(function (el) {
      el.addEventListener('click', jump);
    });
    if (chapterBox) chapterBox.hidden = false;

    var marks = chapters.map(function (b) { return parseFloat(b.getAttribute('data-pd-seek')); });
    video.addEventListener('timeupdate', function () {
      var t = video.currentTime;
      var current = -1;
      marks.forEach(function (m, i) { if (t >= m - 0.3) current = i; });
      chapters.forEach(function (b, i) {
        if (i === current) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    });
  }
})();
