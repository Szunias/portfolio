// Lightbox
const lightbox = document.getElementById('lightbox');
const lbImg = lightbox.querySelector('img');
const lbCaption = lightbox.querySelector('.lightbox__caption');
const galleryItems = document.querySelectorAll('.gallery-item');
let currentIndex = 0;

const images = Array.from(galleryItems).map(item => ({
  src: item.querySelector('img').src,
  alt: item.querySelector('img').alt,
  caption: item.querySelector('.gallery-item__caption').textContent
}));

function openLightbox(index) {
  currentIndex = index;
  lbImg.src = images[index].src;
  lbImg.alt = images[index].alt;
  lbCaption.textContent = images[index].caption;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function navigate(dir) {
  currentIndex = (currentIndex + dir + images.length) % images.length;
  lbImg.src = images[currentIndex].src;
  lbImg.alt = images[currentIndex].alt;
  lbCaption.textContent = images[currentIndex].caption;
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.click();
    }
  });
});

lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
lightbox.querySelector('.lightbox__nav--next').addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
});
