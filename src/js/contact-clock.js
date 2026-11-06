(function () {
  /* Owns winding, hands, the daylight face, the crown and the caption. Load
     only one contact-clock controller per page. contact.html has a caption
     whose time line keeps its place while winding, plus a third line
     ([data-cap-you]) for a visitor on another clock; the contact-wind review
     page keeps the older line, which [data-cap-preview] replaces while
     winding (contact-actions writes its resting time). */
  const MAX_OFFSET = 24 * 60;
  /* After a pointer lets go, the preview holds long enough to read the
     caption a thumb was covering, then winds back. */
  const HOLD_TOUCH = 2200;
  const HOLD_MOUSE = 1000;
  const root = document.querySelector('[data-time-root]');
  const svg = document.querySelector('.ck__dial');
  const ticks = document.querySelector('[data-ticks]');
  const hourHand = document.querySelector('[data-hand="hour"]');
  const minuteHand = document.querySelector('[data-hand="minute"]');
  const secondHand = document.querySelector('[data-hand="second"]');
  const knurl = document.querySelector('[data-knurl]');
  const skyCore = document.querySelector('[data-sky="core"]');
  const skyEdge = document.querySelector('[data-sky="edge"]');
  const capTime = document.querySelector('[data-cap-time]');
  const capHm = document.querySelector('[data-cap-hm]');
  const capZone = document.querySelector('[data-cap-zone]');
  const capWhere = document.querySelector('[data-cap-where]');
  const capNow = document.querySelector('[data-cap-now]');
  const capPreview = document.querySelector('[data-cap-preview]');
  const capYou = document.querySelector('[data-cap-you]');
  if (!root || !svg) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const restingWhere = capWhere ? capWhere.textContent : '';

  const { timeParts, utcOffset, sunAltitude, phaseName, setHand, addTicks } = PortfolioClockFace;
  addTicks(svg, ticks);

  let offsetMinutes = 0;
  let scrubbing = false;
  let activePointer = null;
  let lastPointerAngle = 0;
  let lastRatchetStep = 0;
  let snapRaf = 0;
  let holdTimer = 0;
  let audio = null;
  let clickNoise = null;

  function previewing() {
    return scrubbing || Math.abs(offsetMinutes) >= 1;
  }

  /* ---- sound: 12 ms of decaying noise through a band-pass is a ratchet
     click; the full hour lands lower and a touch louder. Only ever while the
     user is turning. ---- */

  function ensureAudio() {
    if (reducedMotion.matches || audio) return;
    try {
      audio = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {
      audio = null;
    }
  }

  function noiseBuffer() {
    if (!clickNoise) {
      const length = Math.floor(audio.sampleRate * 0.012);
      const buffer = audio.createBuffer(1, length, audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
      clickNoise = buffer;
    }
    return clickNoise;
  }

  function tickSound(strong) {
    if (!audio || reducedMotion.matches) return;
    let source;
    let band;
    let gain;
    function disconnect() {
      if (source) {
        source.onended = null;
        try { source.disconnect(); } catch (_) {}
      }
      if (band) { try { band.disconnect(); } catch (_) {} }
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
      source = audio.createBufferSource();
      band = audio.createBiquadFilter();
      gain = audio.createGain();
      source.buffer = noiseBuffer();
      band.type = 'bandpass';
      band.frequency.value = strong ? 1700 : 3400;
      band.Q.value = strong ? 5 : 9;
      gain.gain.setValueAtTime(strong ? 0.6 : 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      source.connect(band).connect(gain).connect(audio.destination);
      source.onended = disconnect;
      source.start(t);
      source.stop(t + 0.045);
    } catch (_) {
      if (source) { try { source.stop(); } catch (_) {} }
      disconnect();
    }
  }

  /* ---- rendering ---- */

  /* Face light from the sun's altitude: 0 once it is 8 deg under the
     horizon, 1 once it is 6 deg above, eased in between. */
  function daylight(alt) {
    const x = Math.min(1, Math.max(0, (alt + 8) / 14));
    return x * x * (3 - 2 * x);
  }

  /* "3 h 10 min" for the caption, "3 hours 10 minutes" for ARIA. */
  function span(mins, words) {
    const h = Math.floor(Math.abs(mins) / 60);
    const m = Math.abs(mins) % 60;
    if (words) return [h ? h + (h === 1 ? ' hour' : ' hours') : '', m ? m + ' minutes' : ''].filter(Boolean).join(' ');
    return h ? h + ' h' + (m ? ' ' + m + ' min' : '') : m + ' min';
  }

  /* The wound offset to the nearest five minutes: "in 3 h 10 min", "2 h ago". */
  function offsetLabel(mins, words) {
    const rounded = Math.round(Math.abs(mins) / 5) * 5;
    if (!rounded) return 'now';
    return mins >= 0 ? 'in ' + span(rounded, words) : span(rounded, words) + ' ago';
  }

  /* Minutes Graz is ahead of the visitor's own clock (negative: behind),
     from the device's time zone in the browser; nothing leaves the page.
     Without Intl there is no answer, so the visitor's line stays hidden. */
  function gapMinutes(ms) {
    const graz = utcOffset(ms);
    return graz === null ? 0 : graz + new Date(ms).getTimezoneOffset();
  }

  function gapLabel(gap, words) {
    return span(gap, words) + (gap > 0 ? ' ahead of you' : ' behind you');
  }

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function render() {
    const now = Date.now();
    const ms = now + offsetMinutes * 60000;
    const t = timeParts(new Date(ms));
    const active = previewing();
    setHand(hourHand, (t.hour % 12) * 30 + t.minute * 0.5);
    setHand(minuteHand, t.minute * 6 + t.second * 0.1);
    /* A frozen second hand reads as a stopped clock, so it hides while the
       preview is wound away from now. */
    if (secondHand) {
      if (reducedMotion.matches || active) {
        secondHand.setAttribute('visibility', 'hidden');
      } else {
        secondHand.removeAttribute('visibility');
        setHand(secondHand, t.second * 6);
      }
    }

    /* The face carries the daylight over Graz at the time it shows. Light is
       a state, not an animation, so reduced motion keeps it. */
    const phase = phaseName(ms);
    const light = daylight(sunAltitude(ms));
    if (skyCore) skyCore.setAttribute('stop-opacity', (light * 0.16).toFixed(3));
    if (skyEdge) skyEdge.setAttribute('stop-opacity', (light * 0.045).toFixed(3));
    root.setAttribute('data-phase', phase);
    root.classList.toggle('ck--preview', active);

    /* The knurl slides a groove's width (1.6 units) every sixteen minutes of winding. */
    if (knurl) {
      const shift = ((offsetMinutes * 0.1) % 1.6 + 1.6) % 1.6;
      knurl.setAttribute('transform', 'translate(' + shift.toFixed(2) + ' 0)');
    }

    const hm = pad(t.hour) + ':' + pad(t.minute);
    const away = offsetLabel(offsetMinutes);
    if (capHm) capHm.textContent = hm;
    if (capZone) capZone.textContent = t.zone;
    if (capTime) capTime.setAttribute('datetime', hm);
    if (capWhere) capWhere.textContent = active ? away + ' · ' + phase : restingWhere;
    if (capNow) capNow.hidden = active;
    if (capPreview) {
      capPreview.hidden = !active;
      capPreview.textContent = active ? hm + ' in Graz · ' + away + ' · ' + phase : '';
    }

    /* The visitor's line, only when their clock is not on Graz time: how far
       Graz is from it at rest ("9 h ahead of you"), their own time at the
       previewed moment while winding ("13:25 your time"). The dial speaks it too. */
    const gap = capYou ? gapMinutes(now) : 0;
    let you = '';
    let youWords = '';
    if (gap) {
      const local = new Date(ms);
      you = active ? pad(local.getHours()) + ':' + pad(local.getMinutes()) + ' your time' : gapLabel(gap);
      youWords = active ? you : gapLabel(gap, true);
    }
    if (capYou) {
      capYou.hidden = !gap;
      capYou.textContent = you;
    }
    svg.setAttribute('aria-valuenow', String(Math.round(offsetMinutes / 60)));
    svg.setAttribute('aria-valuetext', hm + ' in Graz, ' + (active ? offsetLabel(offsetMinutes, true) + ', ' + phase : 'now') +
      (youWords ? ', ' + youWords : ''));
  }

  function setOffset(next, ratchet) {
    offsetMinutes = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, next));
    if (ratchet) {
      /* One click per half hour of winding, a deeper one on the full hour. */
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
    if (holdTimer) window.clearTimeout(holdTimer);
    holdTimer = 0;
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
    /* Only a deliberate lift holds the preview. A pointercancel (the browser
       took the gesture as a scroll) or a capture lost without a lift goes
       home at once. */
    if (event.type !== 'pointerup' || Math.abs(offsetMinutes) < 1) {
      snapBack();
      return;
    }
    render();
    holdTimer = window.setTimeout(snapBack, event.pointerType === 'mouse' ? HOLD_MOUSE : HOLD_TOUCH);
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
