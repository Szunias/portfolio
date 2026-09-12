(function () {
  /* Owns winding, hands and captions. Load only one contact-clock controller
     per page; contact-actions writes to its separate local-time span. */
  const MAX_OFFSET = 24 * 60;
  const root = document.querySelector('[data-time-root]');
  const svg = document.querySelector('.ck__dial');
  const ticks = document.querySelector('[data-ticks]');
  const hourHand = document.querySelector('[data-hand="hour"]');
  const minuteHand = document.querySelector('[data-hand="minute"]');
  const secondHand = document.querySelector('[data-hand="second"]');
  const capNow = document.querySelector('[data-cap-now]');
  const capPreview = document.querySelector('[data-cap-preview]');
  if (!root || !svg) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const { partNumber, phaseName, setHand, addTicks } = PortfolioClockFace;
  addTicks(svg, ticks);

  let offsetMinutes = 0;
  let scrubbing = false;
  let activePointer = null;
  let lastPointerAngle = 0;
  let lastRatchetStep = 0;
  let snapRaf = 0;
  let audio = null;

  function previewing() {
    return scrubbing || Math.abs(offsetMinutes) >= 1;
  }

  /* ---- sound: a short decaying sine is a soft ratchet tick; the hour step
     lands lower and a touch louder. Only ever while the user is turning. ---- */

  function ensureAudio() {
    if (reducedMotion.matches || audio) return;
    try {
      audio = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {
      audio = null;
    }
  }

  function tickSound(strong) {
    if (!audio || reducedMotion.matches) return;
    let osc;
    let gain;
    function disconnect() {
      if (osc) {
        osc.onended = null;
        try { osc.disconnect(); } catch (_) {}
      }
      if (gain) { try { gain.disconnect(); } catch (_) {} }
    }
    try {
      // A suspended context must not collect ticks that all sound on resume.
      // Sound is optional; blocked audio must never interrupt winding or ARIA.
      if (audio.state === 'suspended' || audio.state === 'interrupted') {
        audio.resume().catch(function () {});
        return;
      }
      if (audio.state !== 'running') return;
      const t = audio.currentTime;
      osc = audio.createOscillator();
      gain = audio.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(strong ? 950 : 1900, t);
      gain.gain.setValueAtTime(strong ? 0.07 : 0.045, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      osc.connect(gain).connect(audio.destination);
      osc.onended = disconnect;
      osc.start(t);
      osc.stop(t + 0.06);
    } catch (_) {
      if (osc) { try { osc.stop(); } catch (_) {} }
      disconnect();
    }
  }

  /* ---- rendering ---- */

  function offsetLabel(mins) {
    const rounded = Math.round(Math.abs(mins) / 5) * 5;
    const h = Math.floor(rounded / 60);
    const m = rounded % 60;
    const span = h ? h + ' h' + (m ? ' ' + m + ' min' : '') : m + ' min';
    return mins >= 0 ? 'in ' + span : span + ' ago';
  }

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function render() {
    const date = new Date(Date.now() + offsetMinutes * 60000);
    const hour = partNumber(date, 'hour');
    const minute = partNumber(date, 'minute');
    const second = partNumber(date, 'second');
    const active = previewing();
    setHand(hourHand, (hour % 12) * 30 + minute * 0.5);
    setHand(minuteHand, minute * 6 + second * 0.1);
    /* A frozen second hand reads as a stopped clock, so it hides while the
       preview is wound away from now. */
    if (secondHand) {
      if (reducedMotion.matches || active) {
        secondHand.setAttribute('visibility', 'hidden');
      } else {
        secondHand.removeAttribute('visibility');
        setHand(secondHand, second * 6);
      }
    }
    root.setAttribute('data-phase', phaseName(hour));

    const label = pad(hour) + ':' + pad(minute) + ' in Graz · ' + offsetLabel(offsetMinutes) + ' · ' + phaseName(hour);
    if (capNow) capNow.hidden = active;
    if (capPreview) {
      capPreview.hidden = !active;
      capPreview.textContent = active ? label : '';
    }
    svg.setAttribute('aria-valuenow', String(Math.round(offsetMinutes / 60)));
    svg.setAttribute('aria-valuetext', active ? label : 'now');
  }

  function setOffset(next, ratchet) {
    offsetMinutes = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, next));
    if (ratchet) {
      /* One tick per half hour of winding, a deeper one on the full hour. */
      const step = Math.floor(offsetMinutes / 30);
      if (step !== lastRatchetStep) {
        tickSound(step % 2 === 0);
        lastRatchetStep = step;
      }
    }
    render();
  }

  /* ---- pointer winding: the dial is a crown, one turn is twelve hours ---- */

  function pointerAngle(event) {
    const box = svg.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    return Math.atan2(dx, -dy) * 180 / Math.PI;
  }

  function stopSnap() {
    if (snapRaf) window.cancelAnimationFrame(snapRaf);
    snapRaf = 0;
  }

  function snapBack() {
    stopSnap();
    if (reducedMotion.matches || Math.abs(offsetMinutes) < 1) {
      setOffset(0, false);
      return;
    }
    const from = offsetMinutes;
    const start = performance.now();
    const duration = Math.min(600, 200 + Math.abs(from) / 6);
    function frame(ts) {
      const q = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - q, 3);
      setOffset(from * (1 - eased), false);
      snapRaf = q < 1 ? window.requestAnimationFrame(frame) : 0;
    }
    snapRaf = window.requestAnimationFrame(frame);
  }

  svg.addEventListener('pointerdown', function (event) {
    if (!event.isPrimary || activePointer !== null || (event.button !== 0 && event.pointerType === 'mouse')) return;
    activePointer = event.pointerId;
    scrubbing = true;
    stopSnap();
    lastPointerAngle = pointerAngle(event);
    lastRatchetStep = Math.floor(offsetMinutes / 30);
    svg.focus({ preventScroll: true });
    try { svg.setPointerCapture(event.pointerId); } catch (_) { /* capture is optional */ }
    root.classList.add('ck--scrubbing');
    ensureAudio();
    render();
    event.preventDefault();
  });

  svg.addEventListener('pointermove', function (event) {
    if (!scrubbing || event.pointerId !== activePointer) return;
    const angle = pointerAngle(event);
    let delta = angle - lastPointerAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastPointerAngle = angle;
    /* The pointer drives the hour hand: 30 degrees to the hour, so one
       degree of turn is two minutes of preview. */
    setOffset(offsetMinutes + delta * 2, true);
  });

  function release(event) {
    if (!scrubbing || event.pointerId !== activePointer) return;
    activePointer = null;
    scrubbing = false;
    try { svg.releasePointerCapture(event.pointerId); } catch (_) { /* capture may already be lost */ }
    root.classList.remove('ck--scrubbing');
    snapBack();
  }

  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);
  svg.addEventListener('lostpointercapture', release);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  /* ---- keyboard winding: an hour per arrow, Escape or Home rewinds ---- */

  svg.addEventListener('keydown', function (event) {
    let step = 0;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') step = 60;
    if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') step = -60;
    if (step) {
      event.preventDefault();
      stopSnap();
      ensureAudio();
      lastRatchetStep = Math.floor(offsetMinutes / 30);
      setOffset(offsetMinutes + step, true);
      return;
    }
    if (event.key === 'Escape' || event.key === 'Home') {
      event.preventDefault();
      snapBack();
    }
  });

  svg.addEventListener('blur', function () {
    if (!scrubbing) snapBack();
  });

  let clockTimer = 0;
  function syncMotion() {
    // Finish only an active rewind; preserve a deliberately selected offset.
    if (reducedMotion.matches && snapRaf) snapBack();
    window.clearInterval(clockTimer);
    render();
    clockTimer = window.setInterval(render, reducedMotion.matches ? 15000 : 1000);
  }
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
})();
