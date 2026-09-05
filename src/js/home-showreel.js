/* Silent film cover with an explicit, separately controlled full showreel. */
(function () {
  'use strict';
  var scope = document.querySelector('.hero');
  if (!scope) return;
  var video = scope.querySelector('.hero__film');
  var preview = scope.querySelector('[data-preview-video]');
  var launch = scope.querySelector('[data-showreel-play]');
  var close = scope.querySelector('[data-showreel-close]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mobile = window.matchMedia('(max-width: 600px)');
  if (!video || !preview || !launch) return;
  var playing = false;
  var visible = true;
  var paused = !!(navigator.connection && navigator.connection.saveData);
  video.controls = false;
  preview.muted = true;

  function selectPreview() {
    var source = [].slice.call(preview.querySelectorAll('source')).find(function (item) {
      return !item.media || window.matchMedia(item.media).matches;
    });
    if (source && preview.getAttribute('src') !== source.getAttribute('src')) {
      preview.src = source.getAttribute('src');
    }
    updatePreview();
  }

  function updatePreview() {
    var canPlay = !paused && !playing && !reduced.matches && !document.hidden && visible;
    scope.classList.toggle('is-settled', paused || reduced.matches);
    if (!canPlay) { preview.pause(); return; }
    var attempt = preview.play();
    if (attempt) attempt.catch(function (error) {
      if (error.name === 'AbortError') return;
      paused = true;
      updatePreview();
    });
  }
  function revealPlayer() {
    playing = true;
    scope.classList.add('is-started','is-playing');
    video.controls = true;
    if (close) close.hidden = false;
    updatePreview();
  }
  function focusVisible(control) {
    var header = document.querySelector('.site-header');
    var visibleTop = (header ? header.getBoundingClientRect().bottom : 0) + 12;
    var box = control.getBoundingClientRect();
    if (box.top < visibleTop) {
      window.scrollBy({ top:box.top - visibleTop, behavior:'instant' });
    } else if (box.bottom > window.innerHeight - 12) {
      window.scrollBy({ top:box.bottom - window.innerHeight + 12, behavior:'instant' });
    }
    control.focus({ preventScroll:true });
  }
  function restoreCover(returnFocus) {
    playing = false;
    video.pause();
    video.controls = false;
    scope.classList.remove('is-started','is-playing');
    if (close) close.hidden = true;
    updatePreview();
    if (returnFocus) focusVisible(launch);
  }
  launch.addEventListener('click', function () {
    revealPlayer();
    if (close) focusVisible(close);
    var attempt = video.play();
    if (attempt) attempt.catch(function () { if (playing) video.controls = true; });
  });
  video.addEventListener('play', revealPlayer);
  video.addEventListener('ended', function () { restoreCover(scope.contains(document.activeElement)); });
  if (close) close.addEventListener('click', function () { restoreCover(true); });
  scope.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && playing && !document.fullscreenElement) restoreCover(true);
  });
  // The background is a brief introduction, then a still: no second player UI.
  preview.addEventListener('timeupdate', function () {
    if (preview.currentTime >= 4.5) {
      paused = true;
      updatePreview();
    }
  });
  reduced.addEventListener('change', updatePreview);
  mobile.addEventListener('change', selectPreview);
  document.addEventListener('visibilitychange', updatePreview);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      updatePreview();
    }).observe(scope);
  }
  selectPreview();
})();
