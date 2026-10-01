/* Two sound redesigns: cue buttons.
   Each cue time plays the clip from half a second before the sound lands, and
   the cue that is sounding gets a marker. local-video.js (loaded earlier) keeps
   a poster button over an unstarted video; a cue presses it, so the native
   controls come back exactly as with a direct play. Without JavaScript the
   cue list stays plain text and the videos keep their native controls.
   Playback only ever starts from a reader's click; nothing plays on its own. */
(function () {
  'use strict';
  var root = document.querySelector('.cine.sd');
  if (!root) return;
  var reels = [].slice.call(root.querySelectorAll('[data-sd-reel]'));
  if (!reels.length) return;

  var PRE_ROLL = 0.5;
  var PLAY = '<svg viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M2 1v8l7-4-7-4Z"/></svg>';
  var reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var videos = [];

  reels.forEach(function (reel) {
    var video = reel.querySelector('video');
    if (!video) return;
    videos.push(video);

    var cues = [].slice.call(reel.querySelectorAll('.sd-cue[data-t]'));
    var times = cues.map(function (cue) { return parseFloat(cue.getAttribute('data-t')) || 0; });
    var frame = 0;

    // On one column the sheet sits under the picture: bring the picture into
    // view so the reader sees the moment they asked for.
    function reveal() {
      var box = video.getBoundingClientRect();
      if (box.top >= 0 && box.bottom <= window.innerHeight) return;
      video.scrollIntoView({ block: 'nearest', behavior: reduced && reduced.matches ? 'auto' : 'smooth' });
    }

    function playFrom(t) {
      var launch = reel.querySelector('.local-video__launch');
      if (launch) launch.click();
      else if (!video.hasAttribute('controls')) video.setAttribute('controls', '');
      var seek = function () {
        try { video.currentTime = t; } catch (e) { /* not seekable yet */ }
      };
      if (video.readyState < 1) {
        video.addEventListener('loadedmetadata', function once() {
          video.removeEventListener('loadedmetadata', once);
          seek();
        });
      }
      seek();
      var started = video.play();
      if (started && typeof started.catch === 'function') started.catch(function () {});
    }

    cues.forEach(function (cue, i) {
      var tc = cue.querySelector('.sd-cue__tc');
      var name = cue.querySelector('.sd-cue__name');
      if (!tc) return;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'sd-cue__play';
      button.setAttribute('aria-label', 'Play from ' + tc.textContent + (name ? ', ' + name.textContent : ''));
      button.innerHTML = PLAY;
      tc.parentNode.insertBefore(button, tc);
      button.appendChild(tc);
      button.addEventListener('click', function () {
        playFrom(Math.max(0, times[i] - PRE_ROLL));
        try { button.focus({ preventScroll: true }); } catch (e) { button.focus(); }
        reveal();
      });
    });

    function render() {
      var t = video.currentTime || 0;
      var now = -1;
      for (var i = 0; i < times.length; i++) if (t >= times[i] - 0.04) now = i;
      if (now > -1 && t > times[now] + 3) now = -1;
      cues.forEach(function (cue, j) { cue.classList.toggle('is-now', j === now); });
    }

    function tick() {
      render();
      frame = video.paused || video.ended ? 0 : window.requestAnimationFrame(tick);
    }

    video.addEventListener('play', function () {
      // One soundtrack at a time.
      videos.forEach(function (other) { if (other !== video && !other.paused) other.pause(); });
      if (!frame) frame = window.requestAnimationFrame(tick);
    });
    ['pause', 'seeked', 'timeupdate', 'ended'].forEach(function (type) {
      video.addEventListener(type, render);
    });
  });
})();
