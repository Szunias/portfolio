/* Showreel chapters under the hero surface: each starts the reel at a project.
   Works through the existing launch button, so home-showreel.js still owns the
   player. One tab stop for the group; arrow keys, Home and End move within it.
   Hover or focus marks the chapter's true start on the surface with a playhead.
   Load before home-transition.js, which reports the initial coverage at once. */
(function () {
  'use strict';
  var hero = document.querySelector('.hero');
  var surface = hero && hero.querySelector('[data-reel-surface]');
  var list = surface && surface.querySelector('[data-reel-chapters]');
  var video = hero && hero.querySelector('.hero__film');
  var launch = hero && hero.querySelector('[data-showreel-play]');
  // The reel's length is authored once, on the list, for this script and the CSS.
  var length = list ? parseFloat(list.style.getPropertyValue('--reel-length')) : 0;
  if (!list || !video || !launch || !(length > 0)) return;
  var head = surface.querySelector('.reel-surface__head');
  var readout = surface.querySelector('[data-reel-readout]');
  var buttons = Array.prototype.slice.call(list.querySelectorAll('[data-reel-at]'));
  // The time axis is the surface's front edge: x 16 to 836 of its 1040 view box.
  var FRONT_X = 16 / 1040;
  var FRONT_W = 820 / 1040;

  function clock(seconds) {
    var s = Math.round(seconds);
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }
  function cue(t) {
    if (head) head.style.left = ((FRONT_X + FRONT_W * t / length) * 100).toFixed(3) + '%';
    if (readout) readout.textContent = clock(t);
    surface.classList.add('is-cued');
  }
  function uncue() { surface.classList.remove('is-cued'); }
  function playFrom(t) {
    launch.click();
    function seek() { try { video.currentTime = t; } catch (error) { /* keep playing from 0 */ } }
    if (video.readyState >= 1) seek();
    else video.addEventListener('loadedmetadata', seek, { once:true });
  }

  buttons.forEach(function (button, index) {
    var t = parseFloat(button.getAttribute('data-reel-at')) || 0;
    button.addEventListener('click', function () { playFrom(t); });
    button.addEventListener('pointerenter', function () { cue(t); });
    button.addEventListener('pointerleave', uncue);
    button.addEventListener('focus', function () { cue(t); });
    button.addEventListener('blur', uncue);
    button.addEventListener('keydown', function (event) {
      var target = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = buttons[(index + 1) % buttons.length];
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = buttons[(index - 1 + buttons.length) % buttons.length];
      else if (event.key === 'Home') target = buttons[0];
      else if (event.key === 'End') target = buttons[buttons.length - 1];
      if (!target) return;
      event.preventDefault();
      buttons.forEach(function (b) { b.tabIndex = b === target ? 0 : -1; });
      target.focus();
    });
  });

  // Covered chapters leave the tab order, like the hero's own controls.
  hero.addEventListener('hero:transition', function (event) { list.inert = event.detail.progress > 0.12; });
})();
