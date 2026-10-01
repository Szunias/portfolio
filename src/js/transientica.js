
/* Transientica: "Skip to the live demo" under the 2025 prototype video.
   local-video.js hides the native controls behind a poster button; pressing this button first
   hands playback back to the native controls, then the video seeks to the demo and plays.
   The button stays hidden without JavaScript. */
(function () {
  var btn = document.querySelector('[data-tr-jump]');
  if (!btn || !btn.closest) return;
  var fig = btn.closest('figure');
  var video = fig ? fig.querySelector('video') : null;
  if (!video || typeof video.play !== 'function') return;
  var at = parseFloat(btn.getAttribute('data-tr-jump')) || 0;

  function play() {
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () {});
  }
  function seek() {
    try { video.currentTime = at; } catch (e) { return; }
    play();
  }

  btn.addEventListener('click', function () {
    var launch = fig.querySelector('.local-video__launch');
    if (launch) launch.click();
    if (video.readyState >= 1) { seek(); return; }
    video.addEventListener('loadedmetadata', seek, { once: true });
    play();
  });
  btn.hidden = false;
})();
