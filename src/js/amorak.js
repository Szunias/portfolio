/* Amorak: the buttons with data-t start the film at that second, always from a click.
   data-dur on the ear-balance figure is the film's length in seconds. */
(function () {
  var fig = document.querySelector('.am [data-am-ears]');
  var video = document.getElementById('am-video');
  if (!fig || !video) return;

  var dur = parseFloat(fig.getAttribute('data-dur')) || 130;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function start() {
    // local-video.js keeps the poster and one play button until the first play.
    var shell = video.parentElement;
    var launch = shell && shell.querySelector('.local-video__launch');
    if (launch) { launch.click(); return; }
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () {});
  }

  function seek(t) {
    t = clamp(t, 0, dur - 0.05);
    try { video.currentTime = t; } catch (e) { /* not seekable yet */ }
    start();
    var r = video.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      video.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
  }

  [].forEach.call(document.querySelectorAll('.am [data-t]'), function (btn) {
    btn.addEventListener('click', function () { seek(parseFloat(btn.getAttribute('data-t')) || 0); });
  });
})();
