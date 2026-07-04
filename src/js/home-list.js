/* Cursor image preview for the project list.
   Each row keeps its thumb image in the DOM (hidden); hovering a row
   shows that image in a floating card that trails the cursor. */
(function () {
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var rows = document.querySelectorAll('.prow');
  if (!rows.length) return;

  var box = document.createElement('div');
  box.id = 'work-preview';
  box.setAttribute('aria-hidden', 'true');
  var img = document.createElement('img');
  img.alt = '';
  box.appendChild(img);
  document.body.appendChild(box);

  var W = 320, H = 200, GAP = 26;
  var tx = 0, ty = 0, x = 0, y = 0, running = false;

  function place() {
    x += (tx - x) * 0.16;
    y += (ty - y) * 0.16;
    var px = x + GAP;
    if (px + W > innerWidth - 10) px = x - GAP - W;
    var py = Math.min(Math.max(y - H / 2, 12), innerHeight - H - 12);
    box.style.transform = 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px)';
    if (running || Math.abs(tx - x) + Math.abs(ty - y) > 0.5) {
      requestAnimationFrame(place);
    }
  }

  rows.forEach(function (row) {
    var thumb = row.querySelector('.prow__thumb img');
    if (!thumb) return;
    row.addEventListener('mouseenter', function (e) {
      img.src = thumb.currentSrc || thumb.src;
      tx = x = e.clientX; ty = y = e.clientY;
      box.classList.add('on');
      if (!running) { running = true; requestAnimationFrame(place); }
    });
    row.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
    });
    row.addEventListener('mouseleave', function () {
      box.classList.remove('on');
      running = false;
    });
  });
})();
