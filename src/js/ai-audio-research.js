/* AI Audio Research: the frame ruler replays the measured latencies from the
   thesis (tables 5.1 and 5.3) in real time, one tick per frame at 60 fps, and
   plays the footstep sample of a method at its 95th-percentile delay. Rows
   without a confirmed sample stay silent. The sample table under it turns its
   native players into one-tap buttons. Without this script both stay a plain
   table and plain audio players; nothing plays until the reader presses a
   button. */
(function () {
  var root = document.querySelector('.ar');
  if (!root) return;

  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduce = !!(mq && mq.matches);
  if (mq) {
    var onMotion = function (e) { reduce = !!e.matches; };
    if (mq.addEventListener) mq.addEventListener('change', onMotion);
    else if (mq.addListener) mq.addListener(onMotion);
  }

  function stopAll(except) {
    Array.prototype.forEach.call(root.querySelectorAll('audio'), function (a) {
      if (a !== except && !a.paused) a.pause();
    });
  }
  function frames(ms) {
    var f = ms * 0.06; /* 16.7 ms per frame at 60 fps */
    return f < 10 ? String(Math.round(f * 10) / 10) : String(Math.round(f));
  }
  function playFrom0(a) {
    try { a.currentTime = 0; } catch (e) { /* not loaded yet */ }
    var p = a.play();
    if (p && p.catch) p.catch(function () {});
  }

  /* ---------- frame ruler ---------- */
  (function () {
    var ruler = root.querySelector('[data-ar-ruler]');
    if (!ruler) return;
    var fire = ruler.querySelector('[data-ar-fire]');
    var fireLabel = ruler.querySelector('[data-ar-fire-label]');
    var soundBtn = ruler.querySelector('[data-ar-sound]');
    var soundLabel = ruler.querySelector('[data-ar-sound-label]');
    var msEl = ruler.querySelector('[data-ar-ms]');
    var frEl = ruler.querySelector('[data-ar-frame]');
    var readout = ruler.querySelector('[data-ar-readout]');
    var rows = Array.prototype.slice.call(ruler.querySelectorAll('tr[data-a]'));
    if (!fire || !rows.length) return;

    var sounds = {};
    Array.prototype.forEach.call(ruler.querySelectorAll('audio[data-ar-snd]'), function (a) {
      sounds[a.getAttribute('data-ar-snd')] = a;
    });
    var END = 4000;
    var soundOn = true;
    var raf = 0;
    var t0 = 0;
    var idle = readout ? readout.textContent : '';
    var hint = 'Samples play at the 95th-percentile delay of their method.';

    rows.forEach(function (r) {
      r.arA = Number(r.getAttribute('data-a')) || 0;
      r.arB = Number(r.getAttribute('data-b')) || 0;
      var th = r.querySelector('th');
      var name = th ? th.textContent.trim() : '';
      if (r.hasAttribute('data-lt')) {
        r.arText = name + ': under ' + r.arB + ' ms, under ' + frames(r.arB) + ' frames';
      } else if (r.arA === r.arB) {
        r.arText = name + ': ' + r.arB + ' ms, ' + frames(r.arB) + ' frames';
      } else {
        r.arText = name + ': ' + r.arA + ' to ' + r.arB + ' ms, ' + frames(r.arA) + ' to ' + frames(r.arB) + ' frames';
      }
      r.addEventListener('mouseenter', function () {
        if (readout) readout.textContent = r.arText + ' at 60 fps';
      });
      r.addEventListener('mouseleave', function () {
        if (readout) readout.textContent = raf && soundOn ? hint : idle;
      });
    });

    function preload() {
      if (!soundOn) return;
      Object.keys(sounds).forEach(function (k) {
        var a = sounds[k];
        if (a.readyState < 2 && a.preload !== 'auto') { a.preload = 'auto'; a.load(); }
      });
    }
    function whenReady(cb) {
      var waiting = soundOn ? Object.keys(sounds).filter(function (k) { return sounds[k].readyState < 3; }) : [];
      if (!waiting.length) { cb(); return; }
      var left = waiting.length;
      var done = false;
      function finish() { if (!done) { done = true; cb(); } }
      function one() { left -= 1; if (left <= 0) finish(); }
      waiting.forEach(function (k) {
        sounds[k].addEventListener('canplaythrough', one, { once: true });
        sounds[k].addEventListener('error', one, { once: true });
      });
      setTimeout(finish, 2500);
    }

    function paint(t) {
      ruler.style.setProperty('--t', t.toFixed(1));
      if (msEl) msEl.textContent = String(Math.round(t));
      if (frEl) frEl.textContent = String(Math.floor(t * 0.06));
    }
    function tick(now) {
      var t = Math.min(now - t0, END);
      paint(t);
      rows.forEach(function (r) {
        if (r.arLanded) return;
        if (!reduce && r.arB > r.arA) {
          r.style.setProperty('--f', Math.max(0, Math.min(1, (t - r.arA) / (r.arB - r.arA))).toFixed(3));
        }
        if (t >= r.arB) {
          r.arLanded = true;
          r.classList.add('is-landed');
          r.style.setProperty('--f', '1');
          var key = r.getAttribute('data-snd');
          if (soundOn && key && sounds[key]) playFrom0(sounds[key]);
        }
      });
      if (t < END) { raf = requestAnimationFrame(tick); return; }
      raf = 0;
      ruler.classList.remove('is-running');
      if (fireLabel) fireLabel.textContent = 'Trigger again';
      if (readout) readout.textContent = idle;
    }
    function start() {
      if (raf) cancelAnimationFrame(raf);
      stopAll();
      rows.forEach(function (r) {
        r.arLanded = false;
        r.classList.remove('is-landed');
        r.style.setProperty('--f', '0');
      });
      ruler.classList.add('is-running');
      if (fireLabel) fireLabel.textContent = 'Replaying';
      if (readout) readout.textContent = soundOn ? hint : idle;
      paint(0);
      t0 = performance.now();
      raf = requestAnimationFrame(tick);
    }
    function stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      ruler.classList.remove('is-running');
      rows.forEach(function (r) { r.classList.remove('is-landed'); r.style.setProperty('--f', '1'); });
      Object.keys(sounds).forEach(function (k) { sounds[k].pause(); });
      paint(0);
      if (fireLabel) fireLabel.textContent = 'Trigger the event';
      if (readout) readout.textContent = idle;
    }

    fire.addEventListener('pointerenter', preload);
    fire.addEventListener('focus', preload);
    fire.addEventListener('click', function () {
      if (raf) { stop(); return; } /* the square icon means stop */
      preload();
      whenReady(start);
    });
    if (soundBtn) {
      soundBtn.addEventListener('click', function () {
        soundOn = !soundOn;
        soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
        if (soundLabel) soundLabel.textContent = soundOn ? 'Sound on' : 'Sound off';
        if (!soundOn) Object.keys(sounds).forEach(function (k) { sounds[k].pause(); });
      });
    }
    ruler.classList.add('is-live');
  })();

  /* ---------- sample table ---------- */
  var matrix = root.querySelector('[data-ar-matrix]');
  if (!matrix) return;
  Array.prototype.forEach.call(matrix.querySelectorAll('audio'), function (a) {
    if (!a.parentNode) return;
    var label = a.getAttribute('aria-label') || 'sample';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ar-play';
    btn.setAttribute('aria-label', 'Play ' + label);
    btn.innerHTML = '<span class="ar-play__icon" aria-hidden="true"></span>';
    a.removeAttribute('controls');
    a.hidden = true;
    a.parentNode.insertBefore(btn, a);

    function progress() {
      if (a.paused) return;
      var d = a.duration;
      btn.style.setProperty('--p', d && isFinite(d) ? (a.currentTime / d).toFixed(3) : '0');
      requestAnimationFrame(progress);
    }
    function off() {
      btn.classList.remove('is-playing');
      btn.setAttribute('aria-label', 'Play ' + label);
      btn.style.setProperty('--p', '0');
    }
    btn.addEventListener('click', function () {
      if (!a.paused) { a.pause(); return; }
      stopAll(a);
      playFrom0(a);
    });
    a.addEventListener('play', function () {
      btn.classList.add('is-playing');
      btn.setAttribute('aria-label', 'Stop ' + label);
      progress();
    });
    a.addEventListener('pause', off);
    a.addEventListener('ended', off);
  });
})();
