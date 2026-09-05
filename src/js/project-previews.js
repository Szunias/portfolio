/* One silent card preview at a time; source files load only on deliberate hover or focus. */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const cards = Array.from(document.querySelectorAll('.wcard')).filter(card => card.querySelector('[data-card-preview]'));
  let current = null;
  let pending = 0;

  function stop() {
    window.clearTimeout(pending);
    if (!current) return;
    current.classList.remove('is-previewing');
    current.querySelector('[data-card-preview]').pause();
    current = null;
  }

  function allowed() {
    return !reduced.matches && !document.hidden && !(navigator.connection && navigator.connection.saveData);
  }

  function queue(card) {
    stop();
    if (!allowed()) return;
    current = card;
    pending = window.setTimeout(() => {
      if (!allowed()) { stop(); return; }
      const video = card.querySelector('[data-card-preview]');
      video.muted = true;
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      const playing = video.play();
      if (playing) playing.catch(() => { if (current === card) stop(); });
    }, 180);
  }

  cards.forEach(card => {
    const video = card.querySelector('[data-card-preview]');
    video.addEventListener('playing', () => {
      if (current === card && allowed()) card.classList.add('is-previewing');
      else video.pause();
    });
    video.addEventListener('error', () => { if (current === card) stop(); });
    card.addEventListener('pointerenter', event => {
      if (fine.matches && event.pointerType !== 'touch') queue(card);
    });
    card.addEventListener('pointerleave', () => {
      if (current === card && !card.matches(':focus-visible')) stop();
    });
    card.addEventListener('focus', () => { if (card.matches(':focus-visible')) queue(card); });
    card.addEventListener('blur', () => { if (current === card) stop(); });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && entry.target === current) stop();
        else if (entry.isIntersecting && !current && entry.target.matches(':focus-visible')) queue(entry.target);
      });
    });
    cards.forEach(card => observer.observe(card));
  }
  reduced.addEventListener('change', stop);
  fine.addEventListener('change', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
})();
