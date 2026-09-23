/* Not Today, Darling!: stage tiles on the rack and inline time cues in the sections below it
   both play the one run recording. A cue scrolls the run into view first, then plays from the
   moment named in the text next to it. Playback moves the circle along the rack and switches
   the visible stage text; nothing plays until the reader asks.
   local-video.js may have put its poster facade over the video first: a press goes through that
   facade so the native controls come back. Without JS the tiles and cues are plain anchors and
   the stage list stays fully visible. */
(function () {
  var run = document.querySelector('[data-nt-run]');
  var panel = document.querySelector('[data-nt-panel]');
  if (!run || !panel) return;
  var video = run.querySelector('video');
  var stages = [].slice.call(run.querySelectorAll('[data-nt-stage]'));
  var sections = [].slice.call(panel.querySelectorAll('.nt-s'));
  if (!video || !stages.length || stages.length !== sections.length) return;

  var starts = stages.map(function (a) { return Number(a.getAttribute('data-from')) || 0; });
  var first = 0;
  stages.forEach(function (a, k) { if (a.hasAttribute('data-default')) first = k; });
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = -1;
  var jumping = false;

  function show(i) {
    if (i === current) return;
    current = i;
    stages.forEach(function (a, k) {
      var on = k === i;
      a.classList.toggle('is-on', on);
      if (on) a.setAttribute('aria-current', 'step');
      else a.removeAttribute('aria-current');
    });
    sections.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
  }

  function stageAt(t) {
    var i = 0;
    for (var k = 0; k < starts.length; k++) if (t >= starts[k]) i = k;
    return i;
  }

  function seek(t) {
    jumping = true;
    function apply() {
      try { video.currentTime = t; } catch (err) { jumping = false; }
    }
    apply();
    // Before metadata the position is only a default start; set it again once it can seek.
    if (video.readyState < 1) video.addEventListener('loadedmetadata', apply, { once: true });
  }

  function playFrom(t) {
    var launch = run.querySelector('.local-video__launch');
    if (launch) launch.click();
    seek(t);
    if (video.paused) {
      var started = video.play();
      if (started && typeof started.catch === 'function') started.catch(function () {});
    }
  }

  panel.classList.add('is-live');

  stages.forEach(function (a, k) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      show(k);
      playFrom(Number(a.getAttribute('data-t')) || 0);
      a.focus({ preventScroll: true });
    });
  });

  [].slice.call(document.querySelectorAll('[data-nt-cue]')).forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var t = Number(a.getAttribute('data-t')) || 0;
      show(stageAt(t));
      run.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      playFrom(t);
      stages[current].focus({ preventScroll: true });
    });
  });

  // Arrow keys move along the rack, like moving between menu tiles in the game.
  run.addEventListener('keydown', function (e) {
    var i = stages.indexOf(document.activeElement);
    if (i < 0) return;
    var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    stages[Math.max(0, Math.min(stages.length - 1, i + step))].focus();
  });

  video.addEventListener('timeupdate', function () {
    if (!video.paused && !jumping) show(stageAt(video.currentTime));
  });
  video.addEventListener('seeked', function () {
    jumping = false;
    show(stageAt(video.currentTime));
  });
  show(first);
})();
