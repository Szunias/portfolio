/* Actual audio in a compact strip; music-player.js owns playback and the queue. */
(function () {
  const audio = document.querySelector('[data-music-audio]');
  const stage = document.querySelector('.stage');
  const plate = document.querySelector('.stage__plate');
  const canvas = document.querySelector('.stage__spectrum');
  if (!stage || !plate || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = Array.from(document.querySelectorAll('#trackData .track-card'));
  const titleEl = stage.querySelector('[data-player="title"]');
  const theme = getComputedStyle(stage);
  const accent = theme.getPropertyValue('--c-accent').trim() || '#aac6de';
  const ink = theme.getPropertyValue('--c-ink').trim() || '#f1f0eb';
  const BANDS = 48;
  const levels = new Float32Array(BANDS);
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
  let width = 0;
  let height = 0;
  let visible = true;
  let buffering = false;
  let lastTitle = '';
  let artworkVersion = 0;

  function applyVeil(luma) {
    const light = Math.max(0, Math.min(1, luma));
    stage.style.setProperty('--stage-veil', (0.52 + light * 0.4).toFixed(3));
    stage.style.setProperty('--stage-bloom', (0.64 - light * 0.42).toFixed(3));
  }

  function sampleLuma(src) {
    const version = ++artworkVersion;
    if (!src) { applyVeil(0.22); return; }
    const img = new Image();
    img.onload = function () {
      if (version !== artworkVersion) return;
      try {
        const probe = document.createElement('canvas');
        probe.width = probe.height = 24;
        const probeCtx = probe.getContext('2d', { willReadFrequently: true });
        if (!probeCtx) { applyVeil(0.22); return; }
        probeCtx.drawImage(img, 0, 0, 24, 24);
        const data = probeCtx.getImageData(0, 0, 24, 24).data;
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        }
        applyVeil(sum / (data.length / 4) / 255);
      } catch (_) { applyVeil(0.22); }
    };
    img.onerror = function () { if (version === artworkVersion) applyVeil(0.22); };
    img.src = src;
  }

  function syncTrack() {
    const title = titleEl ? titleEl.textContent.trim() : '';
    if (title !== lastTitle) {
      lastTitle = title;
      const track = cards.find(card => card.dataset.title === title);
      const size = (track && track.dataset.artSize || '1x1').split('x');
      plate.style.setProperty('--stage-art-w', String(parseInt(size[0], 10) || 1));
      plate.style.setProperty('--stage-art-h', String(parseInt(size[1], 10) || 1));
      sampleLuma(track && track.dataset.art);
      levels.fill(0);
    }
    stage.classList.toggle('is-playing', playing());
    updateMotion();
  }

  function playing() {
    return !!(audio && !audio.paused && !audio.ended && !audio.error);
  }

  function wantsMotion() {
    return playing() && audio.readyState >= 2 && !buffering &&
      !reduced.matches && !document.hidden && visible && width > 0;
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
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      bins = new Uint8Array(analyser.frequencyBinCount);
      bandLo = new Uint16Array(BANDS);
      bandHi = new Uint16Array(BANDS);
      const nyquist = audioCtx.sampleRate / 2;
      const high = Math.min(16000, nyquist);
      for (let i = 0; i < BANDS; i++) {
        const lo = 40 * Math.pow(high / 40, i / BANDS);
        const hi = 40 * Math.pow(high / 40, (i + 1) / BANDS);
        bandLo[i] = Math.min(bins.length - 1, Math.floor(lo / nyquist * bins.length));
        bandHi[i] = Math.min(bins.length, Math.max(bandLo[i] + 1, Math.ceil(hi / nyquist * bins.length)));
      }
    } catch (_) {
      graphFailed = true;
      analyser = null;
    }
    graphPending = false;
    updateMotion();
  }

  function draw(live) {
    ctx.clearRect(0, 0, width, height);
    const step = width / BANDS;
    const bar = Math.max(1.5, Math.min(3, step * 0.44));
    ctx.lineWidth = bar;
    ctx.lineCap = 'round';
    for (let i = 0; i < BANDS; i++) {
      const value = live ? levels[i] : 0;
      const size = Math.max(1, (height - 8) * Math.pow(value, 1.2));
      const x = (i + 0.5) * step;
      ctx.strokeStyle = live ? accent : ink;
      ctx.globalAlpha = live ? 0.35 + value * 0.65 : 0.16;
      ctx.beginPath();
      ctx.moveTo(x, (height - size) / 2);
      ctx.lineTo(x, (height + size) / 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function frame(now) {
    raf = 0;
    if (!wantsMotion() || !analyser) { draw(false); return; }
    const delta = Math.min(100, lastFrame ? now - lastFrame : 16.7);
    lastFrame = now;
    analyser.getByteFrequencyData(bins);
    for (let i = 0; i < BANDS; i++) {
      let sum = 0;
      for (let j = bandLo[i]; j < bandHi[i]; j++) sum += bins[j];
      const target = sum / (bandHi[i] - bandLo[i]) / 255;
      const response = 1 - Math.exp(-delta / (target > levels[i] ? 38 : 170));
      levels[i] += (target - levels[i]) * response;
    }
    draw(true);
    raf = requestAnimationFrame(frame);
  }

  function updateMotion() {
    if (wantsMotion() && analyser) {
      if (!raf) { lastFrame = 0; raf = requestAnimationFrame(frame); }
      return;
    }
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    draw(false);
    if (wantsMotion() && !graphFailed) prepareGraph();
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    width = box.width;
    height = box.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    updateMotion();
  }

  if (typeof ResizeObserver === 'function') new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize, { passive: true });
  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      updateMotion();
    }).observe(canvas);
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && playing()) resumeContext().then(updateMotion).catch(function () {});
    updateMotion();
  });
  reduced.addEventListener('change', updateMotion);
  if (titleEl) new MutationObserver(syncTrack).observe(titleEl, { childList: true, characterData: true, subtree: true });
  if (audio) {
    ['play', 'playing'].forEach(event => audio.addEventListener(event, function () {
      buffering = false;
      resumeContext().then(updateMotion).catch(function () {});
      syncTrack();
    }));
    audio.addEventListener('waiting', function () {
      buffering = true;
      updateMotion();
    });
    ['pause', 'ended', 'emptied', 'error'].forEach(event => audio.addEventListener(event, function () {
      buffering = false;
      levels.fill(0);
      syncTrack();
    }));
  }
  resize();
  syncTrack();
})();
