/* Shared contact-clock face. Controllers own timers, motion and interaction state. */
const PortfolioClockFace = (function () {
  /* Graz: the zone sets the hands, the coordinates set the sun that names
     the phase of the day. */
  const ZONE = 'Europe/Vienna';
  const LAT = 47.07;
  const LON = 15.44;
  const partsFmt = (function () {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: ZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
        timeZoneName: 'short'
      });
    } catch (_) {
      return null;
    }
  })();

  const wallFmt = (function () {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
      });
    } catch (_) {
      return null;
    }
  })();

  /* Hour, minute and second in Graz plus the zone name (CET or CEST), read
     from one formatter call. Without Intl the device clock stands in. */
  function timeParts(now) {
    const out = { hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds(), zone: '' };
    if (!partsFmt) return out;
    partsFmt.formatToParts(now).forEach(function (part) {
      if (part.type === 'hour') out.hour = Number(part.value) % 24;
      else if (part.type === 'minute') out.minute = Number(part.value);
      else if (part.type === 'second') out.second = Number(part.value);
      else if (part.type === 'timeZoneName') out.zone = part.value;
    });
    return out;
  }

  /* Minutes Graz is ahead of UTC at a timestamp (60 in CET, 120 in CEST):
     its wall clock read back as if it were UTC. Null without Intl. */
  function utcOffset(ms) {
    if (!wallFmt) return null;
    const wall = {};
    wallFmt.formatToParts(new Date(ms)).forEach(function (part) { wall[part.type] = Number(part.value); });
    const asUtc = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour % 24, wall.minute, wall.second);
    return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000);
  }

  /* Sun altitude over Graz in degrees at a timestamp (ms). A low-precision
     solar position (about 0.01 deg) is plenty for a face that brightens
     between dawn and dusk. */
  function sunAltitude(ms) {
    const rad = Math.PI / 180;
    const d = (ms - 946728000000) / 86400000;            // days since J2000.0
    const g = (357.529 + 0.98560028 * d) * rad;          // mean anomaly
    const q = 280.459 + 0.98564736 * d;                  // mean longitude
    const L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad;
    const e = (23.439 - 0.00000036 * d) * rad;           // obliquity
    const dec = Math.asin(Math.sin(e) * Math.sin(L));
    const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
    const gmst = (280.46061837 + 360.98564736629 * d) * rad;
    const ha = gmst + LON * rad - ra;
    const lat = LAT * rad;
    return Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha)) / rad;
  }

  /* Day while the sun is up, night once it is 6 deg under the horizon. Civil
     twilight between is dawn or dusk; the next ten minutes say which. */
  function phaseName(ms) {
    const alt = sunAltitude(ms);
    if (alt >= 0) return 'day';
    if (alt >= -6) return sunAltitude(ms + 600000) > alt ? 'dawn' : 'dusk';
    return 'night';
  }

  function setHand(node, angle) {
    if (!node) return;
    node.setAttribute('transform', 'rotate(' + angle.toFixed(2) + ' 50 50)');
  }

  function addTicks(svg, ticks) {
    if (!ticks || !svg || ticks.childElementCount) return;
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

  return Object.freeze({ timeParts, utcOffset, sunAltitude, phaseName, setHand, addTicks });
})();
