/* Feature pages (feature.css): the hero becomes the real player in place.
   The hero's [data-ft-stage] holds a silent loop (poster-loop.js). Every
   a[data-ft-play] on the page links to the full recording, with data-t naming
   the second it starts from: the hero's "Watch with sound" and the play-from
   cues in the text. A press replaces the loop with that recording, with its
   native controls and sound, seeks to data-t and plays it; a cue lower on the
   page brings the hero back into view first. Nothing else ever starts sound.
   Without JavaScript the links open the recording itself. */
(function () {
  'use strict';
  var stage = document.querySelector('.ft [data-ft-stage]');
  var links = [].slice.call(document.querySelectorAll('.ft a[data-ft-play]'));
  if (!stage || !links.length) return;
  var hero = stage.closest('.ft-hero') || stage;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var film = null;

  function open(link) {
    if (film) return film;
    var loop = stage.querySelector('video[data-poster-loop]');
    var toggle = stage.querySelector('[data-loop-toggle]');
    film = document.createElement('video');
    film.className = 'ft-hero__film';
    film.controls = true;
    film.playsInline = true;
    film.preload = 'auto';
    if (loop && loop.getAttribute('poster')) film.poster = loop.getAttribute('poster');
    film.setAttribute('aria-label', stage.getAttribute('data-ft-label') || 'Recording with sound');
    film.src = link.getAttribute('href').split('#')[0];
    if (loop) {
      loop.pause();
      loop.removeAttribute('src');
      loop.load();
      loop.remove();
    }
    if (toggle) toggle.remove();
    stage.insertBefore(film, stage.firstChild);
    hero.classList.add('is-film');
    return film;
  }

  function play(link) {
    var t = Number(link.getAttribute('data-t')) || 0;
    var video = open(link);
    var seek = function () {
      try { video.currentTime = t; } catch (err) {}
    };
    // Before metadata this only sets the start position; set it again once seeking works.
    seek();
    if (video.readyState < 1) video.addEventListener('loadedmetadata', seek, { once: true });
    var started = video.play();
    if (started && typeof started.catch === 'function') started.catch(function () {});
    if (!hero.contains(link)) stage.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
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
