/* One-shot reveals for project pages. Shared header motion lives in page-motion.js. */
(function () {
  'use strict';
  const revealables = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!revealables.length) return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer = null;

  function configureReveals() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }

    if ((reduced && reduced.matches) || !('IntersectionObserver' in window)) {
      revealables.forEach(element => element.classList.add('is-in'));
      return;
    }

    const pending = revealables.filter(element => !element.classList.contains('is-in'));
    if (!pending.length) return;
    const activeObserver = new IntersectionObserver(entries => {
      // Ignore callbacks queued before a motion-preference change.
      if (observer !== activeObserver) return;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        activeObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0.05 });
    observer = activeObserver;
    pending.forEach(element => observer.observe(element));
  }

  configureReveals();
  if (reduced && reduced.addEventListener) {
    reduced.addEventListener('change', configureReveals);
  }
})();
