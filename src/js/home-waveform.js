/* Decorative signal surface, adapted from the supplied Edition 03 design. */
(function () {
  'use strict';

  var hero = document.querySelector('.hero');
  var stage = hero && hero.querySelector('[data-hero-wave]');
  var canvas = stage && stage.querySelector('canvas');
  if (!canvas) return;

  var context = canvas.getContext('2d', { alpha:true });
  if (!context) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var lines = [];
  var frame = 0;
  var width = 0;
  var height = 0;
  var pixelRatio = 1;
  var visible = true;
  var playing = hero.classList.contains('is-started');
  var lastPaint = 0;
  var introStarted = null;
  var introDuration = 3900;
  var targetX = 0;
  var targetY = 0;
  var pointerX = 0;
  var pointerY = 0;
  var bounds = null;

  // Cache the height field. Only its phase and projection change during motion.
  for (var row = 0; row < 120; row++) {
    var v = row / 119;
    var points = [];
    for (var column = 0; column < 122; column++) {
      var u = column / 121;
      var phaseOne = u * Math.PI * 2.6 + v * 2.9;
      var phaseTwo = u * Math.PI * 5.2 - v * 1.3;
      points.push({
        x:(u - 0.5) * 950,
        z:(v - 0.5) * 430,
        envelope:Math.pow(Math.sin(Math.PI * u), 1.15),
        sinOne:Math.sin(phaseOne), cosOne:Math.cos(phaseOne),
        sinTwo:Math.sin(phaseTwo), cosTwo:Math.cos(phaseTwo)
      });
    }
    var shade = Math.round(115 + 100 * Math.pow(1 - v, 0.6));
    var alpha = 0.32 + 0.58 * Math.pow(Math.sin(Math.PI * v), 0.6);
    lines.push({ points:points, stroke:'rgba(' + shade + ',' + (shade + 2) + ',' + shade + ',' + alpha + ')' });
  }

  function canAnimate() {
    return visible && !playing && !hero.classList.contains('is-started') &&
      !document.hidden && !reduced.matches && width > 0 && height > 0;
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastPaint = 0;
  }

  function wake() {
    if (!frame && canAnimate()) frame = requestAnimationFrame(paint);
  }

  function paint(now) {
    frame = 0;
    if (!canAnimate()) return;
    if (lastPaint && now - lastPaint < 30) {
      frame = requestAnimationFrame(paint);
      return;
    }

    var elapsed = lastPaint ? Math.min(now - lastPaint, 80) : 33;
    lastPaint = now;
    if (introStarted === null) introStarted = now;
    var easing = 1 - Math.pow(0.9, elapsed / 33);
    pointerX += (targetX - pointerX) * easing;
    pointerY += (targetY - pointerY) * easing;

    var progress = Math.min(1, (now - introStarted) / introDuration);
    var phase = -0.17 * Math.pow(1 - progress, 2);
    var a = -0.56 + pointerX * 0.11;
    var b = 0.55 + pointerY * 0.11;
    var cosA = Math.cos(a), sinA = Math.sin(a);
    var cosB = Math.cos(b), sinB = Math.sin(b);
    var cosRoll = Math.cos(-0.26), sinRoll = Math.sin(-0.26);
    var cosOne = Math.cos(phase + pointerX * 0.09);
    var sinOne = Math.sin(phase + pointerX * 0.09);
    var cosTwo = Math.cos(phase * 0.65), sinTwo = Math.sin(phase * 0.65);
    var scale = Math.min(width / 1040, height / 760) * 1.07;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.translate(width / 2, height / 2);
    context.scale(scale, scale);
    context.lineWidth = 0.8;

    lines.forEach(function (line) {
      context.beginPath();
      context.strokeStyle = line.stroke;
      line.points.forEach(function (point, index) {
        var y = point.envelope * (
          125 * (point.sinOne * cosOne + point.cosOne * sinOne) +
          46 * (point.sinTwo * cosTwo + point.cosTwo * sinTwo)
        );
        var x = point.x * cosA - point.z * sinA;
        var z = point.x * sinA + point.z * cosA;
        var tiltedY = y * cosB - z * sinB;
        var tiltedZ = y * sinB + z * cosB;
        var rolledX = x * cosRoll - tiltedY * sinRoll;
        var rolledY = x * sinRoll + tiltedY * cosRoll;
        var depth = 1100 / (1100 + tiltedZ);
        if (index === 0) context.moveTo(rolledX * depth, rolledY * depth);
        else context.lineTo(rolledX * depth, rolledY * depth);
      });
      context.stroke();
    });

    stage.classList.add('is-ready');
    if (progress < 1 || Math.abs(targetX - pointerX) + Math.abs(targetY - pointerY) > 0.0008) wake();
  }

  function resize() {
    var stageBox = stage.getBoundingClientRect();
    var heroBox = hero.getBoundingClientRect();
    // Document coordinates remain valid while scrolling; pointermove avoids layout reads.
    bounds = {
      left:heroBox.left + window.scrollX, top:heroBox.top + window.scrollY,
      width:heroBox.width, height:heroBox.height
    };
    width = stageBox.width;
    height = stageBox.height;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    var bufferWidth = Math.round(width * pixelRatio);
    var bufferHeight = Math.round(height * pixelRatio);
    if (canvas.width !== bufferWidth) canvas.width = bufferWidth;
    if (canvas.height !== bufferHeight) canvas.height = bufferHeight;
    wake();
  }

  function resetPointer() {
    targetX = 0;
    targetY = 0;
    wake();
  }

  hero.addEventListener('pointermove', function (event) {
    if (!finePointer.matches || event.pointerType === 'touch' || !canAnimate() ||
        !bounds || !bounds.width || !bounds.height) return;
    targetX = Math.max(-0.5, Math.min(0.5, (event.pageX - bounds.left) / bounds.width - 0.5));
    targetY = Math.max(-0.5, Math.min(0.5, (event.pageY - bounds.top) / bounds.height - 0.5));
    wake();
  }, { passive:true });
  hero.addEventListener('pointerleave', resetPointer, { passive:true });
  finePointer.addEventListener('change', resetPointer);

  hero.addEventListener('hero:playback', function (event) {
    playing = !!(event.detail && event.detail.playing);
    if (playing) stop();
    else wake();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else wake();
  });
  reduced.addEventListener('change', function () {
    stop();
    pointerX = pointerY = targetX = targetY = 0;
    if (reduced.matches) stage.classList.remove('is-ready');
    else wake();
  });

  if ('ResizeObserver' in window) {
    var sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(stage);
    sizeObserver.observe(hero);
  }
  // Also refresh the backing resolution after zoom or a move between displays.
  window.addEventListener('resize', resize, { passive:true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) wake();
      else stop();
    }).observe(hero);
  }
  resize();
})();
