/* AudioQ chain: the plug-in's parameters in processing order.
   Ranges, defaults, the 0.3 cutoff skew and every readout formula are copied
   from Source/PluginProcessor.cpp and AudioFilePlayer.cpp (master). No audio is
   made here; each knob shows what the code does with its value. Knobs are
   role="slider": arrows, Page Up/Down, Home/End; mouse drags vertically,
   touch swipes sideways so vertical swipes still scroll the page. Below 900px
   the readout still opens inside its stage; the 901-1180px layout keeps it
   beside the list instead (see audioq.css), so this threshold must match
   that breakpoint. */
(function () {
  var rack = document.querySelector('[data-aq-rack]');
  if (!rack) return;
  var section = rack.closest('.aq-chain');
  var stages = Array.prototype.slice.call(rack.querySelectorAll('.aq-stage'));
  var home = rack.querySelector('.aq-notes');
  if (!stages.length || !home) return;

  var narrow = window.matchMedia('(max-width: 900px)');
  var notes = {};
  Array.prototype.forEach.call(rack.querySelectorAll('.aq-note'), function (n) { notes[n.getAttribute('data-note')] = n; });
  var knobs = {};
  var mode = 'loop';
  var current = null;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function toNorm(k, v) {
    var p = (v - k.min) / (k.max - k.min);
    return k.skew === 1 ? p : Math.pow(clamp(p, 0, 1), k.skew);
  }
  function fromNorm(k, n) {
    n = clamp(n, 0, 1);
    var v = k.min + (k.max - k.min) * (k.skew === 1 ? n : Math.pow(n, 1 / k.skew));
    if (k.interval) v = Math.round(v / k.interval) * k.interval;
    return clamp(v, k.min, k.max);
  }
  function minus(s) { return s.replace('-', '−'); }
  function show(k, v) { return k.interval ? String(Math.round(v)) : minus(v.toFixed(2)); }
  function hz(v) { return v >= 1000 ? (v / 1000).toFixed(1) + ' kHz' : Math.round(v) + ' Hz'; }
  function db(x) { return (x < 0 ? '−' : '+') + Math.abs(x).toFixed(1) + ' dB'; }
  function val(p) { return knobs[p] ? knobs[p].value : 0; }

  /* Resampling by tempo / 120 moves speed and pitch together:
     12 * log2(ratio) semitones. */
  function speed() {
    var r = val('tempo') / 120;
    var st = 12 * Math.log(r) / Math.LN2;
    if (Math.abs(st) < 0.05) return 'at the original speed and pitch.';
    if (r > 1) return r.toFixed(2) + '× faster and ' + st.toFixed(1) + ' semitones higher.';
    return 'at ' + r.toFixed(2) + '× the speed and ' + Math.abs(st).toFixed(1) + ' semitones lower.';
  }

  var READ = {
    source: function () {
      if (mode === 'random') return 'Random mode: a new region of 0.1 to 3 s whenever one ends, ' + speed();
      if (mode === 'granular') return 'Granular mode: a new region of 0.05 to 0.2 s whenever one ends, ' + speed();
      return 'Loop mode: the region you drew, ' + speed();
    },
    filters: function () {
      var lo = val('hpf'), hi = val('lpf');
      return lo < hi ? 'Passes ' + hz(lo) + ' to ' + hz(hi) + '.'
        : 'The high-pass sits above the low-pass, so the two cut most of the signal.';
    },
    comp: function () {
      var mk = clamp(-val('thresh') * (1 - 1 / Math.max(1, val('ratio'))) * 0.35, 0, 18);
      return 'Make-up gain: ' + db(mk) + '.';
    },
    trem: function () {
      var d = val('depth');
      if (d <= 0) return 'Depth 0: the level does not move.';
      return 'Level moves between ' + Math.max(0, 1 - 2 * d).toFixed(2) + ' and 1.00, ' + val('rate').toFixed(1) + ' times a second.';
    },
    crush: function () {
      var b = val('bits'), dsv = val('ds'), ds = Math.max(1, Math.floor(dsv));
      if (b >= 15.5 && dsv <= 1.5) return '16 bits and no downsampling: the sound passes through unchanged.';
      var lv = Math.pow(2, b);
      var steps = lv < 100 ? String(Math.round(lv * 10) / 10) : Math.round(lv).toLocaleString('en-US');
      return 'Steps of 1/' + steps + ', each value held for ' + ds + (ds === 1 ? ' sample.' : ' samples.');
    },
    stutter: function () {
      var r = val('srate');
      return 'Repeats the last ' + Math.round(1000 / r) + ' ms, ' + r.toFixed(1) + ' times a second.';
    },
    mix: function () {
      var d = val('drywet');
      if (d >= 1) return 'Processed signal only.';
      return Math.round((1 - d) * 100) + '% dry, ' + Math.round(d * 100) + '% processed.';
    },
    out: function () {
      var g = val('gain');
      return 'Output gain: ' + (g > 0 ? db(20 * Math.log10(g)) : '−∞ dB, silent') + '.';
    }
  };

  function readout(key) {
    var n = notes[key];
    var line = n && n.querySelector('[data-live]');
    if (line && READ[key]) line.textContent = READ[key]();
  }

  function place(key) {
    var n = notes[key];
    if (!n) return;
    var stage = rack.querySelector('.aq-stage[data-stage="' + key + '"]');
    if (narrow.matches && stage) {
      if (n.parentNode !== stage) stage.appendChild(n);
    } else if (n.parentNode !== home) {
      home.appendChild(n);
    }
  }

  function select(key, keepView) {
    if (key === current) return;
    var stage = rack.querySelector('.aq-stage[data-stage="' + key + '"]');
    if (!stage) return;
    var before = keepView ? stage.getBoundingClientRect().top : 0;
    var passed = true;
    stages.forEach(function (s) {
      var on = s === stage;
      if (on) passed = false;
      s.classList.toggle('is-on', on);
      s.classList.toggle('is-passed', passed && !on);
      var b = s.querySelector('.aq-stage__name');
      if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    Object.keys(notes).forEach(function (k) { notes[k].classList.toggle('is-on', k === key); });
    current = key;
    place(key);
    readout(key);
    if (keepView) {
      var shift = stage.getBoundingClientRect().top - before;
      if (Math.abs(shift) > 1) window.scrollBy(0, shift);
    }
  }

  function setKnob(k, v) {
    k.value = v;
    k.el.style.setProperty('--n', toNorm(k, v).toFixed(4));
    k.out.textContent = show(k, v);
    k.el.setAttribute('aria-valuenow', String(Math.round(v * 100) / 100));
    k.el.setAttribute('aria-valuetext', show(k, v) + (k.unit ? ' ' + k.unit : ''));
    readout(k.stage);
  }

  function bind(el) {
    var host = el.closest('.aq-stage');
    if (!host) return;
    var k = {
      el: el,
      out: el.querySelector('.aq-knob__val'),
      stage: host.getAttribute('data-stage'),
      min: Number(el.getAttribute('data-min')),
      max: Number(el.getAttribute('data-max')),
      def: Number(el.getAttribute('data-def')),
      skew: Number(el.getAttribute('data-skew') || 1),
      interval: Number(el.getAttribute('data-interval') || 0),
      unit: el.getAttribute('data-unit') || ''
    };
    if (!k.out || isNaN(k.min) || isNaN(k.max)) return;
    knobs[el.getAttribute('data-param')] = k;
    el.setAttribute('role', 'slider');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', el.getAttribute('data-label') || '');
    el.setAttribute('aria-valuemin', String(k.min));
    el.setAttribute('aria-valuemax', String(k.max));

    var pid = null, x0 = 0, y0 = 0, n0 = 0, touch = false;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      select(k.stage, true);
      pid = e.pointerId; touch = e.pointerType !== 'mouse';
      x0 = e.clientX; y0 = e.clientY; n0 = toNorm(k, k.value);
      if (!touch) { e.preventDefault(); el.focus({ preventScroll: true }); }
      try { el.setPointerCapture(pid); } catch (err) { /* capture is optional */ }
      el.classList.add('is-held');
    });
    el.addEventListener('pointermove', function (e) {
      if (e.pointerId !== pid) return;
      var d = touch ? (e.clientX - x0) / 170 : ((e.clientX - x0) - (e.clientY - y0)) / 220;
      setKnob(k, fromNorm(k, n0 + d));
    });
    function end(e) { if (e.pointerId === pid) { pid = null; el.classList.remove('is-held'); } }
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('dblclick', function () { setKnob(k, k.def); });
    el.addEventListener('focus', function () { select(k.stage, true); });
    el.addEventListener('keydown', function (e) {
      var n = toNorm(k, k.value);
      switch (e.key) {
        case 'ArrowUp': case 'ArrowRight': n += 0.01; break;
        case 'ArrowDown': case 'ArrowLeft': n -= 0.01; break;
        case 'PageUp': n += 0.1; break;
        case 'PageDown': n -= 0.1; break;
        case 'Home': n = 0; break;
        case 'End': n = 1; break;
        default: return;
      }
      e.preventDefault();
      select(k.stage, true);
      setKnob(k, fromNorm(k, n));
    });
    setKnob(k, k.def);
  }

  Array.prototype.forEach.call(rack.querySelectorAll('.aq-knob'), bind);
  stages.forEach(function (s) {
    var b = s.querySelector('.aq-stage__name');
    if (b) b.addEventListener('click', function () { select(s.getAttribute('data-stage'), true); });
  });
  Array.prototype.forEach.call(rack.querySelectorAll('.aq-mode'), function (b, i, all) {
    b.addEventListener('click', function () {
      mode = b.getAttribute('data-mode');
      Array.prototype.forEach.call(all, function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      readout('source');
    });
  });
  var onChange = function () { if (current) place(current); };
  if (narrow.addEventListener) narrow.addEventListener('change', onChange);
  else if (narrow.addListener) narrow.addListener(onChange);

  rack.classList.add('is-live');
  if (section) section.classList.add('is-live');
  select('source', false);
})();
