/* Pause & Deserve: the "P Pauses Death" sign as a five-second pause toy.
   The game's rule, played on the opening frame: P (or a tap on the sign)
   freezes the frame for five seconds, then Death is closer and a pause is
   spent. After the last frame the run ends; P again starts over. Only the
   opening frame and its HUD change. P is ignored while the screen is out of
   view, in form fields, with modifier keys and on auto-repeat. Without
   JavaScript the HUD stays hidden and the lead states the rule. */
(function () {
  'use strict';
  var screen = document.querySelector('[data-pd-screen]');
  if (!screen) return;
  var shots = [].slice.call(screen.querySelectorAll('.pd-shot'));
  var plate = screen.querySelector('.pd-plate');
  var fill = screen.querySelector('[data-pd-fill]');
  var secs = screen.querySelector('[data-pd-secs]');
  var count = screen.querySelector('[data-pd-count]');
  var status = screen.querySelector('[data-pd-status]');
  var pips = [].slice.call(screen.querySelectorAll('.pd-pip'));
  if (!shots.length || !plate || !fill || !secs || !status) return;

  var FREEZE = 5000; // the game's rule: five seconds
  var TEXT = {
    idle: 'Press P or tap the sign.',
    frozen: 'Death is frozen for five seconds.',
    faster: 'Death moves again, faster than before.',
    caught: 'Caught. Press P or tap the sign to run again.'
  };
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
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
  function setSecs(ms) { secs.textContent = (ms / 1000).toFixed(1) + ' s'; }
  function show(index) {
    shots.forEach(function (shot, n) { shot.classList.toggle('is-on', n === index); });
  }
  function setPips(n) {
    pips.forEach(function (pip, k) { pip.classList.toggle('is-on', k < n); });
  }

  function tick() {
    var left = Math.max(0, until - now());
    var whole = Math.ceil(left / 1000);
    // Reduced motion: the bar and the seconds step once a second instead of sliding.
    var stepped = !!(reduce && reduce.matches);
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
      caught = true;
      screen.classList.add('is-caught');
      status.textContent = TEXT.caught;
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
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    pause();
  });

  setFill(1);
  setSecs(FREEZE);
  screen.classList.add('pd-live');
})();
