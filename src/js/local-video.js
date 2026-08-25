/* Poster-first playback for local <video>.
   Embedded YouTube already opens behind a poster and one round play control
   (video-facade.js). A local file with the controls attribute instead paints a
   browser control bar across the bottom of its first frame, so the same page
   showed two different players depending on where the file was hosted. This
   hides the bar until the reader asks for the video, then hands playback back
   to the native controls. Without JavaScript the controls attribute stays in
   the markup, so the video is never unreachable. */
(function () {
  var PLAY_ICON = '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path d="M9 7.5v9l7-4.5-7-4.5Z"/></svg>';

  var videos = [].slice.call(document.querySelectorAll('video[controls][poster]'))
    .filter(function (video) {
      // The showreel and the SIDAR teaser run their own controls.
      if (video.closest('[data-showreel]')) return false;
      if (video.hasAttribute('data-autoplay-src')) return false;
      // The script runs at the end of the body, so a reader can already have
      // pressed the native control. Leave a started video alone.
      if (!video.paused || video.currentTime > 0) return false;
      return !!video.parentElement;
    });

  videos.forEach(function (video) {
    var label = video.getAttribute('aria-label') || 'video';

    // The video gets its own positioning shell, so a caption next to it in
    // the figure neither blocks the facade nor sits under the overlay.
    var shell = document.createElement('div');
    shell.className = 'local-video';
    video.parentElement.insertBefore(shell, video);
    shell.appendChild(video);

    var launch = document.createElement('button');
    launch.type = 'button';
    launch.className = 'local-video__launch';
    launch.setAttribute('aria-label', 'Play ' + label);
    launch.innerHTML = '<span class="local-video__play">' + PLAY_ICON + '</span>';

    video.removeAttribute('controls');
    shell.appendChild(launch);

    function start() {
      video.setAttribute('controls', '');
      launch.remove();
      shell.classList.remove('local-video');
      var started = video.play();
      // Safari rejects play() on a file it has not buffered yet; the native
      // controls are already back, so the reader can start it themselves.
      if (started && typeof started.catch === 'function') started.catch(function () {});
      video.focus();
    }

    launch.addEventListener('click', start);
  });
})();
