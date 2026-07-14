(function () {
  function sortDate(track) {
    const value = track.dataset.year || '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (/^\d{4}$/.test(value)) return value;
    return '0000';
  }

  const tracks = Array.from(document.querySelectorAll('#trackData .track-card'))
    .sort((a, b) => sortDate(b).localeCompare(sortDate(a)));
  const featuredCards = Array.from(document.querySelectorAll('[data-featured-track]'));
  const catalog = document.getElementById('music-catalog');
  const timeline = document.getElementById('musicTimeline');
  const catalogOpen = document.querySelector('[data-catalog-open]');
  if (!tracks.length || !featuredCards.length) return;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function trackYear(track) {
    const match = (track.dataset.year || '').match(/^(\d{4})/);
    return match ? match[1] : 'Date unknown';
  }

  function visibleDate(track) {
    const value = track.dataset.year || '';
    const match = value.match(/^\d{4}-(\d{2})-(\d{2})$/);
    if (!match) return 'Year only';
    const month = monthNames[Number(match[1]) - 1] || '';
    return `${match[2]} ${month}`.trim();
  }

  function accessibleDate(track) {
    const value = track.dataset.year || '';
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return value || 'date unknown';
    const month = monthNames[Number(match[2]) - 1] || '';
    return `${Number(match[3])} ${month} ${match[1]}`.trim();
  }

  function appendCatalogTrack(track, list) {
    if (!list) return null;
    const item = document.createElement('li');
    const button = document.createElement('button');
    const trackTitle = track.dataset.title || 'Untitled track';
    const kindText = track.dataset.kind === 'sketch' ? 'Sketch' : 'Finished';
    button.className = 'music-catalog__track';
    button.type = 'button';
    button.dataset.catalogTrack = trackTitle;
    button.setAttribute('aria-label', `Play ${trackTitle}, ${accessibleDate(track)}, ${kindText}`);
    button.setAttribute('aria-controls', 'playerBar');
    button.setAttribute('aria-pressed', 'false');

    const date = document.createElement('time');
    date.className = 'music-catalog__date';
    date.dateTime = track.dataset.year || '';
    date.textContent = visibleDate(track);

    const main = document.createElement('span');
    main.className = 'music-catalog__main';
    const name = document.createElement('span');
    name.className = 'music-catalog__name';
    name.textContent = trackTitle;

    const kind = document.createElement('span');
    kind.className = `music-catalog__kind music-catalog__kind--${track.dataset.kind === 'sketch' ? 'sketch' : 'finished'}`;
    kind.textContent = kindText;
    main.append(name, kind);

    const duration = document.createElement('span');
    duration.className = 'music-catalog__duration';
    duration.textContent = track.dataset.duration || '';

    const action = document.createElement('span');
    action.className = 'music-catalog__play';
    action.textContent = 'Play';
    action.setAttribute('aria-hidden', 'true');

    button.append(date, main, duration, action);
    item.append(button);
    list.append(item);
    return button;
  }

  function buildTimeline() {
    if (!timeline) return [];
    const years = new Map();
    tracks.forEach(track => {
      const year = trackYear(track);
      if (!years.has(year)) years.set(year, []);
      years.get(year).push(track);
    });

    const buttons = [];
    years.forEach((yearTracks, year) => {
      const section = document.createElement('section');
      section.className = 'music-timeline__year';
      section.setAttribute('aria-labelledby', `music-year-${year.replace(/\s+/g, '-').toLowerCase()}`);

      const heading = document.createElement('header');
      heading.className = 'music-timeline__year-heading';
      const title = document.createElement('h3');
      title.id = `music-year-${year.replace(/\s+/g, '-').toLowerCase()}`;
      title.textContent = year;
      const finishedCount = yearTracks.filter(track => track.dataset.kind !== 'sketch').length;
      const sketchCount = yearTracks.length - finishedCount;
      const meta = document.createElement('p');
      const parts = [];
      if (finishedCount) parts.push(`${finishedCount} finished`);
      if (sketchCount) parts.push(`${sketchCount} ${sketchCount === 1 ? 'sketch' : 'sketches'}`);
      meta.textContent = parts.join(' · ');
      heading.append(title, meta);

      const list = document.createElement('ol');
      list.className = 'music-timeline__list';
      yearTracks.forEach(track => {
        const button = appendCatalogTrack(track, list);
        if (button) buttons.push(button);
      });

      section.append(heading, list);
      timeline.append(section);
    });
    return buttons;
  }

  const catalogCards = buildTimeline();
  const cards = [...featuredCards, ...catalogCards];

  if (catalog && catalogOpen) {
    const syncCatalogState = () => catalogOpen.setAttribute('aria-expanded', String(catalog.open));
    catalog.addEventListener('toggle', syncCatalogState);
    catalogOpen.addEventListener('click', event => {
      event.preventDefault();
      catalog.open = true;
      syncCatalogState();
      catalog.scrollIntoView({ block: 'start' });
    });
    syncCatalogState();
  }

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
    const fallback = card.dataset.featuredTrack || card.dataset.catalogTrack || 'track';
    const label = card.getAttribute('aria-label') || `Play ${fallback}`;
    cardLabels.set(card, label.replace(/^Play\s+/i, ''));
  });

  function cardTitle(card) {
    return card.dataset.featuredTrack || card.dataset.catalogTrack || '';
  }

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
      const cardTrack = byTitle.get(cardTitle(card));
      const selected = !!track && cardTrack === track;
      const cardPlaying = selected && playing;
      card.classList.toggle('active', selected);
      card.classList.toggle('is-playing', cardPlaying);
      card.setAttribute('aria-pressed', String(cardPlaying));
      card.setAttribute('aria-label', `${cardPlaying ? 'Pause' : 'Play'} ${cardLabels.get(card)}`);
      const catalogAction = card.querySelector('.music-catalog__play');
      if (catalogAction) catalogAction.textContent = cardPlaying ? 'Pause' : 'Play';
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
      element.focus({ preventScroll: true });
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
    cover.style.backgroundImage = track.dataset.cover
      ? `url("${track.dataset.cover.replace(/"/g, '%22')}")`
      : (track.dataset.gradient || '');
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
    const track = byTitle.get(cardTitle(card));
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
