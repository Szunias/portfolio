const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px 300px 0px'
};

function setupObserver() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  const rows = document.querySelectorAll('.row');
  const stats = document.querySelector('.stats');
  const gallery = document.querySelector('.gallery');

  const checkInitialVisibility = (element) => {
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (isVisible) {
      element.classList.add('visible');
    }
  };

  rows.forEach((row) => {
    checkInitialVisibility(row);
    observer.observe(row);
  });

  if (stats) {
    checkInitialVisibility(stats);
    observer.observe(stats);
  }

  if (gallery) {
    checkInitialVisibility(gallery);
    observer.observe(gallery);
  }

  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
  });

  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`;
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

    setupObserver();
  });
}
