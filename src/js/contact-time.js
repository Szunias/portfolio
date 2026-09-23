(function () {
  const root = document.querySelector('[data-time-root]');
  const svg = document.querySelector('.ck__dial');
  const ticks = document.querySelector('[data-ticks]');
  const hourHand = document.querySelector('[data-hand="hour"]');
  const minuteHand = document.querySelector('[data-hand="minute"]');
  const secondHand = document.querySelector('[data-hand="second"]');
  if (!root) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const { timeParts, phaseName, setHand, addTicks } = PortfolioClockFace;
  addTicks(svg, ticks);

  function tick() {
    const now = Date.now();
    const t = timeParts(new Date(now));
    setHand(hourHand, (t.hour % 12) * 30 + t.minute * 0.5);
    setHand(minuteHand, t.minute * 6 + t.second * 0.1);
    if (secondHand) {
      if (reducedMotion.matches) secondHand.setAttribute('visibility', 'hidden');
      else {
        secondHand.removeAttribute('visibility');
        setHand(secondHand, t.second * 6);
      }
    }
    root.setAttribute('data-phase', phaseName(now));
  }

  let clockTimer = 0;
  function syncMotion() {
    window.clearInterval(clockTimer);
    tick();
    clockTimer = window.setInterval(tick, reducedMotion.matches ? 15000 : 1000);
  }
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
})();
