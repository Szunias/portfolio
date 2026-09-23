/* Pause & Deserve: the "P Pauses Death" sign as a five-second pause toy, and
   the jumps into the trailer below it.

   The toy plays the game's rule on the opening frame: P (or a tap on the
   sign) freezes the frame for five seconds, then Death is closer and a
   pause is spent. After the last frame the run ends, at the timer the real
   run stopped at (00:15.41, since both frames are taken from the trailer's
   own chase), and a link appears to that same run in the trailer. P again
   starts over. Only the opening frame and its HUD change. P is ignored
   while the screen is out of view, in form fields, with modifier keys, on
   auto-repeat and while the video has focus. Without JavaScript the HUD and
   the chapter list stay hidden and the lead states the rule.

   data-pd-seek (seconds) marks every jump into the trailer: the hero link,
   the chapter buttons and the toy's run link. A click starts the video
   through local-video.js's own launch button, then seeks; sound only ever
   starts from a click. The playing chapter is marked with aria-current. */
(function () {
  'use strict';

  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = function () { return !!(reduce && reduce.matches); };

  /* ---------- Trailer jumps ---------- */
  var figure = document.getElementById('pd-trailer');
  var video = figure ? figure.querySelector('video') : null;
  var chapterBox = figure ? figure.querySelector('[data-pd-chapters]') : null;
  var chapters = chapterBox ? [].slice.call(chapterBox.querySelectorAll('button[data-pd-seek]')) : [];

  function seek(seconds) {
    if (!video) return;
    var launch = figure.querySelector('.local-video__launch');
    // local-video.js: restores the native controls and calls play().
    if (launch) launch.click();
    var go = function () { try { video.currentTime = seconds; } catch (e) { /* not seekable yet */ } };
    if (video.readyState >= 1) go();
    else video.addEventListener('loadedmetadata', go, { once: true });
    if (video.paused) {
      var started = video.play();
      if (started && typeof started.catch === 'function') started.catch(function () {});
    }
  }

  function jump(event) {
    var target = event.currentTarget;
    var seconds = parseFloat(target.getAttribute('data-pd-seek'));
    if (!video || isNaN(seconds)) return;
    event.preventDefault();
    seek(seconds);
    var box = figure.getBoundingClientRect();
    var visible = box.top >= 0 && box.bottom <= (window.innerHeight || document.documentElement.clientHeight);
    if (!visible) figure.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
  }

  if (video) {
    [].slice.call(document.querySelectorAll('[data-pd-seek]')).forEach(function (el) {
      el.addEventListener('click', jump);
    });
    if (chapterBox) chapterBox.hidden = false;

    var marks = chapters.map(function (b) { return parseFloat(b.getAttribute('data-pd-seek')); });
    video.addEventListener('timeupdate', function () {
      var t = video.currentTime;
      var current = -1;
      marks.forEach(function (m, i) { if (t >= m - 0.3) current = i; });
      chapters.forEach(function (b, i) {
        if (i === current) b.setAttribute('aria-current', 'true');
        else b.removeAttribute('aria-current');
      });
    });
  }

  /* ---------- The pause toy ---------- */
  var screen = document.querySelector('[data-pd-screen]');
  if (!screen) return;
  var shots = [].slice.call(screen.querySelectorAll('.pd-shot'));
  var plate = screen.querySelector('.pd-plate');
  var fill = screen.querySelector('[data-pd-fill]');
  var secs = screen.querySelector('[data-pd-secs]');
  var count = screen.querySelector('[data-pd-count]');
  var status = screen.querySelector('[data-pd-status]');
  var runLink = screen.querySelector('[data-pd-runlink]');
  var pips = [].slice.call(screen.querySelectorAll('.pd-pip'));
  if (!shots.length || !plate || !fill || !secs || !status) return;

  var FREEZE = 5000; // the game's rule: five seconds
  var TEXT = {
    idle: 'Press P or tap the sign.',
    frozen: 'Death is frozen for five seconds.',
    faster: 'Death moves again, faster than before.',
    caught: 'Caught at 00:15.41. Press P or tap the sign to run again.'
  };
  var now = function () { return window.performance && performance.now ? performance.now() : Date.now(); };
  var nextFrame = window.requestAnimationFrame
    ? function (fn) { window.requestAnimationFrame(fn); }
    : function (fn) { window.setTimeout(function () { fn(now()); }, 50); };
  var pauses = 0;
  var until = 0;
  var frozen = false;
  var caught = false;
  var inView = true;

  function setFill(fraction) { fill.style.transform = 'scaleX(' + fraction + ')'; }
  function setSecs(ms) { secs.textContent = (ms / 1000).toFixed(1) + ' s'; }
  function show(index) { shots.forEach(function (shot, n) { shot.classList.toggle('is-on', n === index); }); }
  function setPips(n) { pips.forEach(function (pip, k) { pip.classList.toggle('is-on', k < n); }); }
  function setRunLink(on) { if (runLink && video) runLink.hidden = !on; }

  function tick() {
    var left = Math.max(0, until - now());
    var whole = Math.ceil(left / 1000);
    // Reduced motion: the bar and the seconds step once a second instead of sliding.
    var stepped = reduced();
    setFill(stepped ? whole / 5 : left / FREEZE);
    setSecs(stepped ? whole * 1000 : left);
    if (count) count.textContent = left > 0 ? String(whole) : '';
    if (left > 0) nextFrame(tick);
    else resume();
  }

  function pause() {
    if (frozen) return;
    if (caught) { reset(); return; }
    frozen = true;
    screen.classList.add('is-frozen');
    plate.setAttribute('aria-disabled', 'true');
    status.textContent = TEXT.frozen;
    until = now() + FREEZE;
    nextFrame(tick);
  }

  function end() {
    caught = true;
    screen.classList.add('is-caught');
    status.textContent = TEXT.caught;
    setRunLink(true);
  }

  function resume() {
    frozen = false;
    pauses += 1;
    screen.classList.remove('is-frozen');
    plate.removeAttribute('aria-disabled');
    setFill(1);
    setSecs(FREEZE);
    setPips(pauses);
    if (pauses < shots.length) {
      show(pauses);
      status.textContent = TEXT.faster;
    } else {
      end();
    }
  }

  function reset() {
    caught = false;
    pauses = 0;
    screen.classList.remove('is-caught');
    show(0);
    setPips(0);
    setFill(1);
    setSecs(FREEZE);
    status.textContent = TEXT.idle;
    setRunLink(false);
  }

  plate.addEventListener('click', pause);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[entries.length - 1].isIntersecting;
    }, { threshold: 0.35 }).observe(screen);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'p' && event.key !== 'P') return;
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || !inView) return;
    var target = event.target;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|VIDEO)$/.test(target.tagName))) return;
    pause();
  });

  setFill(1);
  setSecs(FREEZE);
  screen.classList.add('pd-live');
})();
