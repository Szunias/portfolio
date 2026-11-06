/* The live analyser, drawn as a meter bridge: columns of LED segments on a
   logarithmic 40 Hz to 16 kHz axis, unlit at rest, lit in ice with white peak
   caps while music plays. It also feeds the three-bar level meter (.vu) of
   whichever list row is playing. music-player.js owns playback and the queue;
   this file only observes the shared audio element. */
(function () {
  const audio = document.querySelector('[data-music-audio]');
  const stage = document.querySelector('.stage');
  const canvas = document.querySelector('.stage__spectrum');
  if (!stage || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const theme = getComputedStyle(stage);
  const ICE = theme.getPropertyValue('--c-accent').trim() || '#aac6de';
  const INK = theme.getPropertyValue('--c-ink').trim() || '#f1f0eb';
  const UNLIT = 'rgba(241, 240, 235, 0.075)';
  const MIN_DB = -100;
  const MAX_DB = -34;
  // A 3 dB per octave tilt around 1 kHz, as spectrum analysers such as SPAN
  // use, so a full mix does not read as nothing but bass.
  const SLOPE = 3;
  const MAX_BANDS = 64;
  const PLAYING_METERS = '.set-row.is-playing .vu, .spine.is-playing .vu, .sketch-row.is-playing .vu';
  const levels = new Float32Array(MAX_BANDS);
  const peaks = new Float32Array(MAX_BANDS);
  const holds = new Float32Array(MAX_BANDS);
  const tilt = new Float32Array(MAX_BANDS);
  const colX = new Float32Array(MAX_BANDS);
  // Level meters on screen. A meter outside the playing row is display:none
  // and never intersects, so any entry here belongs to the playing row.
  const shownMeters = new Set();
  let bands = 48;
  let rows = 20;
  let seg = 4;
  let pitch = 7;
  let colW = 8;
  let W = 0;
  let H = 0;
  let width = 0;
  let bins = null;
  let bandLo = null;
  let bandHi = null;
  let audioCtx = null;
  let source = null;
  let analyser = null;
  let graphPending = false;
  let graphFailed = false;
  let raf = 0;
  let lastFrame = 0;
  let canvasVisible = true;
  let buffering = false;

  const shape = value => Math.pow(Math.max(0, Math.min(1, value)), 1.15);
  const segmentY = row => H - row * pitch - seg;

  function mapBands() {
    for (let i = 0; i < bands; i++) {
      const centre = 40 * Math.pow(400, (i + 0.5) / bands);
      tilt[i] = SLOPE * Math.log2(centre / 1000) / (MAX_DB - MIN_DB);
    }
    levels.fill(0);
    peaks.fill(0);
    if (!analyser) return;
    const nyquist = audioCtx.sampleRate / 2;
    const high = Math.min(16000, nyquist);
    for (let i = 0; i < bands; i++) {
      const lo = 40 * Math.pow(high / 40, i / bands);
      const hi = 40 * Math.pow(high / 40, (i + 1) / bands);
      bandLo[i] = Math.min(bins.length - 1, Math.floor(lo / nyquist * bins.length));
      bandHi[i] = Math.min(bins.length, Math.max(bandLo[i] + 1, Math.ceil(hi / nyquist * bins.length)));
    }
  }

  // Device pixels throughout, so every segment lands on whole pixels.
  function draw(live) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = UNLIT;
    ctx.beginPath();
    for (let i = 0; i < bands; i++) for (let r = 0; r < rows; r++) ctx.rect(colX[i], segmentY(r), colW, seg);
    ctx.fill();
    if (!live) return;
    ctx.fillStyle = ICE;
    ctx.beginPath();
    for (let i = 0; i < bands; i++) {
      const lit = Math.min(rows, Math.round(shape(levels[i]) * rows));
      for (let r = 0; r < lit; r++) ctx.rect(colX[i], segmentY(r), colW, seg);
    }
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath();
    for (let i = 0; i < bands; i++) {
      const peak = Math.min(rows, Math.round(peaks[i]));
      if (peak >= 1) ctx.rect(colX[i], segmentY(peak - 1), colW, seg);
    }
    ctx.fill();
  }

  // Low, middle and high thirds of the same bands.
  function feedMeters() {
    const meters = document.querySelectorAll(PLAYING_METERS);
    if (!meters.length) return;
    const a = Math.round(bands / 3);
    const b = Math.round(bands * 2 / 3);
    const average = (from, to) => {
      let sum = 0;
      for (let i = from; i < to; i++) sum += shape(levels[i]);
      return sum / Math.max(1, to - from);
    };
    const values = [average(0, a), average(a, b), average(b, bands)];
    meters.forEach(meter => {
      values.forEach((value, k) => meter.style.setProperty('--v' + (k + 1), Math.min(1, 0.3 + value * 0.95).toFixed(3)));
    });
  }

  function rest() {
    levels.fill(0);
    peaks.fill(0);
    document.querySelectorAll('.vu[style]').forEach(meter => meter.removeAttribute('style'));
    draw(false);
  }

  function playing() {
    return !!(audio && !audio.paused && !audio.ended && !audio.error);
  }

  function wantsMotion() {
    return playing() && audio.readyState >= 2 && !buffering &&
      !reduced.matches && !document.hidden && width > 0 && (canvasVisible || shownMeters.size > 0);
  }

  function syncPlayback() {
    stage.classList.toggle('is-playing', playing());
    updateMotion();
  }

  function resumeContext() {
    if (audioCtx && (audioCtx.state === 'suspended' || audioCtx.state === 'interrupted')) {
      return audioCtx.resume();
    }
    return Promise.resolve();
  }

  async function prepareGraph() {
    if (analyser || graphPending || graphFailed || !audio) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) { graphFailed = true; return; }
    graphPending = true;
    try {
      audioCtx = audioCtx || new AudioContext();
      audioCtx.addEventListener('statechange', updateMotion);
      // Keep native playback until an active context can take over its output.
      await resumeContext();
      if (audioCtx.state !== 'running') throw new Error('Audio context unavailable');
      source = audioCtx.createMediaElementSource(audio);
      // The audible path remains connected even if analyser setup fails.
      source.connect(audioCtx.destination);
      analyser = audioCtx.createAnalyser();
      // 8192 points keep the lowest bands (40 to 60 Hz) on separate bins.
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0.55;
      analyser.minDecibels = MIN_DB;
      analyser.maxDecibels = MAX_DB;
      source.connect(analyser);
      bins = new Uint8Array(analyser.frequencyBinCount);
      bandLo = new Uint16Array(MAX_BANDS);
      bandHi = new Uint16Array(MAX_BANDS);
      mapBands();
    } catch (_) {
      graphFailed = true;
      analyser = null;
    }
    graphPending = false;
    updateMotion();
  }

  function frame(now) {
    raf = 0;
    if (!wantsMotion() || !analyser) { rest(); return; }
    const delta = Math.min(100, lastFrame ? now - lastFrame : 16.7);
    lastFrame = now;
    analyser.getByteFrequencyData(bins);
    for (let i = 0; i < bands; i++) {
      let sum = 0;
      for (let j = bandLo[i]; j < bandHi[i]; j++) sum += bins[j];
      const value = sum / (bandHi[i] - bandLo[i]) / 255;
      const target = value > 0.02 ? Math.max(0, Math.min(1, value + tilt[i])) : 0;
      levels[i] += (target - levels[i]) * (1 - Math.exp(-delta / (target > levels[i] ? 30 : 160)));
      // Peak caps hold for a moment, then fall more slowly than the bars.
      const lit = shape(levels[i]) * rows;
      if (lit >= peaks[i]) { peaks[i] = lit; holds[i] = 0; }
      else if ((holds[i] += delta) > 700) peaks[i] = Math.max(lit, peaks[i] - delta * 0.018);
    }
    if (canvasVisible) draw(true);
    feedMeters();
    raf = requestAnimationFrame(frame);
  }

  function updateMotion() {
    if (wantsMotion() && analyser) {
      if (!raf) { lastFrame = 0; raf = requestAnimationFrame(frame); }
      return;
    }
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    rest();
    if (wantsMotion() && !graphFailed) prepareGraph();
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = box.width;
    W = canvas.width = Math.max(1, Math.round(box.width * dpr));
    H = canvas.height = Math.max(1, Math.round(box.height * dpr));
    // About one column per 20 CSS pixels: 64 across a desktop, 24 on a phone.
    bands = Math.max(24, Math.min(MAX_BANDS, Math.round(box.width / 20)));
    seg = Math.max(2, Math.round((box.height >= 140 ? 4 : 3) * dpr));
    pitch = seg + Math.max(2, Math.round(3 * dpr));
    rows = Math.max(6, Math.floor((H + pitch - seg) / pitch));
    const step = W / bands;
    colW = Math.max(2, Math.round(step * 0.62));
    for (let i = 0; i < bands; i++) colX[i] = Math.round(i * step + (step - colW) / 2);
    mapBands();
    updateMotion();
  }

  if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize, { passive: true });
  // The loop runs while the bridge or the playing row's meter is on screen.
  if (typeof IntersectionObserver === 'function') {
    const visibility = new IntersectionObserver(function (entries) {
      entries.forEach(entry => {
        if (entry.target === canvas) canvasVisible = entry.isIntersecting;
        else if (entry.isIntersecting) shownMeters.add(entry.target);
        else shownMeters.delete(entry.target);
      });
      updateMotion();
    });
    visibility.observe(canvas);
    document.querySelectorAll('.vu').forEach(meter => visibility.observe(meter));
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && playing()) resumeContext().then(updateMotion).catch(function () {});
    updateMotion();
  });
  reduced.addEventListener('change', updateMotion);
  if (audio) {
    ['play', 'playing'].forEach(event => audio.addEventListener(event, function () {
      buffering = false;
      resumeContext().then(updateMotion).catch(function () {});
      syncPlayback();
    }));
    audio.addEventListener('waiting', function () {
      buffering = true;
      updateMotion();
    });
    // A new selection pauses and empties the element first, so the bridge
    // and its peak caps start from rest for every track.
    ['pause', 'ended', 'emptied', 'error'].forEach(event => audio.addEventListener(event, function () {
      buffering = false;
      syncPlayback();
    }));
  }
  resize();
  syncPlayback();
})();
