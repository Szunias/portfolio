/* Not Today, Darling!: the time cues in the stage list and the sections below it play the one
   run recording. A cue scrolls the run into view first, then plays from the moment named in the
   text next to it; nothing plays until the reader asks.
   local-video.js may have put its poster facade over the video first: a press goes through that
   facade so the native controls come back. Without JS the cues are plain anchors to the run. */
(function () {
  var run = document.querySelector('[data-nt-run]');
  if (!run) return;
  var video = run.querySelector('video');
  var cues = [].slice.call(document.querySelectorAll('[data-nt-cue]'));
  if (!video || !cues.length) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function seek(t) {
    function apply() {
      try { video.currentTime = t; } catch (err) {}
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

  cues.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      run.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      playFrom(Number(a.getAttribute('data-t')) || 0);
    });
  });
})();
