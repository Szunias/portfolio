// =========================================
// MUSIC GALAXY - STATIONS & AUDIO PLAYER
// The 3D galaxy (module script in the music layout) renders the stars;
// this file owns the audio engine, the station switcher and the track panel.
// Contract with the galaxy module:
//   - it reads .track-card classes (active / is-playing) and
//     [data-filtered-out] every frame,
//   - it listens for the 'music:station' CustomEvent to fly the camera,
//   - it calls window.musicApp.preview(card) on hover focus and
//     card.click() to play a star.
// =========================================
(function() {
  var trackCards = Array.from(document.querySelectorAll('.track-card'));

  // Guard: only run on music page
  if (!trackCards.length) return;

  function isEvoCard(card) {
    return (card.getAttribute('data-tags') || '').indexOf('evolution') !== -1;
  }

  function trackOrder(card) {
    var order = Number(card.getAttribute('data-order')) || 999;
    // Evolution demos queue after the curated tracks so data-order
    // collisions between the two grids never interleave them.
    return order + (isEvoCard(card) ? 1000 : 0);
  }

  trackCards.sort(function(a, b) {
    return trackOrder(a) - trackOrder(b);
  });

  // =========================================
  // STATIONS
  // =========================================
  var STATIONS = [
    { id: 'all', name: 'All tracks' },
    { id: 'electronic', name: 'Electronic' },
    { id: 'film', name: 'Film' },
    { id: 'jazz', name: 'Jazz' },
    { id: 'metal', name: 'Metal' },
    { id: 'remix', name: 'Remix' },
    { id: 'single', name: 'Singles' },
    { id: 'techno', name: 'Techno' },
    { id: 'evolution', name: 'Evolution' }
  ];
  var currentStationIndex = 0;

  var stationChips = Array.from(document.querySelectorAll('.station-chip'));
  var stationName = document.getElementById('stationName');
  var stationCount = document.getElementById('stationCount');
  var stationPrev = document.getElementById('stationPrev');
  var stationNext = document.getElementById('stationNext');

  function cardTags(card) {
    return (card.getAttribute('data-tags') || '').split(',').map(function(tag) {
      return tag.trim();
    });
  }

  function cardMatchesStation(card, stationId) {
    var tags = cardTags(card);
    var isEvolution = tags.indexOf('evolution') !== -1;
    // "All" means the curated tracks, not the 54 raw evolution demos.
    if (stationId === 'all') return !isEvolution;
    return tags.indexOf(stationId) !== -1;
  }

  function setCardAvailable(card, available) {
    if (available) {
      card.removeAttribute('data-filtered-out');
      card.setAttribute('aria-hidden', 'false');
      card.setAttribute('tabindex', '0');
    } else {
      card.setAttribute('data-filtered-out', 'true');
      card.setAttribute('aria-hidden', 'true');
      card.setAttribute('tabindex', '-1');
    }
  }

  var visibleCards = function() {
    return trackCards.filter(function(c) {
      return !c.hasAttribute('data-filtered-out');
    });
  };

  function announceStation() {
    var status = document.getElementById('filterStatus');
    var count = visibleCards().length;
    if (status) {
      status.textContent = count + (count === 1 ? ' track' : ' tracks') +
        ' on station ' + STATIONS[currentStationIndex].name;
    }
    if (stationCount) {
      stationCount.textContent = count + (count === 1 ? ' track' : ' tracks');
    }
  }

  function setStation(index, options) {
    options = options || {};
    currentStationIndex = ((index % STATIONS.length) + STATIONS.length) % STATIONS.length;
    var station = STATIONS[currentStationIndex];

    stationChips.forEach(function(chip) {
      var selected = chip.getAttribute('data-station') === station.id;
      chip.classList.toggle('active', selected);
      chip.setAttribute('aria-pressed', selected ? 'true' : 'false');
      if (selected && options.focusChip) chip.focus();
    });
    if (stationName) stationName.textContent = station.name;

    trackCards.forEach(function(card) {
      setCardAvailable(card, cardMatchesStation(card, station.id));
    });
    announceStation();

    // Tell the galaxy to fly to this constellation
    document.dispatchEvent(new CustomEvent('music:station', {
      detail: { station: station.id, index: currentStationIndex }
    }));

    // Keep the queue coherent: if the current track left the station,
    // tune into the station's first track (keep playing if we were playing).
    if (currentTrackIndex >= 0) {
      var activeCard = trackCards[currentTrackIndex];
      if (activeCard && activeCard.hasAttribute('data-filtered-out')) {
        activeCard.classList.remove('active');
        var next = visibleCards()[0];
        if (next) {
          selectTrack(next, { autoplay: isPlaying || playRequested });
        }
      }
    } else {
      var preview = visibleCards()[0];
      if (preview) syncPanel(preview, true);
    }
  }

  stationChips.forEach(function(chip, chipIndex) {
    chip.addEventListener('click', function() {
      var id = chip.getAttribute('data-station');
      var index = STATIONS.findIndex(function(s) { return s.id === id; });
      setStation(index >= 0 ? index : 0);
    });
    chip.addEventListener('keydown', function(e) {
      var keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
      if (keys.indexOf(e.key) === -1) return;
      e.preventDefault();
      if (e.key === 'Home') { setStation(0, { focusChip: true }); return; }
      if (e.key === 'End') { setStation(STATIONS.length - 1, { focusChip: true }); return; }
      var dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
      setStation(chipIndex + dir, { focusChip: true });
    });
  });

  if (stationPrev) {
    stationPrev.addEventListener('click', function() {
      setStation(currentStationIndex - 1);
    });
  }
  if (stationNext) {
    stationNext.addEventListener('click', function() {
      setStation(currentStationIndex + 1);
    });
  }

  // =========================================
  // AUDIO PLAYER
  // =========================================
  var playerTitle = document.getElementById('playerTitle');
  var playerArtist = document.getElementById('playerArtist');
  var playerStatus = document.getElementById('playerStatus');
  var playerCover = document.getElementById('playerCover');
  var playerBar = document.getElementById('playerBar');
  var playPauseBtn = document.getElementById('playPauseBtn');
  var playPauseIcon = document.getElementById('playPauseIcon');
  var currentTimeEl = document.getElementById('currentTime');
  var totalTimeEl = document.getElementById('totalTime');
  var progressFill = document.getElementById('progressFill');
  var progressBuffer = document.getElementById('progressBuffer');
  var progressBar = document.getElementById('progressBar');
  var volumeBar = document.getElementById('volumeBar');
  var volumeFill = document.getElementById('volumeFill');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var shuffleBtn = document.getElementById('shuffleBtn');
  var repeatBtn = document.getElementById('repeatBtn');
  var muteBtn = document.getElementById('muteBtn');

  // Track panel (galaxy HUD)
  var trackPanel = document.getElementById('trackPanel');
  var panelCover = document.getElementById('panelCover');
  var panelEyebrow = document.getElementById('panelEyebrow');
  var panelTitle = document.getElementById('panelTitle');
  var panelMeta = document.getElementById('panelMeta');
  var panelDesc = document.getElementById('panelDesc');
  var panelPlay = document.getElementById('panelPlay');

  // Guard: player bar must be present
  if (!playerTitle || !playerArtist || !playerCover || !playPauseBtn || !progressBar || !progressFill || !prevBtn || !nextBtn || !currentTimeEl || !totalTimeEl) return;

  var audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = 0.7;

  var isPlaying = false;
  var currentTrackIndex = -1;
  var originalTitle = document.title;
  var shuffleEnabled = false;
  var repeatOne = false;
  var lastVolume = audio.volume;
  var playRequested = false;
  var panelCard = null;

  function toText(value) {
    return String(value || '');
  }

  function cssUrl(value) {
    return 'url("' + toText(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '")';
  }

  function coverBackground(coverUrl, fallback) {
    return coverUrl ? cssUrl(coverUrl) + ' center/cover no-repeat, ' + fallback : fallback;
  }

  // =========================================
  // TRACK PANEL
  // =========================================
  function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
  }

  function updatePanelPlayLabel() {
    if (!panelPlay || !panelCard) return;
    var isCurrent = currentTrackIndex >= 0 && trackCards[currentTrackIndex] === panelCard;
    var title = toText(panelCard.getAttribute('data-title'));
    panelPlay.textContent = isCurrent && isPlaying ? 'Pause' : 'Play';
    panelPlay.setAttribute('aria-label', (isCurrent && isPlaying ? 'Pause ' : 'Play ') + title);
  }

  function syncPanel(card, animate) {
    if (!trackPanel || !card) return;
    var changed = panelCard !== card;
    panelCard = card;

    var title = toText(card.getAttribute('data-title'));
    var displayTitle = card.querySelector('.track-card__title');
    var coverUrl = card.getAttribute('data-cover') || '';
    var gradient = card.getAttribute('data-gradient') || 'linear-gradient(135deg, #1a1a1a, #2a2a34)';
    var description = card.querySelector('.track-card__desc');
    var year = card.querySelector('.track-card__year');
    var duration = card.getAttribute('data-duration') || '';
    var lufs = card.getAttribute('data-lufs') || '';
    var firstTag = cardTags(card)[0];

    if (panelCover) {
      panelCover.style.background = coverBackground(coverUrl, gradient);
      panelCover.setAttribute('aria-label', (displayTitle ? displayTitle.textContent : title) + ' album cover');
    }
    if (panelEyebrow) panelEyebrow.textContent = firstTag ? capitalize(firstTag) + ' station' : 'Selected track';
    if (panelTitle) panelTitle.textContent = displayTitle ? displayTitle.textContent : title;
    if (panelDesc) panelDesc.textContent = description ? description.textContent : '';

    if (panelMeta) {
      panelMeta.innerHTML = '';
      [
        year ? year.textContent : '',
        duration,
        lufs ? lufs + ' LUFS' : ''
      ].filter(Boolean).forEach(function(item) {
        var span = document.createElement('span');
        span.textContent = item;
        panelMeta.appendChild(span);
      });
    }

    updatePanelPlayLabel();
    trackPanel.classList.add('on');

    if (animate && changed) {
      trackPanel.classList.remove('is-switching');
      void trackPanel.offsetWidth;
      trackPanel.classList.add('is-switching');
    }
  }

  if (panelPlay) {
    panelPlay.addEventListener('click', function() {
      var card = panelCard || visibleCards()[0];
      if (!card) return;
      var isCurrent = currentTrackIndex >= 0 && trackCards[currentTrackIndex] === card;
      if (isCurrent && isPlaying) {
        audio.pause();
      } else if (isCurrent) {
        playAudio();
      } else {
        selectTrack(card);
      }
    });
  }

  function formatTime(secs) {
    if (!Number.isFinite(secs) || secs < 0) secs = 0;
    var m = Math.floor(secs / 60);
    var s = Math.floor(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function updateSeekAria() {
    var duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    var current = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    var pct = duration > 0 ? (current / duration) * 100 : 0;
    var canSeek = currentTrackIndex >= 0 && duration > 0;
    progressBar.setAttribute('aria-disabled', canSeek ? 'false' : 'true');
    progressBar.setAttribute('tabindex', canSeek ? '0' : '-1');
    progressBar.setAttribute('aria-valuenow', Math.round(pct));
    progressBar.setAttribute('aria-valuetext', formatTime(current) + ' of ' + formatTime(duration));
  }

  function setVolume(value) {
    var pct = Math.max(0, Math.min(1, value));
    audio.volume = pct;
    if (pct > 0) {
      lastVolume = pct;
      audio.muted = false;
    }
    if (volumeFill) volumeFill.style.width = (pct * 100) + '%';
    updateVolumeAria();
    updateMuteButton();
  }

  function updateVolumeAria() {
    if (!volumeBar) return;
    var pct = Math.round(audio.volume * 100);
    volumeBar.setAttribute('aria-valuenow', audio.muted ? '0' : String(pct));
    volumeBar.setAttribute('aria-valuetext', audio.muted ? 'Muted, previous volume ' + pct + '%' : pct + '%');
  }

  function currentLufsText() {
    if (currentTrackIndex < 0) return 'Ready to play';
    var card = trackCards[currentTrackIndex];
    var lufs = card ? card.getAttribute('data-lufs') : '';
    return lufs ? 'Normalized ' + lufs + ' LUFS' : 'Ready to play';
  }

  function setPlayerStatus(text, loading) {
    if (playerStatus) playerStatus.textContent = text || currentLufsText();
    if (playerBar) playerBar.classList.toggle('is-loading', !!loading);
  }

  function updatePlayerStateClasses() {
    if (!playerBar) return;
    playerBar.classList.toggle('is-playing', isPlaying);
    playerBar.classList.toggle('has-track', currentTrackIndex >= 0);
    trackCards.forEach(function(card, index) {
      var active = index === currentTrackIndex && !card.hasAttribute('data-filtered-out');
      var labelTitle = card.getAttribute('data-title') || 'track';
      card.classList.toggle('active', active);
      card.classList.toggle('is-playing', active && isPlaying);
      if (active) {
        card.setAttribute('aria-current', 'true');
        card.setAttribute('aria-label', (isPlaying ? 'Playing ' : 'Selected ') + labelTitle);
      } else {
        card.removeAttribute('aria-current');
        card.setAttribute('aria-label', 'Play ' + labelTitle);
      }
    });
    updatePanelPlayLabel();
  }

  function updateModeButtons() {
    if (shuffleBtn) {
      shuffleBtn.setAttribute('aria-pressed', shuffleEnabled ? 'true' : 'false');
      shuffleBtn.setAttribute('aria-label', shuffleEnabled ? 'Shuffle on' : 'Shuffle off');
      shuffleBtn.setAttribute('title', shuffleEnabled ? 'Shuffle on' : 'Shuffle');
    }
    if (repeatBtn) {
      repeatBtn.setAttribute('aria-pressed', repeatOne ? 'true' : 'false');
      repeatBtn.setAttribute('aria-label', repeatOne ? 'Repeat one on' : 'Repeat one off');
      repeatBtn.setAttribute('title', repeatOne ? 'Repeat one on' : 'Repeat one');
    }
  }

  function updateMuteButton() {
    if (!muteBtn) return;
    var muted = audio.muted || audio.volume === 0;
    var volumePath = '<polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
    var mutedPath = '<polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/><path d="M16 9l5 5m0-5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
    var icon = muteBtn.querySelector('svg');
    if (icon) icon.innerHTML = muted ? mutedPath : volumePath;
    muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    muteBtn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    muteBtn.setAttribute('title', muted ? 'Unmute' : 'Mute');
    updateVolumeAria();
  }

  function updateBufferedProgress() {
    if (!progressBuffer || !audio.duration || !audio.buffered || audio.buffered.length === 0) {
      if (progressBuffer) progressBuffer.style.width = '0%';
      return;
    }
    try {
      var end = audio.buffered.end(audio.buffered.length - 1);
      progressBuffer.style.width = Math.min(100, (end / audio.duration) * 100) + '%';
    } catch(e) {
      progressBuffer.style.width = '0%';
    }
  }

  // =========================================
  // MEDIA SESSION
  // =========================================
  function absoluteUrl(value) {
    if (!value) return '';
    var link = document.createElement('a');
    link.href = value;
    return link.href || value;
  }

  function mediaMimeFromUrl(value) {
    if (/\.png(?:[?#]|$)/i.test(value || '')) return 'image/png';
    if (/\.webp(?:[?#]|$)/i.test(value || '')) return 'image/webp';
    return 'image/jpeg';
  }

  function setMediaPlaybackState(state) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch(e) { /* Some browsers expose MediaSession without playbackState. */ }
  }

  function updateMediaPositionState() {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate || 1,
        position: Math.min(audio.duration, Math.max(0, audio.currentTime || 0))
      });
    } catch(e) { /* Invalid media state; safe to ignore. */ }
  }

  function setMediaAction(action, handler) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch(e) { /* Unsupported action in this browser. */ }
  }

  function seekBy(seconds) {
    if (currentTrackIndex === -1 || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + seconds));
    updateSeekAria();
    updateMediaPositionState();
  }

  function seekTo(seconds) {
    if (currentTrackIndex === -1 || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.min(audio.duration, Math.max(0, seconds));
    updateSeekAria();
    updateMediaPositionState();
  }

  function updateMediaSession(card) {
    if (!('mediaSession' in navigator)) return;
    try {
      var title = toText(card.getAttribute('data-title'));
      var artist = card.getAttribute('data-artist') || '';
      var coverUrl = card.getAttribute('data-cover');
      var tags = cardTags(card);
      var album = tags[0] ? capitalize(tags[0]) : 'Music';
      var coverSrc = absoluteUrl(coverUrl);

      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: artist,
        album: album,
        artwork: coverSrc ? [
          { src: coverSrc, sizes: '512x512', type: mediaMimeFromUrl(coverSrc) }
        ] : []
      });
    } catch(e) { /* MediaSession not fully supported in this browser */ }

    setMediaAction('play', function() { playAudio(); });
    setMediaAction('pause', function() { audio.pause(); });
    setMediaAction('previoustrack', function() { prevBtn.click(); });
    setMediaAction('nexttrack', function() { nextBtn.click(); });
    setMediaAction('seekbackward', function(details) { seekBy(-((details && details.seekOffset) || 10)); });
    setMediaAction('seekforward', function(details) { seekBy((details && details.seekOffset) || 10); });
    setMediaAction('seekto', function(details) {
      if (!details || typeof details.seekTime !== 'number') return;
      if (details.fastSeek && audio.fastSeek) {
        try {
          audio.fastSeek(details.seekTime);
          updateSeekAria();
          updateMediaPositionState();
          return;
        } catch(e) {}
      }
      seekTo(details.seekTime);
    });
    setMediaAction('stop', function() {
      audio.pause();
      seekTo(0);
      setMediaPlaybackState('paused');
    });
    setMediaPlaybackState(isPlaying ? 'playing' : 'paused');
    updateMediaPositionState();
  }

  function showPlaybackError() {
    isPlaying = false;
    playRequested = false;
    currentTrackIndex = -1;
    audio.removeAttribute('src');
    audio.load();
    currentTimeEl.textContent = '0:00';
    totalTimeEl.textContent = '0:00';
    progressFill.style.width = '0%';
    if (progressBuffer) progressBuffer.style.width = '0%';
    updatePlayIcon();
    updatePlayerStateClasses();
    setPlayerStatus('Could not load track', false);
    document.title = originalTitle;
    playerTitle.textContent = 'Error loading track';
    playerArtist.textContent = 'Igor Szuniewicz';
    playerCover.style.background = 'linear-gradient(135deg, #3a3a4a, #5a5a6a)';
    trackCards.forEach(function(c) { c.classList.remove('active'); });
    updateSeekAria();
    setMediaPlaybackState('none');
  }

  function playAudio() {
    playRequested = true;
    setPlayerStatus(currentLufsText(), true);
    var playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function(err) {
        if (err && err.name === 'AbortError') return;
        if (err && err.name === 'NotAllowedError') {
          isPlaying = false;
          playRequested = false;
          updatePlayIcon();
          updatePlayerStateClasses();
          setPlayerStatus('Tap play to start', false);
          setMediaPlaybackState('paused');
          return;
        }
        showPlaybackError();
      });
    }
  }

  // =========================================
  // SELECT & PLAY TRACK
  // =========================================
  function selectTrack(card, options) {
    var src = card.getAttribute('data-src');
    if (!src) return;
    options = options || {};

    syncPanel(card, true);

    var title = toText(card.getAttribute('data-title'));
    var artist = card.getAttribute('data-artist') || '';
    var gradient = card.getAttribute('data-gradient') || '';
    var coverUrl = card.getAttribute('data-cover');

    playerTitle.textContent = title;
    playerArtist.textContent = artist;
    totalTimeEl.textContent = card.getAttribute('data-duration') || '0:00';
    currentTimeEl.textContent = '0:00';
    progressFill.style.width = '0%';
    if (progressBuffer) progressBuffer.style.width = '0%';
    updateSeekAria();

    playerCover.style.background = coverBackground(coverUrl, gradient);

    currentTrackIndex = trackCards.indexOf(card);

    audio.src = src;
    setPlayerStatus('Loading - ' + currentLufsText(), true);
    updatePlayerStateClasses();
    updateMediaSession(card);
    if (options.autoplay === false) {
      isPlaying = false;
      playRequested = false;
      audio.load();
      setPlayerStatus(currentLufsText(), false);
      updatePlayIcon();
      setMediaPlaybackState('paused');
    } else {
      playAudio();
    }

    document.title = options.autoplay === false ? originalTitle : title + ' - Igor Szuniewicz | Music';

    trackCards.forEach(function(c) { c.classList.remove('active'); });
    card.classList.add('active');
  }

  // =========================================
  // AUDIO EVENTS
  // =========================================
  audio.addEventListener('play', function() {
    isPlaying = true;
    playRequested = true;
    updatePlayIcon();
    updatePlayerStateClasses();
    setPlayerStatus('Playing - ' + currentLufsText(), false);
    setMediaPlaybackState('playing');
    updateMediaPositionState();
    if (currentTrackIndex >= 0) {
      var card = trackCards[currentTrackIndex];
      var title = toText(card.getAttribute('data-title'));
      document.title = title + ' - Igor Szuniewicz | Music';
    }
  });

  audio.addEventListener('pause', function() {
    isPlaying = false;
    playRequested = false;
    updatePlayIcon();
    updatePlayerStateClasses();
    if (currentTrackIndex >= 0 && !audio.ended) setPlayerStatus('Paused - ' + currentLufsText(), false);
    document.title = originalTitle;
    setMediaPlaybackState('paused');
    updateMediaPositionState();
  });

  audio.addEventListener('ended', function() {
    isPlaying = false;
    playRequested = false;
    updatePlayIcon();
    document.title = originalTitle;
    setMediaPlaybackState('paused');
    updateMediaPositionState();
    if (repeatOne) {
      audio.currentTime = 0;
      playAudio();
      return;
    }
    var visible = visibleCards();
    var currentInVisible = currentTrackIndex >= 0 ? visible.indexOf(trackCards[currentTrackIndex]) : -1;
    if (shuffleEnabled && visible.length > 1) {
      playNextTrack();
      return;
    }
    if (currentInVisible >= 0 && currentInVisible < visible.length - 1) {
      playNextTrack();
      return;
    }
    setPlayerStatus('Finished - ' + currentLufsText(), false);
    updatePlayerStateClasses();
    updateSeekAria();
  });

  audio.addEventListener('timeupdate', function() {
    if (!audio.duration) return;
    var pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
    updateSeekAria();
    updateBufferedProgress();
    updateMediaPositionState();
  });

  audio.addEventListener('loadedmetadata', function() {
    totalTimeEl.textContent = formatTime(audio.duration);
    updateSeekAria();
    updateBufferedProgress();
    updateMediaPositionState();
  });

  audio.addEventListener('progress', updateBufferedProgress);

  audio.addEventListener('waiting', function() {
    if (currentTrackIndex >= 0) setPlayerStatus('Buffering - ' + currentLufsText(), true);
  });

  audio.addEventListener('canplay', function() {
    if (currentTrackIndex >= 0) setPlayerStatus((isPlaying || playRequested ? 'Playing - ' : 'Paused - ') + currentLufsText(), false);
  });

  audio.addEventListener('error', function() {
    showPlaybackError();
  });

  // =========================================
  // PLAY/PAUSE ICON
  // =========================================
  function updatePlayIcon() {
    var playPath = '<polygon points="6,3 20,12 6,21"/>';
    var pausePath = '<rect x="5" y="3" width="5" height="18"/><rect x="14" y="3" width="5" height="18"/>';
    if (playPauseIcon) playPauseIcon.innerHTML = isPlaying ? pausePath : playPath;
    if (playPauseBtn) {
      playPauseBtn.setAttribute('title', isPlaying ? 'Pause' : 'Play');
      playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause track' : 'Play track');
      playPauseBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    }
  }

  // =========================================
  // CLICK / KEYBOARD HANDLERS
  // =========================================
  trackCards.forEach(function(card) {
    card.setAttribute('role', 'button');
    setCardAvailable(card, !card.hasAttribute('data-filtered-out'));
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
    // Keyboard users tab through the hidden list; mirror focus in the panel
    card.addEventListener('focus', function() {
      syncPanel(card, true);
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
      playAudio();
    }
  }

  function selectRelativeTrack(direction) {
    var visible = visibleCards();
    if (visible.length === 0) return;
    var currentInVisible = -1;
    if (currentTrackIndex >= 0) {
      currentInVisible = visible.indexOf(trackCards[currentTrackIndex]);
    }
    if (shuffleEnabled && visible.length > 1) {
      var randomIndex = currentInVisible;
      while (randomIndex === currentInVisible) {
        randomIndex = Math.floor(Math.random() * visible.length);
      }
      selectTrack(visible[randomIndex]);
      return;
    }
    var newIndex = currentInVisible < 0
      ? 0
      : (currentInVisible + direction + visible.length) % visible.length;
    selectTrack(visible[newIndex]);
  }

  function playNextTrack() {
    selectRelativeTrack(1);
  }

  playPauseBtn.addEventListener('click', togglePlay);

  prevBtn.addEventListener('click', function() {
    if (currentTrackIndex >= 0 && audio.currentTime > 5) {
      audio.currentTime = 0;
      return;
    }
    selectRelativeTrack(-1);
  });

  nextBtn.addEventListener('click', function() {
    playNextTrack();
  });

  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', function() {
      shuffleEnabled = !shuffleEnabled;
      updateModeButtons();
    });
  }

  if (repeatBtn) {
    repeatBtn.addEventListener('click', function() {
      repeatOne = !repeatOne;
      updateModeButtons();
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', function() {
      if (audio.muted || audio.volume === 0) {
        audio.muted = false;
        setVolume(lastVolume || 0.7);
      } else {
        lastVolume = audio.volume || lastVolume || 0.7;
        audio.muted = true;
        updateMuteButton();
      }
    });
  }

  progressBar.setAttribute('role', 'slider');
  progressBar.setAttribute('aria-label', 'Seek');
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');
  progressBar.setAttribute('aria-valuenow', '0');
  progressBar.setAttribute('aria-valuetext', '0:00 of 0:00');
  progressBar.setAttribute('aria-disabled', 'true');
  progressBar.setAttribute('tabindex', '-1');

  if (volumeBar) {
    volumeBar.setAttribute('role', 'slider');
    volumeBar.setAttribute('aria-label', 'Volume');
    volumeBar.setAttribute('aria-valuemin', '0');
    volumeBar.setAttribute('aria-valuemax', '100');
    volumeBar.setAttribute('aria-valuenow', '70');
    volumeBar.setAttribute('aria-valuetext', '70%');
    volumeBar.setAttribute('tabindex', '0');
  }

  progressBar.addEventListener('click', function(e) {
    if (currentTrackIndex === -1 || !audio.duration) return;
    seekToClientX(e.clientX);
  });

  function seekToClientX(clientX) {
    if (currentTrackIndex === -1 || !audio.duration) return;
    var rect = progressBar.getBoundingClientRect();
    if (!rect.width) return;
    var pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
    updateSeekAria();
  }

  function bindPointerSlider(el, onMove, canStart) {
    if (!el) return;
    var dragging = false;

    function canDrag() {
      if (canStart && !canStart()) return;
      return true;
    }

    function clientXFromTouch(e) {
      var touch = e.touches && e.touches[0] ? e.touches[0] : (e.changedTouches && e.changedTouches[0]);
      return touch ? touch.clientX : null;
    }

    if (window.PointerEvent) {
      el.addEventListener('pointerdown', function(e) {
        if (!canDrag()) return;
        dragging = true;
        if (el.setPointerCapture) {
          try { el.setPointerCapture(e.pointerId); } catch(err) {}
        }
        e.preventDefault();
        onMove(e.clientX);
      });
      el.addEventListener('pointermove', function(e) {
        if (!dragging) return;
        e.preventDefault();
        onMove(e.clientX);
      });
      function stopPointer(e) {
        if (!dragging) return;
        dragging = false;
        try { el.releasePointerCapture(e.pointerId); } catch(err) {}
      }
      el.addEventListener('pointerup', stopPointer);
      el.addEventListener('pointercancel', stopPointer);
      return;
    }

    el.addEventListener('mousedown', function(e) {
      if (!canDrag()) return;
      dragging = true;
      e.preventDefault();
      onMove(e.clientX);
    });
    document.addEventListener('mousemove', function(e) {
      if (!dragging) return;
      e.preventDefault();
      onMove(e.clientX);
    });
    document.addEventListener('mouseup', function() {
      if (!dragging) return;
      dragging = false;
    });
    el.addEventListener('touchstart', function(e) {
      if (!canDrag()) return;
      var x = clientXFromTouch(e);
      if (x === null) return;
      dragging = true;
      e.preventDefault();
      onMove(x);
    }, { passive: false });
    document.addEventListener('touchmove', function(e) {
      if (!dragging) return;
      var x = clientXFromTouch(e);
      if (x === null) return;
      e.preventDefault();
      onMove(x);
    }, { passive: false });
    document.addEventListener('touchend', function() {
      if (!dragging) return;
      dragging = false;
    });
    document.addEventListener('touchcancel', function() {
      if (!dragging) return;
      dragging = false;
    });
  }

  bindPointerSlider(progressBar, seekToClientX, function() {
    return currentTrackIndex !== -1 && !!audio.duration;
  });

  progressBar.addEventListener('keydown', function(e) {
    if (currentTrackIndex === -1 || !audio.duration) return;
    var step = 5;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      audio.currentTime = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      audio.currentTime = audio.duration;
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 30);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      audio.currentTime = Math.max(0, audio.currentTime - 30);
    }
    updateSeekAria();
  });

  if (volumeBar) {
    volumeBar.addEventListener('click', function(e) {
      setVolumeFromClientX(e.clientX);
    });

    function setVolumeFromClientX(clientX) {
      var rect = volumeBar.getBoundingClientRect();
      if (!rect.width) return;
      var pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setVolume(pct);
    }

    bindPointerSlider(volumeBar, setVolumeFromClientX);

    volumeBar.addEventListener('keydown', function(e) {
      var step = 0.05;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        setVolume(audio.volume + step);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        setVolume(audio.volume - step);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setVolume(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setVolume(1);
      } else if (e.key === 'PageUp') {
        e.preventDefault();
        setVolume(audio.volume + 0.2);
      } else if (e.key === 'PageDown') {
        e.preventDefault();
        setVolume(audio.volume - 0.2);
      }
    });
  }

  // =========================================
  // INIT
  // =========================================
  // Default station is "All": evolution demos start filtered out.
  trackCards.forEach(function(card) {
    setCardAvailable(card, cardMatchesStation(card, 'all'));
  });
  announceStation();

  var initialFeatured = visibleCards()[0] || trackCards[0];
  if (initialFeatured) syncPanel(initialFeatured, false);

  updateModeButtons();
  updateMuteButton();
  updatePlayerStateClasses();
  setPlayerStatus('Ready to play', false);

  // Small API for the galaxy module
  window.musicApp = {
    stations: STATIONS,
    preview: function(card) { syncPanel(card, true); },
    select: function(card) { selectTrack(card); },
    getStationId: function() { return STATIONS[currentStationIndex].id; }
  };

})();
