/* Feature pages (feature.css): the hero becomes the real player in place.
   The hero's [data-ft-stage] holds a silent loop (poster-loop.js) or a still.
   Every a[data-ft-play] on the page names the full recording, with data-t
   naming the second it starts from: the hero's "Watch with sound" and the
   play-from cues in the text. A local recording is linked by href; a YouTube
   one carries data-ft-yt="<video id>" and links to the YouTube page. A press
   replaces the stage with that recording, with its controls and sound, starts
   it at data-t; a cue lower on the page brings the hero back into view first.
   Nothing else ever starts sound. Without JavaScript the links open the
   recording itself. */
(function () {
  'use strict';
  var stage = document.querySelector('.ft [data-ft-stage]');
  var links = [].slice.call(document.querySelectorAll('.ft a[data-ft-play]'));
  if (!stage || !links.length) return;
  var hero = stage.closest('.ft-hero') || stage;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var film = null;

  function clearStage() {
    [].slice.call(stage.children).forEach(function (child) {
      if (child.tagName === 'VIDEO') {
        child.pause();
        child.removeAttribute('src');
        child.load();
      }
      child.remove();
    });
  }

  function open(link, t) {
    if (film) return film;
    var loop = stage.querySelector('video[data-poster-loop]');
    var label = stage.getAttribute('data-ft-label') || 'Recording with sound';
    var yt = link.getAttribute('data-ft-yt');
    if (yt) {
      film = document.createElement('iframe');
      // enablejsapi=1 lets a later cue seek this player through postMessage.
      film.src = 'https://www.youtube-nocookie.com/embed/' + yt + '?autoplay=1&rel=0&enablejsapi=1&start=' + Math.floor(t);
      film.title = label;
      film.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      film.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      film.setAttribute('allowfullscreen', '');
    } else {
      film = document.createElement('video');
      film.controls = true;
      film.playsInline = true;
      film.preload = 'auto';
      if (loop && loop.getAttribute('poster')) film.poster = loop.getAttribute('poster');
      film.setAttribute('aria-label', label);
      film.src = link.getAttribute('href').split('#')[0];
    }
    film.className = 'ft-hero__film';
    clearStage();
    stage.appendChild(film);
    hero.classList.add('is-film');
    return film;
  }

  function command(frame, func, args) {
    frame.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: args || [] }), '*');
  }

  function play(link) {
    var t = Number(link.getAttribute('data-t')) || 0;
    var opened = !!film;
    var video = open(link, t);
    if (video.tagName === 'IFRAME') {
      // A fresh embed already starts at t; a loaded one is moved there.
      if (opened) { command(video, 'seekTo', [t, true]); command(video, 'playVideo'); }
      if (!hero.contains(link)) stage.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
      video.focus({ preventScroll: true });
      return;
    }
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
