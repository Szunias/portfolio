(function () {
  const PLACEHOLDER = 'assets/track-placeholder.svg';
  const STORE_KEY = 'music-player-v2';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function sortDate(track) {
    const value = track.dataset.year || '';
    if (/^\d{4}(-\d{2}-\d{2})?$/.test(value)) return value;
    return '0000';
  }

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

  // ---------------------------------------------------------------- metadata

  function trackYear(track) {
    const match = (track.dataset.year || '').match(/^(\d{4})/);
    return match ? match[1] : 'Date unknown';
  }

  function visibleDate(track) {
    const match = (track.dataset.year || '').match(/^\d{4}-(\d{2})-(\d{2})$/);
    if (!match) return 'Year only';
    return (match[2] + ' ' + (MONTHS[Number(match[1]) - 1] || '')).trim();
  }

  function accessibleDate(track) {
    const value = track.dataset.year || '';
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return value || 'date unknown';
    return (Number(match[3]) + ' ' + (MONTHS[Number(match[2]) - 1] || '') + ' ' + match[1]).trim();
  }

  function isSketch(track) {
    return track.dataset.kind === 'sketch';
  }

  function kindLabel(track) {
    return isSketch(track) ? 'Sketch' : 'Finished';
  }

  function trackDetail(track) {
    const date = visibleDate(track) === 'Year only' ? trackYear(track) : accessibleDate(track);
    return kindLabel(track) + ' · ' + date;
  }

  // ----------------------------------------------------------------- artwork

  // Sketches ship a CSS gradient instead of a cover file. Painting that gradient
  // onto a canvas gives every sketch its own recognisable plate on a lock screen
  // or in CarPlay, which would otherwise show an empty square.
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

  function artFor(track) {
    if (!track) return PLACEHOLDER;
    if (track.dataset.art) return track.dataset.art;
    if (track.dataset.gradient) return gradientArt(track);
    return PLACEHOLDER;
  }

  function artSizeFor(track) {
    if (track && track.dataset.art) return track.dataset.artSize || '';
    if (track && track.dataset.gradient) return '512x512';
    return '';
  }

  function artTypeFor(track) {
    const src = artFor(track);
    if (/^data:image\/jpeg/.test(src) || /\.jpe?g$/i.test(src)) return 'image/jpeg';
    if (/\.png$/i.test(src)) return 'image/png';
    if (/\.svg$/i.test(src)) return 'image/svg+xml';
    return '';
  }

  function rowArtStyle(track) {
    if (track.dataset.thumb) return 'url("' + track.dataset.thumb.replace(/"/g, '%22') + '")';
    return track.dataset.gradient || '';
  }

  // ------------------------------------------------------------------- audio

  const audio = new Audio();
  audio.preload = 'metadata';

  let current = -1;
  let pool = tracks.map((_, i) => i);
  let order = pool.slice();
  let orderPos = -1;
  let shuffleOn = false;
  let repeatMode = 'off';
  let lastVolume = 0.7;
  let sourceVersion = 0;
  let changingTrack = false;
  let hasPlaybackError = false;
  let activeFilter = 'all';

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

  function playOrderPos(position) {
    if (position < 0 || position >= order.length) return;
    orderPos = position;
    select(order[position], true);
  }

  function goNext(userInitiated) {
    if (!order.length) return;
    if (orderPos < 0) {
      playOrderPos(0);
      return;
    }
    if (orderPos + 1 < order.length) {
      playOrderPos(orderPos + 1);
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
      playOrderPos(0);
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
      playOrderPos(orderPos - 1);
      return;
    }
    if (order.length) playOrderPos(order.length - 1);
  }

  function playTrackIndex(index) {
    if (!validIndex(index)) return;
    if (pool.indexOf(index) < 0) {
      pool = tracks.map((_, i) => i);
      buildOrder(index);
    }
    const at = order.indexOf(index);
    if (at >= 0) orderPos = at;
    else buildOrder(index);
    select(index, true);
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
    const src = artFor(track);
    if (src) {
      const entry = { src: new URL(src, document.baseURI).href };
      const sizes = artSizeFor(track);
      const type = artTypeFor(track);
      if (sizes) entry.sizes = sizes;
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
      el.setAttribute('tabindex', enabled ? '0' : '-1');
    });
  }

  function setPlayState() {
    const track = selectedTrack();
    const playing = !!track && !audio.paused && !audio.ended;
    const trackName = track ? (track.dataset.title || 'track') : 'first track';
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
    const percent = hasDuration ? clamp(audio.currentTime / duration * 100, 0, 100) : 0;
    setStyle('progress-fill', 'width', percent + '%');
    setText('current-time', format(audio.currentTime));
    if (hasDuration) setText('total-time', format(duration));
    roleAll('progress').forEach(el => {
      el.setAttribute('aria-valuenow', String(Math.round(percent)));
      el.setAttribute('aria-valuetext', format(audio.currentTime) + ' of ' + format(duration));
    });
    setSeekEnabled(hasDuration);
    drawScrubbers();
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
    drawScrubbers();
  }

  // ------------------------------------------------------- loudness envelope

  // 120 levels per track, base36, written into data-peaks by npm run peaks.
  // Bars grow from the baseline rather than mirroring around a centre line:
  // this is meant to read as data about where the track gets loud, not as
  // waveform decoration.
  let envelopeColors = null;

  function decodePeaks(value) {
    if (!value) return [];
    const levels = new Array(value.length);
    for (let i = 0; i < value.length; i++) {
      const level = parseInt(value[i], 36);
      levels[i] = Number.isFinite(level) ? level : 0;
    }
    return levels;
  }

  function paletteForEnvelope() {
    if (envelopeColors) return envelopeColors;
    const styles = getComputedStyle(document.documentElement);
    const accent = (styles.getPropertyValue('--accent') || '').trim();
    envelopeColors = {
      played: accent || '#aac6de',
      buffered: 'rgba(236, 238, 240, 0.32)',
      rest: 'rgba(236, 238, 240, 0.16)'
    };
    return envelopeColors;
  }

  // Downsampling keeps the small previews legible: 120 bars in a 100px row
  // would be under a pixel each.
  function resample(levels, buckets) {
    if (levels.length <= buckets) return levels;
    const out = new Array(buckets);
    for (let i = 0; i < buckets; i++) {
      const from = Math.floor(i * levels.length / buckets);
      const to = Math.max(from + 1, Math.floor((i + 1) * levels.length / buckets));
      let peak = 0;
      for (let j = from; j < to && j < levels.length; j++) peak = Math.max(peak, levels[j]);
      out[i] = peak;
    }
    return out;
  }

  function paintEnvelope(canvas, levels, playedRatio, bufferedRatio, buckets) {
    if (!canvas || typeof canvas.getContext !== 'function') return false;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return false;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    ctx.clearRect(0, 0, pixelWidth, pixelHeight);
    if (!levels.length) return true;

    const bars = buckets ? resample(levels, buckets) : levels;
    const colors = paletteForEnvelope();
    const slot = pixelWidth / bars.length;
    const barWidth = Math.max(dpr, slot * 0.62);
    const inset = (slot - barWidth) / 2;
    // Silent buckets keep a hairline so the track still reads as a full scrubber.
    const minHeight = Math.max(dpr, pixelHeight * 0.06);

    for (let i = 0; i < bars.length; i++) {
      const position = (i + 0.5) / bars.length;
      const barHeight = Math.max(minHeight, (bars[i] / 35) * pixelHeight);
      ctx.fillStyle = position <= playedRatio
        ? colors.played
        : (position <= bufferedRatio ? colors.buffered : colors.rest);
      ctx.fillRect(i * slot + inset, pixelHeight - barHeight, barWidth, barHeight);
    }
    return true;
  }

  function playbackRatios() {
    const duration = audio.duration;
    const hasDuration = Number.isFinite(duration) && duration > 0;
    const played = hasDuration ? clamp(audio.currentTime / duration, 0, 1) : 0;
    let buffered = 0;
    if (hasDuration && audio.buffered.length) {
      try {
        buffered = clamp(audio.buffered.end(audio.buffered.length - 1) / duration, 0, 1);
      } catch (_) {
        buffered = 0;
      }
    }
    return { played: played, buffered: buffered };
  }

  // The scrubbers: one in the bar, one in the sheet. Both are always redrawn,
  // because the bar one stays on screen while the sheet is closed.
  function drawScrubbers() {
    const track = selectedTrack();
    const levels = track ? decodePeaks(track.dataset.peaks) : [];
    const r = playbackRatios();
    roleAll('envelope').forEach(canvas => {
      if (canvas.closest('[hidden]')) return;
      paintEnvelope(canvas, levels, r.played, r.buffered, 0);
    });
    drawActiveRowWave();
  }

  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(() => drawScrubbers());
    roleAll('envelope').forEach(canvas => ro.observe(canvas));
  }

  // Every archive row carries its own shape, so the list shows where a track
  // gets loud before you play it. These are previews only: the row is a button
  // and must keep a single click target, so seeking happens in the bar and in
  // the sheet, which are real sliders.
  const rowWaves = new Map();

  function drawRowWave(button, track, withProgress) {
    const canvas = rowWaves.get(button);
    if (!canvas) return;
    const r = withProgress ? playbackRatios() : { played: 0, buffered: 0 };
    paintEnvelope(canvas, decodePeaks(track.dataset.peaks), r.played, r.buffered, 44);
  }

  function drawAllRowWaves() {
    const playing = selectedTrack();
    libraryRows.forEach(button => {
      const track = byTitle.get(cardTitle(button));
      if (track) drawRowWave(button, track, track === playing);
    });
  }

  function drawActiveRowWave() {
    const track = selectedTrack();
    if (!track || !libraryRows.length) return;
    libraryRows.forEach(button => {
      if (byTitle.get(cardTitle(button)) === track) drawRowWave(button, track, true);
    });
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
        if (attempt !== sourceVersion) return;
        if (error && error.name === 'AbortError' && audio.paused) {
          setStatus('Paused');
          setPlayState();
          return;
        }
        playbackFailure(error);
      });
    }
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
    const art = artFor(track);
    roleAll('cover').forEach(img => {
      img.src = art;
      img.alt = '';
    });
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

  function buildLibrary() {
    if (!library) return [];
    const years = new Map();
    tracks.forEach((track, index) => {
      const year = trackYear(track);
      if (!years.has(year)) years.set(year, []);
      years.get(year).push({ track: track, index: index });
    });

    const rows = [];
    years.forEach((entries, year) => {
      const group = document.createElement('section');
      group.className = 'library-group';
      group.dataset.year = year;

      const heading = document.createElement('header');
      heading.className = 'library-group__head';
      const title = document.createElement('h3');
      title.textContent = year;
      const finished = entries.filter(entry => !isSketch(entry.track)).length;
      const sketches = entries.length - finished;
      const meta = document.createElement('p');
      const parts = [];
      if (finished) parts.push(finished + ' finished');
      if (sketches) parts.push(sketches + (sketches === 1 ? ' sketch' : ' sketches'));
      meta.textContent = parts.join(' · ');
      heading.append(title, meta);

      const list = document.createElement('ol');
      list.className = 'library-group__list';

      entries.forEach(entry => {
        const track = entry.track;
        const item = document.createElement('li');
        const button = document.createElement('button');
        const trackTitle = track.dataset.title || 'Untitled track';
        button.className = 'library-row';
        button.type = 'button';
        button.dataset.catalogTrack = trackTitle;
        button.dataset.kind = isSketch(track) ? 'sketch' : 'release';
        button.setAttribute('aria-label', 'Play ' + trackTitle + ', ' + accessibleDate(track) + ', ' + kindLabel(track));
        button.setAttribute('aria-controls', 'playerBar');
        button.setAttribute('aria-pressed', 'false');

        const art = document.createElement('span');
        art.className = 'library-row__art';
        art.setAttribute('aria-hidden', 'true');
        art.style.backgroundImage = rowArtStyle(track);

        const main = document.createElement('span');
        main.className = 'library-row__main';
        const name = document.createElement('span');
        name.className = 'library-row__name';
        name.textContent = trackTitle;
        const kind = document.createElement('span');
        kind.className = 'library-row__kind library-row__kind--' + (isSketch(track) ? 'sketch' : 'finished');
        kind.textContent = kindLabel(track);
        main.append(name, kind);

        const date = document.createElement('time');
        date.className = 'library-row__date';
        date.dateTime = track.dataset.year || '';
        date.textContent = visibleDate(track);

        const wave = document.createElement('canvas');
        wave.className = 'library-row__wave';
        wave.setAttribute('aria-hidden', 'true');

        const duration = document.createElement('span');
        duration.className = 'library-row__duration';
        duration.textContent = track.dataset.duration || '';

        const state = document.createElement('span');
        state.className = 'library-row__state';
        state.textContent = 'Play';
        state.setAttribute('aria-hidden', 'true');

        button.append(art, main, wave, date, duration, state);
        item.append(button);
        list.append(item);
        rowWaves.set(button, wave);
        rows.push(button);
      });

      group.append(heading, list);
      library.append(group);
    });
    return rows;
  }

  function applyFilter(filter) {
    activeFilter = filter;
    let visible = 0;
    libraryRows.forEach(row => {
      const match = filter === 'all' || row.dataset.kind === filter;
      row.closest('li').hidden = !match;
      if (match) visible += 1;
    });
    Array.from(document.querySelectorAll('.library-group')).forEach(group => {
      const shown = Array.from(group.querySelectorAll('.library-row'))
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
    // Hidden rows have no measurable width, so the shown ones are repainted.
    drawAllRowWaves();
    return visible;
  }

  // ------------------------------------------------------------------- queue

  function renderQueue() {
    const list = role('queue');
    if (!list) return;
    const upcoming = order.slice(orderPos + 1, orderPos + 21);
    list.textContent = '';
    if (!upcoming.length) {
      const empty = document.createElement('li');
      empty.className = 'now-playing__queue-empty';
      empty.textContent = repeatMode === 'all'
        ? 'End of the queue. Repeat is on, so it starts over.'
        : 'End of the queue.';
      list.append(empty);
      return;
    }
    upcoming.forEach((trackIndex, offset) => {
      const track = tracks[trackIndex];
      if (!track) return;
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'now-playing__queue-row';
      button.setAttribute('aria-label', 'Play ' + (track.dataset.title || 'track') + ' next');
      const art = document.createElement('span');
      art.className = 'now-playing__queue-art';
      art.setAttribute('aria-hidden', 'true');
      art.style.backgroundImage = rowArtStyle(track);
      const name = document.createElement('span');
      name.className = 'now-playing__queue-name';
      name.textContent = track.dataset.title || 'Untitled track';
      const time = document.createElement('span');
      time.className = 'now-playing__queue-time';
      time.textContent = track.dataset.duration || '';
      button.append(art, name, time);
      button.addEventListener('click', () => playOrderPos(orderPos + 1 + offset));
      item.append(button);
      list.append(item);
    });
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
    // The canvas has no measurable size until the dialog is laid out.
    drawScrubbers();
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
      if (event.target === sheet) closeSheet();
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
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
      activePointer = event.pointerId;
      event.preventDefault();
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
      try { element.releasePointerCapture(event.pointerId); } catch (_) {}
    });
    element.addEventListener('pointercancel', event => {
      if (event.pointerId === activePointer) activePointer = null;
    });
    element.addEventListener('lostpointercapture', event => {
      if (event.pointerId === activePointer) activePointer = null;
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
      const track = selectedTrack();
      window.localStorage.setItem(STORE_KEY, JSON.stringify({
        title: track ? track.dataset.title : '',
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
    if (saved.title && byTitle.has(saved.title)) {
      const index = tracks.indexOf(byTitle.get(saved.title));
      // Restore the selection only. Autoplay without a gesture is blocked anyway.
      if (validIndex(index)) {
        const at = order.indexOf(index);
        if (at >= 0) orderPos = at;
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
    setSeekEnabled(false);
    setPlayState();
  });
  audio.addEventListener('loadedmetadata', () => {
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

  libraryRows = buildLibrary();

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

  registerMediaHandlers();
  applyFilter('all');
  restoreState();
  updateModeUI();
  updateVolumeUI();
  setSeekEnabled(false);
  setPlayState();
  drawAllRowWaves();
  drawScrubbers();

  let repaintTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(repaintTimer);
    repaintTimer = window.setTimeout(() => {
      drawAllRowWaves();
      drawScrubbers();
    }, 140);
  });
})();
