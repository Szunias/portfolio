/* Looping thumbnail and an explicitly opened, separately controlled showreel. */
(function () {
  'use strict';
  var scope = document.querySelector('.hero');
  if (!scope) return;
  var video = scope.querySelector('.hero__film');
  var preview = scope.querySelector('[data-preview-video]');
  var launch = scope.querySelector('[data-showreel-play]');
  var close = scope.querySelector('[data-showreel-close]');
  var header = document.querySelector('.site-header');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!video || !preview || !launch) return;
  var playing = false;
  var visible = true;
  var covered = false;
  var connection = navigator.connection;
  var previewFailed = false;
  var previewRequestVersion = 0;
  video.controls = false;
  preview.muted = true;

  function updatePreview() {
    var settled = previewFailed || reduced.matches || !!(connection && connection.saveData);
    var canPlay = !settled && !playing && !covered && !document.hidden && visible;
    var version = ++previewRequestVersion;
    scope.classList.toggle('is-settled', settled);
    if (!canPlay) { preview.pause(); return; }
    var attempt = preview.play();
    if (attempt) attempt.catch(function (error) {
      // A stopped or superseded request cannot disable a later preview.
      if (version !== previewRequestVersion || (error && error.name === 'AbortError')) return;
      previewFailed = true;
      updatePreview();
    });
  }
  function revealPlayer() {
    if (playing) return;
    playing = true;
    scope.classList.add('is-started','is-playing');
    video.controls = true;
    if (close) close.hidden = false;
    updatePreview();
    scope.dispatchEvent(new CustomEvent('hero:playback', { detail:{ playing:true } }));
  }
  function focusVisible(control) {
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
    scope.dispatchEvent(new CustomEvent('hero:playback', { detail:{ playing:false } }));
    if (returnFocus) focusVisible(launch);
  }
  launch.addEventListener('click', function () {
    scope.dispatchEvent(new CustomEvent('hero:reveal'));
    revealPlayer();
    if (close) focusVisible(close);
    var attempt = video.play();
    if (attempt) attempt.catch(function () { if (playing) video.controls = true; });
  });
  video.addEventListener('play', function () {
    // A queued play event may arrive after Close has already paused the video.
    if (!video.paused) revealPlayer();
  });
  video.addEventListener('ended', function () { restoreCover(scope.contains(document.activeElement)); });
  if (close) close.addEventListener('click', function () { restoreCover(true); });
  scope.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && playing && !document.fullscreenElement) restoreCover(true);
  });
  if (connection && typeof connection.addEventListener === 'function') {
    connection.addEventListener('change', updatePreview);
  }
  scope.addEventListener('hero:transition', function (event) {
    var nextCovered = event.detail.progress > 0.12;
    if (covered !== nextCovered) {
      covered = nextCovered;
      updatePreview();
    }
    if (event.detail.progress >= 0.98 && playing) restoreCover(false);
  });
  reduced.addEventListener('change', updatePreview);
  document.addEventListener('visibilitychange', updatePreview);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      updatePreview();
    }, { rootMargin:'-' + (header ? header.offsetHeight : 0) + 'px 0px 0px' }).observe(preview);
  }
  updatePreview();
})();
