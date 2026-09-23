/* Mówik: hold F8 (dictation) or F7 (command) on the keyboard, or press and
   hold the keycaps, to run the indicator and the RAM buffer strip. Indicator
   strings, colours and the 1.8 s success hold come from mowik.py
   (StatusIndicator); the 300 ms pre-roll, 120 ms post-roll and 250 ms minimum
   from config.example.json. The page records nothing. The four sound cues
   are rendered here sample for sample from mowik.py's BUILTIN_SOUND_NOTES and
   builtin_sound_wav(): sine plus a 0.14 second harmonic at +0.35 rad, an 8 ms
   sin^2 attack, a 32 ms cos^2 release, amplitude 0.075, 44.1 kHz 16-bit. Sound
   is off until the tray button is clicked or a cue-table line is played, and
   never runs on load. */
(function () {
  /* ---------- Cue synthesis (shared by the rig and the cue table) ---------- */
  var NOTES = {
    start: [[523.25, 72, 0]],
    stop: [[392.0, 68, 0]],
    done: [[523.25, 55, 10], [659.25, 74, 0]],
    error: [[329.63, 75, 8], [277.18, 95, 0]]
  };
  var SR = 44100;
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, buffers = {};

  function pyRound(x) { /* Python 3 round(): halves go to the even neighbour */
    var f = Math.floor(x), d = x - f;
    if (d > 0.5) return f + 1;
    if (d < 0.5) return f;
    return f % 2 === 0 ? f : f + 1;
  }

  function render(kind) {
    var notes = NOTES[kind], parts = [], total = 0;
    notes.forEach(function (n) {
      var freq = n[0], count = Math.max(1, pyRound(SR * n[1] / 1000));
      var attack = Math.min(Math.floor(count / 2), Math.max(1, Math.floor(SR * 0.008)));
      var release = Math.min(count - attack, Math.max(1, Math.floor(SR * 0.032)));
      var tone = new Float64Array(count);
      for (var i = 0; i < count; i++) {
        var t = i / SR;
        var s = Math.sin(2 * Math.PI * freq * t) + 0.14 * Math.sin(4 * Math.PI * freq * t + 0.35);
        var env = 1;
        if (i < attack) { env = Math.pow(Math.sin((Math.PI / 2) * i / attack), 2); }
        if (release && i >= count - release) {
          var k = i - (count - release);
          env = Math.pow(Math.cos(release > 1 ? (Math.PI / 2) * k / (release - 1) : 0), 2);
        }
        tone[i] = 0.075 * s * env;
      }
      parts.push(tone); total += count;
      if (n[2]) { var gap = new Float64Array(pyRound(SR * n[2] / 1000)); parts.push(gap); total += gap.length; }
    });
    var wave = new Float64Array(total), o = 0;
    parts.forEach(function (p) { wave.set(p, o); o += p.length; });
    wave[0] = 0; wave[total - 1] = 0;
    var buf = ctx.createBuffer(1, total, SR), ch = buf.getChannelData(0);
    for (var j = 0; j < total; j++) { /* numpy int16 cast truncates toward zero */
      var v = Math.max(-1, Math.min(1, wave[j]));
      ch[j] = Math.trunc(v * 32767) / 32768;
    }
    return buf;
  }

  function ensureAudio() {
    if (!AC) return false;
    if (!ctx) { try { ctx = new AC(); } catch (err) { return false; } }
    if (ctx.state === 'suspended') { ctx.resume(); }
    return true;
  }

  function play(kind) {
    if (!ctx || !NOTES[kind]) return 0;
    if (!buffers[kind]) buffers[kind] = render(kind);
    var src = ctx.createBufferSource();
    src.buffer = buffers[kind];
    src.connect(ctx.destination);
    src.start();
    return buffers[kind].duration;
  }

  /* ---------- The cue table ---------- */
  var notes = document.querySelector('[data-mw-notes]');
  if (notes) {
    Array.prototype.slice.call(notes.querySelectorAll('[data-cue]')).forEach(function (row) {
      var timer = 0;
      row.addEventListener('click', function () {
        var kind = row.getAttribute('data-cue');
        var dur = ensureAudio() ? play(kind) : 0;
        clearTimeout(timer);
        row.classList.add('is-playing');
        timer = setTimeout(function () { row.classList.remove('is-playing'); }, Math.max(260, dur * 1000 + 120));
      });
    });
  }

  /* ---------- The rig ---------- */
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
  var soundBtn = rig.querySelector('[data-mw-sound]');
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

  var lang = 'en', state = 'idle', mode = null, t0 = 0, held = 0, raf = 0, timers = [], soundOn = false;

  function later(fn, s) { timers.push(setTimeout(fn, s * 1000)); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function cue(kind) { if (soundOn) play(kind); }

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
    cue('start');
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
    later(function () { cue('stop'); }, POST); /* the app plays it after the post-roll */
    if (held < MIN) { /* the app shows the error state but plays no error cue */
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
      cue(was === 'cmd' ? 'error' : 'done');
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

  function setSound(on) {
    soundOn = !!on;
    if (soundBtn) soundBtn.setAttribute('aria-pressed', String(soundOn));
  }
  if (soundBtn) {
    if (!AC) { soundBtn.hidden = true; }
    soundBtn.addEventListener('click', function () {
      if (!soundOn && !ensureAudio()) return;
      setSound(!soundOn);
      if (state === 'idle') {
        readout.textContent = soundOn
          ? 'sound cues on: C5 on the press, G4 after the release'
          : 'sound cues off';
      }
    });
  }

  widths(0, false);
  setState('idle');
})();
