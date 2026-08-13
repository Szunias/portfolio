(function () {
  const audio = window.__musicAudio;
  const stage = document.querySelector('.stage');
  const plate = document.querySelector('.stage__plate');
  const canvas = document.querySelector('.stage__viz');
  if (!stage || !plate || !canvas) return;

  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = reduceQuery.matches;
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
    sampleLuma(track && track.dataset.art);
  }

  function applyVeil(luma) {
    const light = Math.max(0, Math.min(1, luma));
    stage.style.setProperty('--stage-veil', (0.52 + light * 0.4).toFixed(3));
    stage.style.setProperty('--stage-bloom', (0.64 - light * 0.42).toFixed(3));
  }

  function sampleLuma(src) {
    if (!src) {
      applyVeil(0.22);
      return;
    }
    const img = new Image();
    img.onload = function () {
      try {
        const probe = document.createElement('canvas');
        probe.width = 24;
        probe.height = 24;
        const ctx = probe.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          applyVeil(0.22);
          return;
        }
        ctx.drawImage(img, 0, 0, 24, 24);
        const data = ctx.getImageData(0, 0, 24, 24).data;
        let sum = 0;
        const pixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        }
        applyVeil(sum / pixels / 255);
      } catch (_) {
        applyVeil(0.22);
      }
    };
    img.onerror = function () { applyVeil(0.22); };
    img.src = src;
  }

  function syncTrack() {
    const title = titleEl ? titleEl.textContent.trim() : '';
    if (title && title !== lastTitle) {
      lastTitle = title;
      applyPlate(trackByTitle(title));
      sizeCanvasAndRedraw();
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

    if (!live) return;

    analyser.getByteFrequencyData(freq);
    const bins = 64;
    const maxBar = Math.min(w, h) * 0.055;
    ctx2d.lineCap = 'round';
    for (let i = 0; i < bins; i++) {
      const sample = freq[Math.min(freq.length - 1, 2 + Math.floor(i * 0.85))];
      const value = sample / 255;
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
  }

  function playingNow() {
    return !!(audio && !audio.paused && !audio.ended);
  }

  function drawStatic() {
    const w = plate.clientWidth;
    const h = plate.clientHeight;
    if (w < 8 || h < 8) return;
    ctx2d.clearRect(0, 0, w, h);
    drawRing(w, h, false);
  }

  // The loop runs only while sound is actually playing; a resting page
  // draws its ring once and schedules nothing. Reduced-motion visitors
  // keep the still ring even during playback.
  function drawFrame() {
    raf = 0;
    if (!(analyser && playingNow() && !reduceMotion)) {
      drawStatic();
      return;
    }
    const w = plate.clientWidth;
    const h = plate.clientHeight;
    if (w >= 8 && h >= 8) {
      ctx2d.clearRect(0, 0, w, h);
      drawRing(w, h, true);
    }
    raf = window.requestAnimationFrame(drawFrame);
  }

  function start() {
    if (!raf) raf = window.requestAnimationFrame(drawFrame);
  }

  function stop() {
    if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
    drawStatic();
  }

  function sizeCanvasAndRedraw() {
    sizeCanvas();
    // Resizing wipes the bitmap; the running loop repaints on its own,
    // a resting page needs its still ring back.
    if (!raf) drawStatic();
  }

  applyPlate(trackByTitle(titleEl ? titleEl.textContent.trim() : ''));
  sizeCanvas();
  drawStatic();
  window.addEventListener('resize', sizeCanvasAndRedraw, { passive: true });
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(sizeCanvasAndRedraw).observe(plate);
  }

  if (typeof reduceQuery.addEventListener === 'function') {
    reduceQuery.addEventListener('change', function (event) {
      reduceMotion = event.matches;
      if (!reduceMotion && playingNow()) start(); else stop();
    });
  }

  if (audio) {
    audio.addEventListener('play', function () {
      ensureGraph();
      resumeContext();
      syncTrack();
      start();
    });
    audio.addEventListener('playing', function () {
      ensureGraph();
      resumeContext();
      syncTrack();
      start();
    });
    audio.addEventListener('pause', function () {
      syncTrack();
      stop();
    });
    audio.addEventListener('ended', function () {
      syncTrack();
      stop();
    });
  }

  if (titleEl && typeof MutationObserver === 'function') {
    new MutationObserver(syncTrack).observe(titleEl, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }
})();
