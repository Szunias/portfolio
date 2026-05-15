// Scroll reveal
(function(){
  document.documentElement.classList.add('js');
  const reveals = document.querySelectorAll('.reveal, .reveal-stagger');
  if (!reveals.length) return;
  if (!('IntersectionObserver' in window)) {
    // Fallback: reveal everything at once
    reveals.forEach(el => el.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 45% 0px' });
  reveals.forEach(el => observer.observe(el));
})();
