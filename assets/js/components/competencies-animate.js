/**
 * Competencies Scroll Animation
 * Animates progress bars when they come into view
 */

(function() {
  'use strict';

  function initCompetenciesAnimation() {
    const compGroups = document.querySelectorAll('.comp-group');

    if (!compGroups.length) return;

    // Intersection Observer to trigger animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add animate-in class to trigger the animation
          entry.target.classList.add('animate-in');

          // Stop observing this element
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2, // Trigger when 20% of element is visible
      rootMargin: '0px 0px -50px 0px' // Start slightly before reaching viewport
    });

    // Observe all comp-groups
    compGroups.forEach(group => {
      observer.observe(group);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCompetenciesAnimation);
  } else {
    initCompetenciesAnimation();
  }

})();
