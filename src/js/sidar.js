/* SIDAR NULL scanner console: three frames of a Black Zone and one Scan key,
   the game's own input. Each scan reveals the next frame from the centre of
   the screen; after the route it goes dark again. The frame keys jump straight
   to a frame, and the prototype 0.4 recording plays on the same screen until
   the next scan removes it. Clicking the screen is a pointer shortcut for
   Scan. Reduced motion is read on every scan, so a live change applies at once;
   without JS a <noscript> style lays the frames out as a strip.

   The dark frame shows a "Press Scan" prompt (class is-dark) until the first
   pulse. The console also runs one scan by itself the first time its screen
   has been at least 60% in view for half a second, so a visitor who never
   clicks still sees the dark room turn into points; it never runs after the
   visitor has used the console or under prefers-reduced-motion. */
(function () {
  var unit = document.querySelector('[data-scanner]');
  if (!unit) return;
  var screen = unit.querySelector('[data-scan-screen]');
  var layers = [].slice.call(unit.querySelectorAll('[data-scan-layer]'));
  var ring = unit.querySelector('.sn-ring');
  var next = unit.querySelector('[data-scan-next]');
  var nextLabel = unit.querySelector('[data-scan-next-label]');
  var steps = [].slice.call(unit.querySelectorAll('[data-scan-step]'));
  var status = unit.querySelector('[data-scan-status]');
  var label = unit.querySelector('[data-scan-label]');
  var rec = unit.querySelector('[data-scan-rec]');
  if (!screen || !layers.length || !next || !status) return;

  var TEXT = [
    'Before the scan, a distant lit doorway is the only visible landmark.',
    'The pulse draws points on the walls, floor and ceiling.',
    'The doorway gives the player a direction for the next scan.'
  ];
  var REC_TEXT = 'Prototype 0.4: the button-triggered scanner and the corridor blockout.';
  var REC_LABEL = 'Prototype 0.4 recording';
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var last = layers.length - 1;
  var state = 0;
  var frame = null;
  var timer = 0;
  var touched = false;

  function frameLabel(i) { return 'Black Zone · frame ' + (i + 1) + ' of ' + layers.length; }

  function stopRecording() {
    if (frame && frame.parentNode) frame.parentNode.removeChild(frame);
    frame = null;
    unit.classList.remove('is-rec');
    if (rec) rec.setAttribute('aria-pressed', 'false');
  }

  function show(n, pulse) {
    stopRecording();
    var old = layers[state];
    state = Math.max(0, Math.min(last, n));
    var cur = layers[state];
    var animate = pulse && cur !== old && !(reduce && reduce.matches);
    window.clearTimeout(timer);
    layers.forEach(function (layer) {
      layer.classList.remove('is-on', 'is-prev', 'is-entering');
      layer.setAttribute('aria-hidden', 'true');
    });
    cur.classList.add('is-on');
    cur.removeAttribute('aria-hidden');
    if (animate) {
      old.classList.add('is-prev');
      cur.classList.add('is-entering');
      void cur.offsetWidth;
      cur.classList.remove('is-entering');
      if (ring) {
        ring.classList.remove('is-live');
        void ring.offsetWidth;
        ring.classList.add('is-live');
      }
      timer = window.setTimeout(function () { old.classList.remove('is-prev'); }, 1000);
    } else if (ring) {
      ring.classList.remove('is-live');
    }
    unit.classList.toggle('is-scanned', state > 0);
    unit.classList.toggle('is-dark', state === 0);
    status.textContent = TEXT[state] || '';
    if (label) label.textContent = frameLabel(state);
    steps.forEach(function (key, i) { key.setAttribute('aria-pressed', i === state ? 'true' : 'false'); });
    if (nextLabel) nextLabel.textContent = state === last ? 'Go dark' : 'Scan';
  }

  function scan() {
    if (state === last) show(0, false);
    else show(state + 1, true);
  }

  function playRecording() {
    if (frame) { show(state, false); return; }
    var id = rec.getAttribute('data-video-id');
    if (!id) return;
    frame = document.createElement('iframe');
    frame.className = 'sn-rec-frame';
    // autoplay is safe here: it only ever runs from this click.
    frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    frame.title = rec.getAttribute('data-video-title') || 'Prototype recording';
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    frame.setAttribute('allowfullscreen', '');
    screen.appendChild(frame);
    unit.classList.add('is-rec');
    unit.classList.remove('is-dark');
    rec.setAttribute('aria-pressed', 'true');
    steps.forEach(function (key) { key.setAttribute('aria-pressed', 'false'); });
    status.textContent = REC_TEXT;
    if (label) label.textContent = REC_LABEL;
    if (nextLabel) nextLabel.textContent = 'Scan';
  }

  next.addEventListener('click', function () {
    touched = true;
    if (frame) show(state, false);
    else scan();
  });
  steps.forEach(function (key, i) {
    key.addEventListener('click', function () { touched = true; show(i, i > state); });
  });
  screen.addEventListener('click', function () {
    touched = true;
    if (!frame) scan();
  });
  if (rec) rec.addEventListener('click', function () { touched = true; playRecording(); });
  show(0, false);

  // One scan on first view. Scroll-driven, once, never after the visitor has
  // touched the console and never with reduced motion.
  if (touched || !('IntersectionObserver' in window)) return;
  var wait = 0;
  var io = new IntersectionObserver(function (entries) {
    var entry = entries[entries.length - 1];
    if (touched || (reduce && reduce.matches)) { window.clearTimeout(wait); io.disconnect(); return; }
    window.clearTimeout(wait);
    if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
      wait = window.setTimeout(function () {
        io.disconnect();
        if (!touched && !frame && state === 0 && !(reduce && reduce.matches)) show(1, true);
      }, 500);
    }
  }, { threshold: [0, 0.6] });
  io.observe(screen);
})();
