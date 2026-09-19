/* Scroll-driven compositing: move the opening and its pre-rendered wave. */
(function () {
  'use strict';
  var scene = document.querySelector('[data-home-scene]');
  var opening = scene && scene.querySelector('.home-scene__opening');
  var hero = opening && opening.querySelector('.hero');
  if (!hero) return;
  var controls = hero.querySelector('.hero__base');
  var wave = hero.querySelector('.hero-wave');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var header = document.querySelector('.site-header');
  var frame = 0;
  var start = 0;
  var origin = 0;
  var distance = 1;
  var lastProgress = -1;
  var lastPlaybackState = -1;
  var revealFocusedControls = false;

  function ease(value) {
    value = Math.max(0, Math.min(1, value));
    return value * value * (3 - 2 * value);
  }

  function render() {
    frame = 0;
    if (revealFocusedControls) {
      revealFocusedControls = false;
      if (!reduced.matches && controls.contains(document.activeElement)) {
        // Native focus scrolling can center a low control past the sticky
        // boundary, where Work covers it. Cancel that scroll before applying
        // coverage; the pin position keeps the complete control row visible.
        window.scrollTo({ top:start, behavior:'instant' });
      }
    }
    var travel = window.scrollY - start;
    var progress = reduced.matches ? 0 : Math.max(0, Math.min(1, travel / distance));
    if (progress === lastProgress) return;
    lastProgress = progress;
    var travelEase = ease(progress);
    // Only transform and opacity change during scrolling. The SVG is rasterized
    // once; there is no canvas render loop or inherited per-frame CSS variable.
    hero.style.transform = reduced.matches ? '' : 'translate3d(0,' +
      (-Math.min(140, distance * 0.2) * travelEase).toFixed(2) + 'px,0)';
    hero.style.opacity = reduced.matches ? '' : (1 - ease((progress - 0.3) / 0.7)).toFixed(4);
    if (wave) wave.style.transform = reduced.matches ? '' : 'translate3d(' +
      (-24 * travelEase).toFixed(2) + 'px,0,0) rotate(' + (-7 * travelEase).toFixed(3) + 'deg)';
    // Covered controls must not remain in the keyboard navigation order.
    if (controls) controls.inert = progress > 0.08;
    opening.inert = progress >= 0.98;
    // The player only needs coverage changes, not an event on every frame.
    var playbackState = progress >= 0.98 ? 2 : progress > 0.12 ? 1 : 0;
    if (playbackState !== lastPlaybackState) {
      lastPlaybackState = playbackState;
      hero.dispatchEvent(new CustomEvent('hero:transition', { detail:{ progress:progress } }));
    }
  }

  function requestRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function measure() {
    if (frame) cancelAnimationFrame(frame);
    var headerHeight = header ? header.offsetHeight : 0;
    var openingHeight = opening.offsetHeight;
    distance = Math.max(1, Math.min(openingHeight, window.innerHeight - headerHeight));
    // On a short screen, let the complete opening scroll into view before pinning.
    var pinTop = Math.min(headerHeight, window.innerHeight - openingHeight);
    var sceneTop = scene.getBoundingClientRect().top + window.scrollY;
    origin = Math.max(0, sceneTop - headerHeight);
    start = sceneTop - pinTop;
    scene.style.setProperty('--hero-pin-top', pinTop + 'px');
    lastProgress = -1;
    render();
  }

  function configure() {
    scene.classList.toggle('has-cinematic-transition', !reduced.matches);
    measure();
  }

  window.addEventListener('scroll', requestRender, { passive:true });
  window.addEventListener('resize', measure, { passive:true });
  window.addEventListener('pageshow', measure);
  if (controls) controls.addEventListener('focusin', function (event) {
    if (!event.target.matches(':focus-visible')) return;
    revealFocusedControls = true;
    requestRender();
  });
  hero.addEventListener('hero:reveal', function () {
    if (frame) cancelAnimationFrame(frame);
    window.scrollTo({ top:origin, behavior:'instant' });
    render();
  });
  reduced.addEventListener('change', configure);
  if ('ResizeObserver' in window) {
    var observer = new ResizeObserver(measure);
    observer.observe(opening);
    if (header) observer.observe(header);
  }
  configure();
})();
