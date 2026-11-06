/* Warm same-origin HTML documents on hover, touch or keyboard focus.
   Unsupported browsers and restricted connections keep ordinary navigation;
   each document URL is warmed at most once per pageview. */
(function () {
  var probe = document.createElement('link');
  if (!probe.relList || !probe.relList.supports || !probe.relList.supports('prefetch')) return;

  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var warmed = new Set();

  function prefetchable(anchor) {
    if (!anchor || anchor.origin !== window.location.origin) return null;
    // A root path beginning // becomes a foreign host when used as an href.
    // Skip speculative loading; the original link still navigates normally.
    if (anchor.pathname.startsWith('//')) return null;
    if (anchor.hasAttribute('download') || anchor.target.toLowerCase() === '_blank') return null;
    // Documents only: media and the CV PDF are too heavy to fetch on a guess.
    if (!/(\.html|\/)$/.test(anchor.pathname)) return null;
    var url = anchor.pathname + anchor.search;
    if (url === window.location.pathname + window.location.search || warmed.has(url)) return null;
    return url;
  }

  function warm(event) {
    // A connection can become restricted or recover without a page reload.
    if (connection && (connection.saveData || /^(slow-2g|2g|3g)$/.test(connection.effectiveType || ''))) return;
    var target = event.target instanceof Element ? event.target.closest('a[href]') : null;
    var url = prefetchable(target);
    if (!url) return;
    warmed.add(url);
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'document';
    link.href = url;
    document.head.appendChild(link);
  }

  document.addEventListener('mouseover', warm, { passive: true });
  document.addEventListener('touchstart', warm, { passive: true });
  document.addEventListener('focusin', warm);
})();
