(function () {
  const EMAIL = 'igorszuniewiczwork@gmail.com';
  // Graz: the caption next to the readout names the city, and the footer
  // clock (colophon-clock.js) reads the same zone, so the two never disagree.
  const ZONE = 'Europe/Vienna';
  const TOPICS = {
    game: 'Game audio',
    vr: 'Spatial and VR sound',
    tools: 'Audio tools',
    music: 'Music'
  };

  const links = Array.from(document.querySelectorAll('[data-mail-link]'));
  const topics = Array.from(document.querySelectorAll('[data-topic]'));
  const note = document.querySelector('[data-mail-note]');
  const copyBtn = document.querySelector('[data-copy-mail]');
  const copyStatus = document.querySelector('[data-copy-status]');
  const subjectOut = document.querySelector('[data-preview-subject]');
  const noteOut = document.querySelector('[data-preview-note]');
  const clockOuts = Array.from(document.querySelectorAll('[data-local-time]'));
  const hero = document.querySelector('[data-spot-root]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let topic = '';
  let copyTimer = 0;

  const timeFmt = (function () {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZoneName: 'short'
      });
    } catch (_) {
      return null;
    }
  })();

  const isoFmt = (function () {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      });
    } catch (_) {
      return null;
    }
  })();

  function mailHref() {
    const params = [];
    if (topic && TOPICS[topic]) params.push('subject=' + encodeURIComponent(TOPICS[topic]));
    const line = note && note.value.trim();
    if (line) params.push('body=' + encodeURIComponent(line));
    return 'mailto:' + EMAIL + (params.length ? '?' + params.join('&') : '');
  }

  function syncMail() {
    const href = mailHref();
    links.forEach(function (el) { el.setAttribute('href', href); });
    if (subjectOut) subjectOut.textContent = (topic && TOPICS[topic]) || 'No subject yet';
    if (noteOut) {
      const line = note && note.value.trim();
      noteOut.textContent = line || 'No note yet';
    }
    document.documentElement.setAttribute('data-ca-topic', topic || 'none');
  }

  function setTopic(next) {
    topic = topic === next ? '' : next;
    topics.forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.topic === topic));
    });
    syncMail();
  }

  function tickClock() {
    const now = new Date();
    let label = '';
    if (timeFmt) {
      label = timeFmt.format(now).replace(',', '');
    } else {
      label = now.toTimeString().slice(0, 5);
    }
    let iso = '';
    if (isoFmt) {
      const parts = isoFmt.formatToParts(now);
      const get = function (type) {
        const part = parts.find(function (item) { return item.type === type; });
        return part ? part.value : '';
      };
      iso = get('year') + '-' + get('month') + '-' + get('day') + 'T' + get('hour') + ':' + get('minute');
    }
    clockOuts.forEach(function (el) {
      if (el.tagName === 'TIME' && iso) el.dateTime = iso;
      el.textContent = label;
    });
  }

  function copied(ok) {
    if (!copyStatus) return;
    copyStatus.textContent = ok ? 'Copied.' : 'Copy failed. Select the address instead.';
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(function () { copyStatus.textContent = ''; }, 2400);
  }

  function copyAddress() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(function () { copied(true); }).catch(function () { copied(false); });
      return;
    }
    copied(false);
  }

  topics.forEach(function (btn) {
    btn.addEventListener('click', function () { setTopic(btn.dataset.topic || ''); });
  });

  if (note) note.addEventListener('input', syncMail);
  if (copyBtn) copyBtn.addEventListener('click', copyAddress);

  // There used to be a document-level keydown here: a bare "c" copied the
  // address and "1"-"4" picked a topic wherever focus rested. Nothing on any
  // contact page announced those keys, and single-character shortcuts with
  // no modifier and no way to turn them off are exactly what WCAG 2.1.4
  // forbids (a voice-input user saying a word that starts with "c" would
  // silently overwrite their clipboard). The buttons do the same work with
  // Enter and Space, so the shortcuts are gone rather than gated.

  if (hero && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (event) {
      const box = hero.getBoundingClientRect();
      if (!box.width || !box.height) return;
      hero.style.setProperty('--spot-x', ((event.clientX - box.left) / box.width * 100).toFixed(2) + '%');
      hero.style.setProperty('--spot-y', ((event.clientY - box.top) / box.height * 100).toFixed(2) + '%');
    });
    hero.addEventListener('pointerleave', function () {
      hero.style.removeProperty('--spot-x');
      hero.style.removeProperty('--spot-y');
    });
  }

  tickClock();
  window.setInterval(tickClock, 15000);
  syncMail();
})();
