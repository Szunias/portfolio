/* Warm same-origin documents on deliberate navigation intent. */
(function () {
  'use strict';
  const probe = document.createElement('link');
  if (!probe.relList || !probe.relList.supports || !probe.relList.supports('prefetch')) return;

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const warmed = new Set();

  function allowed() {
    return !connection || !(connection.saveData || /^(slow-2g|2g|3g)$/.test(connection.effectiveType || ''));
  }

  function prefetchable(anchor) {
    if (!anchor || anchor.origin !== window.location.origin) return null;
    if (anchor.hasAttribute('download') || (anchor.target && anchor.target.toLowerCase() !== '_self')) return null;
    // Documents only: media and the CV PDF are too heavy to fetch on a guess.
    if (!/(\.html|\/)$/.test(anchor.pathname)) return null;
    // Query strings identify different documents; fragments do not.
    const url = anchor.pathname + anchor.search;
    const current = window.location.pathname + window.location.search;
    return url === current || warmed.has(url) ? null : url;
  }

  function warm(event) {
    // Recheck preferences when the interaction happens, not only at page load.
    if (!allowed()) return;
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    const url = prefetchable(anchor);
    if (!url) return;
    warmed.add(url);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'document';
    link.href = url;
    document.head.appendChild(link);
  }

  document.addEventListener('mouseover', warm, { passive: true });
  document.addEventListener('touchstart', warm, { passive: true });
  document.addEventListener('focusin', warm);
})();
