/* Warm same-origin pages before they are clicked.
   The site is static HTML on a CDN, so the whole cost of a navigation is one
   small document fetch; starting it on hover or first touch makes the click
   land on a warm cache. Safari has no prefetch support and fails the relList
   check, metered and slow connections opt out, and every URL is fetched at
   most once per pageview. */
(function () {
  var probe = document.createElement('link');
  if (!probe.relList || !probe.relList.supports || !probe.relList.supports('prefetch')) return;

  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection && (connection.saveData || /(^|\b)(slow-2g|2g|3g)$/.test(connection.effectiveType || ''))) return;

  var warmed = {};

  function prefetchable(anchor) {
    if (!anchor || anchor.origin !== window.location.origin) return null;
    if (anchor.hasAttribute('download') || anchor.target === '_blank') return null;
    // Documents only: media and the CV PDF are too heavy to fetch on a guess.
    if (!/(\.html|\/)$/.test(anchor.pathname)) return null;
    var url = anchor.pathname;
    if (url === window.location.pathname || warmed[url]) return null;
    return url;
  }

  function warm(event) {
    var target = event.target instanceof Element ? event.target.closest('a[href]') : null;
    var url = prefetchable(target);
    if (!url) return;
    warmed[url] = true;
    var link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'document';
    link.href = url;
    document.head.appendChild(link);
  }

  // mouseover covers pointer hover; touchstart fires early enough on phones
  // to buy ~100ms before the synthetic click completes.
  document.addEventListener('mouseover', warm, { passive: true });
  document.addEventListener('touchstart', warm, { passive: true });
})();
