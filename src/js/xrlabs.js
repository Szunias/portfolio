/* XR Labs: Floor-plan positions that draw the shot path to each trainee position.
   The radio group is the accessible control; the rings on the plan are a
   pointer shortcut and stay aria-hidden. Each choice switches the drawn path,
   the readout and the matching still from the public footage. Without
   JavaScript every position stays listed under the plan. #xr-pos-N opens a
   position directly. Motion is CSS only (an opacity fade that
   prefers-reduced-motion switches off). */
(function () {
  var floor = document.querySelector('[data-xr-floor]');
  if (!floor) return;
  var radios = Array.prototype.slice.call(floor.querySelectorAll('input[name="xr-pos"]'));
  var rays = Array.prototype.slice.call(floor.querySelectorAll('[data-xr-rays]'));
  var spots = Array.prototype.slice.call(floor.querySelectorAll('[data-xr-spot]'));
  var panels = Array.prototype.slice.call(floor.querySelectorAll('[data-xr-panel]'));
  if (!radios.length || !rays.length || !panels.length) return;

  function show(n) {
    rays.forEach(function (g) { g.classList.toggle('is-on', g.getAttribute('data-xr-rays') === n); });
    spots.forEach(function (g) { g.classList.toggle('is-on', g.getAttribute('data-xr-spot') === n); });
    panels.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-xr-panel') === n); });
    radios.forEach(function (r) {
      r.checked = r.value === n;
      if (r.parentNode && r.parentNode.classList) r.parentNode.classList.toggle('is-on', r.checked);
    });
  }

  floor.classList.add('is-live');
  radios.forEach(function (r) {
    r.addEventListener('change', function () { if (r.checked) show(r.value); });
  });
  spots.forEach(function (g) {
    g.addEventListener('click', function () { show(g.getAttribute('data-xr-spot')); });
  });

  var hash = /^#xr-pos-([1-4])$/.exec(window.location.hash || '');
  var start = radios.filter(function (r) { return r.checked; })[0];
  show(hash ? hash[1] : (start ? start.value : radios[0].value));
})();
