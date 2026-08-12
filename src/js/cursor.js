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
  var halo = document.createElement('div');
  halo.className = 'cursor-light__halo';
  var dot = document.createElement('div');
  dot.className = 'cursor-light__dot';
  glow.appendChild(halo);
  glow.appendChild(dot);
  document.body.appendChild(glow);

  var targetX = -400;
  var targetY = -400;
  var x = targetX;
  var y = targetY;
  // The halo swell is composed into the same transform string as the
  // translation. The standalone `scale` property would apply first and
  // multiply the translation with it, throwing the glow off the pointer.
  var scale = 1;
  var targetScale = 1;
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
    targetScale = hot ? 1.45 : 1;
  }, { passive: true });

  function frame() {
    x += (targetX - x) * 0.18;
    y += (targetY - y) * 0.18;
    scale += (targetScale - scale) * 0.12;
    halo.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + scale + ')';
    // The dot sits exactly on the pointer while the halo trails it, so there
    // is always something precisely where the cursor is.
    dot.style.transform = 'translate3d(' + targetX + 'px,' + targetY + 'px,0)';
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
