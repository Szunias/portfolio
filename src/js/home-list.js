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

  launch.addEventListener('click', function () {
    revealPlayer();
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () { video.controls = true; });
    }
  });

  video.addEventListener('play', revealPlayer);
})();
