(function () {
  const audio = window.__musicAudio;
  const stage = document.querySelector('.stage');
  const plate = document.querySelector('.stage__plate');
  const ringCanvas = document.querySelector('.stage__viz');
  const specCanvas = document.querySelector('.stage__spectrum');
  if (!stage || !plate || !ringCanvas) return;

  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = reduceQuery.matches;
  const cards = Array.from(document.querySelectorAll('#trackData .track-card'));
  const titleEl = document.querySelector('.stage [data-player="title"]');
  const ringCtx = ringCanvas.getContext('2d');
  const specCtx = specCanvas ? specCanvas.getContext('2d') : null;
  if (!ringCtx) return;

  // ?viz=demo drives the analyser with synthetic data so the spectrum can be
  // judged without sound playing (headless screenshots, local design passes).
  const demoMode = /[?&]viz=demo\b/.test(window.location.search);

  let freq = null;
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
      sizeCanvasesAndRedraw();
    }
    stage.classList.toggle('is-playing', !!(audio && !audio.paused && !audio.ended));
  }

  function sizeCanvas(canvas, ctx, w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.round(w));
    h = Math.max(1, Math.round(h));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function sizeCanvases() {
    sizeCanvas(ringCanvas, ringCtx, plate.clientWidth, plate.clientHeight);
    if (specCanvas && specCtx) sizeCanvas(specCanvas, specCtx, stage.clientWidth, stage.clientHeight);
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
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
      freq = new Uint8Array(analyser.frequencyBinCount);
      computeBands();
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

  /* ---------------- spectrum: log-frequency analyser ---------------- */

  const POINTS = 144;
  const FMIN = 30;
  const FMAX = 16000;
  const GRID = [
    [50, '50'], [100, '100'], [200, '200'], [500, '500'],
    [1000, '1k'], [2000, '2k'], [5000, '5k'], [10000, '10k']
  ];
  const cur = new Float32Array(POINTS);
  const peak = new Float32Array(POINTS);
  let bandLo = null;
  let bandHi = null;

  function computeBands() {
    const nyquist = audioCtx.sampleRate / 2;
    const bins = analyser.frequencyBinCount;
    bandLo = new Uint16Array(POINTS);
    bandHi = new Uint16Array(POINTS);
    for (let i = 0; i < POINTS; i++) {
      const f0 = FMIN * Math.pow(FMAX / FMIN, (i - 0.5) / (POINTS - 1));
      const f1 = FMIN * Math.pow(FMAX / FMIN, (i + 0.5) / (POINTS - 1));
      let lo = Math.floor((f0 / nyquist) * bins);
      let hi = Math.ceil((f1 / nyquist) * bins);
      lo = Math.max(0, Math.min(bins - 1, lo));
      hi = Math.max(lo + 1, Math.min(bins, hi));
      bandLo[i] = lo;
      bandHi[i] = hi;
    }
  }

  function hump(t, center, width) {
    const d = (t - center) / width;
    return Math.exp(-d * d);
  }

  function sampleSpectrum(nowMs) {
    const liveAudio = analyser && playingNow();
    if (liveAudio) analyser.getByteFrequencyData(freq);
    for (let i = 0; i < POINTS; i++) {
      const t = i / (POINTS - 1);
      let v;
      if (liveAudio) {
        let sum = 0;
        for (let b = bandLo[i]; b < bandHi[i]; b++) sum += freq[b];
        v = sum / (bandHi[i] - bandLo[i]) / 255;
        // Gentle tilt so the top octaves read against the bass-heavy FFT.
        v *= 0.66 + 0.62 * t;
      } else {
        const s = nowMs / 1000;
        v = 0.8 * hump(t, 0.1, 0.14) * (0.62 + 0.38 * Math.sin(s * 2.2))
          + 0.5 * hump(t, 0.42, 0.2) * (0.6 + 0.3 * Math.sin(s * 1.3 + 1.7))
          + 0.44 * hump(t, 0.74, 0.11) * (0.55 + 0.35 * Math.sin(s * 3.6 + 0.5))
          + 0.04 + 0.05 * Math.random();
      }
      if (v > 1) v = 1;
      if (v < 0) v = 0;
      cur[i] += (v - cur[i]) * (v > cur[i] ? 0.5 : 0.1);
      peak[i] = Math.max(peak[i] - 0.0045, cur[i]);
    }
  }

  function tracePath(values, w, base, amp) {
    const step = w / (POINTS - 1);
    let px = 0;
    let py = base - values[0] * amp;
    specCtx.moveTo(px, py);
    for (let i = 1; i < POINTS; i++) {
      const x = i * step;
      const y = base - values[i] * amp;
      specCtx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
      px = x;
      py = y;
    }
    specCtx.lineTo(px, py);
  }

  function drawSpectrum(live) {
    if (!specCtx || !specCanvas.clientWidth) return;
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (w < 8 || h < 8) return;
    specCtx.clearRect(0, 0, w, h);
    const base = h - 40;
    const amp = h * 0.44;
    const span = Math.log(FMAX / FMIN);

    specCtx.font = '10px "IBM Plex Mono", ui-monospace, monospace';
    specCtx.textAlign = 'center';
    specCtx.lineWidth = 1;
    for (let g = 0; g < GRID.length; g++) {
      const x = Math.round((w * Math.log(GRID[g][0] / FMIN)) / span) + 0.5;
      specCtx.strokeStyle = 'rgba(236, 238, 240, 0.10)';
      specCtx.beginPath();
      specCtx.moveTo(x, base);
      specCtx.lineTo(x, base - amp - 24);
      specCtx.stroke();
      specCtx.fillStyle = 'rgba(236, 238, 240, 0.48)';
      specCtx.fillText(GRID[g][1], x, base + 18);
    }
    specCtx.strokeStyle = 'rgba(236, 238, 240, 0.12)';
    specCtx.beginPath();
    specCtx.moveTo(0, base + 0.5);
    specCtx.lineTo(w, base + 0.5);
    specCtx.stroke();

    if (!live) return;

    specCtx.lineJoin = 'round';

    // Peak-hold contour, slowly falling back to the live curve.
    specCtx.beginPath();
    tracePath(peak, w, base, amp);
    specCtx.strokeStyle = 'rgba(170, 198, 222, 0.3)';
    specCtx.lineWidth = 1;
    specCtx.stroke();

    // Filled spectrum body.
    specCtx.beginPath();
    tracePath(cur, w, base, amp);
    specCtx.lineTo(w, base);
    specCtx.lineTo(0, base);
    specCtx.closePath();
    const fillGrad = specCtx.createLinearGradient(0, base - amp, 0, base);
    fillGrad.addColorStop(0, 'rgba(170, 198, 222, 0.22)');
    fillGrad.addColorStop(1, 'rgba(170, 198, 222, 0.02)');
    specCtx.fillStyle = fillGrad;
    specCtx.fill();

    // Soft glow pass under a crisp line.
    specCtx.beginPath();
    tracePath(cur, w, base, amp);
    specCtx.strokeStyle = 'rgba(170, 198, 222, 0.12)';
    specCtx.lineWidth = 6;
    specCtx.stroke();
    specCtx.beginPath();
    tracePath(cur, w, base, amp);
    specCtx.strokeStyle = 'rgba(190, 214, 234, 0.85)';
    specCtx.lineWidth = 1.5;
    specCtx.stroke();

    drawInspector(w, base, amp);
  }

  /* ---------------- inspector: the frequency under the cursor ----------------
     Mouse only, and only while the spectrum is actually drawing: the hairline
     and readout ride inside the live render loop, so a resting page never
     pays for them. Touch is left alone so nothing competes with scrolling. */

  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  let hoverX = -1;
  let hoverY = -1;

  function noteLabel(f) {
    const midi = Math.round(69 + 12 * Math.log2(f / 440));
    if (midi < 12 || midi > 131) return '';
    return NOTE_NAMES[midi % 12] + (Math.floor(midi / 12) - 1);
  }

  function drawInspector(w, base, amp) {
    if (hoverX < 0 || hoverY < base - amp - 24 || hoverY > base + 20) return;
    const t = Math.max(0, Math.min(1, hoverX / w));
    const f = FMIN * Math.pow(FMAX / FMIN, t);
    const x = Math.round(hoverX) + 0.5;

    specCtx.strokeStyle = 'rgba(170, 198, 222, 0.35)';
    specCtx.lineWidth = 1;
    specCtx.beginPath();
    specCtx.moveTo(x, base);
    specCtx.lineTo(x, base - amp - 24);
    specCtx.stroke();

    const i = Math.round(t * (POINTS - 1));
    specCtx.beginPath();
    specCtx.arc(hoverX, base - cur[i] * amp, 2.5, 0, Math.PI * 2);
    specCtx.fillStyle = 'rgba(190, 214, 234, 0.9)';
    specCtx.fill();

    const note = noteLabel(f);
    const label = (f < 1000 ? Math.round(f) + ' Hz' : (f / 1000).toFixed(1) + ' kHz') + (note ? ' · ' + note : '');
    specCtx.font = '10px "IBM Plex Mono", ui-monospace, monospace';
    specCtx.fillStyle = 'rgba(190, 214, 234, 0.85)';
    const flip = hoverX > w - 84;
    specCtx.textAlign = flip ? 'right' : 'left';
    /* The canvas sits under the page content, so the top of the hairline can
       run behind the track list; the readout stays in the clear strip just
       above the baseline instead. */
    specCtx.fillText(label, flip ? hoverX - 8 : hoverX + 8, base - 8);
  }

  function inspectorLive() {
    return !reduceMotion && (demoMode || playingNow());
  }

  if (finePointer && specCtx) {
    stage.addEventListener('pointermove', function (event) {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      const over = event.target && event.target.closest &&
        event.target.closest('a, button, input, [role="slider"]');
      if (over) {
        hoverX = -1;
        stage.classList.remove('stage--inspect');
        return;
      }
      const box = stage.getBoundingClientRect();
      hoverX = event.clientX - box.left;
      hoverY = event.clientY - box.top;
      const base = stage.clientHeight - 40;
      const amp = stage.clientHeight * 0.44;
      const inBand = hoverY >= base - amp - 24 && hoverY <= base + 20;
      stage.classList.toggle('stage--inspect', inBand && inspectorLive());
    }, { passive: true });

    stage.addEventListener('pointerleave', function () {
      hoverX = -1;
      stage.classList.remove('stage--inspect');
    }, { passive: true });
  }

  /* ---------------- ring: still frame around the cover ---------------- */

  function drawRing() {
    const w = plate.clientWidth;
    const h = plate.clientHeight;
    if (w < 8 || h < 8) return;
    ringCtx.clearRect(0, 0, w, h);
    ringCtx.beginPath();
    ringCtx.ellipse(w / 2, h / 2, Math.max(8, w / 2 - 8), Math.max(8, h / 2 - 8), 0, 0, Math.PI * 2);
    ringCtx.strokeStyle = 'rgba(236, 238, 240, 0.22)';
    ringCtx.lineWidth = 1.25;
    ringCtx.stroke();
  }

  function playingNow() {
    return !!(audio && !audio.paused && !audio.ended);
  }

  function drawStatic() {
    drawRing();
    drawSpectrum(false);
  }

  // The loop runs only while sound is actually playing (or in demo mode); a
  // resting page draws its ring and grid once and schedules nothing.
  // Reduced-motion visitors keep the still frame even during playback.
  function drawFrame(nowMs) {
    raf = 0;
    const live = !reduceMotion && (demoMode || (analyser && playingNow()));
    if (!live) {
      drawStatic();
      return;
    }
    sampleSpectrum(nowMs || 0);
    drawSpectrum(true);
    raf = window.requestAnimationFrame(drawFrame);
  }

  function start() {
    if (!raf) raf = window.requestAnimationFrame(drawFrame);
  }

  function stop() {
    if (demoMode) return;
    if (raf) {
      window.cancelAnimationFrame(raf);
      raf = 0;
    }
    drawStatic();
  }

  function sizeCanvasesAndRedraw() {
    sizeCanvases();
    // Resizing wipes the bitmaps; the running loop repaints the spectrum on
    // its own, but the ring is out of the loop and a resting page needs its
    // still frame back either way.
    drawRing();
    if (!raf) drawSpectrum(false);
  }

  applyPlate(trackByTitle(titleEl ? titleEl.textContent.trim() : ''));
  sizeCanvases();
  drawStatic();
  window.addEventListener('resize', sizeCanvasesAndRedraw, { passive: true });
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(sizeCanvasesAndRedraw).observe(plate);
    new ResizeObserver(sizeCanvasesAndRedraw).observe(stage);
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

  if (demoMode && specCanvas) {
    specCanvas.style.opacity = '1';
    if (!reduceMotion) start();
  }
})();
