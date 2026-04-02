// =========================================
// THEME TOGGLE
// =========================================
(function() {
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch(e) {}
    });
  }
  try {
    var saved = localStorage.getItem('theme');
    document.documentElement.setAttribute('data-theme', saved || 'dark');
  } catch(e) {}
})();

// =========================================
// FILTER & AUDIO PLAYER
// =========================================
(function() {
  var filterBtns = document.querySelectorAll('.filter-btn');
  var trackCards = document.querySelectorAll('.track-card');

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.getAttribute('data-filter');

      trackCards.forEach(function(card) {
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
          setTimeout(function() {
            card.classList.add('hidden');
          }, 200);
        }
      });
    });
  });

  // =========================================
  // AUDIO PLAYER
  // =========================================
  var audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = 0.7;

  var isPlaying = false;
  var currentTrackIndex = -1;
  var originalTitle = document.title;

  var visibleCards = function() {
    return Array.from(trackCards).filter(function(c) { return !c.classList.contains('hidden'); });
  };

  var playerTitle = document.getElementById('playerTitle');
  var playerArtist = document.getElementById('playerArtist');
  var playerCover = document.getElementById('playerCover');
  var playPauseBtn = document.getElementById('playPauseBtn');
  var playPauseIcon = document.getElementById('playPauseIcon');
  var currentTimeEl = document.getElementById('currentTime');
  var totalTimeEl = document.getElementById('totalTime');
  var progressFill = document.getElementById('progressFill');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var mobilePlayBtn = document.getElementById('mobilePlayBtn');
  var mobilePlayIcon = document.getElementById('mobilePlayIcon');

  // Show mobile play button on small screens
  function checkMobile() {
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

    var title = decodeEntities(card.getAttribute('data-title'));
    var artist = card.getAttribute('data-artist');
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
  }

  // =========================================
  // SELECT & PLAY TRACK
  // =========================================
  function selectTrack(card) {
    var title = decodeEntities(card.getAttribute('data-title'));
    var artist = card.getAttribute('data-artist');
    var gradient = card.getAttribute('data-gradient');
    var src = card.getAttribute('data-src');
    var coverUrl = card.getAttribute('data-cover');

    playerTitle.textContent = title;
    playerArtist.textContent = artist;
    totalTimeEl.textContent = card.getAttribute('data-duration');
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

  // =========================================
  // PLAY/PAUSE ICON
  // =========================================
  function updatePlayIcon() {
    var playPath = '<polygon points="6,3 20,12 6,21"/>';
    var pausePath = '<rect x="5" y="3" width="5" height="18"/><rect x="14" y="3" width="5" height="18"/>';
    playPauseIcon.innerHTML = isPlaying ? pausePath : playPath;
    mobilePlayIcon.innerHTML = isPlaying ? pausePath : playPath;
  }

  // =========================================
  // CLICK HANDLERS
  // =========================================
  trackCards.forEach(function(card) {
    card.addEventListener('click', function() {
      selectTrack(card);
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
  mobilePlayBtn.addEventListener('click', togglePlay);

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

  document.getElementById('progressBar').addEventListener('click', function(e) {
    if (currentTrackIndex === -1 || !audio.duration) return;
    var rect = this.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });

  document.getElementById('volumeBar').addEventListener('click', function(e) {
    var rect = this.getBoundingClientRect();
    var pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.volume = pct;
    document.getElementById('volumeFill').style.width = (pct * 100) + '%';
  });

})();
