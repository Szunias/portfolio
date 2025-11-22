/**
 * Lightbox Accessibility Enhancement
 * Automatically sets proper alt text for lightbox images
 */

(function () {
  'use strict';

  function enhanceLightboxAccessibility() {
    const lightboxImg = document.getElementById('lightbox-img');
    if (!lightboxImg) return;

    // Find all clickable images that trigger lightbox
    const galleryItems = document.querySelectorAll('.gallery-item, .media-item, .blueprint-side');

    galleryItems.forEach((item) => {
      const img = item.querySelector('img');
      if (!img) return;

      item.addEventListener('click', () => {
        // Get alt text from source image, or use a descriptive fallback
        const sourceAlt = img.getAttribute('alt') || '';
        const caption = item.querySelector('figcaption, .gallery-overlay span, .gallery-title');
        const captionText = caption ? caption.textContent.trim() : '';

        // Priority: existing alt > caption > filename > generic
        let lightboxAlt = sourceAlt;

        if (!lightboxAlt && captionText) {
          lightboxAlt = captionText;
        } else if (!lightboxAlt) {
          // Extract descriptive text from filename
          const filename = img.src.split('/').pop().split('.')[0];
          lightboxAlt = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }

        // Fallback if still empty
        if (!lightboxAlt) {
          lightboxAlt = 'Project screenshot - click to close';
        }

        // Set the alt text
        lightboxImg.setAttribute('alt', lightboxAlt);
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceLightboxAccessibility);
  } else {
    enhanceLightboxAccessibility();
  }
})();
