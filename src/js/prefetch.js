/* Warm eligible same-origin documents on hover, touch or keyboard focus. */
(function () {
  'use strict';

  const probe = document.createElement('link');
  if (!probe.relList || !probe.relList.supports || !probe.relList.supports('prefetch')) return;
  const warmed = new Set();

  function connectionAllowsPrefetch() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return !document.hidden && !(connection && (
      connection.saveData || /^(slow-2g|2g|3g)$/.test(connection.effectiveType || '')
    ));
  }

  function prefetchable(anchor) {
    if (!anchor || anchor.origin !== window.location.origin) return null;
    if (anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return null;
    // Documents only: media and the CV are too expensive to fetch speculatively.
    if (!/(\.html|\/)$/.test(anchor.pathname)) return null;
    const url = anchor.pathname + anchor.search;
    const current = window.location.pathname + window.location.search;
    if (url === current || warmed.has(url)) return null;
    return url;
  }

  function warm(event) {
    if (!connectionAllowsPrefetch()) return;
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
