/* A few seconds of real gameplay, silent. The loop loads only once it is on
   screen, plays only while half of it is visible, and never runs under reduced
   motion, data saving or a hidden tab.
   Two hosts use it. Inside a YouTube facade's launch button it replaces the
   still poster, and the click that starts the real video removes it with the
   button. On feature pages (feature.css) the loops stand on their own, each
   with a button[data-loop-toggle] whose aria-controls names it: the reader can
   pause a loop and start it again, a paused loop stays paused until pressed
   again, and the button is hidden whenever loops may not run at all. */
(function () {
  'use strict';
  var loops = [].slice.call(document.querySelectorAll('video[data-poster-loop]'));
  if (!loops.length || !('IntersectionObserver' in window)) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var connection = navigator.connection;
  var visible = [];
  var held = [];
  // Each toggle is paired with its loop once, so a loop a page script later
  // removes (feature.js swaps the hero loop for the player) cannot break it.
  var toggles = [].slice.call(document.querySelectorAll('button[data-loop-toggle]'))
    .map(function (button) {
      return { button: button, video: document.getElementById(button.getAttribute('aria-controls') || '') };
    })
    .filter(function (toggle) { return loops.indexOf(toggle.video) !== -1; });

  function motionAllowed() {
    return !reduced.matches && !(connection && connection.saveData);
  }

  function update(video) {
    if (!video.isConnected) return;
    if (motionAllowed() && !document.hidden && visible.indexOf(video) !== -1 && held.indexOf(video) === -1) {
      if (!video.getAttribute('src')) video.src = video.getAttribute('data-src');
      video.muted = true;
      var playing = video.play();
      if (playing) playing.catch(function () {});
    } else {
      video.pause();
    }
  }

  function syncToggle(toggle) {
    var word = held.indexOf(toggle.video) === -1 ? 'Pause' : 'Play';
    toggle.button.hidden = !motionAllowed() || !toggle.video.isConnected;
    toggle.button.textContent = word;
    toggle.button.setAttribute('aria-label', word + ' the silent loop');
  }

  function updateAll() {
    loops.forEach(update);
    toggles.forEach(syncToggle);
  }

  loops.forEach(function (video) {
    video.addEventListener('playing', function () { video.classList.add('is-playing'); });
    video.addEventListener('error', function () { video.classList.remove('is-playing'); });
  });

  toggles.forEach(function (toggle) {
    toggle.button.addEventListener('click', function () {
      var i = held.indexOf(toggle.video);
      if (i === -1) held.push(toggle.video); else held.splice(i, 1);
      update(toggle.video);
      syncToggle(toggle);
    });
    syncToggle(toggle);
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
