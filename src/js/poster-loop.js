/* A few seconds of real gameplay, silent, in place of a still poster. The loop
   loads only once its facade is on screen, plays only while half of it is
   visible, and never runs under reduced motion, data saving or a hidden tab.
   It sits inside the facade's launch button, so the click that starts the real
   video removes it with the button. */
(function () {
  'use strict';
  var loops = [].slice.call(document.querySelectorAll('video[data-poster-loop]'));
  if (!loops.length || !('IntersectionObserver' in window)) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var connection = navigator.connection;
  var visible = [];

  function allowed() {
    return !reduced.matches && !document.hidden && !(connection && connection.saveData);
  }

  function update(video) {
    if (!video.isConnected) return;
    if (allowed() && visible.indexOf(video) !== -1) {
      if (!video.getAttribute('src')) video.src = video.getAttribute('data-src');
      video.muted = true;
      var playing = video.play();
      if (playing) playing.catch(function () {});
    } else {
      video.pause();
    }
  }

  function updateAll() { loops.forEach(update); }

  loops.forEach(function (video) {
    video.addEventListener('playing', function () { video.classList.add('is-playing'); });
    video.addEventListener('error', function () { video.classList.remove('is-playing'); });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var i = visible.indexOf(entry.target);
      if (entry.isIntersecting && i === -1) visible.push(entry.target);
      if (!entry.isIntersecting && i !== -1) visible.splice(i, 1);
      update(entry.target);
    });
  }, { threshold: 0.5 });
  loops.forEach(function (video) { observer.observe(video); });

  reduced.addEventListener('change', function () {
    if (reduced.matches) loops.forEach(function (video) { video.classList.remove('is-playing'); });
    updateAll();
  });
  document.addEventListener('visibilitychange', updateAll);
  if (connection && typeof connection.addEventListener === 'function') connection.addEventListener('change', updateAll);
})();
