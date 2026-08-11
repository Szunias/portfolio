/* Showreel cover. The native controls remain the no-JS fallback; when JS is
   available, the reel opens with a quieter branded play action and restores
   the browser controls as soon as playback starts. */
(function () {
  var frame = document.querySelector('[data-showreel]');
  if (!frame) return;
  var video = frame.querySelector('video');
  // The reel is the full-bleed hero now, so its play action lives with the
  // other calls to action rather than inside the media layer.
  var launch = frame.querySelector('[data-showreel-play]') || document.querySelector('[data-showreel-play]');
  if (!video || !launch) return;

  // State drives both the media layer and the copy that sits on it, so the
  // class goes on the section that contains both.
  var scope = frame.closest('.hero') || frame;

  video.controls = false;
  frame.classList.add('has-custom-cover');
  scope.classList.add('has-custom-cover');

  function revealPlayer() {
    frame.classList.add('is-started');
    scope.classList.add('is-started');
    video.controls = true;
  }

  // The copy sits on top of the reel, and the reel carries its own titles and
  // lower thirds, so while it plays the headline was covering the thing it was
  // introducing. This state lets the CSS clear the copy out of the way and put
  // the whole frame on screen, then bring it back when playback stops.
  function setPlaying(on) {
    frame.classList.toggle('is-playing', on);
    scope.classList.toggle('is-playing', on);
  }

  launch.addEventListener('click', function () {
    revealPlayer();
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () { video.controls = true; });
    }
  });

  video.addEventListener('play', function () {
    revealPlayer();
    setPlaying(true);
  });
  // Pausing must NOT bring the headline back: the paused frame carries the
  // reel's own titles, and the copy landing on top of them read as a glitch.
  // The cover copy returns only once the reel has actually finished.
  video.addEventListener('ended', function () { setPlaying(false); });
})();
