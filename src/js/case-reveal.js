// Scroll reveals for case-template pages (.io-reveal -> .in)
(function() {
  var els = Array.prototype.slice.call(document.querySelectorAll('.io-reveal'));
  if (!els.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function(el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function(items) {
    items.forEach(function(item) {
      if (!item.isIntersecting) return;
      item.target.classList.add('in');
      io.unobserve(item.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach(function(el) { io.observe(el); });
})();
