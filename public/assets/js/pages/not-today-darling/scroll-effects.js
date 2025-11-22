const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px 300px 0px'
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

  const sections = document.querySelectorAll(
    '.row, .voicelines-section, .team-section, .gallery, .download-section'
  );
  sections.forEach((section) => observer.observe(section));
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
