// CRITICAL FIX: Track observers for cleanup
window.__indexPageObservers = window.__indexPageObservers || [];

export function initScrollReveal() {
  const setup = () => {
    const observerOptions = {
      threshold: 0,
      rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // CRITICAL FIX: Track observer for cleanup
    window.__indexPageObservers.push(observer);

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}
