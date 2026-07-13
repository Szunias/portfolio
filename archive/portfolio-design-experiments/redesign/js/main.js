(function(){
  // Signal cable: fill height tracks scroll progress of the whole document.
  var fill = document.querySelector('.cable__fill');
  if (fill) {
    var onScroll = function(){
      var doc = document.documentElement;
      var scrollable = doc.scrollHeight - doc.clientHeight;
      var pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      fill.style.height = Math.min(100, Math.max(0, pct)) + '%';
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }
})();

(function(){
  // Mobile nav toggle
  var btn = document.querySelector('[data-nav-open]');
  var panel = document.querySelector('[data-nav-panel]');
  var closeBtn = document.querySelector('[data-nav-close]');
  if (!btn || !panel) return;
  function open(){ panel.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
  function close(){ panel.classList.remove('is-open'); document.body.style.overflow = ''; }
  btn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  panel.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', close); });
})();

(function(){
  // Reveal-on-scroll for sections marked [data-reveal]
  var items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(function(el){ el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  items.forEach(function(el){ io.observe(el); });
})();

(function(){
  // Minimal audio player for the music page: one <audio> element,
  // buttons carry data-track-* attributes read at click time.
  var audio = document.querySelector('[data-player-audio]');
  if (!audio) return;
  var bar = document.querySelector('[data-player-bar]');
  var titleEl = document.querySelector('[data-player-title]');
  var metaEl = document.querySelector('[data-player-meta]');
  var playBtn = document.querySelector('[data-player-toggle]');
  var progress = document.querySelector('[data-player-progress]');
  var current = null;

  function setPlaying(isPlaying){
    if (playBtn) playBtn.textContent = isPlaying ? '⏸' : '▶';
    if (bar) bar.classList.toggle('is-playing', isPlaying);
  }

  function playTrack(btn){
    var src = btn.getAttribute('data-track-src');
    var title = btn.getAttribute('data-track-title');
    var meta = btn.getAttribute('data-track-meta');
    if (!src) return;
    if (current === btn && !audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }
    if (current === btn && audio.paused) {
      audio.play();
      setPlaying(true);
      return;
    }
    current = btn;
    audio.src = src;
    audio.play().catch(function(){});
    if (titleEl) titleEl.textContent = title || '';
    if (metaEl) metaEl.textContent = meta || '';
    if (bar) bar.classList.add('is-active');
    setPlaying(true);
    document.querySelectorAll('[data-track-src]').forEach(function(b){ b.classList.remove('is-current'); });
    btn.classList.add('is-current');
  }

  document.querySelectorAll('[data-track-src]').forEach(function(btn){
    btn.addEventListener('click', function(){ playTrack(btn); });
  });

  if (playBtn) {
    playBtn.addEventListener('click', function(){
      if (!current) return;
      if (audio.paused) { audio.play(); setPlaying(true); }
      else { audio.pause(); setPlaying(false); }
    });
  }

  audio.addEventListener('timeupdate', function(){
    if (!progress || !audio.duration) return;
    progress.style.width = (audio.currentTime / audio.duration * 100) + '%';
  });
  audio.addEventListener('ended', function(){ setPlaying(false); if (progress) progress.style.width='0%'; });
})();
