(function () {
  const root = document.querySelector('[data-time-root]');
  const svg = document.querySelector('.ck__dial');
  const ticks = document.querySelector('[data-ticks]');
  const hourHand = document.querySelector('[data-hand="hour"]');
  const minuteHand = document.querySelector('[data-hand="minute"]');
  const secondHand = document.querySelector('[data-hand="second"]');
  if (!root) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const { partNumber, phaseName, setHand, addTicks } = PortfolioClockFace;
  addTicks(svg, ticks);

  function tick() {
    const now = new Date();
    const hour = partNumber(now, 'hour');
    const minute = partNumber(now, 'minute');
    const second = partNumber(now, 'second');
    setHand(hourHand, (hour % 12) * 30 + minute * 0.5);
    setHand(minuteHand, minute * 6 + second * 0.1);
    if (secondHand) {
      if (reducedMotion.matches) secondHand.setAttribute('visibility', 'hidden');
      else {
        secondHand.removeAttribute('visibility');
        setHand(secondHand, second * 6);
      }
    }
    root.setAttribute('data-phase', phaseName(hour));
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
