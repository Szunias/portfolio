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
  var filterGeneration = 0;

  function cardMatchesFilter(card, filter) {
    var tags = card.getAttribute('data-tags') || '';
    return filter === 'all' || tags.indexOf(filter) !== -1;
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

  function activateFilter(btn, focus) {
    filterBtns.forEach(function(b) {
      var selected = b === btn;
      b.classList.toggle('active', selected);
      b.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    if (focus) btn.focus();
  }

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      activateFilter(btn, false);

      var filter = btn.getAttribute('data-filter');
      var run = ++filterGeneration;

      trackCards.forEach(function(card) {
        // Cancel any pending hide from a previous filter click
        var pending = hideTimers.get(card);
        if (pending) {
          clearTimeout(pending);
          hideTimers.delete(card);
        }

        if (cardMatchesFilter(card, filter)) {
          setCardAvailable(card, true);
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              if (run !== filterGeneration || card.hasAttribute('data-filtered-out')) return;
              card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
              if (Array.from(trackCards).indexOf(card) === currentTrackIndex) {
                card.classList.add('active');
              }
            });
          });
        } else {
          setCardAvailable(card, false);
          card.classList.remove('active');
          card.style.transition = 'opacity 0.2s ease';
          card.style.opacity = '0';
          var t = setTimeout(function() {
            if (run !== filterGeneration || !card.hasAttribute('data-filtered-out')) return;
            card.classList.add('hidden');
            hideTimers.delete(card);
          }, 200);
          hideTimers.set(card, t);
        }
      });

      if (currentTrackIndex >= 0) {
        var activeCard = trackCards[currentTrackIndex];
        if (activeCard && activeCard.hasAttribute('data-filtered-out')) {
          activeCard.classList.remove('active');
        }
      }
    });

    btn.addEventListener('keydown', function(e) {
      var keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
      if (keys.indexOf(e.key) === -1) return;
      e.preventDefault();
      var buttons = Array.from(filterBtns);
      var index = buttons.indexOf(btn);
      if (e.key === 'Home') {
        buttons[0].click();
        activateFilter(buttons[0], true);
        return;
      }
      if (e.key === 'End') {
        buttons[buttons.length - 1].click();
        activateFilter(buttons[buttons.length - 1], true);
        return;
      }
      var dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
      var next = buttons[(index + dir + buttons.length) % buttons.length];
      next.click();
      activateFilter(next, true);
    });
  });

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
  var mobilePlayBtn = document.getElementById('mobilePlayBtn');
  var mobilePlayIcon = document.getElementById('mobilePlayIcon');

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

  var visibleCards = function() {
    return Array.from(trackCards).filter(function(c) {
      return !c.hasAttribute('data-filtered-out');
    });
  };

  // The full player controls stay available on small screens, so this fallback stays hidden.
  function checkMobile() {
    if (!mobilePlayBtn) return;
    mobilePlayBtn.style.display = 'none';
  }
  checkMobile();
  window.addEventListener('resize', checkMobile, { passive: true });

  function decodeEntities(str) {
    var temp = document.createElement('div');
    temp.innerHTML = str;
    return temp.textContent;
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
    if (volumeBar) {
      volumeBar.setAttribute('aria-valuenow', Math.round(pct * 100));
      volumeBar.setAttribute('aria-valuetext', Math.round(pct * 100) + '%');
    }
    updateMuteButton();
  }

  function currentLufsText() {
    if (currentTrackIndex < 0) return 'Normalized playback';
    var card = trackCards[currentTrackIndex];
    var lufs = card ? card.getAttribute('data-lufs') : '';
    return lufs ? 'Normalized ' + lufs + ' LUFS' : 'Normalized playback';
  }

  function setPlayerStatus(text, loading) {
    if (playerStatus) playerStatus.textContent = text || currentLufsText();
    if (playerBar) playerBar.classList.toggle('is-loading', !!loading);
  }

  function updatePlayerStateClasses() {
    if (!playerBar) return;
    playerBar.classList.toggle('is-playing', isPlaying);
    playerBar.classList.toggle('has-track', currentTrackIndex >= 0);
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
  }

  function updateBufferedProgress() {
    if (!progressBuffer || !audio.duration || !audio.buffered || audio.buffered.length === 0) {
      if (progressBuffer) progressBuffer.style.width = '0%';
      return;
    }
    var end = audio.buffered.end(audio.buffered.length - 1);
    progressBuffer.style.width = Math.min(100, (end / audio.duration) * 100) + '%';
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

      var coverType = /\.png(?:[?#]|$)/i.test(coverUrl || '') ? 'image/png' : 'image/jpeg';

      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: artist,
        album: album,
        artwork: coverUrl ? [
          { src: coverUrl, sizes: '512x512', type: coverType }
        ] : []
      });

      navigator.mediaSession.setActionHandler('play', function() { playAudio(); });
      navigator.mediaSession.setActionHandler('pause', function() { audio.pause(); });
      navigator.mediaSession.setActionHandler('previoustrack', function() { prevBtn.click(); });
      navigator.mediaSession.setActionHandler('nexttrack', function() { nextBtn.click(); });
    } catch(e) { /* MediaSession not fully supported in this browser */ }
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
  }

  function playAudio() {
    playRequested = true;
    setPlayerStatus(currentLufsText(), true);
    var playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function(err) {
        if (err && err.name === 'AbortError') return;
        showPlaybackError();
      });
    }
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
    if (progressBuffer) progressBuffer.style.width = '0%';
    updateSeekAria();

    if (coverUrl) {
      playerCover.style.background = "url('" + coverUrl + "') center/cover no-repeat, " + gradient;
    } else {
      playerCover.style.background = gradient;
    }

    var allCards = Array.from(trackCards);
    currentTrackIndex = allCards.indexOf(card);

    audio.src = src;
    setPlayerStatus('Loading - ' + currentLufsText(), true);
    updatePlayerStateClasses();
    playAudio();

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
    playRequested = true;
    updatePlayIcon();
    updatePlayerStateClasses();
    setPlayerStatus('Playing - ' + currentLufsText(), false);
    if (currentTrackIndex >= 0) {
      var card = trackCards[currentTrackIndex];
      var title = decodeEntities(card.getAttribute('data-title'));
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
  });

  audio.addEventListener('ended', function() {
    isPlaying = false;
    playRequested = false;
    updatePlayIcon();
    document.title = originalTitle;
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
  });

  audio.addEventListener('loadedmetadata', function() {
    totalTimeEl.textContent = formatTime(audio.duration);
    updateSeekAria();
    updateBufferedProgress();
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
    if (mobilePlayIcon) mobilePlayIcon.innerHTML = isPlaying ? pausePath : playPath;
    if (playPauseBtn) {
      playPauseBtn.setAttribute('title', isPlaying ? 'Pause' : 'Play');
      playPauseBtn.setAttribute('aria-label', isPlaying ? 'Pause track' : 'Play track');
      playPauseBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    }
    if (mobilePlayBtn) {
      mobilePlayBtn.setAttribute('title', isPlaying ? 'Pause' : 'Play');
      mobilePlayBtn.setAttribute('aria-label', isPlaying ? 'Pause track' : 'Play track');
      mobilePlayBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
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
  if (mobilePlayBtn) mobilePlayBtn.addEventListener('click', togglePlay);

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
  progressBar.setAttribute('tabindex', '0');

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
    if (!el || !window.PointerEvent) return;
    var dragging = false;
    el.addEventListener('pointerdown', function(e) {
      if (canStart && !canStart()) return;
      dragging = true;
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
      onMove(e.clientX);
    });
    el.addEventListener('pointermove', function(e) {
      if (!dragging) return;
      e.preventDefault();
      onMove(e.clientX);
    });
    function stop(e) {
      if (!dragging) return;
      dragging = false;
      try { el.releasePointerCapture(e.pointerId); } catch(err) {}
    }
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);
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

  updateModeButtons();
  updateMuteButton();
  updatePlayerStateClasses();
  setPlayerStatus('Normalized playback', false);

})();
