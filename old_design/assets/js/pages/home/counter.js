// CRITICAL FIX: Track observers for cleanup
window.__indexPageObservers = window.__indexPageObservers || [];

function animateCounter(element) {
  const target = Number.parseInt(element.getAttribute('data-count'), 10);
  if (!Number.isFinite(target)) return;

  const prefix = element.getAttribute('data-prefix') || '';
  const suffix = element.getAttribute('data-suffix') || '';
  const duration = 2000;
  const steps = 60;
  const increment = target / steps;

  let current = 0;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = `${prefix}${Math.floor(current)}${suffix}`;
  }, duration / steps);
}

export function initCounters() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.classList.contains('counted')) return;
        entry.target.classList.add('counted');
        animateCounter(entry.target);
        // CRITICAL FIX: Unobserve after animation starts to prevent unnecessary checks
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  // CRITICAL FIX: Track observer for cleanup
  window.__indexPageObservers.push(observer);

  document.querySelectorAll('.stat-number[data-count]').forEach((el) => observer.observe(el));
}
