// Background starfield - tiny square particles like the home hero,
// drawn on a fixed 2D canvas. Slow drift + scroll parallax.
(function() {
  var canvas = document.getElementById('bgStars');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var stars = [], W = 0, H = 0;

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    stars = [];
    var n = Math.max(70, Math.min(190, Math.round(W * H / 15000)));
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        z: 0.35 + Math.random() * 0.65,   // depth: parallax + brightness
        s: Math.random() < 0.85 ? 1 : 2,  // mostly 1px squares
        tw: Math.random() * Math.PI * 2   // twinkle phase
      });
    }
  }

  var t = 0, scroll = window.scrollY || 0;
  window.addEventListener('scroll', function() { scroll = window.scrollY; }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      var x = (st.x + t * 2.2 * st.z) % W;
      var y = (st.y - scroll * st.z * 0.18) % H;
      if (y < 0) y += H;
      var a = 0.22 + 0.4 * st.z * (0.7 + 0.3 * Math.sin(t * 0.8 + st.tw));
      ctx.fillStyle = 'rgba(200, 216, 234, ' + a.toFixed(3) + ')';
      ctx.fillRect(x, y, st.s, st.s);
    }
  }

  function loop() {
    t += 0.016;
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  seed();
  var rt = 0;
  window.addEventListener('resize', function() {
    clearTimeout(rt);
    rt = setTimeout(function() { resize(); seed(); draw(); }, 150);
  });

  if (reduce) { draw(); } else { loop(); }
})();
