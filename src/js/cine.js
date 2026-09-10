/* One-shot project reveals and a reading-progress indicator.
   Both enhance ordinary markup; reduced motion keeps that content visible. */
(function () {
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var revealables = [].slice.call(document.querySelectorAll('[data-reveal]'));
  var revealObserver;

  function revealAll() {
    if (revealObserver) revealObserver.disconnect();
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  if (revealables.length) {
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
  }

  var bar = document.querySelector('[data-progress]');
  var ticking = false;

  function scheduleProgress() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      var doc = document.documentElement;
      if (bar) {
        var max = doc.scrollHeight - window.innerHeight;
        var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        bar.style.setProperty('--progress', ratio.toFixed(4));
      }
      doc.toggleAttribute('data-scrolled', window.scrollY > window.innerHeight * 0.6);
    });
  }

  if (bar || document.querySelector('[data-cine]')) {
    window.addEventListener('scroll', scheduleProgress, { passive: true });
    window.addEventListener('resize', scheduleProgress, { passive: true });
    window.addEventListener('load', scheduleProgress);
    // Lazy media can change the denominator without another scroll event.
    if (typeof ResizeObserver === 'function') {
      new ResizeObserver(scheduleProgress).observe(document.documentElement);
    }
    scheduleProgress();
  }
})();
