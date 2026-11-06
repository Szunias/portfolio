/* Two sound redesigns: the second clip's stage.
   feature.js turns the hero into the God of War clip. The Baldur's Gate 3
   clip has its own stage further down ([data-sd-stage]): its "Watch" button
   and its cues (a[data-sd-play], data-t in seconds) replace the silent loop
   with that clip, with controls and sound, and start it at data-t. A cue
   brings the stage into view first. Only one clip sounds at a time. Without
   JavaScript the links open the clip itself. */
(function () {
  'use strict';
  var root = document.querySelector('.ft.sd');
  if (!root) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // One soundtrack at a time: a clip that starts pauses any other playing clip (never a silent loop).
  document.addEventListener('play', function (e) {
    var started = e.target;
    if (!started || started.tagName !== 'VIDEO' || started.hasAttribute('data-poster-loop')) return;
    [].slice.call(root.querySelectorAll('video:not([data-poster-loop])')).forEach(function (other) {
      if (other !== started && !other.paused) other.pause();
    });
  }, true);

  var stage = root.querySelector('[data-sd-stage]');
  var links = [].slice.call(root.querySelectorAll('a[data-sd-play]'));
  if (!stage || !links.length) return;
  var film = null;

  function open(link) {
    if (film) return film;
    var loop = stage.querySelector('video[data-poster-loop]');
    film = document.createElement('video');
    film.controls = true;
    film.playsInline = true;
    film.preload = 'auto';
    if (loop && loop.getAttribute('poster')) film.poster = loop.getAttribute('poster');
    film.setAttribute('aria-label', stage.getAttribute('data-sd-label') || 'Clip with sound');
    film.src = link.getAttribute('href').split('#')[0];
    [].slice.call(stage.children).forEach(function (child) {
      if (child.tagName === 'VIDEO') {
        child.pause();
        child.removeAttribute('src');
        child.load();
      }
      child.remove();
    });
    stage.appendChild(film);
    stage.classList.add('is-film');
    return film;
  }

  function play(link) {
    var t = Number(link.getAttribute('data-t')) || 0;
    var video = open(link);
    var seek = function () {
      try { video.currentTime = t; } catch (err) {}
    };
    seek();
    if (video.readyState < 1) video.addEventListener('loadedmetadata', seek, { once: true });
    var started = video.play();
    if (started && typeof started.catch === 'function') started.catch(function () {});
    var box = stage.getBoundingClientRect();
    if (box.top < 0 || box.bottom > window.innerHeight) {
      stage.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    }
    video.focus({ preventScroll: true });
  }

  links.forEach(function (link) {
    link.setAttribute('role', 'button');
    link.addEventListener('click', function (e) {
      // A modified click keeps the browser's own behaviour (open the file elsewhere).
      if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      play(link);
    });
    link.addEventListener('keydown', function (e) {
      if (e.key !== ' ') return;
      e.preventDefault();
      play(link);
    });
  });
})();
