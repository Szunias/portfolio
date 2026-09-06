/* One silent card preview at a time; load only on deliberate hover or focus. */
(function () {
  'use strict';

  const previews = Array.from(document.querySelectorAll('.wcard')).map(card => ({
    card,
    video: card.querySelector('[data-card-preview]'),
  })).filter(item => item.video);
  if (!previews.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let current = null;
  let pending = 0;
  let generation = 0;

  function stop() {
    generation += 1;
    window.clearTimeout(pending);
    pending = 0;
    if (!current) return;
    current.card.classList.remove('is-previewing');
    current.video.pause();
    current = null;
  }

  function allowed() {
    return !reduced.matches && !document.hidden && !(connection && connection.saveData);
  }

  function queue(item) {
    stop();
    if (!allowed()) return;
    const { video } = item;
    const source = video.getAttribute('src') || video.dataset.src;
    if (!source) return;
    current = item;
    const request = generation;
    pending = window.setTimeout(() => {
      pending = 0;
      if (request !== generation || current !== item) return;
      if (!allowed()) { stop(); return; }
      video.muted = true;
      if (!video.getAttribute('src')) video.src = source;
      function onFailure() {
        // A rejected older play() must not stop a newer attempt on this card.
        if (request === generation && current === item) stop();
      }
      try {
        const playing = video.play();
        if (playing && typeof playing.catch === 'function') playing.catch(onFailure);
      } catch {
        onFailure();
      }
    }, 180);
  }

  previews.forEach(item => {
    const { card, video } = item;
    video.addEventListener('playing', () => {
      if (current === item && allowed()) card.classList.add('is-previewing');
      else video.pause();
    });
    video.addEventListener('error', () => { if (current === item) stop(); });
    card.addEventListener('pointerenter', event => {
      if (fine.matches && event.pointerType !== 'touch') queue(item);
    });
    card.addEventListener('pointerleave', () => {
      if (current === item && !card.matches(':focus-visible')) stop();
    });
    card.addEventListener('focus', () => { if (card.matches(':focus-visible')) queue(item); });
    card.addEventListener('blur', () => { if (current === item) stop(); });
  });

  if ('IntersectionObserver' in window) {
    const byCard = new Map(previews.map(item => [item.card, item]));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && current && entry.target === current.card) stop();
        else if (entry.isIntersecting && !current && entry.target.matches(':focus-visible')) {
          const item = byCard.get(entry.target);
          if (item) queue(item);
        }
      });
    });
    previews.forEach(({ card }) => observer.observe(card));
  }
  reduced.addEventListener('change', stop);
  fine.addEventListener('change', stop);
  if (connection && typeof connection.addEventListener === 'function') {
    connection.addEventListener('change', () => { if (!allowed()) stop(); });
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
})();
