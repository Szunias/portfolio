/* AutoTrim Exporter: the tool window whose pages follow the chapters.
   The window stacks the six v3.4.3 captures in one frame. On wide screens it
   follows the chapter being read. Everything reads without this script. */
(function () {
  'use strict';
  var root = document.querySelector('[data-at]');
  if (!root) return;
  root.classList.add('at-js');

  var slice = Array.prototype.slice;
  var wide = window.matchMedia('(min-width: 1000px)');
  var pages = slice.call(root.querySelectorAll('.at-page[data-page]'));
  var head = root.querySelector('.at-head');
  var win = root.querySelector('[data-atw]');
  var shots = win ? slice.call(win.querySelectorAll('.atw__shot')) : [];
  var tourBtn = win ? win.querySelector('[data-tour]') : null;
  var tourLabel = win ? win.querySelector('[data-tour-label]') : null;
  var video = win ? win.querySelector('.atw__tour') : null;
  var enlargeBtn = win ? win.querySelector('[data-enlarge]') : null;
  var current = 1;
  var tourOn = false;

  function num(el, attr) { return Number(el.getAttribute(attr)); }

  function stopTour() {
    if (!tourOn) return;
    tourOn = false;
    if (video) { video.pause(); video.hidden = true; }
    if (win) win.classList.remove('is-tour');
    if (tourBtn) tourBtn.setAttribute('aria-pressed', 'false');
    if (tourLabel) tourLabel.textContent = 'Interface tour';
  }

  function startTour() {
    if (!video || !tourBtn || !win) return;
    tourOn = true;
    win.classList.add('is-tour');
    video.hidden = false;
    tourBtn.setAttribute('aria-pressed', 'true');
    if (tourLabel) tourLabel.textContent = 'Back to the pages';
    var played = video.play();
    if (played && typeof played.catch === 'function') played.catch(function () {});
  }

  function show(n) {
    stopTour();
    current = n;
    shots.forEach(function (shot) {
      var on = num(shot, 'data-page') === n;
      shot.classList.toggle('is-on', on);
      shot.setAttribute('aria-hidden', on ? 'false' : 'true');
      shot.tabIndex = on ? 0 : -1;
    });
  }

  if (tourBtn) tourBtn.addEventListener('click', function () { if (tourOn) stopTour(); else startTour(); });
  if (video) video.addEventListener('ended', stopTour);
  if (enlargeBtn) {
    enlargeBtn.addEventListener('click', function () {
      stopTour();
      var active = shots.filter(function (shot) { return num(shot, 'data-page') === current; })[0];
      if (active) active.click();
    });
  }

  /* ---------- Scroll ---------- */
  if ('IntersectionObserver' in window) {
    var band = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // The opening counts as page 1, so scrolling back up restores Export.
        var n = entry.target === head ? 1 : num(entry.target, 'data-page');
        if (wide.matches && !tourOn && n !== current) show(n);
      });
    }, { rootMargin: '-42% 0px -52% 0px' });
    pages.forEach(function (page) { band.observe(page); });
    if (head) band.observe(head);
  }
})();
