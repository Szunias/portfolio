// Enhanced Gallery Lightbox System with Thumbnails
(function() {
  'use strict';

  let currentGalleryImages = [];
  let currentImageIndex = 0;
  let lightboxInitialized = false;

  // Create enhanced lightbox HTML structure
  function createLightbox() {
    if (document.getElementById('global-lightbox')) return;

    const lightboxHTML = `
      <div class="global-lightbox" id="global-lightbox">
        <div class="lightbox-overlay"></div>
        <div class="lightbox-container">
          <div class="lightbox-header">
            <button class="lightbox-close" aria-label="Close lightbox">
              <span class="close-icon">✕</span>
            </button>
            <div class="lightbox-counter">
              <span id="lightbox-current">1</span> / <span id="lightbox-total">1</span>
            </div>
          </div>

          <div class="lightbox-content">
            <button class="lightbox-nav lightbox-prev" aria-label="Previous image">
              <span class="nav-icon">❮</span>
            </button>

            <div class="lightbox-image-container">
              <img id="lightbox-img" src="" alt="" />
              <div class="lightbox-loading">
                <div class="loading-spinner"></div>
              </div>
            </div>

            <button class="lightbox-nav lightbox-next" aria-label="Next image">
              <span class="nav-icon">❯</span>
            </button>
          </div>

          <div class="lightbox-thumbnails" id="lightbox-thumbnails">
            <div class="thumbnails-container" id="thumbnails-container">
              <!-- Thumbnails will be generated here -->
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    addLightboxStyles();
    bindLightboxEvents();
  }

  // Enhanced CSS styles for lightbox
  function addLightboxStyles() {
    if (document.getElementById('lightbox-styles')) return;

    const styles = `
      <style id="lightbox-styles">
        .global-lightbox {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 100000;
          opacity: 0;
          transition: opacity 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .global-lightbox.active {
          display: block;
          opacity: 1;
        }

        .lightbox-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(10,10,20,0.98) 100%);
          backdrop-filter: blur(15px);
        }

        .lightbox-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          z-index: 2;
        }

        .lightbox-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .lightbox-close {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          border: 1px solid rgba(255,255,255,0.2);
          color: #ffffff;
          width: 50px;
          height: 50px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .lightbox-close .close-icon {
          font-size: 20px;
          font-weight: bold;
          color: #ffffff;
          line-height: 1;
          user-select: none;
        }

        .lightbox-close:hover {
          background: linear-gradient(135deg, rgba(255,50,50,0.8) 0%, rgba(255,100,100,0.6) 100%);
          border-color: rgba(255,100,100,0.8);
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(255,50,50,0.4);
        }

        .lightbox-counter {
          background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,40,0.9) 100%);
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 1rem;
          font-weight: 600;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .lightbox-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
        }

        .lightbox-image-container {
          position: relative;
          max-width: calc(100% - 140px);
          max-height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-content img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 15px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          transition: all 0.4s ease;
        }

        .lightbox-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: none;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #18bfef;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%);
          border: 1px solid rgba(255,255,255,0.3);
          color: #ffffff;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          backdrop-filter: blur(15px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.4);
          z-index: 10;
        }

        .lightbox-nav .nav-icon {
          font-size: 24px;
          font-weight: bold;
          color: #ffffff;
          line-height: 1;
          user-select: none;
        }

        .lightbox-nav:hover {
          background: linear-gradient(135deg, #18bfef 0%, #9a6cff 100%);
          border-color: #18bfef;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 12px 35px rgba(24,191,239,0.5);
        }

        .lightbox-nav:active {
          transform: translateY(-50%) scale(0.95);
        }

        .lightbox-prev {
          left: 20px;
        }

        .lightbox-next {
          right: 20px;
        }

        .lightbox-thumbnails {
          background: linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(20,20,40,0.9) 100%);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 20px;
          max-height: 140px;
          overflow: hidden;
        }

        .thumbnails-container {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.3) transparent;
          padding: 5px 0;
        }

        .thumbnails-container::-webkit-scrollbar {
          height: 6px;
        }

        .thumbnails-container::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }

        .thumbnails-container::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #18bfef, #9a6cff);
          border-radius: 3px;
        }

        .thumbnail-item {
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
          position: relative;
        }

        .thumbnail-item:hover {
          border-color: #18bfef;
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(24,191,239,0.4);
        }

        .thumbnail-item.active {
          border-color: #18bfef;
          box-shadow: 0 0 0 3px rgba(24,191,239,0.3);
        }

        .thumbnail-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .thumbnail-item:hover img {
          transform: scale(1.1);
        }

        /* Hide elements for single image */
        .global-lightbox.single-image .lightbox-nav,
        .global-lightbox.single-image .lightbox-thumbnails {
          display: none;
        }

        .global-lightbox.single-image .lightbox-image-container {
          max-width: 100%;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .lightbox-header {
            padding: 15px 20px;
          }

          .lightbox-close {
            width: 45px;
            height: 45px;
          }

          .lightbox-close .close-icon {
            font-size: 18px;
          }

          .lightbox-counter {
            padding: 8px 16px;
            font-size: 0.9rem;
          }

          .lightbox-content {
            padding: 15px;
          }

          .lightbox-image-container {
            max-width: calc(100% - 100px);
          }

          .lightbox-nav {
            width: 50px;
            height: 50px;
          }

          .lightbox-nav .nav-icon {
            font-size: 20px;
          }

          .lightbox-prev {
            left: 15px;
          }

          .lightbox-next {
            right: 15px;
          }

          .lightbox-thumbnails {
            padding: 15px;
            max-height: 120px;
          }

          .thumbnail-item {
            width: 70px;
            height: 70px;
          }
        }

        @media (max-width: 480px) {
          .lightbox-header {
            padding: 10px 15px;
          }

          .lightbox-close {
            width: 40px;
            height: 40px;
          }

          .lightbox-close .close-icon {
            font-size: 16px;
          }

          .lightbox-counter {
            padding: 6px 12px;
            font-size: 0.8rem;
          }

          .lightbox-content {
            padding: 10px;
          }

          .lightbox-image-container {
            max-width: calc(100% - 80px);
          }

          .lightbox-nav {
            width: 45px;
            height: 45px;
          }

          .lightbox-nav .nav-icon {
            font-size: 18px;
          }

          .lightbox-prev {
            left: 10px;
          }

          .lightbox-next {
            right: 10px;
          }

          .lightbox-thumbnails {
            padding: 10px;
            max-height: 100px;
          }

          .thumbnail-item {
            width: 60px;
            height: 60px;
          }
        }

        /* Animation classes */
        .lightbox-fade-in {
          animation: fadeIn 0.4s ease;
        }

        .lightbox-slide-in {
          animation: slideIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes slideIn {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // Generate thumbnails for the gallery
  function generateThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnails-container');
    thumbnailsContainer.innerHTML = '';

    currentGalleryImages.forEach((imageSrc, index) => {
      const thumbnail = document.createElement('div');
      thumbnail.className = 'thumbnail-item';
      if (index === currentImageIndex) {
        thumbnail.classList.add('active');
      }

      const img = document.createElement('img');
      img.src = imageSrc;
      img.alt = `Thumbnail ${index + 1}`;
      img.loading = 'lazy';

      thumbnail.appendChild(img);
      thumbnail.addEventListener('click', () => {
        goToImage(index);
      });

      thumbnailsContainer.appendChild(thumbnail);
    });

    // Scroll active thumbnail into view
    scrollToActiveThumbnail();
  }

  // Scroll to active thumbnail
  function scrollToActiveThumbnail() {
    const thumbnailsContainer = document.getElementById('thumbnails-container');
    const activeThumbnail = thumbnailsContainer.querySelector('.thumbnail-item.active');

    if (activeThumbnail) {
      activeThumbnail.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }

  // Update active thumbnail
  function updateActiveThumbnail() {
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    thumbnails.forEach((thumb, index) => {
      if (index === currentImageIndex) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
    scrollToActiveThumbnail();
  }

  // Bind enhanced lightbox events
  function bindLightboxEvents() {
    const lightbox = document.getElementById('global-lightbox');
    const overlay = lightbox.querySelector('.lightbox-overlay');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => changeLightboxImage(-1));
    nextBtn.addEventListener('click', () => changeLightboxImage(1));

    // Close on overlay click
    overlay.addEventListener('click', closeLightbox);

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('active')) return;

      switch(e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          changeLightboxImage(-1);
          break;
        case 'ArrowRight':
          changeLightboxImage(1);
          break;
      }
    });
  }

  // Open enhanced lightbox
  function openLightbox(imageSrc, galleryImages, imageIndex) {
    currentGalleryImages = galleryImages;
    currentImageIndex = imageIndex;

    const lightbox = document.getElementById('global-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const currentSpan = document.getElementById('lightbox-current');
    const totalSpan = document.getElementById('lightbox-total');
    const loadingSpinner = lightbox.querySelector('.lightbox-loading');

    // Show loading spinner
    loadingSpinner.style.display = 'block';
    lightboxImg.style.opacity = '0';

    // Load image
    lightboxImg.onload = function() {
      loadingSpinner.style.display = 'none';
      lightboxImg.style.opacity = '1';
    };

    lightboxImg.src = imageSrc;
    currentSpan.textContent = imageIndex + 1;
    totalSpan.textContent = galleryImages.length;

    // Generate thumbnails
    generateThumbnails();

    // Handle single vs multiple images
    if (galleryImages.length === 1) {
      lightbox.classList.add('single-image');
    } else {
      lightbox.classList.remove('single-image');
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close lightbox
  function closeLightbox() {
    const lightbox = document.getElementById('global-lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Go to specific image
  function goToImage(index) {
    if (index === currentImageIndex) return;

    currentImageIndex = index;
    const lightboxImg = document.getElementById('lightbox-img');
    const currentSpan = document.getElementById('lightbox-current');
    const loadingSpinner = document.querySelector('.lightbox-loading');

    // Show loading and fade out current image
    loadingSpinner.style.display = 'block';
    lightboxImg.style.opacity = '0';

    // Load new image
    lightboxImg.onload = function() {
      loadingSpinner.style.display = 'none';
      lightboxImg.style.opacity = '1';
    };

    lightboxImg.src = currentGalleryImages[currentImageIndex];
    currentSpan.textContent = currentImageIndex + 1;

    updateActiveThumbnail();
  }

  // Change lightbox image with navigation
  function changeLightboxImage(direction) {
    if (currentGalleryImages.length <= 1) return;

    let newIndex = currentImageIndex + direction;

    if (newIndex < 0) {
      newIndex = currentGalleryImages.length - 1;
    } else if (newIndex >= currentGalleryImages.length) {
      newIndex = 0;
    }

    goToImage(newIndex);
  }

  // Initialize enhanced galleries
  function initializeGalleries() {
    if (lightboxInitialized) return;

    createLightbox();

    // Find all gallery containers
    const gallerySelectors = [
      '.projects-grid',
      '.ray-gallery',
      '.env-grid img',
      '.gallery-grid',
      '.project-gallery',
      '.pausedeserve-gallery',
      '.akantilado-gallery',
      '.amorak-gallery',
      '.richter-gallery',
      '.audioq-gallery'
    ];

    gallerySelectors.forEach(selector => {
      const containers = document.querySelectorAll(selector);

      containers.forEach(container => {
        const images = container.querySelectorAll('img');
        if (images.length === 0) return;

        const galleryImages = Array.from(images).map(img => {
          return img.getAttribute('data-full') ||
                 img.getAttribute('data-src') ||
                 img.src;
        });

        images.forEach((img, index) => {
          if (img.hasAttribute('data-lightbox-init')) return;

          img.setAttribute('data-lightbox-init', 'true');
          img.style.cursor = 'pointer';

          const clickTarget = img.closest('.gallery-item') || img.closest('.image') || img;

          clickTarget.addEventListener('click', function(e) {
            e.preventDefault();
            const imageSrc = img.getAttribute('data-full') ||
                           img.getAttribute('data-src') ||
                           img.src;
            openLightbox(imageSrc, galleryImages, index);
          });
        });
      });
    });

    lightboxInitialized = true;
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGalleries);
  } else {
    initializeGalleries();
  }

  // Re-initialize if new content is added dynamically
  window.initializeLightbox = initializeGalleries;

})();