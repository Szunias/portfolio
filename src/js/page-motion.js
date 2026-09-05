/* Native, one-shot motion. No scroll hijacking and no continuous render loop. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  var pending = false;
  function updateHeader() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
      if (hero) {
        var progress = reduced.matches || hero.classList.contains('is-started') ? 0 : Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
        hero.style.setProperty('--hero-scroll', progress.toFixed(3));
      }
    });
  }
  window.addEventListener('scroll', updateHeader, { passive:true });
  window.addEventListener('resize', updateHeader, { passive:true });
  updateHeader();

  var observer;
  var selectors = '.work-head, .wcard, .plist__group, .prow--tool, .music-cta, #about > h2, .about-panel, .closing, .cine-open, .cine > section > .cine-split__body, .cine > section > .cine-split__media, .cine-row > figure, .stage__plate, .stage__side, .library .section-heading, .ck__plate, .ck__side';
  function enableMotion() {
    if (reduced.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-enter');
        observer.unobserve(entry.target);
      });
    }, { threshold:0, rootMargin:'0px 0px -24px 0px' });
    document.querySelectorAll(selectors).forEach(function (element) {
      observer.observe(element);
    });
    document.querySelectorAll('.hero__line').forEach(function (line, index) {
      line.style.animationDelay = (index * 90) + 'ms';
      line.classList.add('motion-line');
    });
  }
  enableMotion();
  reduced.addEventListener('change', function () {
    updateHeader();
    if (observer) observer.disconnect();
    document.querySelectorAll('.motion-enter,.motion-line').forEach(function (el) {
      el.classList.remove('motion-enter','motion-line');
    });
    if (!reduced.matches) enableMotion();
  });
})();
