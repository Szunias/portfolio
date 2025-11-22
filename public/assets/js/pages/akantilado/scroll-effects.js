const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -100px 0px'
};

function setupIntersectionObserver() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  const sections = document.querySelectorAll('section, .video-section, .hero-image');
  sections.forEach((section) => observer.observe(section));

  const cards = document.querySelectorAll('.grid-item, .gallery-item, .meta-badge');
  cards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.08}s`;
  });
}

export function initScrollEffects() {
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      document.body.classList.add('loaded');
    }, 100);

    setupIntersectionObserver();
  });
}
