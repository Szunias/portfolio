// =========================================
// FILTER & AUDIO PLAYER
// =========================================
(function() {
  var filterBtns = document.querySelectorAll('.filter-btn');
  var tracksGrid = document.getElementById('tracks-grid');
  var trackCards = Array.from(document.querySelectorAll('.track-card'));

  // Guard: only run on music page
  if (!trackCards.length) return;

  function trackOrder(card) {
    return Number(card.getAttribute('data-order')) || 999;
  }

  trackCards.sort(function(a, b) {
    return trackOrder(a) - trackOrder(b);
  });
  // Only re-append cards that already belong to #tracks-grid.
  // Evolution cards live in their own #evolution-grid and must stay there.
  if (tracksGrid) {
    trackCards.forEach(function(card) {
      if (card.parentNode === tracksGrid) tracksGrid.appendChild(card);
    });
  }

  // Per-card hide timer so rapid filter switches don't leave stale timers
  // hiding cards that should now be visible.
  var hideTimers = new WeakMap();
  var filterGeneration = 0;

  function cardMatchesFilter(card, filter) {
    var tags = (card.getAttribute('data-tags') || '').split(',').map(function(tag) {
      return tag.trim();
    });
    var isEvolution = tags.indexOf('evolution') !== -1;
    // "All" means the curated main grid, not the raw evolution demos.
    if (filter === 'all') return !isEvolution;
    return tags.indexOf(filter) !== -1;
  }

  var evolutionSection = document.querySelector('.evolution-section');
  var tracksSection = document.querySelector('.tracks-section');

  function syncSectionVisibility(filter) {
    var showEvolution = filter === 'evolution';
    if (evolutionSection) evolutionSection.hidden = !showEvolution;
    if (tracksSection) tracksSection.hidden = showEvolution;
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

  function announceFilterResult() {
    var status = document.getElementById('filterStatus');
    if (!status) return;
    var count = visibleCards().length;
    status.textContent = count + (count === 1 ? ' track shown' : ' tracks shown');
  }

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      activateFilter(btn, false);

      var filter = btn.getAttribute('data-filter');
      syncSectionVisibility(filter);
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
              if (trackCards.indexOf(card) === currentTrackIndex) {
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
          var visibleFeatured = visibleCards()[0];
          if (visibleFeatured) {
            selectTrack(visibleFeatured, { reveal: false, autoplay: isPlaying || playRequested });
          }
        } else if (activeCard) {
          syncFeaturedTrack(activeCard, false);
        }
      } else if (!galleryCurrentCard || galleryCurrentCard.hasAttribute('data-filtered-out')) {
        var nextFeatured = visibleCards()[0];
        if (nextFeatured) syncFeaturedTrack(nextFeatured, true);
      }
      announceFilterResult();
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
  var musicGallery = document.getElementById('musicGallery');
  var galleryCover = document.getElementById('galleryCover');
  var galleryCategory = document.getElementById('galleryCategory');
  var galleryTitle = document.getElementById('galleryTitle');
  var galleryArtist = document.getElementById('galleryArtist');
  var galleryMeta = document.getElementById('galleryMeta');
  var galleryDescription = document.getElementById('galleryDescription');
  var galleryTags = document.getElementById('galleryTags');
  var galleryPlay = document.getElementById('galleryPlay');

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
  var galleryCurrentCard = null;
  var galleryAnimationTimer = 0;

  var visibleCards = function() {
    return trackCards.filter(function(c) {
      return !c.hasAttribute('data-filtered-out');
    });
  };

  function toText(value) {
    return String(value || '');
  }

  function cssUrl(value) {
    return 'url("' + toText(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '")';
  }

  function coverBackground(coverUrl, fallback) {
    return coverUrl ? cssUrl(coverUrl) + ' center/cover no-repeat, ' + fallback : fallback;
  }

  function getCardAccent(card) {
    if (!card || !window.getComputedStyle) return '#d4612f';
    return getComputedStyle(card).getPropertyValue('--card-accent').trim() || '#d4612f';
  }

  function syncFeaturedTrack(card, animate) {
    if (!musicGallery || !galleryCover || !card) return;

    var changed = galleryCurrentCard !== card;
    var title = toText(card.getAttribute('data-title'));
    var displayTitle = card.querySelector('.track-card__title');
    var artist = card.getAttribute('data-artist') || '';
    var coverUrl = card.getAttribute('data-cover') || '';
    var gradient = card.getAttribute('data-gradient') || 'linear-gradient(135deg, #1a1a1a, #3a2a24)';
    var description = card.querySelector('.track-card__desc');
    var year = card.querySelector('.track-card__year');
    var duration = card.getAttribute('data-duration') || '';
    var lufs = card.getAttribute('data-lufs') || '';
    var firstTag = card.querySelector('.track-card__tag');

    galleryCurrentCard = card;
    musicGallery.style.setProperty('--gallery-accent', getCardAccent(card));
    musicGallery.style.setProperty('--gallery-cover', coverUrl ? cssUrl(coverUrl) : gradient);
    galleryCover.style.background = coverBackground(coverUrl, gradient);
    galleryCover.setAttribute('aria-label', (displayTitle ? displayTitle.textContent : title) + ' album cover');

    if (galleryCategory) galleryCategory.textContent = firstTag ? firstTag.textContent + ' selection' : 'Selected track';
    if (galleryTitle) galleryTitle.textContent = displayTitle ? displayTitle.textContent : title;
    if (galleryArtist) galleryArtist.textContent = artist;
    if (galleryDescription) galleryDescription.textContent = description ? description.textContent : '';

    if (galleryMeta) {
      galleryMeta.innerHTML = '';
      [
        year ? year.textContent : '',
        duration,
        lufs ? lufs + ' LUFS' : ''
      ].filter(Boolean).forEach(function(item) {
        var span = document.createElement('span');
        span.textContent = item;
        galleryMeta.appendChild(span);
      });
    }

    if (galleryTags) {
      galleryTags.innerHTML = '';
      card.querySelectorAll('.track-card__tag').forEach(function(tag) {
        var span = document.createElement('span');
        span.textContent = tag.textContent;
        galleryTags.appendChild(span);
      });
    }

    if (galleryPlay) {
      galleryPlay.setAttribute('aria-label', 'Play ' + (displayTitle ? displayTitle.textContent : title));
    }

    if (animate && changed) {
      musicGallery.classList.remove('is-switching');
      window.clearTimeout(galleryAnimationTimer);
      void musicGallery.offsetWidth;
      musicGallery.classList.add('is-switching');
      galleryAnimationTimer = window.setTimeout(function() {
        musicGallery.classList.remove('is-switching');
      }, 640);
    }
  }

  function bringTrackCardIntoView(card) {
    if (!card || !card.scrollIntoView) return;
    var rect = card.getBoundingClientRect();
    var bottomLimit = window.innerHeight - (playerBar ? playerBar.offsetHeight + 32 : 32);
    var alreadyComfortable = rect.top >= 88 && rect.bottom <= bottomLimit;
    if (alreadyComfortable) return;

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.requestAnimationFrame(function() {
      card.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
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
      var tags = (card.getAttribute('data-tags') || '').split(',');
      var album = tags[0] ? tags[0].charAt(0).toUpperCase() + tags[0].slice(1) : 'Music';
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
    var preserveScroll = !options.reveal;
    var savedScrollX = window.scrollX || window.pageXOffset || 0;
    var savedScrollY = window.scrollY || window.pageYOffset || 0;

    syncFeaturedTrack(card, true);

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

    // Highlight active card
    trackCards.forEach(function(c) { c.classList.remove('active'); });
    card.classList.add('active');
    if (options.reveal) {
      bringTrackCardIntoView(card);
    } else if (preserveScroll) {
      window.requestAnimationFrame(function() {
        window.scrollTo(savedScrollX, savedScrollY);
        window.setTimeout(function() {
          window.scrollTo(savedScrollX, savedScrollY);
        }, 80);
      });
    }
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
      selectTrack(visible[randomIndex], { reveal: true });
      return;
    }
    var newIndex = currentInVisible < 0
      ? 0
      : (currentInVisible + direction + visible.length) % visible.length;
    selectTrack(visible[newIndex], { reveal: true });
  }

  function playNextTrack() {
    selectRelativeTrack(1);
  }

  playPauseBtn.addEventListener('click', togglePlay);
  if (galleryPlay) {
    galleryPlay.addEventListener('click', function() {
      var card = galleryCurrentCard || visibleCards()[0];
      if (card) selectTrack(card);
    });
  }

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

  // Default filter is "All" — hide evolution demos and the evolution section
  // so the curated 15-track grid is what the visitor sees first.
  trackCards.forEach(function(card) {
    if ((card.getAttribute('data-tags') || '').split(',').map(function(t) { return t.trim(); }).indexOf('evolution') !== -1) {
      setCardAvailable(card, false);
      card.classList.add('hidden');
    }
  });
  syncSectionVisibility('all');

  var initialFeatured = visibleCards()[0] || trackCards[0];
  if (initialFeatured) syncFeaturedTrack(initialFeatured, false);
  announceFilterResult();

  updateModeButtons();
  updateMuteButton();
  updatePlayerStateClasses();
  setPlayerStatus('Ready to play', false);

})();
