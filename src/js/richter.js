/* Richter: seismograph drum of the low end that scrubs the film and follows playback.
   TRACE is the finished mix of DigitalAudioWorkstation2.mp4 band-passed to
   25-140 Hz, peak level every 25 ms (40 readings a second), normalised to the
   loudest reading and stored as one character per reading (0-63 on a 0.7
   curve, decoded back to linear here). Nothing in it is invented.
   Like a helicorder, the record wraps into lines: 4 lines of 11 s on a wide
   screen, 8 lines of 5.5 s on a phone; both draw the peak of every 50 ms.
   Cue times come from the picture. 0:07 is where the released "Richter - Main
   Theme" lines up with the film mix (FFT cross-correlation, offset 6.92 s).
   The plot is a slider over the film: click, tap or arrow keys move it.
   The timecodes in the cue sheet are the accessible buttons; the frames next
   to them are a pointer shortcut and stay aria-hidden. */
(function () {
  var drum = document.querySelector('[data-ri-drum]');
  var plot = drum && drum.querySelector('[data-ri-plot]');
  var film = document.querySelector('[data-ri-film]');
  if (!drum || !plot || !film) return;

  var TRACE = '1111111001111111111111011111111111111121111111111111101111111110111111111111211111112111111011000011111101111111111111233442442433254343466769448CEFAC7A87649CD9BB977EG999D9A9AB6AA7DCEEEDCFBB9QMGEC89IDF9NGIDFC8IIB7EGJIDLKBHHFI66CFDEDBE9CNZJWVCAGEGIGHPGKMXWaXVVTVbWOrYXXPVSWQRYKIUYseXlSTPgVXcKfXLNNKXaVkZVcgUOWRLQWQhTTeeTVXWSTXiTZejVVWbIMcYUYTRYWYaTSXdVYSbbOSdYNJaZWTVYOJbRQSaZQTRdaIbXZSOUQUXgYeedhWLVgXTZaaLVXUMbeaGbbQjNTSUZfgUQgTSNWbYbZmNXVLmVTXNNWZRTikWcSbWVQjabalVVXQgbXVYZHYWXbgZQQZUcdllRRMQUXNUPORiMdQcbWQaSSOmVVPXeMPWYSVbbfdXdUNIWWTSjRUThaIbVORYPWZTfbXKVWZTXeYYklZLSOTWSZjKSlXVQjiXXSdTTVdRZbfPMQXPYfdZVQmPNYXRZXXQVIkVQLVcUWgQUKoiLHSeWQWfVLadQWKggUQWZddmVeDilVYTPWTdcLMZVgVhheVXKUNaecTOtQqYeeedfefKeXOVNdnglcub__XWSdccQakaXmdaPTWWVnTadXaWTemjPPPLXalUTWfaPUiSUasnbWYNXVXbTTqnPVPfTQbiSdiikYdfdRVSYRbfYVQYXZXVXMcRSdcfliJaZORUchUkmaVPWIRWYeUWaYaOoYOQOZYVQeUaRgJRQWOUfdSSUjURWWRVMXUQPlRKNMWZXRSRQmgLUIbSUXWfKTcRNLeUROQVcPfUULbdNQXRVWdbLIXcYVfgXWXSWSUhLSXbPYXWijbmWcSZZXYRVXPcWcWegMUUbQYRXcWXaVVYMPORcQZZUWTKgOUTaSPPOaNTTdTSUihVYePPWYDZVVOWPcdHIYdMSVadYllbbWbXRUNYSXcdVQiaVUeNFTQRRWbZULdZUWaZbbZmYORPDOVXeSUfYSOheXQNcYRWcTbabTJTcOYdeSMTkWQVVdVMUTRLjaSQOdWSdYOHllSOMiTUZZWNblcVScVQOWZaQjicZacONORPSdkMLZaeaadbQXRTQVhUXQYKSWTYYVeadNYaNRRXaZWYSQdePXPbJbSWeUQVXWVVUOKdHVZTYRMgTTRXVSPXdNUVcSRVibSVkXLQTIYQXVaOfZFMSdMVXagRdgVbTWTVPKWRVfaNPIHHBC7668A86556456554657534634455453531111111111101111111000000000000000000000000000000000000000000000000101100000000111111011111111111111111111122122233339URaVNTPTaSQSNQTNLQVSNONUNTJNORQOSLOPRRQNLOOQPPNPPTSROQQOQPPONOQQROPNMMLLLLJLKLLMMMMMMLMNOPOOOOPPLPQQQKPPQPPQPPPONOOOOMNNNNLNONMJLIFCAA86554333332222112111211211111211122111121112211211111211111111111211111111111112111211111111112111111111111111111111111111110010000100110';
  var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  var DUR = 43.96, SPAN = 44;
  var CUES = [
    [3, 'rumble', 'The plain'],
    [7, 'craft', 'The craft'],
    [10, 'crack', 'The ground splits'],
    [18, 'collapse', 'The ridge collapses'],
    [28, 'gate', 'The gate'],
    [37, 'title', 'The title card']
  ];
  var NS = 'http://www.w3.org/2000/svg';
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var coarse = mq('(pointer: coarse)');
  var screen = film.closest('[data-ri-screen]') || film.parentElement;
  var timeEl = drum.querySelector('[data-ri-time]');
  var hint = drum.querySelector('[data-ri-hint]');
  var rows = [].slice.call(document.querySelectorAll('[data-ri-cue]'));

  var fine = [], coarseData = [];
  for (var i = 0; i < TRACE.length; i++) {
    fine.push(Math.pow(Math.max(0, CHARS.indexOf(TRACE.charAt(i))) / 63, 1 / 0.7));
  }
  for (var j = 0; j < fine.length; j += 2) coarseData.push(Math.max(fine[j], fine[j + 1] || 0));

  var g = null, lit = [], marks = [], penLine, penDot, hover, hoverLine, hoverText;
  var t = 0, raf = 0, flip = 1, now = -2, lastW = 0, rz = 0;

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function fmt(s) {
    s = Math.max(0, Math.floor(s + 0.001));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }
  function yOf(k) { return g.top + g.row * (k + 0.5); }
  function xOf(sec) { return g.gut + sec / g.line * g.lw; }
  function lineOf(sec) { return Math.min(g.lines - 1, Math.floor(sec / g.line)); }

  function pathFor(k) {
    var per = g.line * g.rate, i0 = Math.round(k * per), i1 = Math.min(g.data.length, Math.round((k + 1) * per));
    var y = yOf(k), d = '';
    for (var i = i0; i < i1; i++) {
      var v = g.data[i] * g.amp * (i % 2 ? -1 : 1);
      d += (i === i0 ? 'M' : 'L') + xOf((i - i0) / g.rate).toFixed(1) + ' ' + (y - v).toFixed(1);
    }
    return d;
  }

  function build() {
    var w = plot.clientWidth;
    if (!w) return;
    lastW = w;
    var small = w < 600;
    g = small
      ? { lines: 8, rate: 20, data: coarseData, gut: 38, right: 8, top: 14, row: 32, amp: 32 * 0.8, foot: 6 }
      : { lines: 4, rate: 20, data: coarseData, gut: 58, right: 18, top: 22, row: 64, amp: 64 * 0.92, foot: 12 };
    g.small = small;
    g.w = w;
    g.line = SPAN / g.lines;
    g.lw = w - g.gut - g.right;
    g.h = g.top + g.lines * g.row + g.foot;
    plot.style.height = g.h + 'px';
    plot.textContent = '';
    var svg = el('svg', { width: w, height: g.h, viewBox: '0 0 ' + w + ' ' + g.h, 'aria-hidden': 'true', focusable: 'false' }, plot);
    var defs = el('defs', {}, svg);
    var base = el('g', {}, svg);
    var dim = el('g', { 'class': 'ri-tr ri-tr--dim' }, svg);
    var bright = el('g', { 'class': 'ri-tr ri-tr--lit' }, svg);
    var mk = el('g', {}, svg);
    lit = [];
    for (var k = 0; k < g.lines; k++) {
      var y = yOf(k);
      el('line', { x1: g.gut, x2: w - g.right, y1: y, y2: y, 'class': 'ri-rule' }, base);
      for (var s = Math.ceil(k * g.line); s <= (k + 1) * g.line + 0.001; s++) {
        var x = xOf(s - k * g.line), major = s % 5 === 0;
        el('line', { x1: x, x2: x, y1: y + g.row / 2 - (major ? 7 : 4), y2: y + g.row / 2, 'class': 'ri-tick' }, base);
      }
      el('text', { x: g.gut - (small ? 8 : 16), y: y + 4, 'text-anchor': 'end', 'class': 'ri-lab' }, base).textContent = fmt(k * g.line);
      var d = pathFor(k);
      el('path', { d: d }, dim);
      var clip = el('clipPath', { id: 'ri-clip-' + k }, defs);
      lit.push(el('rect', { x: 0, y: y - g.row, width: 0, height: g.row * 2 }, clip));
      el('path', { d: d, 'clip-path': 'url(#ri-clip-' + k + ')' }, bright);
    }
    marks = CUES.map(function (c) {
      var k = lineOf(c[0]), x = xOf(c[0] - k * g.line), y = yOf(k);
      var grp = el('g', { 'class': 'ri-mk' }, mk);
      el('line', { x1: x, x2: x, y1: y - g.row / 2 + 1, y2: y + g.row / 2 - 1 }, grp);
      el('text', { x: x + 5, y: y - g.row / 2 + (small ? 9 : 11) }, grp).textContent = fmt(c[0]) + (small ? '' : ' ' + c[1]);
      return grp;
    });
    hover = el('g', { 'class': 'ri-hover', display: 'none' }, svg);
    hoverLine = el('line', {}, hover);
    hoverText = el('text', {}, hover);
    var pen = el('g', { 'class': 'ri-pen' }, svg);
    penLine = el('line', {}, pen);
    penDot = el('circle', { r: small ? 3 : 3.5 }, pen);
    now = -2;
    place(t, false);
  }

  function place(sec, scribble) {
    if (!g) return;
    t = Math.max(0, Math.min(DUR, sec || 0));
    var k = lineOf(t);
    for (var n = 0; n < g.lines; n++) {
      var frac = Math.max(0, Math.min(1, (t - n * g.line) / g.line));
      lit[n].setAttribute('width', (frac > 0 ? g.gut + frac * g.lw : 0).toFixed(1));
    }
    var x = xOf(t - k * g.line).toFixed(1), y = yOf(k);
    penLine.setAttribute('x1', x);
    penLine.setAttribute('x2', x);
    penLine.setAttribute('y1', y - g.row / 2 + 1);
    penLine.setAttribute('y2', y + g.row / 2 - 1);
    var v = g.data[Math.min(g.data.length - 1, Math.floor(t * g.rate))] || 0;
    var dy = scribble && !reduce.matches ? v * g.amp * (flip = -flip) : 0;
    penDot.setAttribute('cx', x);
    penDot.setAttribute('cy', (y - dy).toFixed(1));

    var c = -1;
    for (var m = 0; m < CUES.length; m++) if (t >= CUES[m][0]) c = m;
    if (c !== now) {
      now = c;
      marks.forEach(function (mk, i) { mk.classList.toggle('is-now', i === c); });
      rows.forEach(function (r, i) { r.classList.toggle('is-now', i === c); });
    }
    if (timeEl) timeEl.textContent = fmt(t);
    plot.setAttribute('aria-valuenow', String(Math.round(t)));
    plot.setAttribute('aria-valuetext', fmt(t) + (c >= 0 ? ', ' + CUES[c][2] : ''));
  }

  function tick() {
    raf = 0;
    place(film.currentTime, true);
    if (!film.paused && !film.ended && !reduce.matches) raf = requestAnimationFrame(tick);
  }

  /* play: start the film if it has not started (local-video.js keeps a
     poster button over it until then). Without play the film is only cued. */
  function seek(sec, play) {
    sec = Math.max(0, Math.min(DUR - 0.1, sec));
    var launch = screen.querySelector('.local-video__launch');
    var back = document.activeElement;
    if (play && launch) launch.click();
    try { film.currentTime = sec; } catch (e) { /* not seekable yet */ }
    if (play && film.paused) {
      var p = film.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    }
    if (play) drum.classList.add('has-started');
    place(sec, false);
    if (play && launch && back && back !== document.body && back.focus) back.focus({ preventScroll: true });
  }

  function timeAt(ev) {
    var r = plot.getBoundingClientRect();
    var k = Math.max(0, Math.min(g.lines - 1, Math.floor((ev.clientY - r.top - g.top) / g.row)));
    var frac = Math.max(0, Math.min(1, (ev.clientX - r.left - g.gut) / g.lw));
    return Math.min(DUR, (k + frac) * g.line);
  }

  function showHover(ev) {
    var s = timeAt(ev), k = lineOf(s);
    var x = xOf(s - k * g.line), y = yOf(k);
    hover.setAttribute('display', 'inline');
    hoverLine.setAttribute('x1', x);
    hoverLine.setAttribute('x2', x);
    hoverLine.setAttribute('y1', y - g.row / 2 + 1);
    hoverLine.setAttribute('y2', y + g.row / 2 - 1);
    hoverText.setAttribute('x', x + 5);
    hoverText.setAttribute('y', y + g.row / 2 - 5);
    hoverText.textContent = fmt(s);
  }

  var dragging = false, downAt = null;
  plot.addEventListener('pointerdown', function (ev) {
    if (!g || ev.button > 0) return;
    if (ev.pointerType === 'mouse') {
      dragging = true;
      if (plot.setPointerCapture) plot.setPointerCapture(ev.pointerId);
      seek(timeAt(ev), true);
    } else {
      downAt = { x: ev.clientX, y: ev.clientY };
    }
  });
  plot.addEventListener('pointermove', function (ev) {
    if (!g || ev.pointerType !== 'mouse') return;
    if (dragging) {
      var s = timeAt(ev);
      try { film.currentTime = s; } catch (e) { /* not seekable yet */ }
      place(s, false);
    }
    showHover(ev);
  });
  plot.addEventListener('pointerup', function (ev) {
    if (dragging) { dragging = false; return; }
    if (downAt && Math.abs(ev.clientX - downAt.x) < 10 && Math.abs(ev.clientY - downAt.y) < 10) seek(timeAt(ev), true);
    downAt = null;
  });
  plot.addEventListener('pointercancel', function () { dragging = false; downAt = null; });
  plot.addEventListener('pointerleave', function () { if (hover) hover.setAttribute('display', 'none'); });

  plot.addEventListener('keydown', function (ev) {
    if (!g) return;
    var cur = film.currentTime || t, s;
    switch (ev.key) {
      case 'ArrowRight': s = cur + 1; break;
      case 'ArrowLeft': s = cur - 1; break;
      case 'ArrowDown': case 'PageDown': s = cur + g.line; break;
      case 'ArrowUp': case 'PageUp': s = cur - g.line; break;
      case 'Home': s = 0; break;
      case 'End': s = DUR; break;
      case ' ': case 'Enter':
        ev.preventDefault();
        if (film.paused) seek(cur, true); else film.pause();
        return;
      default: return;
    }
    ev.preventDefault();
    seek(s, false);
  });

  rows.forEach(function (row) {
    var sec = Number(row.getAttribute('data-ri-cue'));
    [].forEach.call(row.querySelectorAll('[data-ri-seek]'), function (b) {
      b.addEventListener('click', function () {
        seek(sec, true);
        var r = screen.getBoundingClientRect();
        if (r.bottom < 60 || r.top > window.innerHeight - 60) {
          screen.scrollIntoView({ block: 'center', behavior: reduce.matches ? 'auto' : 'smooth' });
        }
      });
    });
  });

  film.addEventListener('play', function () {
    drum.classList.add('has-started');
    if (!raf && !reduce.matches) raf = requestAnimationFrame(tick);
  });
  ['pause', 'seeked', 'timeupdate', 'ended'].forEach(function (type) {
    film.addEventListener(type, function () { if (film.paused || reduce.matches) place(film.currentTime, false); });
  });

  window.addEventListener('resize', function () {
    cancelAnimationFrame(rz);
    rz = requestAnimationFrame(function () { if (plot.clientWidth !== lastW) build(); });
  });

  if (hint && coarse.matches) hint.textContent = 'Tap the trace to jump there';
  drum.classList.add('is-live');
  build();

  /* The theme on its own. One sound at a time: the film pauses it and it pauses the film. */
  var audio = document.querySelector('[data-ri-audio]');
  var btn = document.querySelector('[data-ri-play]');
  var aTime = document.querySelector('[data-ri-atime]');
  var aBar = document.querySelector('[data-ri-abar]');
  if (!audio || !btn) return;
  audio.removeAttribute('controls');
  audio.hidden = true;
  btn.hidden = false;
  function showTime() {
    var d = isFinite(audio.duration) && audio.duration ? audio.duration : 37.6;
    if (aTime) aTime.textContent = fmt(audio.currentTime) + ' / ' + fmt(d);
    if (aBar) aBar.style.width = (Math.min(1, audio.currentTime / d) * 100).toFixed(2) + '%';
  }
  btn.addEventListener('click', function () {
    if (audio.paused) {
      var p = audio.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    } else {
      audio.pause();
    }
  });
  audio.addEventListener('play', function () {
    btn.classList.add('is-playing');
    btn.setAttribute('aria-label', 'Pause the main theme');
    if (!film.paused) film.pause();
  });
  audio.addEventListener('pause', function () {
    btn.classList.remove('is-playing');
    btn.setAttribute('aria-label', 'Play the main theme');
  });
  audio.addEventListener('timeupdate', showTime);
  audio.addEventListener('ended', function () { audio.currentTime = 0; showTime(); });
  film.addEventListener('play', function () { if (!audio.paused) audio.pause(); });
})();
