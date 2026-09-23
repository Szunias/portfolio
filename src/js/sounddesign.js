/* Two sound redesigns: the spotting-sheet players.
   Each reel gets a burnt-in timecode that runs with the video, a ruler whose
   playhead follows playback, and cue timecodes that play the clip from half a
   second before the sound lands. local-video.js (loaded earlier) keeps a
   poster button over an unstarted video; a cue presses it, so the native
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

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function timecode(t, fps) {
    var frames = Math.max(0, Math.floor(t * fps + 1e-6));
    var secs = Math.floor(frames / fps);
    return '00:' + pad(Math.floor(secs / 60)) + ':' + pad(secs % 60) + ':' + pad(frames % fps);
  }

  reels.forEach(function (reel) {
    var video = reel.querySelector('video');
    if (!video) return;
    videos.push(video);

    var fps = parseFloat(reel.getAttribute('data-fps')) || 60;
    var duration = parseFloat(reel.getAttribute('data-duration')) || 0;
    var burnTc = reel.querySelector('.sd-burn__tc');
    var burnCue = reel.querySelector('.sd-burn__cue');
    var ruler = reel.querySelector('.sd-ruler');
    var head = reel.querySelector('.sd-ruler__head');
    var fill = reel.querySelector('.sd-ruler__fill');
    var cues = [].slice.call(reel.querySelectorAll('.sd-cue[data-t]'));
    var marks = [].slice.call(reel.querySelectorAll('.sd-ruler__mark'));
    var times = cues.map(function (cue) { return parseFloat(cue.getAttribute('data-t')) || 0; });
    var frame = 0;

    function light(i, on) {
      if (cues[i]) cues[i].classList.toggle('is-lit', on);
      if (marks[i]) marks[i].classList.toggle('is-lit', on);
    }

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
      button.addEventListener('focus', function () { light(i, true); });
      button.addEventListener('blur', function () { light(i, false); });
      cue.addEventListener('mouseenter', function () { light(i, true); });
      cue.addEventListener('mouseleave', function () { light(i, false); });
    });

    function render() {
      var t = video.currentTime || 0;
      if (burnTc) burnTc.textContent = timecode(t, fps);
      var now = -1;
      for (var i = 0; i < times.length; i++) if (t >= times[i] - 0.04) now = i;
      if (now > -1 && t > times[now] + 3) now = -1;
      cues.forEach(function (cue, j) { cue.classList.toggle('is-now', j === now); });
      marks.forEach(function (mark, j) { mark.classList.toggle('is-now', j === now); });
      if (burnCue) burnCue.textContent = now > -1 ? (cues[now].getAttribute('data-short') || '') : '';
      if (duration) {
        var x = Math.min(100, (t / duration) * 100) + '%';
        if (head) head.style.left = x;
        if (fill) fill.style.width = x;
      }
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

    // Pointer shortcut: a click on the ruler plays from that point. Keyboard
    // readers have the cue timecodes and the native controls.
    if (ruler && duration) {
      ruler.addEventListener('click', function (event) {
        var box = ruler.getBoundingClientRect();
        if (!box.width) return;
        playFrom(Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)) * duration);
      });
    }
  });
})();
