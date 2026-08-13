(function () {
  const ZONE = 'Europe/Vienna';
  const root = document.querySelector('[data-time-root]');
  const svg = document.querySelector('.ck__dial');
  const ticks = document.querySelector('[data-ticks]');
  const hourHand = document.querySelector('[data-hand="hour"]');
  const minuteHand = document.querySelector('[data-hand="minute"]');
  const secondHand = document.querySelector('[data-hand="second"]');
  if (!root) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const partsFmt = (function () {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: ZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
      });
    } catch (_) {
      return null;
    }
  })();

  function partNumber(now, type) {
    if (!partsFmt) {
      if (type === 'hour') return now.getHours();
      if (type === 'minute') return now.getMinutes();
      return now.getSeconds();
    }
    const part = partsFmt.formatToParts(now).find(function (item) { return item.type === type; });
    return part ? Number(part.value) : 0;
  }

  function phaseName(hour) {
    if (hour < 5 || hour >= 22) return 'night';
    if (hour < 8) return 'dawn';
    if (hour >= 17) return 'dusk';
    return 'day';
  }

  function setHand(node, angle) {
    if (!node) return;
    node.setAttribute('transform', 'rotate(' + angle.toFixed(2) + ' 50 50)');
  }

  if (ticks && svg && !ticks.childElementCount) {
    const ns = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < 60; i += 1) {
      const hour = i % 5 === 0;
      const angle = (i * 6) * Math.PI / 180;
      const inner = hour ? 39 : 43.5;
      const outer = 46.5;
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', (50 + Math.sin(angle) * inner).toFixed(2));
      line.setAttribute('y1', (50 - Math.cos(angle) * inner).toFixed(2));
      line.setAttribute('x2', (50 + Math.sin(angle) * outer).toFixed(2));
      line.setAttribute('y2', (50 - Math.cos(angle) * outer).toFixed(2));
      line.setAttribute('class', hour ? 'ck__tick ck__tick--hour' : 'ck__tick');
      ticks.appendChild(line);
    }
  }

  if (reduceMotion && secondHand) secondHand.setAttribute('visibility', 'hidden');

  function tick() {
    const now = new Date();
    const hour = partNumber(now, 'hour');
    const minute = partNumber(now, 'minute');
    const second = partNumber(now, 'second');
    setHand(hourHand, (hour % 12) * 30 + minute * 0.5);
    setHand(minuteHand, minute * 6 + second * 0.1);
    if (!reduceMotion) setHand(secondHand, second * 6);
    root.setAttribute('data-phase', phaseName(hour));
  }

  tick();
  window.setInterval(tick, reduceMotion ? 15000 : 1000);
})();
