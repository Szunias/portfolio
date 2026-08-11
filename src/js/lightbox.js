// Lightbox
(function(){
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const lbImg = lightbox.querySelector('img');
  const lbCaption = lightbox.querySelector('.lightbox__caption');
  const lbCount = lightbox.querySelector('.lightbox__count');
  const lbHint = lightbox.querySelector('.lightbox__hint');
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
  let touchStartX = null;
  let touchStartY = null;
  const backgroundState = new WeakMap();

  function resetTouch() {
    touchStartX = null;
    touchStartY = null;
  }

  const images = Array.from(galleryItems).map(item => {
    const img = item.querySelector('img');
    const cap = item.querySelector('.gallery-item__caption');
    return {
      src: img ? img.src : '',
      // The gallery srcset lets a phone open the 1200px webp instead of the
      // full-size original the src attribute points at.
      srcset: img ? (img.getAttribute('srcset') || '') : '',
      alt: img ? img.alt : '',
      caption: cap ? cap.textContent : ''
    };
  });
  const hasMultipleImages = images.length > 1;

  [prevBtn, nextBtn].filter(Boolean).forEach(btn => {
    btn.hidden = !hasMultipleImages;
  });
  // A single capture has nothing to count through and nothing to browse, so
  // "1 / 1" and the arrow hint would both be noise.
  if (lbCount) lbCount.hidden = !hasMultipleImages;
  if (lbHint && !hasMultipleImages) lbHint.textContent = 'esc to close';

  function render(index) {
    currentIndex = index;
    if (images[index].srcset) {
      lbImg.srcset = images[index].srcset;
      lbImg.sizes = '100vw';
    } else {
      lbImg.removeAttribute('srcset');
      lbImg.removeAttribute('sizes');
    }
    lbImg.src = images[index].src;
    lbImg.alt = images[index].alt;
    lbImg.removeAttribute('aria-hidden');
    if (lbCaption) lbCaption.textContent = images[index].caption || images[index].alt;
    // Without this there is no way to tell a three-image set from a ten-image
    // one, or where in it you are.
    if (lbCount) lbCount.textContent = (index + 1) + ' / ' + images.length;
  }

  function getFocusable() {
    return [closeBtn, prevBtn, nextBtn].filter(el => el && !el.hidden);
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
    lightbox.setAttribute('aria-hidden', 'false');
    lightbox.setAttribute('aria-modal', 'true');
    if (closeBtn) closeBtn.focus();
    setBackgroundInert(true);
    openFrame = requestAnimationFrame(() => {
      openFrame = null;
      if (isOpen && lightbox.getAttribute('aria-hidden') === 'false') {
        lightbox.classList.add('active');
      }
    });
    document.body.style.overflow = 'hidden';
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
        // Reset to the transparent placeholder (img must always have a src).
        // srcset has to go first, or the browser keeps showing its candidate.
        lbImg.removeAttribute('srcset');
        lbImg.removeAttribute('sizes');
        lbImg.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      }
      closeTimer = null;
    }, 300);
  }

  function navigate(dir) {
    if (!hasMultipleImages) return;
    render((currentIndex + dir + images.length) % images.length);
  }

  galleryItems.forEach((item, i) => {
    item.setAttribute('aria-haspopup', 'dialog');
    item.setAttribute('aria-controls', 'lightbox');
    // Only one page hand-wrote this badge, so on the others nothing signalled
    // that a capture opens - and on touch there is no hover state to discover
    // it with. It is decoration for a control the tile already exposes.
    if (!item.querySelector('.gallery-item__zoom')) {
      const badge = document.createElement('span');
      badge.className = 'gallery-item__zoom';
      badge.setAttribute('aria-hidden', 'true');
      badge.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="7"/><line x1="15.5" y1="15.5" x2="22" y2="22"/></svg>';
      item.appendChild(badge);
    }
    if (item.tagName !== 'BUTTON' && item.tagName !== 'A') {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
    }
    item.addEventListener('click', (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      openLightbox(i, item);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === ' ' || (e.key === 'Enter' && item.tagName !== 'A')) {
        e.preventDefault();
        openLightbox(i, item);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  lightbox.addEventListener('touchstart', (e) => {
    resetTouch();
    if (!isOpen || e.touches.length !== 1 || (e.target instanceof Element && e.target.closest('button'))) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchStartX === null || touchStartY === null || e.changedTouches.length !== 1) {
      resetTouch();
      return;
    }
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    resetTouch();
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.2) return;
    navigate(deltaX < 0 ? 1 : -1);
  }, { passive: true });
  lightbox.addEventListener('touchcancel', resetTouch, { passive: true });

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
