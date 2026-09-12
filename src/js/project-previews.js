/* One silent card preview at a time; source files load only on deliberate hover or focus. */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const cards = Array.from(document.querySelectorAll('.wcard')).filter(card => card.querySelector('[data-card-preview]'));
  const connection = navigator.connection;
  let current = null;
  let pending = 0;
  let requestVersion = 0;

  function stop() {
    requestVersion++;
    window.clearTimeout(pending);
    if (!current) return;
    current.classList.remove('is-previewing');
    current.querySelector('[data-card-preview]').pause();
    current = null;
  }

  function allowed() {
    return !reduced.matches && !document.hidden && !(connection && connection.saveData);
  }

  function queue(card) {
    stop();
    if (!allowed()) return;
    current = card;
    const version = requestVersion;
    pending = window.setTimeout(() => {
      if (version !== requestVersion) return;
      if (!allowed()) { stop(); return; }
      const video = card.querySelector('[data-card-preview]');
      video.muted = true;
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      const playing = video.play();
      if (playing) playing.catch(() => {
        // A previous play() can reject after the same card is hovered again.
        if (version === requestVersion && current === card) stop();
      });
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
  if (connection && typeof connection.addEventListener === 'function') {
    connection.addEventListener('change', () => { if (connection.saveData) stop(); });
  }
  reduced.addEventListener('change', stop);
  fine.addEventListener('change', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
})();
