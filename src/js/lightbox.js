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
  let lastTrigger = null;
  let closeTimer = null;
  let openFrame = null;
  let isOpen = false;
  const backgroundState = new WeakMap();

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
    lbImg.removeAttribute('aria-hidden');
    if (lbCaption) lbCaption.textContent = images[index].caption || images[index].alt;
  }

  function getFocusable() {
    return [closeBtn, prevBtn, nextBtn].filter(Boolean);
  }

  function setControlsEnabled(enabled) {
    getFocusable().forEach(el => {
      if (enabled) {
        el.removeAttribute('tabindex');
      } else {
        el.setAttribute('tabindex', '-1');
      }
    });
    if ('inert' in lightbox) lightbox.inert = !enabled;
  }

  function setBackgroundInert(enabled) {
    Array.from(document.body.children).forEach(el => {
      if (el === lightbox || el.tagName === 'SCRIPT') return;
      if (enabled) {
        if (!backgroundState.has(el)) {
          backgroundState.set(el, {
            ariaHidden: el.getAttribute('aria-hidden'),
            inert: el.inert
          });
        }
        el.setAttribute('aria-hidden', 'true');
        if ('inert' in el) el.inert = true;
      } else {
        const previous = backgroundState.get(el);
        if (!previous) return;
        if (previous.ariaHidden === null) {
          el.removeAttribute('aria-hidden');
        } else {
          el.setAttribute('aria-hidden', previous.ariaHidden);
        }
        if ('inert' in el) el.inert = previous.inert;
        backgroundState.delete(el);
      }
    });
  }

  function openLightbox(index, trigger) {
    isOpen = true;
    lastTrigger = trigger || document.activeElement;
    render(index);
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    if (openFrame) cancelAnimationFrame(openFrame);
    lightbox.hidden = false;
    setControlsEnabled(true);
    setBackgroundInert(true);
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.setAttribute('aria-modal', 'true');
    openFrame = requestAnimationFrame(() => {
      openFrame = null;
      if (isOpen && lightbox.getAttribute('aria-hidden') === 'false') {
        lightbox.classList.add('active');
      }
    });
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    isOpen = false;
    if (openFrame) {
      cancelAnimationFrame(openFrame);
      openFrame = null;
    }
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.removeAttribute('aria-modal');
    setControlsEnabled(false);
    setBackgroundInert(false);
    document.body.style.overflow = '';
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
    lastTrigger = null;
    closeTimer = setTimeout(() => {
      if (!lightbox.classList.contains('active')) {
        lightbox.hidden = true;
        lbImg.setAttribute('aria-hidden', 'true');
        lbImg.removeAttribute('src');
      }
      closeTimer = null;
    }, 300);
  }

  function navigate(dir) {
    render((currentIndex + dir + images.length) % images.length);
  }

  galleryItems.forEach((item, i) => {
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('click', () => openLightbox(i, item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i, item);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
      return;
    }
    if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); navigate(-1); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); navigate(1); return; }
    // Focus trap on Tab
    if (e.key === 'Tab') {
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!focusable.includes(active)) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
