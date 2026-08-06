/* Showreel cover. The native controls remain the no-JS fallback; when JS is
   available, the reel opens with a quieter branded play action and restores
   the browser controls as soon as playback starts. */
(function () {
  var frame = document.querySelector('[data-showreel]');
  if (!frame) return;
  var video = frame.querySelector('video');
  var launch = frame.querySelector('[data-showreel-play]');
  if (!video || !launch) return;

  video.controls = false;
  frame.classList.add('has-custom-cover');

  function revealPlayer() {
    frame.classList.add('is-started');
    video.controls = true;
  }

  launch.addEventListener('click', function () {
    revealPlayer();
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () { video.controls = true; });
    }
  });

  video.addEventListener('play', revealPlayer);
})();

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

  // The sticky preview only helps on a wide, precise-pointer layout. Keep it
  // in sync when a window crosses the breakpoint or its input mode changes.
  if (!window.matchMedia) return;
  var previewQuery = window.matchMedia('(min-width: 1180px) and (hover: hover) and (pointer: fine)');
  var transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  var split = null;
  var cleanups = [];

  // The panel is 400px wide, so the ~640w srcset candidate covers it on 1x
  // and stays acceptable on 2x displays; anything larger is wasted transfer.
  var PANEL_TARGET_WIDTH = 640 * Math.min(window.devicePixelRatio || 1, 2);

  function pickPanelSrc(thumb) {
    var srcset = thumb.getAttribute('srcset');
    if (!srcset) return thumb.src;
    var candidates = srcset.split(',').map(function (entry) {
      var parts = entry.trim().split(/\s+/);
      return { url: parts[0], width: parseInt(parts[1], 10) || 0 };
    }).filter(function (c) { return c.url; });
    if (!candidates.length) return thumb.src;
    candidates.sort(function (a, b) { return a.width - b.width; });
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i].width >= PANEL_TARGET_WIDTH) return candidates[i].url;
    }
    return candidates[candidates.length - 1].url;
  }

  function mountPreview() {
    if (split) return;

    split = document.createElement('div');
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
    var srcs = [];
    var metas = [];
    rows.forEach(function (row) {
      var thumb = row.querySelector('.prow__thumb img');
      var img = document.createElement('img');
      img.alt = '';
      img.decoding = 'async';
      img.src = transparentPixel;
      img.dataset.loaded = 'false';
      if (row.classList.contains('prow--tool')) img.className = 'pview__image--tool';
      // src is assigned lazily in activate() so the page load doesn't pull
      // all full-size thumbs at once. The thumbs are display:none at this
      // width and lazy, so currentSrc is always empty here; the srcset has
      // to be parsed by hand or the panel falls back to full-size originals.
      srcs.push(thumb ? pickPanelSrc(thumb) : '');
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
      if (imgs[i].dataset.loaded !== 'true' && srcs[i]) {
        imgs[i].src = srcs[i];
        imgs[i].dataset.loaded = 'true';
      }
      // Preload the neighbours so quick cursor sweeps don't flash empty frames.
      [i - 1, i + 1].forEach(function (j) {
        if (imgs[j] && imgs[j].dataset.loaded !== 'true' && srcs[j]) {
          imgs[j].src = srcs[j];
          imgs[j].dataset.loaded = 'true';
        }
      });
      imgs[i].classList.add('on');
      capIdx.textContent = (i + 1 < 10 ? '0' : '') + (i + 1) + ' / ' + rows.length;
      capMeta.textContent = metas[i];
      current = i;
    }

    // Pointer and scroll both drive the panel and the later event simply wins.
    // An earlier version gated scrolling behind a "pointer is over the list"
    // flag, but a stationary cursor sitting in the gap between two rows left
    // that flag stuck on and froze the panel mid-list.
    rows.forEach(function (row, i) {
      var onEnter = function () { activate(i); };
      var onFocus = function () { activate(i); };
      row.addEventListener('mouseenter', onEnter);
      row.addEventListener('focusin', onFocus);
      cleanups.push(function () {
        row.removeEventListener('mouseenter', onEnter);
        row.removeEventListener('focusin', onFocus);
      });
    });

    // Whichever row sits nearest the middle of the viewport becomes the active
    // one, so the panel always matches what the reader is looking at.
    // Deliberately a scroll listener rather than an IntersectionObserver: an
    // observer only reports transitions, so a row already inside the trigger
    // band produces no callback at all, and delivery is tied to frame
    // production. Reading geometry once per animation frame is predictable and
    // costs nine getBoundingClientRect calls.
    var ticking = false;
    var syncToScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var mid = window.innerHeight / 2;
        var best = -1;
        var bestDist = Infinity;
        for (var i = 0; i < rows.length; i++) {
          var b = rows[i].getBoundingClientRect();
          if (b.bottom < 0 || b.top > window.innerHeight) continue;
          var dist = Math.abs((b.top + b.bottom) / 2 - mid);
          if (dist < bestDist) { bestDist = dist; best = i; }
        }
        if (best >= 0) activate(best);
      });
    };

    window.addEventListener('scroll', syncToScroll, { passive: true });
    window.addEventListener('resize', syncToScroll);
    cleanups.push(function () {
      window.removeEventListener('scroll', syncToScroll);
      window.removeEventListener('resize', syncToScroll);
    });

    activate(0);
    syncToScroll();
  }

  function unmountPreview() {
    if (!split) return;
    cleanups.forEach(function (cleanup) { cleanup(); });
    cleanups = [];
    split.parentNode.insertBefore(list, split);
    split.remove();
    split = null;
  }

  function syncPreview() {
    if (previewQuery.matches) mountPreview();
    else unmountPreview();
  }

  syncPreview();
  if (previewQuery.addEventListener) previewQuery.addEventListener('change', syncPreview);
  else previewQuery.addListener(syncPreview);
})();
