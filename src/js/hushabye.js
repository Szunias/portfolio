/* HUSHABYE: the CAM 1-6 switcher in the monitor section. Without JavaScript the
   six camera views stand in a grid with their labels. Here the grid becomes one
   view: the six buttons (aria-pressed) choose the camera, the arrow keys move
   between them, and the line under them names the camera through a polite live region.
   The views share one grid cell and cross-fade in CSS, so nothing reflows. */
(function () {
  'use strict';
  var root = document.querySelector('[data-hu-cams]');
  if (!root) return;
  var shots = [].slice.call(root.querySelectorAll('[data-hu-cam]'));
  var buttons = [].slice.call(root.querySelectorAll('[data-hu-cam-button]'));
  var group = root.querySelector('[data-hu-cam-buttons]');
  var status = root.querySelector('[data-hu-cam-status]');
  if (shots.length < 2 || buttons.length !== shots.length || !group || !status) return;

  // The status line repeats the chosen view's own label (CAM n and the room).
  function label(i) {
    var caption = shots[i].querySelector('figcaption');
    if (!caption) return;
    status.textContent = '';
    [].forEach.call(caption.childNodes, function (node) { status.appendChild(node.cloneNode(true)); });
  }

  function select(i) {
    shots.forEach(function (shot, j) {
      var on = j === i;
      shot.classList.toggle('is-on', on);
      if (on) shot.removeAttribute('aria-hidden'); else shot.setAttribute('aria-hidden', 'true');
    });
    buttons.forEach(function (button, j) { button.setAttribute('aria-pressed', String(j === i)); });
    label(i);
  }

  buttons.forEach(function (button, i) {
    button.addEventListener('click', function () { select(i); });
    button.addEventListener('keydown', function (event) {
      var step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      var next = (i + step + buttons.length) % buttons.length;
      buttons[next].focus();
      select(next);
    });
  });

  // The markup marks the opening camera with aria-pressed="true" (CAM 1 already
  // stands beside the premise). Its label is written while the line is still
  // hidden, so it is not announced.
  var first = 0;
  buttons.forEach(function (button, i) { if (button.getAttribute('aria-pressed') === 'true') first = i; });
  select(first);
  group.hidden = false;
  status.hidden = false;
  root.classList.add('is-live');
})();
