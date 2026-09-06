/* Looping thumbnail and an explicitly opened, separately controlled showreel. */
(function () {
  'use strict';
  const scope = document.querySelector('.hero');
  if (!scope) return;
  const video = scope.querySelector('.hero__film');
  const preview = scope.querySelector('[data-preview-video]');
  const launch = scope.querySelector('[data-showreel-play]');
  const close = scope.querySelector('[data-showreel-close]');
  const header = document.querySelector('.site-header');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!video || !preview || !launch) return;
  let playerOpen = false;
  let visible = true;
  let paused = !!(navigator.connection && navigator.connection.saveData);
  video.controls = false;
  preview.muted = true;

  function updatePreview() {
    const canPlay = !paused && !playerOpen && !reduced.matches && !document.hidden && visible;
    scope.classList.toggle('is-settled', paused || reduced.matches);
    if (!canPlay) { preview.pause(); return; }
    const attempt = preview.play();
    if (attempt) attempt.catch(function (error) {
      if (error.name === 'AbortError') return;
      paused = true;
      updatePreview();
    });
  }
  function revealPlayer() {
    if (playerOpen) return;
    playerOpen = true;
    scope.classList.add('is-started', 'is-playing');
    video.controls = true;
    if (close) close.hidden = false;
    updatePreview();
    scope.dispatchEvent(new CustomEvent('hero:playback', { detail: { playing: true } }));
  }
  function focusVisible(control) {
    const visibleTop = (header ? header.getBoundingClientRect().bottom : 0) + 12;
    const box = control.getBoundingClientRect();
    if (box.top < visibleTop) {
      window.scrollBy({ top: box.top - visibleTop, behavior: 'instant' });
    } else if (box.bottom > window.innerHeight - 12) {
      window.scrollBy({ top: box.bottom - window.innerHeight + 12, behavior: 'instant' });
    }
    control.focus({ preventScroll: true });
  }
  function restoreCover(returnFocus) {
    playerOpen = false;
    video.pause();
    video.controls = false;
    scope.classList.remove('is-started', 'is-playing');
    if (close) close.hidden = true;
    updatePreview();
    scope.dispatchEvent(new CustomEvent('hero:playback', { detail: { playing: false } }));
    if (returnFocus) focusVisible(launch);
  }
  launch.addEventListener('click', function () {
    revealPlayer();
    if (close) focusVisible(close);
    const attempt = video.play();
    if (attempt) attempt.catch(function () { if (playerOpen) video.controls = true; });
  });
  video.addEventListener('play', function () {
    // A queued media event must not reopen a player the visitor just closed.
    // Opening (and hero:playback notification) belongs to the launch button.
    if (!playerOpen) video.pause();
  });
  video.addEventListener('ended', function () { restoreCover(scope.contains(document.activeElement)); });
  if (close) close.addEventListener('click', function () { restoreCover(true); });
  scope.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && playerOpen && !document.fullscreenElement) restoreCover(true);
  });
  reduced.addEventListener('change', updatePreview);
  document.addEventListener('visibilitychange', updatePreview);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      updatePreview();
    }, { rootMargin: '-' + (header ? header.offsetHeight : 0) + 'px 0px 0px' }).observe(preview);
  }
  updatePreview();
})();
