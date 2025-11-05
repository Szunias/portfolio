let headerScrollInitialized = false;
let headerScrollHandler = null;

function initHeaderScrollEffect() {
  const header = document.getElementById('header');
  if (!header || headerScrollInitialized) return;

  if (headerScrollHandler) {
    window.removeEventListener('scroll', headerScrollHandler);
  }

  headerScrollHandler = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', headerScrollHandler, { passive: true });
  headerScrollInitialized = true;
  headerScrollHandler();
}

function initScrollReveal() {
  const observerOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px 100px 0px'
  };

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      event.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

export function initPageEffects() {
  initHeaderScrollEffect();
  document.addEventListener('DOMContentLoaded', initHeaderScrollEffect);
  window.addEventListener('load', initHeaderScrollEffect);
  initScrollReveal();
  initSmoothScroll();
}
