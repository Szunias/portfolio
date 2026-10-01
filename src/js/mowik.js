/* Mówik: the four sound cues are rendered here sample for sample from
   mowik.py's BUILTIN_SOUND_NOTES and builtin_sound_wav(): sine plus a 0.14
   second harmonic at +0.35 rad, an 8 ms sin^2 attack, a 32 ms cos^2 release,
   amplitude 0.075, 44.1 kHz 16-bit. Sound plays only when a cue-table line is
   selected, never on load. */
(function () {
  /* ---------- Cue synthesis ---------- */
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
})();
