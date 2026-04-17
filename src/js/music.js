// =========================================
// THEME TOGGLE
// =========================================
(function() {
  // Apply saved theme immediately to avoid flash
  try {
    var saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch(e) {}

  var toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  toggle.addEventListener('click', function() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch(e) {}
  });
})();

// =========================================
// FILTER & AUDIO PLAYER
// =========================================
(function() {
  var filterBtns = document.querySelectorAll('.filter-btn');
  var trackCards = document.querySelectorAll('.track-card');

  // Guard: only run on music page
  if (!trackCards.length) return;

  // Per-card hide timer so rapid filter switches don't leave stale timers
  // hiding cards that should now be visible.
  var hideTimers = new WeakMap();

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      var filter = btn.getAttribute('data-filter');

      trackCards.forEach(function(card) {
        // Cancel any pending hide from a previous filter click
        var pending = hideTimers.get(card);
        if (pending) {
          clearTimeout(pending);
          hideTimers.delete(card);
        }

        var tags = card.getAttribute('data-tags') || '';
        if (filter === 'all' || tags.indexOf(filter) !== -1) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          });
        } else {
          card.style.transition = 'opacity 0.2s ease';
          card.style.opacity = '0';
          var t = setTimeout(function() {
            card.classList.add('hidden');
            hideTimers.delete(card);
          }, 200);
          hideTimers.set(card, t);
        }
      });
    });
  });

  // =========================================
  // AUDIO PLAYER
  // =========================================
  var playerTitle = document.getElementById('playerTitle');
  var playerArtist = document.getElementById('playerArtist');
  var playerCover = document.getElementById('playerCover');
  var playPauseBtn = document.getElementById('playPauseBtn');
  var playPauseIcon = document.getElementById('playPauseIcon');
  var currentTimeEl = document.getElementById('currentTime');
  var totalTimeEl = document.getElementById('totalTime');
  var progressFill = document.getElementById('progressFill');
  var progressBar = document.getElementById('progressBar');
  var volumeBar = document.getElementById('volumeBar');
  var volumeFill = document.getElementById('volumeFill');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var mobilePlayBtn = document.getElementById('mobilePlayBtn');
  var mobilePlayIcon = document.getElementById('mobilePlayIcon');

  // Guard: player bar must be present
  if (!playerTitle || !playPauseBtn || !progressBar || !prevBtn || !nextBtn) return;

  var audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = 0.7;

  var isPlaying = false;
  var currentTrackIndex = -1;
  var originalTitle = document.title;

  var visibleCards = function() {
    return Array.from(trackCards).filter(function(c) { return !c.classList.contains('hidden'); });
  };

  // Show mobile play button on small screens
  function checkMobile() {
    if (!mobilePlayBtn) return;
    if (window.innerWidth <= 650) {
      mobilePlayBtn.style.display = 'flex';
    } else {
      mobilePlayBtn.style.display = 'none';
    }
  }
  checkMobile();
  window.addEventListener('resize', checkMobile);

  function decodeEntities(str) {
    var temp = document.createElement('div');
    temp.innerHTML = str;
    return temp.textContent;
  }

  function formatTime(secs) {
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // =========================================
  // MEDIA SESSION
  // =========================================
  function updateMediaSession(card) {
    if (!('mediaSession' in navigator)) return;
    try {
      var title = decodeEntities(card.getAttribute('data-title') || '');
      var artist = card.getAttribute('data-artist') || '';
      var coverUrl = card.getAttribute('data-cover');
      var tags = (card.getAttribute('data-tags') || '').split(',');
      var album = tags[0] ? tags[0].charAt(0).toUpperCase() + tags[0].slice(1) : 'Music';

      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: artist,
        album: album,
        artwork: coverUrl ? [
          { src: coverUrl, sizes: '512x512', type: 'image/jpeg' }
        ] : []
      });

      navigator.mediaSession.setActionHandler('play', function() { audio.play(); });
      navigator.mediaSession.setActionHandler('pause', function() { audio.pause(); });
      navigator.mediaSession.setActionHandler('previoustrack', function() { prevBtn.click(); });
      navigator.mediaSession.setActionHandler('nexttrack', function() { nextBtn.click(); });
    } catch(e) { /* MediaSession not fully supported in this browser */ }
  }

  // =========================================
  // SELECT & PLAY TRACK
  // =========================================
  function selectTrack(card) {
    var src = card.getAttribute('data-src');
    if (!src) return;

    var title = decodeEntities(card.getAttribute('data-title') || '');
    var artist = card.getAttribute('data-artist') || '';
    var gradient = card.getAttribute('data-gradient') || '';
    var coverUrl = card.getAttribute('data-cover');

    playerTitle.textContent = title;
    playerArtist.textContent = artist;
    totalTimeEl.textContent = card.getAttribute('data-duration') || '0:00';
    currentTimeEl.textContent = '0:00';
    progressFill.style.width = '0%';

    if (coverUrl) {
      playerCover.style.background = "url('" + coverUrl + "') center/cover no-repeat, " + gradient;
    } else {
      playerCover.style.background = gradient;
    }

    var allCards = Array.from(trackCards);
    currentTrackIndex = allCards.indexOf(card);

    audio.src = src;
    audio.play().catch(function() {});

    document.title = title + ' - Igor Szuniewicz | Music';

    updateMediaSession(card);

    // Highlight active card
    trackCards.forEach(function(c) { c.classList.remove('active'); });
    card.classList.add('active');
  }

  // =========================================
  // AUDIO EVENTS
  // =========================================
  audio.addEventListener('play', function() {
    isPlaying = true;
    updatePlayIcon();
    if (currentTrackIndex >= 0) {
      var card = trackCards[currentTrackIndex];
      var title = decodeEntities(card.getAttribute('data-title'));
      document.title = title + ' - Igor Szuniewicz | Music';
    }
  });

  audio.addEventListener('pause', function() {
    isPlaying = false;
    updatePlayIcon();
    document.title = originalTitle;
  });

  audio.addEventListener('ended', function() {
    isPlaying = false;
    updatePlayIcon();
    document.title = originalTitle;
    nextBtn.click();
  });

  audio.addEventListener('timeupdate', function() {
    if (!audio.duration) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', function() {
    totalTimeEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('error', function() {
    isPlaying = false;
    updatePlayIcon();
    document.title = originalTitle;
  });

  // =========================================
  // PLAY/PAUSE ICON
  // =========================================
  function updatePlayIcon() {
    var playPath = '<polygon points="6,3 20,12 6,21"/>';
    var pausePath = '<rect x="5" y="3" width="5" height="18"/><rect x="14" y="3" width="5" height="18"/>';
    if (playPauseIcon) playPauseIcon.innerHTML = isPlaying ? pausePath : playPath;
    if (mobilePlayIcon) mobilePlayIcon.innerHTML = isPlaying ? pausePath : playPath;
  }

  // =========================================
  // CLICK / KEYBOARD HANDLERS
  // =========================================
  trackCards.forEach(function(card) {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    var title = card.getAttribute('data-title') || 'track';
    card.setAttribute('aria-label', 'Play ' + title);
    card.addEventListener('click', function() {
      selectTrack(card);
    });
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectTrack(card);
      }
    });
  });

  function togglePlay() {
    if (currentTrackIndex === -1) {
      var visible = visibleCards();
      if (visible.length > 0) selectTrack(visible[0]);
      return;
    }
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }

  playPauseBtn.addEventListener('click', togglePlay);
  if (mobilePlayBtn) mobilePlayBtn.addEventListener('click', togglePlay);

  prevBtn.addEventListener('click', function() {
    var visible = visibleCards();
    if (visible.length === 0) return;
    var currentInVisible = -1;
    if (currentTrackIndex >= 0) {
      currentInVisible = visible.indexOf(trackCards[currentTrackIndex]);
    }
    var newIndex = currentInVisible <= 0 ? visible.length - 1 : currentInVisible - 1;
    selectTrack(visible[newIndex]);
  });

  nextBtn.addEventListener('click', function() {
    var visible = visibleCards();
    if (visible.length === 0) return;
    var currentInVisible = -1;
    if (currentTrackIndex >= 0) {
      currentInVisible = visible.indexOf(trackCards[currentTrackIndex]);
    }
    var newIndex = currentInVisible >= visible.length - 1 ? 0 : currentInVisible + 1;
    selectTrack(visible[newIndex]);
  });

  progressBar.addEventListener('click', function(e) {
    if (currentTrackIndex === -1 || !audio.duration) return;
    var rect = this.getBoundingClientRect();
    if (!rect.width) return;
    var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  });

  if (volumeBar) {
    volumeBar.addEventListener('click', function(e) {
      var rect = this.getBoundingClientRect();
      if (!rect.width) return;
      var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.volume = pct;
      if (volumeFill) volumeFill.style.width = (pct * 100) + '%';
    });
  }

})();
