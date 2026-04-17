// Lightbox
(function(){
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const lbImg = lightbox.querySelector('img');
  const lbCaption = lightbox.querySelector('.lightbox__caption');
  const closeBtn = lightbox.querySelector('.lightbox__close');
  const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
  const nextBtn = lightbox.querySelector('.lightbox__nav--next');
  const galleryItems = document.querySelectorAll('.gallery-item');
  if (!lbImg || !galleryItems.length) return;

  let currentIndex = 0;

  const images = Array.from(galleryItems).map(item => {
    const img = item.querySelector('img');
    const cap = item.querySelector('.gallery-item__caption');
    return {
      src: img ? img.src : '',
      alt: img ? img.alt : '',
      caption: cap ? cap.textContent : ''
    };
  });

  function render(index) {
    currentIndex = index;
    lbImg.src = images[index].src;
    lbImg.alt = images[index].alt;
    if (lbCaption) lbCaption.textContent = images[index].caption;
  }

  function openLightbox(index) {
    render(index);
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    render((currentIndex + dir + images.length) % images.length);
  }

  galleryItems.forEach((item, i) => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('click', () => openLightbox(i));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
})();
