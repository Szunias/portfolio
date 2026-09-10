/* One-shot project reveals; ordinary markup stays visible without motion. */
(function () {
  var revealables = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (!revealables.length) return;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var revealObserver;

  function revealAll() {
    if (revealObserver) revealObserver.disconnect();
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  if ((reduced && reduced.matches) || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0.05 });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }
  if (reduced) reduced.addEventListener('change', function () {
    // Reveals are one-shot: restoring motion must not hide content again.
    if (reduced.matches) revealAll();
  });
})();
