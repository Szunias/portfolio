// Shadow Frames story gallery.
// Keeps all images in the document while giving the page one cinematic stage.
(function() {
  var gallery = document.querySelector('[data-sf-gallery]');
  if (!gallery) return;

  var mainImage = gallery.querySelector('[data-sf-gallery-main]');
  var caption = gallery.querySelector('[data-sf-gallery-caption]');
  var count = gallery.querySelector('[data-sf-gallery-count]');
  var stage = gallery.querySelector('.sf-gallery__stage');
  var previous = gallery.querySelector('[data-sf-gallery-prev]');
  var next = gallery.querySelector('[data-sf-gallery-next]');
  var thumbs = Array.prototype.slice.call(gallery.querySelectorAll('.sf-gallery__thumbs button[data-src]'));
  var index = 0;

  if (!mainImage || !caption || !count || !stage || !previous || !next || !thumbs.length) return;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function show(newIndex, options) {
    options = options || {};
    index = (newIndex + thumbs.length) % thumbs.length;
    var thumb = thumbs[index];

    mainImage.src = thumb.getAttribute('data-src');
    mainImage.alt = thumb.getAttribute('data-alt') || '';
    caption.textContent = thumb.getAttribute('data-caption') || '';
    count.textContent = pad(index + 1) + ' / ' + pad(thumbs.length);

    thumbs.forEach(function(button, buttonIndex) {
      if (buttonIndex === index) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });

    if (options.focusThumb) thumb.focus();
    if (options.scrollThumb && thumb.scrollIntoView) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }

  previous.addEventListener('click', function() {
    show(index - 1, { scrollThumb: true });
  });

  next.addEventListener('click', function() {
    show(index + 1, { scrollThumb: true });
  });

  thumbs.forEach(function(button, buttonIndex) {
    button.addEventListener('click', function() {
      show(buttonIndex);
    });
  });

  stage.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index - 1, { scrollThumb: true });
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + 1, { scrollThumb: true });
    } else if (event.key === 'Home') {
      event.preventDefault();
      show(0, { scrollThumb: true });
    } else if (event.key === 'End') {
      event.preventDefault();
      show(thumbs.length - 1, { scrollThumb: true });
    }
  });
})();
