/* Cursor light for the home page.
   A soft ice-tinted glow trails the pointer and leans into whatever it can
   click; the native cursor stays untouched. Desktop only: coarse pointers
   never see it, and reduced motion disables the whole thing rather than
   shipping a slower version of it. */
(function () {
  if (!window.matchMedia) return;
  if (!matchMedia('(pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var glow = document.createElement('div');
  glow.className = 'cursor-light';
  glow.setAttribute('aria-hidden', 'true');
  var dot = document.createElement('div');
  dot.className = 'cursor-light__dot';
  glow.appendChild(dot);
  document.body.appendChild(glow);

  var targetX = -400;
  var targetY = -400;
  var x = targetX;
  var y = targetY;
  var shown = false;

  document.addEventListener('mousemove', function (event) {
    targetX = event.clientX;
    targetY = event.clientY;
    if (!shown) {
      shown = true;
      // Skip the flight from the parking spot on the first appearance.
      x = targetX;
      y = targetY;
      glow.classList.add('is-on');
    }
  }, { passive: true });

  document.addEventListener('mouseleave', function () {
    shown = false;
    glow.classList.remove('is-on');
  });

  // The halo swells over anything interactive so the light reads as a cue,
  // not as decoration that happens to move.
  document.addEventListener('mouseover', function (event) {
    var hot = event.target instanceof Element
      && event.target.closest('a, button, summary, [role="button"]');
    glow.classList.toggle('is-hot', !!hot);
  }, { passive: true });

  function frame() {
    x += (targetX - x) * 0.16;
    y += (targetY - y) * 0.16;
    glow.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
