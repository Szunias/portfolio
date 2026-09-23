/* Transientica: Practice lane played with K, S and H keys or touch pads, with timing feedback.
   The timing windows are this page's own (Perfect 60 ms, Great 130 ms, Good 200 ms).
   K, S and H act only while focus is inside the widget, so they never shadow browser or
   screen-reader keys. Pads answer touch, mouse and Enter/Space. With reduced motion,
   including a live change, the notes stay still and the pads only light their lane. */
(function () {
  var toy = document.querySelector('[data-tr-toy]');
  if (!toy || !window.requestAnimationFrame || !document.createElementNS) return;
  var layer = toy.querySelector('[data-tr-notes]');
  var play = toy.querySelector('[data-tr-play]');
  var laneOut = toy.querySelector('[data-tr-lane]');
  var judgeOut = toy.querySelector('[data-tr-judge]');
  var summary = toy.querySelector('[data-tr-summary]');
  var pads = Array.prototype.slice.call(toy.querySelectorAll('.tr-pad[data-lane]'));
  var shapes = Array.prototype.slice.call(toy.querySelectorAll('[data-tr-shape]'));
  if (!layer || !play || !laneOut || !judgeOut || pads.length !== 3) return;

  var NS = 'http://www.w3.org/2000/svg';
  var NAMES = ['Kick', 'Snare', 'Hi-hat'];
  var CLS = ['kick', 'snare', 'hat'];
  var KEYS = { k: 0, s: 1, h: 2 };
  var WINDOWS = [[60, 'Perfect!', 'perfect'], [130, 'Great!', 'great'], [200, 'Good', 'good']];
  var LIMIT = 200, TRAVEL = 1500, BEAT = 625, LEAD = TRAVEL + BEAT;
  var TOP = 14, LINE = 262;
  var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var still = !!(motion && motion.matches);
  var frame = Array.prototype.map.call(layer.childNodes, function (node) { return node.cloneNode(true); });

  // Two bars of kick and snare, then two bars with hi-hats between them.
  var PATTERN = [];
  [0, 1, 2, 3, 4, 5, 6, 7].forEach(function (b) { PATTERN.push([b, b % 2]); });
  [8, 12].forEach(function (b) {
    [[0, 0], [0.5, 2], [1, 1], [1.5, 2], [2, 0], [2.5, 2], [3, 1], [3.5, 2]].forEach(function (s) {
      PATTERN.push([b + s[0], s[1]]);
    });
  });

  var notes = [], raf = 0, running = false, stats = null, combo = 0, best = 0;

  function depth(p) { return p <= 1 ? 0.35 * p * p + 0.65 * p : 1 + (p - 1) * 1.35; }
  function svgEl(name, attrs) {
    var el = document.createElementNS(NS, name);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }
  function makeNote(lane) {
    var g = svgEl('g', { 'class': 'tr-note tr-note--' + CLS[lane] });
    g.appendChild(svgEl('circle', { 'class': 'tr-note__ring', r: '16' }));
    g.appendChild(svgEl('circle', { 'class': 'tr-note__dot', r: '3.5' }));
    return g;
  }
  function place(n, p) {
    var q = depth(p);
    var top = 148 + 32 * n.lane, bottom = 80 + 100 * n.lane;
    var x = top + (bottom - top) * q;
    var y = TOP + (LINE - TOP) * q;
    var s = (4 + 12 * Math.min(q, 1.2)) / 16;
    n.el.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + s.toFixed(3) + ')');
  }
  function drop(n) {
    if (n.el && n.el.parentNode) n.el.parentNode.removeChild(n.el);
    n.el = null;
  }
  function clearLayer() {
    while (layer.firstChild) layer.removeChild(layer.firstChild);
  }
  function showFrame() {
    clearLayer();
    frame.forEach(function (node) { layer.appendChild(node.cloneNode(true)); });
  }

  function show(lane, text, extra, cls) {
    if (lane !== null) {
      laneOut.textContent = NAMES[lane];
      laneOut.className = 'tr-readout__lane is-' + CLS[lane];
    }
    judgeOut.textContent = text || ' ';
    judgeOut.className = 'tr-readout__judge' + (cls ? ' is-' + cls : '');
    if (extra) {
      var em = document.createElement('em');
      em.textContent = extra;
      judgeOut.appendChild(em);
    }
  }
  function flash(lane) {
    [pads[lane], shapes[lane]].forEach(function (el) {
      if (!el) return;
      el.classList.add('is-hit');
      setTimeout(function () { el.classList.remove('is-hit'); }, 110);
    });
  }
  function burst(lane) {
    if (still) return;
    var c = svgEl('circle', { 'class': 'tr-burst tr-burst--' + CLS[lane], cx: String(80 + 100 * lane), cy: String(LINE), r: '16' });
    layer.appendChild(c);
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 360);
  }

  function judge(n, dt) {
    n.done = true;
    if (dt === null) {
      stats.miss++;
      combo = 0;
      show(null, 'Miss', '', 'miss');
      return;
    }
    drop(n);
    var w = WINDOWS.filter(function (x) { return Math.abs(dt) <= x[0]; })[0];
    stats[w[2]]++;
    combo++;
    best = Math.max(best, combo);
    var offset = (dt >= 0 ? '+' : '−') + Math.abs(Math.round(dt)) + ' ms';
    show(n.lane, w[1], offset + (combo > 1 ? ' · ' + combo + 'x' : ''), w[2]);
    burst(n.lane);
  }

  function hit(lane) {
    flash(lane);
    if (!running) { show(lane, '', ''); return; }
    var now = performance.now(), pick = null, gap = Infinity;
    notes.forEach(function (n) {
      if (n.done || n.lane !== lane) return;
      var dt = now - n.t;
      if (Math.abs(dt) < Math.abs(gap)) { gap = dt; pick = n; }
    });
    if (pick && Math.abs(gap) <= LIMIT) judge(pick, gap);
    else show(lane, '', '');
  }

  function tick(now) {
    if (!running) return;
    var left = 0;
    notes.forEach(function (n) {
      var p = 1 - (n.t - now) / TRAVEL;
      if (!n.done && now - n.t > LIMIT) judge(n, null);
      if (p < 0) { left++; return; }
      if (!n.done && !n.el) { n.el = makeNote(n.lane); layer.appendChild(n.el); }
      if (n.el) {
        if (p > 1.3) drop(n);
        else { place(n, p); if (n.done) n.el.classList.add('is-missed'); }
      }
      if (!n.done || n.el) left++;
    });
    if (left) raf = requestAnimationFrame(tick);
    else finish();
  }

  function begin() {
    cancelAnimationFrame(raf);
    clearLayer();
    var t0 = performance.now() + LEAD;
    notes = PATTERN.map(function (s) { return { t: t0 + s[0] * BEAT, lane: s[1], el: null, done: false }; });
    stats = { perfect: 0, great: 0, good: 0, miss: 0 };
    combo = 0;
    best = 0;
    running = true;
    toy.classList.add('is-running');
    play.textContent = 'Stop';
    if (summary) summary.textContent = '';
    laneOut.textContent = ' ';
    laneOut.className = 'tr-readout__lane';
    show(null, 'Get ready', '');
    raf = requestAnimationFrame(tick);
  }
  function finish() {
    running = false;
    cancelAnimationFrame(raf);
    toy.classList.remove('is-running');
    play.textContent = 'Play again';
    if (summary && stats) {
      summary.textContent = 'Perfect ' + stats.perfect + ' · Great ' + stats.great + ' · Good ' + stats.good +
        ' · Miss ' + stats.miss + ' · Best combo ' + best;
    }
  }
  function halt() {
    if (!running) return;
    finish();
    clearLayer();
  }

  function setStill(on) {
    still = on;
    toy.classList.toggle('is-still', on);
    if (on) {
      halt();
      showFrame();
    }
  }

  toy.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var lane = KEYS[String(e.key).toLowerCase()];
    if (lane === undefined) return;
    e.preventDefault();
    if (!e.repeat) hit(lane);
  });
  pads.forEach(function (pad) {
    var lane = Number(pad.getAttribute('data-lane'));
    pad.addEventListener('pointerdown', function (e) { if (e.button === 0) hit(lane); });
    pad.addEventListener('click', function (e) { if (e.detail === 0) hit(lane); });
  });
  play.addEventListener('click', function () {
    if (running) { halt(); return; }
    if (still) return;
    if (!toy.contains(document.activeElement)) toy.focus({ preventScroll: true });
    begin();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) halt();
  });
  if (motion) {
    var onMotion = function () { setStill(motion.matches); };
    if (motion.addEventListener) motion.addEventListener('change', onMotion);
    else if (motion.addListener) motion.addListener(onMotion);
  }

  toy.classList.add('is-live');
  if (still) toy.classList.add('is-still');
})();
