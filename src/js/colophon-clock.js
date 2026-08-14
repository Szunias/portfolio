(function () {
  /* The Graz time in the site footer, pointing at the contact clock. A 30s
     cadence is enough for a minutes-only readout. */
  const outs = Array.from(document.querySelectorAll('[data-colophon-time]'));
  if (!outs.length) return;

  let fmt = null;
  try {
    fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Vienna',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    });
  } catch (_) {}

  function tick() {
    const now = new Date();
    const label = fmt ? fmt.format(now) : now.toTimeString().slice(0, 5);
    outs.forEach(function (el) {
      el.textContent = label;
      el.setAttribute('datetime', label);
    });
  }

  tick();
  window.setInterval(tick, 30000);
})();
