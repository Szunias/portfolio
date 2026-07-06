/* Split preview for the project list.
   JS wraps the list in a two-column grid and lifts each row's hidden thumb
   into a sticky panel on the right; hovering (or keyboard-focusing) a row
   crossfades the panel to that project's image. Without JS, or on narrow
   screens, the list stays full-width and rows show inline thumbnails. */
(function () {
  var list = document.querySelector('.plist');
  if (!list) return;
  var rows = [].slice.call(list.querySelectorAll('.prow'));
  if (!rows.length) return;

  var split = document.createElement('div');
  split.className = 'work-split';
  list.parentNode.insertBefore(split, list);
  split.appendChild(list);

  var view = document.createElement('aside');
  view.className = 'pview';
  view.setAttribute('aria-hidden', 'true');
  var frame = document.createElement('div');
  frame.className = 'pview__frame';
  view.appendChild(frame);
  var caption = document.createElement('div');
  caption.className = 'pview__caption';
  var capIdx = document.createElement('span');
  var capMeta = document.createElement('span');
  caption.appendChild(capIdx);
  caption.appendChild(capMeta);
  view.appendChild(caption);
  split.appendChild(view);

  var imgs = [];
  var metas = [];
  rows.forEach(function (row) {
    var thumb = row.querySelector('.prow__thumb img');
    var img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = thumb ? (thumb.currentSrc || thumb.src) : '';
    frame.appendChild(img);
    imgs.push(img);

    var metaEl = row.querySelector('.prow__meta');
    metas.push(metaEl
      ? metaEl.innerHTML.split(/<br\s*\/?>/i)
          .map(function (s) { return s.replace(/<[^>]*>/g, '').trim(); })
          .filter(Boolean).join(' · ')
      : '');
  });

  var current = -1;
  function activate(i) {
    if (i === current) return;
    if (current >= 0) imgs[current].classList.remove('on');
    imgs[i].classList.add('on');
    capIdx.textContent = (i + 1 < 10 ? '0' : '') + (i + 1) + ' / ' + rows.length;
    capMeta.textContent = metas[i];
    current = i;
  }

  rows.forEach(function (row, i) {
    row.addEventListener('mouseenter', function () { activate(i); });
    row.addEventListener('focusin', function () { activate(i); });
  });
  activate(0);
})();
