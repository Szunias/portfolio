/* Mówik: hold F8 (dictation) or F7 (command) on the keyboard, or press and
   hold the keycaps, to run the indicator and the RAM buffer strip. Indicator
   strings, colours and the 1.8 s success hold come from mowik.py
   (StatusIndicator); the 300 ms pre-roll, 120 ms post-roll and 250 ms minimum
   from config.example.json. The page records nothing: a take is timed, not heard. */
(function () {
  var rig = document.querySelector('[data-mw-rig]');
  if (!rig) return;
  var title = rig.querySelector('[data-mw-cap-title]');
  var sub = rig.querySelector('[data-mw-cap-sub]');
  var readout = rig.querySelector('[data-mw-readout]');
  var bar = rig.querySelector('[data-mw-bar]');
  var time = rig.querySelector('[data-mw-time]');
  var keyEls = {
    dict: rig.querySelector('[data-mw-key="dict"]'),
    cmd: rig.querySelector('[data-mw-key="cmd"]')
  };
  var langBtns = Array.prototype.slice.call(rig.querySelectorAll('[data-mw-lang]'));
  if (!title || !sub || !readout || !bar || !time || !keyEls.dict || !keyEls.cmd) return;
  var seg = {
    pre: bar.querySelector('.is-pre'),
    hold: bar.querySelector('.is-hold'),
    post: bar.querySelector('.is-post')
  };
  if (!seg.pre || !seg.hold || !seg.post) return;

  var PRE = 0.3, POST = 0.12, MIN = 0.25, OK = 1.8, PROC = 0.9, NONE = 1.35;

  var UI = {
    en: {
      idle: ['Ready to dictate', 'Hold the shortcut, speak, then release'],
      rec: 'Listening',
      cmd: 'Voice command',
      proc: ['Transcribing speech', 'Preparing your text…'],
      cproc: ['Recognizing command', 'One moment…'],
      ok: ['Ready', 'Text inserted'],
      none: ['No matching command was found', ''],
      short: ['The recording was too short', '']
    },
    pl: {
      idle: ['Gotowy do dyktowania', 'Przytrzymaj skrót, powiedz zdanie i puść'],
      rec: 'Słucham',
      cmd: 'Komenda głosowa',
      proc: ['Rozpoznaję mowę', 'Porządkuję tekst…'],
      cproc: ['Rozpoznaję komendę', 'Chwila…'],
      ok: ['Gotowe', 'Tekst został wklejony'],
      none: ['Nie znaleziono pasującej komendy', ''],
      short: ['Nagranie było zbyt krótkie', '']
    }
  };
  var LINE = {
    idle: 'Hold F8 or F7 on your keyboard, or press and hold a key above.',
    rec: 'recording into RAM, nothing written to disk',
    cmd: 'command mode: only an exact saved phrase counts',
    short: 'held under 250 ms: too short, not transcribed',
    proc: 'faster-whisper on this computer: CUDA float16, or CPU int8',
    cproc: 'matching the phrase against saved commands',
    ok: 'pasted into the active window and copied; audio dropped',
    none: 'no exact match: nothing typed, nothing run'
  };

  var lang = 'en', state = 'idle', mode = null, t0 = 0, held = 0, raf = 0, timers = [];

  function later(fn, s) { timers.push(setTimeout(fn, s * 1000)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function widths(h, post) {
    var total = PRE + h + (post ? POST : 0);
    var span = Math.max(4, total * 1.08);
    seg.pre.style.width = (PRE / span * 100) + '%';
    seg.hold.style.width = (h / span * 100) + '%';
    seg.post.style.width = ((post ? POST : 0) / span * 100) + '%';
    time.textContent = total.toFixed(2) + ' s';
  }

  function paint() {
    var s = UI[lang];
    var pair;
    if (state === 'rec') pair = [s.rec, held.toFixed(1) + ' s'];
    else if (state === 'cmd') pair = [s.cmd, held.toFixed(1) + ' s'];
    else pair = s[state] || s.idle;
    title.textContent = pair[0];
    sub.textContent = pair[1];
    sub.hidden = !pair[1];
    title.parentNode.setAttribute('lang', lang);
  }

  function setState(next) {
    state = next;
    rig.setAttribute('data-state', next);
    paint();
    readout.textContent = LINE[next] || LINE.idle;
  }

  function tick() {
    raf = requestAnimationFrame(function () {
      if (!mode) return;
      held = (performance.now() - t0) / 1000;
      widths(held, false);
      paint();
      tick();
    });
  }

  function press(which) {
    if (mode) return;
    clearTimers();
    bar.classList.remove('is-settling');
    mode = which;
    held = 0;
    t0 = performance.now();
    keyEls[which].classList.add('is-down');
    keyEls[which].setAttribute('aria-pressed', 'true');
    setState(which === 'cmd' ? 'cmd' : 'rec');
    widths(0, false);
    tick();
  }

  function discard() {
    bar.classList.add('is-settling');
    widths(0, false);
  }

  function idle() {
    clearTimers();
    widths(0, false);
    setState('idle');
  }

  function release(which) {
    if (!mode || (which && which !== mode)) return;
    cancelAnimationFrame(raf);
    held = (performance.now() - t0) / 1000;
    var was = mode;
    keyEls[was].classList.remove('is-down');
    keyEls[was].setAttribute('aria-pressed', 'false');
    mode = null;
    if (held < MIN) {
      discard();
      setState('short');
      later(idle, NONE);
      return;
    }
    widths(held, true);
    setState(was === 'cmd' ? 'cproc' : 'proc');
    later(function () {
      var stay = was === 'cmd' ? NONE : OK;
      setState(was === 'cmd' ? 'none' : 'ok');
      later(discard, stay / 2);
      later(idle, stay);
    }, PROC);
  }

  function keyMode(e) {
    if (e.key === 'F8' || e.code === 'F8') return 'dict';
    if (e.key === 'F7' || e.code === 'F7') return 'cmd';
    return null;
  }

  document.addEventListener('keydown', function (e) {
    var m = keyMode(e);
    if (!m || e.ctrlKey || e.altKey || e.metaKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    e.preventDefault(); /* F7 would otherwise offer caret browsing */
    if (!e.repeat) press(m);
  });
  document.addEventListener('keyup', function (e) {
    var m = keyMode(e);
    if (!m) return;
    e.preventDefault();
    release(m);
  });
  window.addEventListener('blur', function () { release(); });

  Object.keys(keyEls).forEach(function (m) {
    var k = keyEls[m];
    k.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      try { k.setPointerCapture(e.pointerId); } catch (err) { /* capture is optional */ }
      press(m);
    });
    k.addEventListener('pointerup', function () { release(m); });
    k.addEventListener('pointercancel', function () { release(m); });
    k.addEventListener('lostpointercapture', function () { release(m); });
    k.addEventListener('keydown', function (e) {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      if (!e.repeat) press(m);
    });
    k.addEventListener('keyup', function (e) {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      release(m);
    });
    k.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    k.addEventListener('click', function (e) { e.preventDefault(); });
  });

  function setLang(next) {
    lang = next === 'pl' ? 'pl' : 'en';
    langBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-mw-lang') === lang));
    });
    paint();
  }
  langBtns.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-mw-lang')); });
  });

  widths(0, false);
  setState('idle');
})();
