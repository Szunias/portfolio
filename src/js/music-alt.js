(function () {
  const audio = window.__musicAudio;
  const stage = document.querySelector('.stage');
  const plate = document.querySelector('.stage__plate');
  const canvas = document.querySelector('.stage__viz');
  if (!stage || !plate || !canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = Array.from(document.querySelectorAll('#trackData .track-card'));
  const titleEl = document.querySelector('.stage [data-player="title"]');
  const ctx2d = canvas.getContext('2d');
  if (!ctx2d) return;

  const freq = new Uint8Array(128);
  let analyser = null;
  let audioCtx = null;
  let graphFailed = false;
  let raf = 0;
  let lastTitle = '';

  function trackByTitle(title) {
    return cards.find(card => card.dataset.title === title) || null;
  }

  function applyPlate(track) {
    const raw = track && track.dataset.artSize;
    const parts = raw ? raw.split('x') : [];
    const w = parseInt(parts[0], 10);
    const h = parseInt(parts[1], 10);
    if (w > 0 && h > 0) {
      plate.style.setProperty('--stage-art-w', String(w));
      plate.style.setProperty('--stage-art-h', String(h));
    } else {
      plate.style.setProperty('--stage-art-w', '1');
      plate.style.setProperty('--stage-art-h', '1');
    }
  }

  function syncTrack() {
    const title = titleEl ? titleEl.textContent.trim() : '';
    if (title && title !== lastTitle) {
      lastTitle = title;
      applyPlate(trackByTitle(title));
      sizeCanvas();
    }
    stage.classList.toggle('is-playing', !!(audio && !audio.paused && !audio.ended));
  }

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(plate.clientWidth));
    const h = Math.max(1, Math.round(plate.clientHeight));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ensureGraph() {
    if (analyser || graphFailed || !audio) return analyser;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (typeof Ctx !== 'function') {
      graphFailed = true;
      return null;
    }
    try {
      audioCtx = new Ctx();
      const source = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.84;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (_) {
      graphFailed = true;
      analyser = null;
    }
    return analyser;
  }

  function resumeContext() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function () {});
    }
  }

  function drawRing(w, h, live) {
    const cx = w / 2;
    const cy = h / 2;
    const rx = Math.max(8, w / 2 - 8);
    const ry = Math.max(8, h / 2 - 8);

    ctx2d.beginPath();
    ctx2d.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx2d.strokeStyle = 'rgba(236, 238, 240, 0.22)';
    ctx2d.lineWidth = 1.25;
    ctx2d.stroke();

    if (!live) return 0;

    analyser.getByteFrequencyData(freq);
    const bins = 64;
    const maxBar = Math.min(w, h) * 0.055;
    let bass = 0;
    ctx2d.lineCap = 'round';
    for (let i = 0; i < bins; i++) {
      const sample = freq[Math.min(freq.length - 1, 2 + Math.floor(i * 0.85))];
      const value = sample / 255;
      if (i < 10) bass += value;
      const angle = (i / bins) * Math.PI * 2 - Math.PI / 2;
      const ox = Math.cos(angle);
      const oy = Math.sin(angle);
      const innerX = cx + ox * rx;
      const innerY = cy + oy * ry;
      ctx2d.beginPath();
      ctx2d.moveTo(innerX, innerY);
      ctx2d.lineTo(innerX + ox * (3 + value * maxBar), innerY + oy * (3 + value * maxBar));
      ctx2d.strokeStyle = 'rgba(236, 238, 240,' + (0.2 + value * 0.7) + ')';
      ctx2d.lineWidth = 2;
      ctx2d.stroke();
    }
    return bass / 10;
  }

  function drawFrame() {
    const w = plate.clientWidth;
    const h = plate.clientHeight;
    if (w < 8 || h < 8) {
      raf = window.requestAnimationFrame(drawFrame);
      return;
    }

    ctx2d.clearRect(0, 0, w, h);
    syncTrack();

    const live = analyser && audio && !audio.paused && !audio.ended && !reduceMotion;
    const bass = drawRing(w, h, live);
    document.documentElement.style.setProperty('--stage-bass', live ? bass.toFixed(3) : '0');
    raf = window.requestAnimationFrame(drawFrame);
  }

  function start() {
    if (!raf) raf = window.requestAnimationFrame(drawFrame);
  }

  applyPlate(trackByTitle(titleEl ? titleEl.textContent.trim() : ''));
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas, { passive: true });
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(sizeCanvas).observe(plate);
  }

  if (audio) {
    audio.addEventListener('play', function () {
      ensureGraph();
      resumeContext();
      start();
    });
    audio.addEventListener('playing', function () {
      ensureGraph();
      resumeContext();
      start();
    });
    audio.addEventListener('pause', syncTrack);
    audio.addEventListener('ended', syncTrack);
  }

  if (titleEl && typeof MutationObserver === 'function') {
    new MutationObserver(syncTrack).observe(titleEl, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  start();
})();
