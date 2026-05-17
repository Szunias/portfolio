// Scroll reveal
(function(){
  document.documentElement.classList.add('js');
  const reveals = Array.from(document.querySelectorAll('.reveal, .reveal-stagger'));
  if (!reveals.length) return;
  const revealed = new WeakSet();
  let observer = null;

  function show(el) {
    if (revealed.has(el)) return;
    el.classList.add('visible');
    revealed.add(el);
    if (observer) observer.unobserve(el);
  }

  function scanVisible() {
    const buffer = Math.max(160, window.innerHeight * 0.45);
    const revealLine = window.scrollY + window.innerHeight + buffer;
    reveals.forEach(el => {
      if (revealed.has(el)) return;
      const rect = el.getBoundingClientRect();
      const documentTop = rect.top + window.scrollY;
      if (documentTop < revealLine) {
        show(el);
      }
    });
  }

  let ticking = false;
  function scheduleScan() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      scanVisible();
    });
  }

  if (!('IntersectionObserver' in window)) {
    // Fallback: reveal everything at once
    reveals.forEach(show);
    return;
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        show(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 45% 0px' });
  reveals.forEach(el => observer.observe(el));
  window.addEventListener('scroll', scheduleScan, { passive: true });
  window.addEventListener('resize', scheduleScan, { passive: true });
  window.addEventListener('load', scheduleScan, { once: true });
  scanVisible();
})();
