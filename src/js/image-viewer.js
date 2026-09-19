/* Original-image links work without JavaScript; the dialog adds an in-page preview. */
(function () {
  'use strict';
  var links = document.querySelectorAll('[data-image-zoom]');
  if (!links.length || !window.HTMLDialogElement) return;

  var dialog = document.createElement('dialog');
  if (typeof dialog.showModal !== 'function') return;
  dialog.className = 'image-viewer';
  dialog.setAttribute('aria-label', 'Image preview');
  dialog.setAttribute('aria-describedby', 'image-viewer-caption');
  dialog.innerHTML = '<div class="image-viewer__toolbar">' +
    '<button type="button" data-zoom-toggle aria-pressed="false">Zoom in</button>' +
    '<a data-original target="_blank" rel="noopener noreferrer">Open original</a>' +
    '<button type="button" data-close aria-label="Close image preview" autofocus><span class="image-viewer__close-label">Close</span><span aria-hidden="true">&times;</span></button>' +
    '</div><div class="image-viewer__surface" tabindex="0" role="region" aria-label="Image detail"></div>' +
    '<p class="image-viewer__caption" id="image-viewer-caption"></p>';
  document.body.appendChild(dialog);

  var image = document.createElement('img');
  image.className = 'image-viewer__image';
  var caption = dialog.querySelector('.image-viewer__caption');
  var surface = dialog.querySelector('.image-viewer__surface');
  var original = dialog.querySelector('[data-original]');
  var zoom = dialog.querySelector('[data-zoom-toggle]');
  var close = dialog.querySelector('[data-close]');
  var trigger;

  function setZoom(active) {
    dialog.classList.toggle('is-zoomed', active);
    zoom.setAttribute('aria-pressed', String(active));
    zoom.textContent = active ? 'Fit to screen' : 'Zoom in';
    surface.scrollTop = 0;
    surface.scrollLeft = 0;
  }

  links.forEach(function (link) {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', function (event) {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      trigger = link;
      var thumbnail = link.querySelector('img');
      image.alt = thumbnail.alt;
      image.src = link.href;
      // Keep the unused dialog free of an image with no source.
      if (!image.parentNode) surface.appendChild(image);
      caption.textContent = thumbnail.alt;
      original.href = link.href;
      setZoom(false);
      dialog.showModal();
      document.documentElement.classList.add('image-viewer-open');
      close.focus({ preventScroll: true });
    });
  });

  zoom.addEventListener('click', function () { setZoom(!dialog.classList.contains('is-zoomed')); });
  close.addEventListener('click', function () { dialog.close(); });
  // Close only when both ends of a click are on the backdrop, not after a pan.
  var backdropDown = false;
  function onBackdrop(event) {
    if (event.target !== dialog) return false;
    var box = dialog.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right ||
      event.clientY < box.top || event.clientY > box.bottom;
  }
  dialog.addEventListener('pointerdown', function (event) { backdropDown = onBackdrop(event); });
  dialog.addEventListener('pointercancel', function () { backdropDown = false; });
  dialog.addEventListener('click', function (event) {
    if (backdropDown && onBackdrop(event)) dialog.close();
    backdropDown = false;
  });
  dialog.addEventListener('close', function () {
    backdropDown = false;
    document.documentElement.classList.remove('image-viewer-open');
    if (trigger) trigger.focus({ preventScroll: true });
  });
})();
