import { elements, state } from './state.js';
import { TIME_UPDATE_INTERVAL, clamp, formatTime, isValidDuration } from './utils.js';
import { renderPlaylist, updatePlaylistPlayingState, updateDurationDisplay } from './playlist.js';

function ensurePlayerVisible() {
  if (elements.playerBar) {
    elements.playerBar.classList.add('visible');
  }
}

export function loadTrack(index) {
  const track = state.tracks[index];
  if (!track) return;

  state.currentTrackIndex = index;

  if (elements.playerCover) elements.playerCover.src = track.cover;
  if (elements.playerTitle) elements.playerTitle.textContent = track.title;
  if (elements.playerArtist) elements.playerArtist.textContent = track.artist;

  if (elements.progressBar) {
    elements.progressBar.style.cursor = 'pointer';
  }
  if (elements.progressFill) {
    elements.progressFill.style.width = '0%';
    elements.progressFill.classList.remove('dragging');
    elements.progressFill.style.transition = '';
  }
  if (elements.currentTime) elements.currentTime.textContent = '0:00';
  if (elements.totalTime) elements.totalTime.textContent = '0:00';

  const source = Array.isArray(track.sources) ? track.sources[0] : null;
  if (source && source.url) {
    elements.audio.preload = 'auto';
    elements.audio.src = source.url;
    elements.audio.load();
  }

  renderPlaylist();
  updatePlaylistPlayingState();
}

export function play() {
  if (!elements.audio || !elements.audio.src) return;

  const playPromise = elements.audio.play();
  if (!playPromise || typeof playPromise.then !== 'function') {
    state.isPlaying = true;
    return;
  }

  playPromise
    .then(() => {
      state.isPlaying = true;
      if (elements.playBtn) elements.playBtn.textContent = '⏸';
      if (elements.albumArt) elements.albumArt.classList.add('playing');
      ensurePlayerVisible();
      updatePlaylistPlayingState();
    })
    .catch((error) => {
      state.isPlaying = false;
      if (elements.playBtn) elements.playBtn.textContent = '▶';
      if (elements.albumArt) elements.albumArt.classList.remove('playing');
      if (error?.name === 'NotSupportedError' && state.tracks.length > 1) {
        setTimeout(nextTrack, 500);
      }
    });
}

export function pause() {
  if (!elements.audio) return;
  elements.audio.pause();
  state.isPlaying = false;
  if (elements.playBtn) elements.playBtn.textContent = '▶';
  if (elements.albumArt) elements.albumArt.classList.remove('playing');
  updatePlaylistPlayingState();
}

export function togglePlay() {
  if (state.isPlaying) {
    pause();
  } else {
    play();
  }
}

export function nextTrack() {
  if (!state.tracks.length) return;
  state.currentTrackIndex = (state.currentTrackIndex + 1) % state.tracks.length;
  loadTrack(state.currentTrackIndex);
  if (state.isPlaying) play();
}

export function prevTrack() {
  if (!state.tracks.length) return;
  state.currentTrackIndex = (state.currentTrackIndex - 1 + state.tracks.length) % state.tracks.length;
  loadTrack(state.currentTrackIndex);
  if (state.isPlaying) play();
}

function handleLoadedMetadata() {
  if (!elements.audio) return;
  if (!elements.totalTime || !elements.progressBar) return;

  if (isValidDuration(elements.audio.duration)) {
    elements.totalTime.textContent = formatTime(elements.audio.duration);
    elements.progressBar.style.cursor = 'pointer';
    updateDurationDisplay(state.currentTrackIndex, elements.audio.duration);
  } else {
    elements.totalTime.textContent = '0:00';
    elements.progressBar.style.cursor = 'not-allowed';
  }
}

function handleTimeUpdate() {
  if (!elements.audio || !elements.progressFill || !elements.currentTime) return;
  const now = Date.now();
  if (now - state.lastTimeUpdate < TIME_UPDATE_INTERVAL) return;
  state.lastTimeUpdate = now;

  if (state.isDragging) return;
  if (!isValidDuration(elements.audio.duration)) {
    if (elements.progressBar) elements.progressBar.style.cursor = 'not-allowed';
    return;
  }

  const progress = (elements.audio.currentTime / elements.audio.duration) * 100;
  elements.progressFill.style.width = `${progress}%`;
  elements.currentTime.textContent = formatTime(elements.audio.currentTime);
  if (elements.progressBar) elements.progressBar.style.cursor = 'pointer';
}

function handleAudioError() {
  if (!elements.audio || !elements.progressBar || !elements.progressFill || !elements.currentTime || !elements.totalTime) {
    return;
  }

  if (state.isDragging) {
    state.isDragging = false;
    elements.progressFill.classList.remove('dragging');
    elements.progressFill.style.transition = '';
    document.removeEventListener('mousemove', handleProgressBarDrag);
    document.removeEventListener('mouseup', handleProgressBarMouseUp);
  }

  elements.progressFill.style.width = '0%';
  elements.currentTime.textContent = '0:00';
  elements.totalTime.textContent = '0:00';
  elements.progressBar.style.cursor = 'not-allowed';

  if (elements.progressHover) elements.progressHover.style.opacity = '0';
  if (elements.progressTooltip) elements.progressTooltip.style.opacity = '0';

  pause();

  if (state.tracks.length > 1) {
    setTimeout(nextTrack, 1000);
  }
}

function handleProgressBarMouseDown(event) {
  if (!elements.audio || !elements.progressBar) return;
  if (!isValidDuration(elements.audio.duration)) return;

  state.dragStartX = event.clientX;
  state.dragMoved = false;
  state.isDragging = true;
  state.wasPlayingBeforeDrag = !elements.audio.paused;

  document.addEventListener('mousemove', handleProgressBarDrag);
  document.addEventListener('mouseup', handleProgressBarMouseUp);

  event.preventDefault();
}

function handleProgressBarDrag(event) {
  if (!state.isDragging || !elements.progressBar || !elements.progressFill || !elements.audio || !elements.currentTime) {
    return;
  }

  if (Math.abs(event.clientX - state.dragStartX) > 3) {
    state.dragMoved = true;
    if (!elements.progressFill.classList.contains('dragging')) {
      elements.progressFill.classList.add('dragging');
      elements.progressFill.style.transition = 'none';
    }
  }

  if (!state.dragMoved) return;

  const rect = elements.progressBar.getBoundingClientRect();
  const percent = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  elements.progressFill.style.width = `${percent * 100}%`;
  elements.currentTime.textContent = formatTime(percent * elements.audio.duration);
}

function handleProgressBarMouseUp(event) {
  if (!state.isDragging || !elements.progressBar || !elements.progressFill || !elements.audio || !elements.currentTime) {
    return;
  }

  document.removeEventListener('mousemove', handleProgressBarDrag);
  document.removeEventListener('mouseup', handleProgressBarMouseUp);

  if (state.dragMoved) {
    const rect = elements.progressBar.getBoundingClientRect();
    const percent = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const newTime = percent * elements.audio.duration;

    elements.progressFill.classList.remove('dragging');
    elements.progressFill.style.transition = '';

    elements.audio.currentTime = newTime;
    elements.currentTime.textContent = formatTime(newTime);

    if (state.wasPlayingBeforeDrag) {
      play();
    }
  }

  state.isDragging = false;
  state.dragMoved = false;
}

function handleProgressBarClick(event) {
  if (!elements.audio || !elements.progressBar || !elements.progressFill || !elements.currentTime) return;
  if (!isValidDuration(elements.audio.duration)) return;
  if (state.dragMoved) return;

  if (elements.audio.seekable.length === 0 || (elements.audio.seekable.length > 0 && elements.audio.seekable.end(0) === 0)) {
    return;
  }

  const rect = elements.progressBar.getBoundingClientRect();
  const percent = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  const newTime = percent * elements.audio.duration;

  elements.progressFill.style.width = `${percent * 100}%`;
  elements.currentTime.textContent = formatTime(newTime);

  const wasPlaying = !elements.audio.paused;
  if (wasPlaying) elements.audio.pause();
  elements.audio.currentTime = newTime;
  if (wasPlaying) {
    setTimeout(() => elements.audio.play().catch(() => {}), 50);
  }
}

function handleProgressBarMouseMove(event) {
  if (!elements.audio || !elements.progressBar || !elements.progressHover || !elements.progressTooltip) return;
  if (state.isDragging || !isValidDuration(elements.audio.duration)) return;

  if (state.hoverUpdateFrame) {
    cancelAnimationFrame(state.hoverUpdateFrame);
  }

  state.hoverUpdateFrame = requestAnimationFrame(() => {
    const rect = elements.progressBar.getBoundingClientRect();
    const percent = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    elements.progressHover.style.width = `${percent * 100}%`;
    const hoverTime = percent * elements.audio.duration;
    elements.progressTooltip.textContent = formatTime(hoverTime);
    elements.progressTooltip.style.left = `${event.clientX - rect.left}px`;
  });
}

function handleProgressBarMouseEnter() {
  if (!elements.audio || !elements.progressBar || !elements.progressHover || !elements.progressTooltip) return;
  if (!isValidDuration(elements.audio.duration)) {
    elements.progressBar.style.cursor = 'not-allowed';
    return;
  }

  elements.progressBar.style.cursor = 'pointer';
  elements.progressHover.style.opacity = '1';
  elements.progressTooltip.style.opacity = '1';
}

function handleProgressBarMouseLeave() {
  if (state.hoverUpdateFrame) {
    cancelAnimationFrame(state.hoverUpdateFrame);
    state.hoverUpdateFrame = null;
  }

  if (elements.progressHover) elements.progressHover.style.opacity = '0';
  if (elements.progressTooltip) elements.progressTooltip.style.opacity = '0';
}

function updateVolumeIcon(volume) {
  if (!elements.volumeIcon) return;
  if (volume === 0) {
    elements.volumeIcon.textContent = '🔇';
  } else if (volume < 0.3) {
    elements.volumeIcon.textContent = '🔈';
  } else if (volume < 0.7) {
    elements.volumeIcon.textContent = '🔉';
  } else {
    elements.volumeIcon.textContent = '🔊';
  }
}

function handlePlaylistActivation(target) {
  if (!elements.playlist) return;
  const item = target.closest('.playlist-item');
  if (!item) return;
  const index = Number.parseInt(item.dataset.trackIndex, 10);
  if (Number.isNaN(index)) return;

  if (index === state.currentTrackIndex && elements.audio?.src) {
    togglePlay();
    return;
  }

  loadTrack(index);
  play();
}

export function bindPlayerEvents() {
  if (!elements.audio) return;

  elements.audio.volume = state.previousVolume;
  if (elements.volumeSlider) {
    elements.volumeSlider.value = String(state.previousVolume * 100);
    elements.volumeSlider.style.setProperty('--volume-percent', `${state.previousVolume * 100}%`);
  }
  updateVolumeIcon(state.previousVolume);

  if (elements.playBtn) elements.playBtn.addEventListener('click', togglePlay);
  if (elements.nextBtn) elements.nextBtn.addEventListener('click', nextTrack);
  if (elements.prevBtn) elements.prevBtn.addEventListener('click', prevTrack);

  elements.audio.addEventListener('loadedmetadata', handleLoadedMetadata);
  elements.audio.addEventListener('timeupdate', handleTimeUpdate);
  elements.audio.addEventListener('error', handleAudioError);
  elements.audio.addEventListener('ended', nextTrack);
  elements.audio.addEventListener('stalled', () => {});
  elements.audio.addEventListener('suspend', () => {});
  elements.audio.addEventListener('abort', () => {
    if (elements.progressBar) elements.progressBar.style.cursor = 'not-allowed';
  });

  if (elements.progressBar) {
    elements.progressBar.addEventListener('mousedown', handleProgressBarMouseDown);
    elements.progressBar.addEventListener('click', handleProgressBarClick);
    elements.progressBar.addEventListener('mousemove', handleProgressBarMouseMove);
    elements.progressBar.addEventListener('mouseenter', handleProgressBarMouseEnter);
    elements.progressBar.addEventListener('mouseleave', handleProgressBarMouseLeave);
  }

  window.addEventListener('beforeunload', () => {
    if (!state.isDragging) return;
    state.isDragging = false;
    if (elements.progressFill) {
      elements.progressFill.classList.remove('dragging');
      elements.progressFill.style.transition = '';
    }
    document.removeEventListener('mousemove', handleProgressBarDrag);
    document.removeEventListener('mouseup', handleProgressBarMouseUp);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden || !state.isDragging) return;
    handleProgressBarMouseUp(new MouseEvent('mouseup'));
  });

  if (elements.progressHover && elements.progressTooltip) {
    elements.progressHover.style.opacity = '0';
    elements.progressTooltip.style.opacity = '0';
  }

  if (elements.volumeSlider) {
    elements.volumeSlider.addEventListener('input', (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      const volume = Number.parseFloat(input.value) / 100;
      elements.audio.volume = volume;
      input.style.setProperty('--volume-percent', `${input.value}%`);
      updateVolumeIcon(volume);
      if (volume > 0) {
        state.previousVolume = volume;
      }
    });
  }

  if (elements.volumeIcon && elements.volumeSlider) {
    elements.volumeIcon.addEventListener('click', () => {
      if (elements.audio.volume > 0) {
        state.previousVolume = elements.audio.volume;
        elements.audio.volume = 0;
        elements.volumeSlider.value = '0';
        elements.volumeSlider.style.setProperty('--volume-percent', '0%');
        updateVolumeIcon(0);
      } else {
        elements.audio.volume = state.previousVolume;
        const percent = state.previousVolume * 100;
        elements.volumeSlider.value = String(percent);
        elements.volumeSlider.style.setProperty('--volume-percent', `${percent}%`);
        updateVolumeIcon(state.previousVolume);
      }
    });
  }

  if (elements.playlist) {
    elements.playlist.addEventListener('click', (event) => {
      handlePlaylistActivation(event.target);
    });

    elements.playlist.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      handlePlaylistActivation(event.target);
    });
  }
}
