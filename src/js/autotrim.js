/* AutoTrim Exporter: the tool window whose pages follow the chapters, plus the
   Select overlapping sketch.
   The window stacks the six v3.4.3 captures in one frame. On wide screens it
   follows the chapter being read; the window's own sidebar rows and the number
   keys 1-6 select the same page. The sketch collects the items that overlap
   the anchor item and frames them. Everything reads without this script. */
(function () {
  'use strict';
  var root = document.querySelector('[data-at]');
  if (!root) return;
  root.classList.add('at-js');

  var slice = Array.prototype.slice;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var wide = window.matchMedia('(min-width: 1000px)');
  var pages = slice.call(root.querySelectorAll('.at-page[data-page]'));
  var head = root.querySelector('.at-head');
  var win = root.querySelector('[data-atw]');
  var shots = win ? slice.call(win.querySelectorAll('.atw__shot')) : [];
  var hots = win ? slice.call(win.querySelectorAll('[data-go]')) : [];
  var tourBtn = win ? win.querySelector('[data-tour]') : null;
  var tourLabel = win ? win.querySelector('[data-tour-label]') : null;
  var video = win ? win.querySelector('.atw__tour') : null;
  var enlargeBtn = win ? win.querySelector('[data-enlarge]') : null;
  var current = 1;
  var tourOn = false;
  var lockUntil = 0;
  var winInView = false;
  var arrInView = false;

  function num(el, attr) { return Number(el.getAttribute(attr)); }

  function markChapter(n) {
    pages.forEach(function (page) { page.classList.toggle('is-current', num(page, 'data-page') === n); });
  }

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
    hots.forEach(function (hot) { hot.setAttribute('aria-pressed', String(num(hot, 'data-go') === n)); });
  }

  function go(n) {
    show(n);
    markChapter(n);
    var target = pages[n - 1];
    if (!wide.matches || !target) return;
    lockUntil = Date.now() + (reduce.matches ? 100 : 1000);
    target.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
  }

  hots.forEach(function (hot) {
    hot.addEventListener('click', function () { go(num(hot, 'data-go')); });
  });
  if (tourBtn) tourBtn.addEventListener('click', function () { if (tourOn) stopTour(); else startTour(); });
  if (video) video.addEventListener('ended', stopTour);
  if (enlargeBtn) {
    enlargeBtn.addEventListener('click', function () {
      stopTour();
      var active = shots.filter(function (shot) { return num(shot, 'data-page') === current; })[0];
      if (active) active.click();
    });
  }

  /* ---------- Select overlapping ---------- */
  var arr = root.querySelector('[data-arr]');
  var setArr = null;
  if (arr) {
    var arrBtn = arr.querySelector('[data-arr-toggle]');
    var arrOut = arr.querySelector('[data-arr-out]');
    var arrSr = arr.querySelector('[data-arr-sr]');
    var view = arr.querySelector('.arr__view');
    if (arrBtn && arrOut && view) {
      setArr = function (on) {
        arr.classList.toggle('is-across', on);
        arrBtn.setAttribute('aria-pressed', String(on));
        arrOut.textContent = on ? '3 items across 3 tracks' : '1 item on 1 track';
        if (arrSr) arrSr.textContent = on ? ': Impact, Debris and Sub. Ambience and Temp are left out.' : ': the Impact item.';
        view.style.setProperty('--t0', on ? '1.02' : '0');
        view.style.setProperty('--t1', on ? '3.02' : '6');
      };
      arrBtn.addEventListener('click', function () { setArr(arrBtn.getAttribute('aria-pressed') !== 'true'); });
    }
  }

  /* ---------- Scroll, visibility and keys ---------- */
  if ('IntersectionObserver' in window) {
    var band = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || Date.now() < lockUntil) return;
        // The opening counts as page 1, so scrolling back up restores Export.
        var n = entry.target === head ? 1 : num(entry.target, 'data-page');
        markChapter(n);
        if (wide.matches && !tourOn && n !== current) show(n);
      });
    }, { rootMargin: '-42% 0px -52% 0px' });
    pages.forEach(function (page) { band.observe(page); });
    if (head) band.observe(head);
    if (win) new IntersectionObserver(function (e) { winInView = e[0].isIntersecting; }).observe(win);
    if (arr) new IntersectionObserver(function (e) { arrInView = e[0].isIntersecting; }).observe(arr);
  }

  document.addEventListener('keydown', function (event) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    var t = event.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|VIDEO)$/.test(t.tagName))) return;
    if (document.querySelector('dialog[open]')) return;
    if (/^[1-6]$/.test(event.key) && wide.matches && winInView) {
      event.preventDefault();
      go(Number(event.key));
    } else if ((event.key === 'v' || event.key === 'V') && arrInView && setArr) {
      event.preventDefault();
      setArr(!arr.classList.contains('is-across'));
    }
  });
})();
