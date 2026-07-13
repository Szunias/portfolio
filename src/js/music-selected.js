(function () {
  const tracks = Array.from(document.querySelectorAll('#trackData .track-card'));
  const cards = Array.from(document.querySelectorAll('[data-featured-track]'));
  if (!tracks.length || !cards.length) return;

  const bar = document.getElementById('playerBar');
  const title = document.getElementById('playerTitle');
  const artist = document.getElementById('playerArtist');
  const status = document.getElementById('playerStatus');
  const cover = document.getElementById('playerCover');
  const play = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playPauseIcon');
  const previous = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  const repeat = document.getElementById('repeatBtn');
  const shuffle = document.getElementById('shuffleBtn');
  const mute = document.getElementById('muteBtn');
  const progress = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const bufferFill = document.getElementById('progressBuffer');
  const currentTime = document.getElementById('currentTime');
  const totalTime = document.getElementById('totalTime');
  const volume = document.getElementById('volumeBar');
  const volumeFill = document.getElementById('volumeFill');
  const required = [bar, title, artist, status, cover, play, playIcon, previous, next,
    repeat, shuffle, mute, progress, progressFill, bufferFill, currentTime, totalTime,
    volume, volumeFill];
  if (required.some(element => !element)) return;

  bar.hidden = false;
  cards.forEach(card => {
    card.disabled = false;
    card.removeAttribute('aria-disabled');
  });

  const byTitle = new Map(tracks.map(track => [track.dataset.title, track]));
  const cardLabels = new WeakMap();
  cards.forEach(card => {
    const fallback = card.dataset.featuredTrack || 'track';
    const label = card.getAttribute('aria-label') || `Play ${fallback}`;
    cardLabels.set(card, label.replace(/^Play\s+/i, ''));
  });

  const audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = 0.7;

  let current = -1;
  let repeatOne = false;
  let shuffleOn = false;
  let lastVolume = audio.volume;
  let sourceVersion = 0;
  let changingTrack = false;
  let hasPlaybackError = false;

  function validIndex(index) {
    return Number.isInteger(index) && index >= 0 && index < tracks.length;
  }

  function selectedTrack() {
    return validIndex(current) ? tracks[current] : null;
  }

  function source(track) {
    if (!track) return '';
    try {
      return atob(track.dataset.srcE || '').trim();
    } catch (_) {
      return '';
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function format(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    return minutes + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
  }

  function setStatus(text, state) {
    status.textContent = text;
    bar.classList.toggle('is-loading', state === 'loading');
    bar.classList.toggle('has-error', state === 'error');
    bar.setAttribute('aria-busy', String(state === 'loading'));
    status.setAttribute('role', state === 'error' ? 'alert' : 'status');
    hasPlaybackError = state === 'error';
  }

  function setSeekEnabled(enabled) {
    progress.setAttribute('aria-disabled', String(!enabled));
    progress.setAttribute('tabindex', enabled ? '0' : '-1');
  }

  function setPlayState() {
    const track = selectedTrack();
    const playing = !!track && !audio.paused && !audio.ended;
    const trackName = track ? (track.dataset.title || 'track') : 'first track';
    const action = playing ? 'Pause' : (hasPlaybackError ? 'Retry' : 'Play');

    bar.classList.toggle('is-playing', playing);
    playIcon.innerHTML = playing
      ? '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>'
      : '<polygon points="6,3 20,12 6,21"></polygon>';
    play.title = action;
    play.setAttribute('aria-label', `${action} ${trackName}`);

    cards.forEach(card => {
      const cardTrack = byTitle.get(card.dataset.featuredTrack);
      const selected = !!track && cardTrack === track;
      const cardPlaying = selected && playing;
      card.classList.toggle('active', selected);
      card.classList.toggle('is-playing', cardPlaying);
      card.setAttribute('aria-pressed', String(selected));
      card.setAttribute('aria-label', `${cardPlaying ? 'Pause' : 'Play'} ${cardLabels.get(card)}`);
    });
  }

  function updateProgress() {
    const duration = audio.duration;
    const hasDuration = Number.isFinite(duration) && duration > 0;
    const percent = hasDuration ? clamp(audio.currentTime / duration * 100, 0, 100) : 0;
    progressFill.style.width = percent + '%';
    currentTime.textContent = format(audio.currentTime);
    if (hasDuration) totalTime.textContent = format(duration);
    progress.setAttribute('aria-valuenow', String(Math.round(percent)));
    progress.setAttribute('aria-valuetext', `${format(audio.currentTime)} of ${format(duration)}`);
    setSeekEnabled(hasDuration);
  }

  function updateBuffered() {
    const duration = audio.duration;
    let percent = 0;
    if (Number.isFinite(duration) && duration > 0 && audio.buffered.length) {
      try {
        percent = clamp(audio.buffered.end(audio.buffered.length - 1) / duration * 100, 0, 100);
      } catch (_) {
        percent = 0;
      }
    }
    bufferFill.style.width = percent + '%';
  }

  function updateVolumeUI() {
    const effectiveVolume = audio.muted ? 0 : audio.volume;
    const percent = Math.round(effectiveVolume * 100);
    const muted = percent === 0;
    volumeFill.style.width = percent + '%';
    volume.setAttribute('aria-valuenow', String(percent));
    volume.setAttribute('aria-valuetext', percent + '%');
    mute.setAttribute('aria-pressed', String(muted));
    mute.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
    mute.title = muted ? 'Unmute' : 'Mute';
  }

  function setVolumeValue(value) {
    const nextVolume = clamp(value, 0, 1);
    audio.muted = false;
    audio.volume = nextVolume;
    if (nextVolume > 0) lastVolume = nextVolume;
    updateVolumeUI();
  }

  function setCurrentTime(seconds) {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = clamp(seconds, 0, audio.duration);
    updateProgress();
  }

  function valueFromClientX(element, clientX) {
    const rect = element.getBoundingClientRect();
    if (!Number.isFinite(rect.width) || rect.width <= 0) return null;
    return clamp((clientX - rect.left) / rect.width, 0, 1);
  }

  function setVolumeFromClientX(clientX) {
    const value = valueFromClientX(volume, clientX);
    if (value === null) return;
    setVolumeValue(value);
  }

  function seekFromClientX(clientX) {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const value = valueFromClientX(progress, clientX);
    if (value === null) return;
    setCurrentTime(value * audio.duration);
  }

  function setupPointerSlider(element, update) {
    if (!('PointerEvent' in window)) {
      element.addEventListener('click', event => update(event.clientX));
      return;
    }

    let activePointer = null;
    element.addEventListener('pointerdown', event => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      activePointer = event.pointerId;
      event.preventDefault();
      try { element.setPointerCapture(event.pointerId); } catch (_) {}
      update(event.clientX);
    });
    element.addEventListener('pointermove', event => {
      if (event.pointerId !== activePointer) return;
      event.preventDefault();
      update(event.clientX);
    });
    element.addEventListener('pointerup', event => {
      if (event.pointerId !== activePointer) return;
      event.preventDefault();
      update(event.clientX);
      activePointer = null;
      try { element.releasePointerCapture(event.pointerId); } catch (_) {}
    });
    element.addEventListener('pointercancel', event => {
      if (event.pointerId === activePointer) activePointer = null;
    });
    element.addEventListener('lostpointercapture', event => {
      if (event.pointerId === activePointer) activePointer = null;
    });
  }

  function playbackFailure(error) {
    let message = 'Playback failed. Try again.';
    if (error && error.name === 'NotAllowedError') {
      message = 'Press play to allow audio.';
    } else if (error && error.name === 'NotSupportedError') {
      message = 'This browser cannot play the selected audio format.';
    }
    setStatus(message, 'error');
    setPlayState();
  }

  function requestPlayback() {
    if (!selectedTrack() || !audio.src) {
      setStatus('Select a valid track first.', 'error');
      setPlayState();
      return;
    }

    const retrying = hasPlaybackError || !!audio.error;
    if (retrying) {
      try {
        audio.load();
      } catch (error) {
        playbackFailure(error);
        return;
      }
    }

    const attemptVersion = sourceVersion;
    setStatus(audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA ? 'Starting' : 'Loading', 'loading');
    let promise;
    try {
      promise = audio.play();
    } catch (error) {
      playbackFailure(error);
      return;
    }
    if (promise && typeof promise.catch === 'function') {
      promise.catch(error => {
        if (attemptVersion !== sourceVersion) return;
        if (error && error.name === 'AbortError' && audio.paused) {
          setStatus('Paused');
          setPlayState();
          return;
        }
        playbackFailure(error);
      });
    }
  }

  function resetTimeline() {
    progressFill.style.width = '0%';
    bufferFill.style.width = '0%';
    currentTime.textContent = '0:00';
    progress.setAttribute('aria-valuenow', '0');
    progress.setAttribute('aria-valuetext', '0:00 of 0:00');
    setSeekEnabled(false);
  }

  function select(index, autoplay) {
    if (!validIndex(index)) {
      setStatus('That track is not configured correctly.', 'error');
      setPlayState();
      return false;
    }

    const track = tracks[index];
    const trackSource = source(track);
    if (!trackSource) {
      setStatus('The selected track has no playable source.', 'error');
      setPlayState();
      return false;
    }

    sourceVersion += 1;
    const version = sourceVersion;
    changingTrack = true;
    audio.pause();
    current = index;
    resetTimeline();
    title.textContent = track.dataset.title || 'Untitled track';
    artist.textContent = track.dataset.artist || 'Igor Szuniewicz';
    totalTime.textContent = track.dataset.duration || '0:00';
    cover.style.backgroundImage = track.dataset.cover ? `url("${track.dataset.cover.replace(/"/g, '%22')}")` : '';
    bar.classList.add('has-track');
    setStatus(autoplay ? 'Loading' : 'Ready to play', autoplay ? 'loading' : '');
    audio.src = trackSource;
    audio.load();
    setPlayState();
    window.setTimeout(() => {
      if (sourceVersion === version) changingTrack = false;
    }, 0);
    if (autoplay) requestPlayback();
    return true;
  }

  function adjacent(direction) {
    if (!validIndex(current)) {
      select(0, true);
      return;
    }
    if (shuffleOn && tracks.length > 1) {
      const offset = 1 + Math.floor(Math.random() * (tracks.length - 1));
      select((current + offset) % tracks.length, true);
      return;
    }
    select((current + direction + tracks.length) % tracks.length, true);
  }

  cards.forEach(card => card.addEventListener('click', () => {
    const track = byTitle.get(card.dataset.featuredTrack);
    const index = tracks.indexOf(track);
    if (!validIndex(index)) {
      setStatus('That track is not configured correctly.', 'error');
      setPlayState();
      return;
    }
    if (index === current && !audio.paused) audio.pause();
    else if (index === current) requestPlayback();
    else select(index, true);
  }));

  play.addEventListener('click', () => {
    if (!validIndex(current)) {
      select(0, true);
      return;
    }
    if (audio.paused) requestPlayback();
    else audio.pause();
  });
  previous.addEventListener('click', () => adjacent(-1));
  next.addEventListener('click', () => adjacent(1));
  repeat.addEventListener('click', () => {
    repeatOne = !repeatOne;
    repeat.classList.toggle('active', repeatOne);
    repeat.setAttribute('aria-pressed', String(repeatOne));
    repeat.setAttribute('aria-label', 'Repeat one ' + (repeatOne ? 'on' : 'off'));
  });
  shuffle.addEventListener('click', () => {
    shuffleOn = !shuffleOn;
    shuffle.classList.toggle('active', shuffleOn);
    shuffle.setAttribute('aria-pressed', String(shuffleOn));
    shuffle.setAttribute('aria-label', 'Shuffle ' + (shuffleOn ? 'on' : 'off'));
  });
  mute.addEventListener('click', () => {
    if (audio.muted || audio.volume === 0) {
      if (audio.volume === 0) audio.volume = lastVolume || 0.7;
      audio.muted = false;
    } else {
      lastVolume = audio.volume;
      audio.muted = true;
    }
    updateVolumeUI();
  });

  volume.addEventListener('keydown', event => {
    const keyboardVolume = audio.muted ? 0 : audio.volume;
    let nextVolume = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') nextVolume = keyboardVolume - 0.05;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') nextVolume = keyboardVolume + 0.05;
    else if (event.key === 'Home') nextVolume = 0;
    else if (event.key === 'End') nextVolume = 1;
    if (nextVolume === null) return;
    event.preventDefault();
    setVolumeValue(nextVolume);
  });

  progress.addEventListener('keydown', event => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    let nextTime = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') nextTime = audio.currentTime - 5;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') nextTime = audio.currentTime + 5;
    else if (event.key === 'Home') nextTime = 0;
    else if (event.key === 'End') nextTime = audio.duration;
    if (nextTime === null) return;
    event.preventDefault();
    setCurrentTime(nextTime);
  });

  setupPointerSlider(volume, setVolumeFromClientX);
  setupPointerSlider(progress, seekFromClientX);

  audio.addEventListener('loadstart', () => {
    if (selectedTrack()) setStatus('Loading', 'loading');
    updateBuffered();
  });
  audio.addEventListener('waiting', () => {
    if (selectedTrack()) setStatus('Buffering', 'loading');
  });
  audio.addEventListener('stalled', () => {
    if (selectedTrack()) setStatus('Network stalled. Retrying…', 'loading');
  });
  audio.addEventListener('canplay', () => {
    if (!selectedTrack()) return;
    if (hasPlaybackError) {
      updateProgress();
      updateBuffered();
      setPlayState();
      return;
    }
    setStatus(audio.paused ? 'Ready to play' : 'Playing');
    updateProgress();
    updateBuffered();
    setPlayState();
  });
  audio.addEventListener('play', setPlayState);
  audio.addEventListener('playing', () => {
    setStatus('Playing');
    setPlayState();
  });
  audio.addEventListener('pause', () => {
    if (!changingTrack && !hasPlaybackError && selectedTrack() && !audio.ended) setStatus('Paused');
    setPlayState();
  });
  audio.addEventListener('ended', () => {
    if (repeatOne) {
      audio.currentTime = 0;
      requestPlayback();
    } else {
      adjacent(1);
    }
  });
  audio.addEventListener('error', () => {
    const messages = {
      1: 'Audio loading was aborted.',
      2: 'A network error stopped the audio.',
      3: 'The selected audio could not be decoded.',
      4: 'This browser does not support the selected audio.'
    };
    setStatus(messages[audio.error && audio.error.code] || 'The selected audio could not be loaded.', 'error');
    setSeekEnabled(false);
    setPlayState();
  });
  audio.addEventListener('loadedmetadata', () => {
    updateProgress();
    updateBuffered();
  });
  audio.addEventListener('durationchange', updateProgress);
  audio.addEventListener('volumechange', updateVolumeUI);
  audio.addEventListener('progress', updateBuffered);
  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('emptied', resetTimeline);

  updateVolumeUI();
  setSeekEnabled(false);
  setPlayState();
})();
