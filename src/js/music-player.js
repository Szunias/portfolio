/* Playback, transport and persistence. music-library.js owns track formatting
   and list markup; music-visualizer.js observes the same audio element. */
(function () {
  const { sortDate, trackYear, isSketch, kindLabel, rowDetail, trackDetail, displayName, displayNote } = PortfolioMusicLibrary;
  const PLACEHOLDER = 'assets/track-placeholder.svg';
  const STORE_KEY = 'music-player-v2';
  // The archive opens on the chip the page marks as pressed (All on music.html).
  const pressedChip = document.querySelector('[data-filter][aria-pressed="true"]');
  const DEFAULT_FILTER = (pressedChip && pressedChip.dataset.filter) || 'all';

  const tracks = Array.from(document.querySelectorAll('#trackData .track-card'))
    .sort((a, b) => sortDate(b).localeCompare(sortDate(a)));
  const tiles = Array.from(document.querySelectorAll('[data-featured-track]'));
  const library = document.getElementById('musicLibrary');
  if (!tracks.length) return;

  // ---------------------------------------------------------------- elements

  const roleAll = role => Array.from(document.querySelectorAll('[data-player="' + role + '"]'));
  const role = name => document.querySelector('[data-player="' + name + '"]');

  const bar = role('bar');
  const sheet = role('sheet');
  if (!bar) return;

  function setText(name, text) {
    roleAll(name).forEach(el => { el.textContent = text; });
  }
  function setAttr(name, attr, value) {
    roleAll(name).forEach(el => el.setAttribute(attr, value));
  }
  function setStyle(name, prop, value) {
    roleAll(name).forEach(el => { el.style[prop] = value; });
  }
  // An optional line disappears instead of leaving an empty gap.
  function showText(name, text) {
    roleAll(name).forEach(el => {
      el.textContent = text;
      el.hidden = !text;
    });
  }

  // ----------------------------------------------------------------- artwork

  // Every track ships a CSS gradient. Painting it onto a canvas gives a track
  // without usable cover art its own plate on a lock screen or in CarPlay,
  // which would otherwise show an empty square.
  const artCache = new Map();

  function gradientColors(value) {
    if (!value) return [];
    const found = value.match(/hsla?\([^)]*\)|rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}/g);
    return found ? found.slice(0, 6) : [];
  }

  function gradientArt(track) {
    const key = track.dataset.title || '';
    if (artCache.has(key)) return artCache.get(key);
    const colors = gradientColors(track.dataset.gradient);
    let url = PLACEHOLDER;
    if (colors.length) {
      try {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const fill = ctx.createLinearGradient(0, 0, size, size);
          colors.forEach((color, i) => {
            fill.addColorStop(colors.length === 1 ? 0 : i / (colors.length - 1), color);
          });
          ctx.fillStyle = fill;
          ctx.fillRect(0, 0, size, size);
          const vignette = ctx.createRadialGradient(size / 2, size / 2, size * 0.12, size / 2, size / 2, size * 0.72);
          vignette.addColorStop(0, 'rgba(0,0,0,0)');
          vignette.addColorStop(1, 'rgba(0,0,0,0.34)');
          ctx.fillStyle = vignette;
          ctx.fillRect(0, 0, size, size);
          url = canvas.toDataURL('image/jpeg', 0.82);
        }
      } catch (_) {
        url = PLACEHOLDER;
      }
    }
    artCache.set(key, url);
    return url;
  }

  // Covers on the page itself exist only in the review layouts (music-alt,
  // music-crate); music.html has no [data-player="cover"] image at all.
  function artFor(track) {
    if (!track) return PLACEHOLDER;
    if (track.dataset.art) return track.dataset.art;
    if (track.dataset.gradient) return gradientArt(track);
    return PLACEHOLDER;
  }

  function updateArtwork(track) {
    const size = (track.dataset.art && track.dataset.artSize || '1x1').split('x');
    roleAll('cover').forEach(img => {
      img.src = artFor(track);
      img.alt = '';
      // music-alt's plate takes the proportions of the cover it holds.
      const plate = img.closest && img.closest('.stage__plate');
      if (!plate) return;
      plate.style.setProperty('--stage-art-w', String(parseInt(size[0], 10) || 1));
      plate.style.setProperty('--stage-art-h', String(parseInt(size[1], 10) || 1));
    });
  }

  // The lock screen shows a cover only when the catalogue's art-kind marks it
  // genuine ("genuine" or the unconfirmed "genuine?"). AI-looking covers give
  // way to the track's neutral gradient plate.
  function sessionArt(track) {
    if (track.dataset.art && /^genuine/.test(track.dataset.artKind || '')) {
      return { src: track.dataset.art, sizes: track.dataset.artSize || '' };
    }
    if (track.dataset.gradient) return { src: gradientArt(track), sizes: '512x512' };
    return { src: PLACEHOLDER, sizes: '' };
  }

  function artType(src) {
    if (/^data:image\/jpeg/.test(src) || /\.jpe?g$/i.test(src)) return 'image/jpeg';
    if (/\.png$/i.test(src)) return 'image/png';
    if (/\.svg$/i.test(src)) return 'image/svg+xml';
    return '';
  }

  // ------------------------------------------------------------------- audio

  const audio = document.querySelector('[data-music-audio]');
  if (!audio) return;
  audio.preload = 'metadata';

  let current = -1;
  let pool = tracks.map((_, i) => i);
  let order = pool.slice();
  let orderPos = -1;
  let shuffleOn = false;
  let repeatMode = 'off';
  let lastVolume = 0.7;
  let sourceVersion = 0;
  let playbackRequestVersion = 0;
  let changingTrack = false;
  let hasPlaybackError = false;
  let activeFilter = DEFAULT_FILTER;

  audio.volume = lastVolume;

  const volumeAdjustable = (function () {
    try {
      const probe = new Audio();
      probe.volume = 0.42;
      return Math.abs(probe.volume - 0.42) < 0.01;
    } catch (_) {
      return false;
    }
  })();

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
    return Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
  }

  // ------------------------------------------------------------ queue / order

  function shuffled(indices) {
    const out = indices.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  // A real queue rather than a random jump per skip: every track plays once
  // before any repeats, and Previous walks back through what actually played.
  function buildOrder(keepIndex) {
    if (!pool.length) pool = tracks.map((_, i) => i);
    if (shuffleOn) {
      order = shuffled(pool);
      if (validIndex(keepIndex) && order.indexOf(keepIndex) > 0) {
        order.splice(order.indexOf(keepIndex), 1);
        order.unshift(keepIndex);
      }
    } else {
      order = pool.slice();
    }
    orderPos = validIndex(keepIndex) ? order.indexOf(keepIndex) : -1;
    renderQueue();
  }

  function setPool(indices, keepCurrent) {
    pool = indices && indices.length ? indices.slice() : tracks.map((_, i) => i);
    buildOrder(keepCurrent && pool.indexOf(current) >= 0 ? current : null);
  }

  // The last track the listener deliberately navigated to (a click on a
  // track, next/prev, a queue jump). Auto-advance after a track ends and
  // shuffle landings do not count, so they cannot overwrite a real choice.
  let chosenTitle = '';

  function rememberChoice(index) {
    const track = tracks[index];
    chosenTitle = track ? track.dataset.title : '';
    saveState();
  }

  function playOrderPos(position, explicit) {
    if (position < 0 || position >= order.length) return;
    orderPos = position;
    select(order[position], true);
    if (explicit) rememberChoice(order[position]);
  }

  function goNext(userInitiated) {
    if (!order.length) return;
    if (orderPos < 0) {
      playOrderPos(0, userInitiated);
      return;
    }
    if (orderPos + 1 < order.length) {
      playOrderPos(orderPos + 1, userInitiated);
      return;
    }
    if (repeatMode === 'all' || userInitiated) {
      if (shuffleOn && order.length > 1) {
        const previousLast = order[orderPos];
        let reshuffledOrder = shuffled(pool);
        // Avoid replaying the same track straight after a wrap-around.
        if (reshuffledOrder[0] === previousLast) {
          reshuffledOrder.push(reshuffledOrder.shift());
        }
        order = reshuffledOrder;
        renderQueue();
      }
      playOrderPos(0, userInitiated);
      return;
    }
    audio.pause();
    setCurrentTime(0);
    setStatus('End of queue');
    // pause() on already-ended audio does not always fire a pause event.
    setPlayState();
  }

  function goPrevious() {
    // Restarting the track first matches every other player people use.
    if (validIndex(current) && Number.isFinite(audio.duration) && audio.currentTime > 3) {
      setCurrentTime(0);
      return;
    }
    if (orderPos > 0) {
      playOrderPos(orderPos - 1, true);
      return;
    }
    if (order.length) playOrderPos(order.length - 1, true);
  }

  function playTrackIndex(index) {
    if (!validIndex(index)) return;
    if (pool.indexOf(index) < 0) {
      // Widening the queue must also widen the visible filter, otherwise the
      // filter chips and archive list would disagree with the actual queue.
      applyFilter('all');
      buildOrder(index);
    }
    const at = order.indexOf(index);
    if (at >= 0) orderPos = at;
    else buildOrder(index);
    select(index, true);
    rememberChoice(index);
  }

  // ------------------------------------------------------------ media session

  const hasMediaSession = 'mediaSession' in navigator;
  let lastPositionPush = 0;

  function updateMediaMetadata() {
    if (!hasMediaSession || typeof window.MediaMetadata !== 'function') return;
    const track = selectedTrack();
    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }
    const artwork = [];
    const art = sessionArt(track);
    if (art.src) {
      const entry = { src: new URL(art.src, document.baseURI).href };
      const type = artType(art.src);
      if (art.sizes) entry.sizes = art.sizes;
      if (type) entry.type = type;
      artwork.push(entry);
    }
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.dataset.title || 'Untitled track',
        artist: track.dataset.artist || 'Igor Szuniewicz',
        album: kindLabel(track) + ' · ' + trackYear(track),
        artwork: artwork
      });
    } catch (_) { /* metadata is a nicety, never block playback for it */ }
  }

  function updatePlaybackState() {
    if (!hasMediaSession) return;
    if (!selectedTrack()) navigator.mediaSession.playbackState = 'none';
    else navigator.mediaSession.playbackState = audio.paused ? 'paused' : 'playing';
  }

  // Feeds the scrubber in CarPlay and on lock screens. It throws on a
  // non-finite duration or a position past the end, so both are guarded.
  function pushPositionState(force) {
    if (!hasMediaSession || typeof navigator.mediaSession.setPositionState !== 'function') return;
    const now = Date.now();
    if (!force && now - lastPositionPush < 900) return;
    lastPositionPush = now;
    const duration = audio.duration;
    try {
      if (!Number.isFinite(duration) || duration <= 0) {
        navigator.mediaSession.setPositionState();
        return;
      }
      navigator.mediaSession.setPositionState({
        duration: duration,
        playbackRate: audio.playbackRate > 0 ? audio.playbackRate : 1,
        position: clamp(audio.currentTime, 0, duration)
      });
    } catch (_) { /* older engines reject partial state objects */ }
  }

  function registerMediaHandlers() {
    if (!hasMediaSession || typeof navigator.mediaSession.setActionHandler !== 'function') return;
    const actions = {
      play: () => requestPlayback(),
      pause: () => audio.pause(),
      stop: () => { audio.pause(); setCurrentTime(0); },
      previoustrack: () => goPrevious(),
      nexttrack: () => goNext(true),
      seekbackward: details => setCurrentTime(audio.currentTime - ((details && details.seekOffset) || 10)),
      seekforward: details => setCurrentTime(audio.currentTime + ((details && details.seekOffset) || 10)),
      seekto: details => {
        if (!details || typeof details.seekTime !== 'number') return;
        setCurrentTime(details.seekTime);
      }
    };
    Object.keys(actions).forEach(action => {
      // Unsupported actions throw rather than no-op, so each one stands alone.
      try { navigator.mediaSession.setActionHandler(action, actions[action]); } catch (_) {}
    });
  }

  // --------------------------------------------------------------- player UI

  function setStatus(text, state) {
    setText('status', text);
    bar.classList.toggle('is-loading', state === 'loading');
    bar.classList.toggle('has-error', state === 'error');
    bar.setAttribute('aria-busy', String(state === 'loading'));
    setAttr('status', 'role', state === 'error' ? 'alert' : 'status');
    hasPlaybackError = state === 'error';
  }

  function setSeekEnabled(enabled) {
    roleAll('progress').forEach(el => {
      el.setAttribute('aria-disabled', String(!enabled));
    });
  }

  function setPlayState() {
    const track = selectedTrack();
    const playing = !!track && !audio.paused && !audio.ended;
    const trackName = track ? displayName(track) : 'first track';
    const action = playing ? 'Pause' : (hasPlaybackError ? 'Retry' : 'Play');

    bar.classList.toggle('is-playing', playing);
    roleAll('play-icon').forEach(icon => {
      icon.innerHTML = playing
        ? '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>'
        : '<polygon points="6,3 20,12 6,21"></polygon>';
    });
    roleAll('play').forEach(button => {
      button.title = action;
      button.setAttribute('aria-label', action + ' ' + trackName);
    });

    cards().forEach(card => {
      const cardTrack = byTitle.get(cardTitle(card));
      const selected = !!track && cardTrack === track;
      const cardPlaying = selected && playing;
      card.classList.toggle('active', selected);
      card.classList.toggle('is-playing', cardPlaying);
      card.setAttribute('aria-pressed', String(cardPlaying));
      card.setAttribute('aria-label', (cardPlaying ? 'Pause ' : 'Play ') + cardLabels.get(card));
      const state = card.querySelector('.library-row__state');
      if (state) state.textContent = cardPlaying ? 'Pause' : 'Play';
    });

    updatePlaybackState();
    renderQueue();
  }

  function updateProgress() {
    const duration = audio.duration;
    const hasDuration = Number.isFinite(duration) && duration > 0;
    // Catalog lengths use the nearest second; elapsed time counts completed seconds.
    const total = format(Math.round(duration));
    const percent = hasDuration ? clamp(audio.currentTime / duration * 100, 0, 100) : 0;
    setStyle('progress-fill', 'width', percent + '%');
    setText('current-time', format(audio.currentTime));
    if (hasDuration) setText('total-time', total);
    roleAll('progress').forEach(el => {
      el.setAttribute('aria-valuenow', String(Math.round(percent)));
      el.setAttribute('aria-valuetext', format(audio.currentTime) + ' of ' + total);
    });
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
    setStyle('progress-buffer', 'width', percent + '%');
  }

  function updateVolumeUI() {
    const effective = audio.muted ? 0 : audio.volume;
    const percent = Math.round(effective * 100);
    const muted = percent === 0;
    setStyle('volume-fill', 'width', percent + '%');
    roleAll('volume').forEach(el => {
      el.setAttribute('aria-valuenow', String(percent));
      el.setAttribute('aria-valuetext', percent + '%');
    });
    roleAll('mute').forEach(button => {
      button.setAttribute('aria-pressed', String(muted));
      button.setAttribute('aria-label', muted ? 'Unmute audio' : 'Mute audio');
      button.title = muted ? 'Unmute' : 'Mute';
    });
  }

  function updateModeUI() {
    roleAll('shuffle').forEach(button => {
      button.classList.toggle('active', shuffleOn);
      button.setAttribute('aria-pressed', String(shuffleOn));
      button.setAttribute('aria-label', 'Shuffle ' + (shuffleOn ? 'on' : 'off'));
    });
    roleAll('repeat').forEach(button => {
      button.classList.toggle('active', repeatMode !== 'off');
      button.classList.toggle('is-one', repeatMode === 'one');
      button.setAttribute('aria-label', 'Repeat mode: ' + repeatMode);
    });
  }

  function setVolumeValue(value) {
    const next = clamp(value, 0, 1);
    audio.muted = false;
    audio.volume = next;
    if (next > 0) lastVolume = next;
    updateVolumeUI();
    saveState();
  }

  function setCurrentTime(seconds) {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = clamp(seconds, 0, audio.duration);
    updateProgress();
    pushPositionState(true);
  }

  function resetTimeline() {
    setStyle('progress-fill', 'width', '0%');
    setStyle('progress-buffer', 'width', '0%');
    setText('current-time', '0:00');
    roleAll('progress').forEach(el => {
      el.setAttribute('aria-valuenow', '0');
      el.setAttribute('aria-valuetext', '0:00 of 0:00');
    });
    setSeekEnabled(false);
  }

  // -------------------------------------------------------------- playback

  function playbackFailure(error) {
    let message = 'Playback failed. Try again.';
    if (error && error.name === 'NotAllowedError') message = 'Press play to allow audio.';
    else if (error && error.name === 'NotSupportedError') message = 'This browser cannot play the selected audio format.';
    setStatus(message, 'error');
    // A failed media element can retain paused=false even after output stops.
    audio.pause();
    setPlayState();
  }

  function requestPlayback() {
    if (!selectedTrack() || !audio.src) {
      if (order.length) {
        playOrderPos(orderPos >= 0 ? orderPos : 0);
        return;
      }
      setStatus('Select a valid track first.', 'error');
      setPlayState();
      return;
    }

    if (hasPlaybackError || audio.error) {
      try {
        audio.load();
      } catch (error) {
        playbackFailure(error);
        return;
      }
    }

    const attempt = sourceVersion;
    const request = ++playbackRequestVersion;
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
        // Pause/resume can start a new request without changing the source.
        if (attempt !== sourceVersion || request !== playbackRequestVersion) return;
        if (error && error.name === 'AbortError' && audio.paused) {
          setStatus('Paused');
          setPlayState();
          return;
        }
        playbackFailure(error);
      });
    }
  }

  // The selection as a listener reads it: the display name (a long one steps
  // down a size on the stage), the note, the sentence about the piece, the
  // facts line, the link to its film and its place in the set list.
  function showSelection(track) {
    const name = displayName(track);
    roleAll('name').forEach(el => {
      el.textContent = name;
      el.classList.toggle('is-long', name.length > 12);
    });
    showText('note', displayNote(track));
    showText('about', track.dataset.about || displayNote(track));
    setText('facts', [trackDetail(track), track.dataset.duration].filter(Boolean).join(' · '));
    roleAll('page').forEach(link => {
      const page = track.dataset.page || '';
      link.hidden = !page;
      if (page) link.setAttribute('href', page);
    });
    const at = tiles.findIndex(tile => byTitle.get(cardTitle(tile)) === track);
    roleAll('set-position').forEach(el => {
      el.hidden = at < 0;
      if (at < 0) return;
      const index = document.createElement('span');
      index.textContent = String(at + 1).padStart(2, '0');
      el.textContent = '';
      el.append(index, ' / ' + String(tiles.length).padStart(2, '0'));
    });
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

    setText('title', track.dataset.title || 'Untitled track');
    setText('artist', track.dataset.artist || 'Igor Szuniewicz');
    setText('detail', trackDetail(track));
    setText('total-time', track.dataset.duration || '0:00');
    showSelection(track);
    updateArtwork(track);
    bar.classList.add('has-track');
    setStatus(autoplay ? 'Loading' : 'Ready to play', autoplay ? 'loading' : '');

    audio.src = trackSource;
    audio.load();
    updateMediaMetadata();
    pushPositionState(true);
    setPlayState();
    saveState();

    window.setTimeout(() => {
      if (sourceVersion === version) changingTrack = false;
    }, 0);

    if (autoplay) requestPlayback();
    return true;
  }

  // ---------------------------------------------------------------- library

  const byTitle = new Map(tracks.map(track => [track.dataset.title, track]));
  const cardLabels = new WeakMap();
  let libraryRows = [];

  function cardTitle(card) {
    return card.dataset.featuredTrack || card.dataset.catalogTrack || '';
  }

  function cards() {
    return tiles.concat(libraryRows);
  }

  function applyFilter(filter) {
    activeFilter = filter;
    let visible = 0;
    libraryRows.forEach(row => {
      const match = filter === 'all' || row.dataset.kind === filter;
      row.closest('li').hidden = !match;
      if (match) visible += 1;
      const rowTrack = byTitle.get(cardTitle(row));
      const detail = row.querySelector('.library-row__detail');
      if (rowTrack && detail) detail.textContent = rowDetail(rowTrack, filter);
    });
    // A year, the shelf or the whole sketch notebook with nothing left to show
    // goes away with its heading.
    Array.from(document.querySelectorAll('.library-group, .library-sketchbook')).forEach(group => {
      const shown = Array.from(group.querySelectorAll('[data-catalog-track]'))
        .some(row => !row.closest('li').hidden);
      group.hidden = !shown;
    });
    document.querySelectorAll('[data-filter]').forEach(chip => {
      chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter));
    });
    // Playing from a filtered archive should keep you inside that filter.
    const indices = [];
    tracks.forEach((track, index) => {
      if (filter === 'all' || (isSketch(track) ? 'sketch' : 'release') === filter) indices.push(index);
    });
    setPool(indices, true);
    return visible;
  }

  // ------------------------------------------------------------------- queue

  let queueSignature = '';

  function renderQueue() {
    const list = role('queue');
    if (!list) return;
    const upcoming = order.slice(orderPos + 1, orderPos + 21);
    const signature = JSON.stringify([orderPos, repeatMode, upcoming]);
    // Transport events do not change the queue. Keep its nodes and focus intact.
    if (signature === queueSignature) return;
    queueSignature = signature;
    // Rebuilding the list destroys the focused row, which would silently dump
    // keyboard focus to the body inside the open dialog. Remember the slot so
    // focus can land on the equivalent row afterwards.
    const focused = document.activeElement;
    const hadFocus = !!(focused && list.contains(focused));
    const focusSlot = hadFocus
      ? Array.from(list.querySelectorAll('.now-playing__queue-row')).indexOf(focused.closest('.now-playing__queue-row'))
      : -1;
    list.textContent = '';
    if (!upcoming.length) {
      const empty = document.createElement('li');
      empty.className = 'now-playing__queue-empty';
      empty.textContent = repeatMode === 'all'
        ? 'End of the queue. Repeat is on, so it starts over.'
        : 'End of the queue.';
      list.append(empty);
      if (hadFocus) {
        const closeButton = document.querySelector('[data-player="close-sheet"]');
        if (closeButton) closeButton.focus();
      }
      return;
    }
    upcoming.forEach((trackIndex, offset) => {
      const track = tracks[trackIndex];
      if (!track) return;
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'now-playing__queue-row';
      button.setAttribute('aria-label', 'Play ' + displayName(track) + ' next');
      const name = document.createElement('span');
      name.className = 'now-playing__queue-name';
      name.textContent = displayName(track);
      const time = document.createElement('span');
      time.className = 'now-playing__queue-time';
      time.textContent = track.dataset.duration || '';
      button.append(name, time);
      button.addEventListener('click', () => playOrderPos(orderPos + 1 + offset, true));
      item.append(button);
      list.append(item);
    });
    if (hadFocus) {
      const rows = list.querySelectorAll('.now-playing__queue-row');
      const target = rows[Math.max(0, Math.min(focusSlot, rows.length - 1))];
      if (target) target.focus();
    }
  }

  // ------------------------------------------------------------------- sheet

  const canOpenSheet = !!sheet && typeof sheet.showModal === 'function';

  // The open attribute is the single source of truth for the scroll lock.
  // Escape closes a native dialog without running any of our code, and the
  // close event does not fire in every engine, so watching the attribute is
  // the only way the lock cannot get stuck on.
  function syncSheetLock() {
    document.documentElement.classList.toggle('has-sheet-open', !!(sheet && sheet.open));
  }

  function openSheet() {
    if (!canOpenSheet || sheet.open) return;
    sheet.showModal();
    syncSheetLock();
  }

  function closeSheet() {
    if (sheet && sheet.open) sheet.close();
    syncSheetLock();
  }

  if (sheet) {
    if (typeof MutationObserver === 'function') {
      new MutationObserver(syncSheetLock).observe(sheet, {
        attributes: true,
        attributeFilter: ['open']
      });
    }
    sheet.addEventListener('close', syncSheetLock);
    sheet.addEventListener('cancel', syncSheetLock);
    // Clicking the backdrop closes the sheet; clicks inside must not.
    sheet.addEventListener('click', event => {
      if (event.target !== sheet) return;
      const box = sheet.getBoundingClientRect();
      const outside = event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom;
      if (outside) closeSheet();
    });
  }

  roleAll('open-sheet').forEach(button => {
    if (!canOpenSheet) {
      button.hidden = true;
      return;
    }
    button.addEventListener('click', openSheet);
  });
  roleAll('close-sheet').forEach(button => button.addEventListener('click', closeSheet));

  // ---------------------------------------------------------------- sliders

  function valueFromClientX(element, clientX) {
    const rect = element.getBoundingClientRect();
    if (!Number.isFinite(rect.width) || rect.width <= 0) return null;
    return clamp((clientX - rect.left) / rect.width, 0, 1);
  }

  function setupPointerSlider(element, update) {
    if (!('PointerEvent' in window)) {
      element.addEventListener('click', event => update(element, event.clientX));
      return;
    }
    let activePointer = null;
    element.addEventListener('pointerdown', event => {
      if (!event.isPrimary || activePointer !== null || (event.pointerType === 'mouse' && event.button !== 0)) return;
      activePointer = event.pointerId;
      event.preventDefault();
      // touch-action stays pan-y until here, so a swipe that starts on the rail
      // scrolls the page instead of being swallowed by the slider.
      element.classList.add('is-scrubbing');
      element.focus({ preventScroll: true });
      try { element.setPointerCapture(event.pointerId); } catch (_) {}
      update(element, event.clientX);
    });
    element.addEventListener('pointermove', event => {
      if (event.pointerId !== activePointer) return;
      event.preventDefault();
      update(element, event.clientX);
    });
    element.addEventListener('pointerup', event => {
      if (event.pointerId !== activePointer) return;
      event.preventDefault();
      update(element, event.clientX);
      activePointer = null;
      element.classList.remove('is-scrubbing');
      try { element.releasePointerCapture(event.pointerId); } catch (_) {}
    });
    element.addEventListener('pointercancel', event => {
      if (event.pointerId !== activePointer) return;
      activePointer = null;
      element.classList.remove('is-scrubbing');
    });
    element.addEventListener('lostpointercapture', event => {
      if (event.pointerId !== activePointer) return;
      activePointer = null;
      element.classList.remove('is-scrubbing');
    });
  }

  roleAll('progress').forEach(element => {
    setupPointerSlider(element, (el, clientX) => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const value = valueFromClientX(el, clientX);
      if (value === null) return;
      setCurrentTime(value * audio.duration);
    });
    element.addEventListener('keydown', event => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      let next = null;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = audio.currentTime - 5;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = audio.currentTime + 5;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = audio.duration;
      if (next === null) return;
      event.preventDefault();
      setCurrentTime(next);
    });
  });

  roleAll('volume').forEach(element => {
    // iOS ignores writes to audio.volume, so a slider there would be a dead control.
    if (!volumeAdjustable) {
      element.hidden = true;
      return;
    }
    setupPointerSlider(element, (el, clientX) => {
      const value = valueFromClientX(el, clientX);
      if (value === null) return;
      setVolumeValue(value);
    });
    element.addEventListener('keydown', event => {
      const base = audio.muted ? 0 : audio.volume;
      let next = null;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = base - 0.05;
      else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = base + 0.05;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = 1;
      if (next === null) return;
      event.preventDefault();
      setVolumeValue(next);
    });
  });

  // --------------------------------------------------------------- controls

  roleAll('play').forEach(button => button.addEventListener('click', () => {
    if (!validIndex(current)) {
      playOrderPos(orderPos >= 0 ? orderPos : 0);
      return;
    }
    if (audio.paused) requestPlayback();
    else audio.pause();
  }));
  roleAll('prev').forEach(button => button.addEventListener('click', () => goPrevious()));
  roleAll('next').forEach(button => button.addEventListener('click', () => goNext(true)));

  roleAll('shuffle').forEach(button => button.addEventListener('click', () => {
    shuffleOn = !shuffleOn;
    buildOrder(validIndex(current) ? current : null);
    updateModeUI();
    setStatus(shuffleOn ? 'Shuffle on' : 'Shuffle off');
    saveState();
  }));

  roleAll('repeat').forEach(button => button.addEventListener('click', () => {
    repeatMode = repeatMode === 'off' ? 'all' : (repeatMode === 'all' ? 'one' : 'off');
    updateModeUI();
    renderQueue();
    setStatus('Repeat ' + repeatMode);
    saveState();
  }));

  roleAll('mute').forEach(button => button.addEventListener('click', () => {
    if (audio.muted || audio.volume === 0) {
      if (audio.volume === 0) audio.volume = lastVolume || 0.7;
      audio.muted = false;
    } else {
      lastVolume = audio.volume;
      audio.muted = true;
    }
    updateVolumeUI();
    saveState();
  }));

  document.querySelectorAll('[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => applyFilter(chip.dataset.filter || 'all'));
  });

  const playSelected = document.querySelector('[data-play-selected]');
  if (playSelected) {
    playSelected.addEventListener('click', () => {
      const indices = tiles
        .map(tile => tracks.indexOf(byTitle.get(cardTitle(tile))))
        .filter(validIndex);
      if (!indices.length) return;
      shuffleOn = false;
      setPool(indices, false);
      updateModeUI();
      playOrderPos(0);
    });
  }

  const shuffleAll = document.querySelector('[data-shuffle-all]');
  if (shuffleAll) {
    shuffleAll.addEventListener('click', () => {
      shuffleOn = true;
      applyFilter('all');
      buildOrder(null);
      updateModeUI();
      playOrderPos(0);
    });
  }

  // ------------------------------------------------------------ persistence

  function saveState() {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({
        title: chosenTitle,
        volume: audio.volume,
        muted: audio.muted,
        shuffle: shuffleOn,
        repeat: repeatMode
      }));
    } catch (_) { /* private mode or storage disabled */ }
  }

  function restoreState() {
    let saved = null;
    try {
      saved = JSON.parse(window.localStorage.getItem(STORE_KEY) || 'null');
    } catch (_) {
      saved = null;
    }
    if (!saved || typeof saved !== 'object') return;
    if (typeof saved.volume === 'number' && saved.volume >= 0 && saved.volume <= 1) {
      audio.volume = saved.volume;
      if (saved.volume > 0) lastVolume = saved.volume;
    }
    if (saved.muted === true) audio.muted = true;
    shuffleOn = saved.shuffle === true;
    repeatMode = ['off', 'all', 'one'].indexOf(saved.repeat) >= 0 ? saved.repeat : 'off';
    buildOrder(null);
    // Only a track the listener deliberately navigated to comes back, and
    // only while it is still on the set list. Auto-advance never saves, so
    // wherever playback happened to stop cannot outrank the curated opener.
    const onSetList = tiles.some(tile => cardTitle(tile) === saved.title);
    if (saved.title && onSetList && byTitle.has(saved.title)) {
      const index = tracks.indexOf(byTitle.get(saved.title));
      // Restore the selection only when it belongs to the active filter.
      // Autoplay without a gesture is blocked anyway.
      if (validIndex(index) && pool.indexOf(index) >= 0) {
        const at = order.indexOf(index);
        if (at >= 0) orderPos = at;
        chosenTitle = saved.title;
        select(index, false);
      }
    }
  }

  // ----------------------------------------------------------- audio events

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
    if (!hasPlaybackError) setStatus(audio.paused ? 'Ready to play' : 'Playing');
    updateProgress();
    updateBuffered();
    setPlayState();
  });
  audio.addEventListener('play', () => {
    setPlayState();
    pushPositionState(true);
  });
  audio.addEventListener('playing', () => {
    // First real playback: let music.css show the buffered range. Before
    // this, a preloaded buffer next to "Ready to play" looks part-heard.
    document.documentElement.classList.add('has-played');
    setStatus('Playing');
    setPlayState();
    pushPositionState(true);
  });
  audio.addEventListener('pause', () => {
    if (!changingTrack && !hasPlaybackError && selectedTrack() && !audio.ended) setStatus('Paused');
    setPlayState();
    pushPositionState(true);
  });
  audio.addEventListener('ended', () => {
    if (repeatMode === 'one') {
      setCurrentTime(0);
      requestPlayback();
      return;
    }
    goNext(false);
  });
  audio.addEventListener('error', () => {
    const messages = {
      1: 'Audio loading was aborted.',
      2: 'A network error stopped the audio.',
      3: 'The selected audio could not be decoded.',
      4: 'This browser does not support the selected audio.'
    };
    setStatus(messages[audio.error && audio.error.code] || 'The selected audio could not be loaded.', 'error');
    audio.pause();
    setSeekEnabled(false);
    setPlayState();
  });
  audio.addEventListener('loadedmetadata', () => {
    // With preload="metadata" some browsers (Safari/iOS) stop loading here and
    // never fire canplay, which would leave a restored, non-autoplay selection
    // stuck on "Loading" with aria-busy set. Metadata in hand while paused
    // means the track is ready to start.
    if (audio.paused && !hasPlaybackError && selectedTrack()) setStatus('Ready to play');
    updateProgress();
    updateBuffered();
    pushPositionState(true);
  });
  audio.addEventListener('durationchange', () => {
    updateProgress();
    pushPositionState(true);
  });
  audio.addEventListener('volumechange', updateVolumeUI);
  audio.addEventListener('progress', updateBuffered);
  audio.addEventListener('timeupdate', () => {
    updateProgress();
    pushPositionState(false);
  });
  audio.addEventListener('seeked', () => pushPositionState(true));
  audio.addEventListener('ratechange', () => pushPositionState(true));
  audio.addEventListener('emptied', resetTimeline);

  // -------------------------------------------------------------------- init

  libraryRows = PortfolioMusicLibrary.build(library, tracks, activeFilter);

  // The set list's running time is the sum of the catalogue durations.
  const setSeconds = tiles.reduce((sum, tile) => {
    const track = byTitle.get(cardTitle(tile));
    const time = track && /^(\d+):([0-5]\d)$/.exec(track.dataset.duration || '');
    return sum + (time ? Number(time[1]) * 60 + Number(time[2]) : 0);
  }, 0);
  if (setSeconds) setText('set-runtime', Math.round(setSeconds / 60) + ' min');

  cards().forEach(card => {
    const fallback = cardTitle(card) || 'track';
    const label = card.getAttribute('aria-label') || ('Play ' + fallback);
    cardLabels.set(card, label.replace(/^Play\s+/i, ''));
    card.disabled = false;
    card.removeAttribute('aria-disabled');
    card.addEventListener('click', () => {
      const index = tracks.indexOf(byTitle.get(cardTitle(card)));
      if (!validIndex(index)) {
        setStatus('That track is not configured correctly.', 'error');
        setPlayState();
        return;
      }
      if (index === current && !audio.paused) audio.pause();
      else if (index === current) requestPlayback();
      else playTrackIndex(index);
    });
  });

  bar.hidden = false;
  document.querySelectorAll('[data-player-only]').forEach(el => { el.hidden = false; });
  // A play control authored on the page stays inert until the player runs.
  roleAll('play').forEach(button => {
    button.disabled = false;
    button.removeAttribute('aria-disabled');
  });

  registerMediaHandlers();
  applyFilter(DEFAULT_FILTER);
  restoreState();
  // Nothing chosen on an earlier visit: open on the first piece of the set
  // list so the stage shows a selection instead of an empty player.
  if (!selectedTrack() && tiles.length) {
    const firstFeatured = byTitle.get(cardTitle(tiles[0]));
    const firstIndex = firstFeatured ? tracks.indexOf(firstFeatured) : -1;
    if (validIndex(firstIndex)) {
      // The selected opener and Next must share the same queue position.
      if (pool.indexOf(firstIndex) < 0) applyFilter('all');
      buildOrder(firstIndex);
      select(firstIndex, false);
    }
  }
  updateModeUI();
  updateVolumeUI();
  setSeekEnabled(false);
  setPlayState();
})();
