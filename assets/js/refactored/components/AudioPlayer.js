/**
 * AudioPlayer Component
 * Full-featured audio player for portfolio showcase
 *
 * Features:
 * - Play/Pause/Next/Previous controls
 * - Progress bar with seek
 * - Volume control with mute
 * - Playlist management
 * - Shuffle and repeat modes
 * - Keyboard shortcuts
 * - Track filtering
 * - Duration preloading
 * - Accessible controls
 *
 * @class AudioPlayer
 * @example
 * const player = new AudioPlayer({
 *   container: '#audio-player-container',
 *   tracks: [
 *     { title: 'Track 1', artist: 'Artist', sources: [{ url: 'track1.mp3' }] }
 *   ]
 * });
 * player.init();
 */

import { EventEmitter } from '../core/EventEmitter.js';
import { Storage } from '../utils/storage.js';
import { AUDIO_CONFIG, STORAGE_KEYS, KEYS } from '../core/config.js';

export class AudioPlayer extends EventEmitter {
  /**
   * @param {Object} options - Configuration options
   * @param {string} options.container - Container selector
   * @param {Array} options.tracks - Array of track objects
   * @param {number} options.volume - Initial volume (0-1)
   * @param {boolean} options.autoplay - Auto-play first track
   * @param {boolean} options.shuffle - Enable shuffle mode
   * @param {string} options.repeat - Repeat mode (off, one, all)
   */
  constructor(options = {}) {
    super();

    this.options = {
      container: '#audio-player',
      tracks: [],
      volume: Storage.get(STORAGE_KEYS.VOLUME, AUDIO_CONFIG.DEFAULT_VOLUME),
      autoplay: false,
      shuffle: false,
      repeat: 'off', // off, one, all
      showPlaylist: true,
      showVolume: true,
      ...options
    };

    // State
    this.state = {
      currentTrackIndex: 0,
      isPlaying: false,
      isMuted: false,
      shuffle: this.options.shuffle,
      repeat: this.options.repeat,
      volume: this.options.volume,
      duration: 0,
      currentTime: 0,
      buffered: 0,
      isDragging: false,
      currentFilter: 'all',
      shuffleHistory: [],
      originalPlaylist: [...this.options.tracks]
    };

    // Elements
    this.elements = {};

    // Audio element
    this.audio = null;

    // Timers
    this._progressInterval = null;
    this._keyboardListener = null;
  }

  /**
   * Initialize the player
   * @public
   */
  init() {
    if (this.options.tracks.length === 0) {
      console.warn('AudioPlayer: No tracks provided');
      return;
    }

    this._render();
    this._cacheElements();
    this._attachEventListeners();
    this._loadTrack(0);

    if (this.options.autoplay) {
      this.play();
    }

    this.emit('initialized');
  }

  /**
   * Render player HTML
   * @private
   */
  _render() {
    const container = document.querySelector(this.options.container);
    if (!container) {
      throw new Error(`AudioPlayer: Container "${this.options.container}" not found`);
    }

    container.innerHTML = this._getTemplate();
  }

  /**
   * Get player template
   * @private
   * @returns {string} HTML template
   */
  _getTemplate() {
    return `
      <div class="audio-player" role="region" aria-label="Audio player">
        <!-- Track Info -->
        <div class="audio-player__track-info">
          <img class="audio-player__artwork" src="" alt="Album artwork" />
          <div class="audio-player__details">
            <div class="audio-player__title"></div>
            <div class="audio-player__artist"></div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="audio-player__progress-container">
          <div
            class="audio-player__progress-bar"
            role="slider"
            aria-label="Seek"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow="0"
            tabindex="0">
            <div class="audio-player__progress-buffer"></div>
            <div class="audio-player__progress-fill"></div>
            <div class="audio-player__progress-thumb"></div>
          </div>
          <div class="audio-player__time">
            <span class="audio-player__time-current">0:00</span>
            <span class="audio-player__time-total">0:00</span>
          </div>
        </div>

        <!-- Controls -->
        <div class="audio-player__controls">
          <button
            class="audio-player__control-btn audio-player__shuffle"
            aria-label="Toggle shuffle"
            aria-pressed="false">
            <svg class="audio-player__control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" stroke-width="2"/>
            </svg>
          </button>

          <button
            class="audio-player__control-btn audio-player__prev"
            aria-label="Previous track">
            <svg class="audio-player__control-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/>
            </svg>
          </button>

          <button
            class="audio-player__control-btn audio-player__play-btn"
            aria-label="Play">
            <svg class="audio-player__control-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          <button
            class="audio-player__control-btn audio-player__next"
            aria-label="Next track">
            <svg class="audio-player__control-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>

          <button
            class="audio-player__control-btn audio-player__repeat"
            aria-label="Toggle repeat"
            aria-pressed="false">
            <svg class="audio-player__control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" stroke-width="2"/>
            </svg>
          </button>

          ${this.options.showVolume ? this._getVolumeTemplate() : ''}
        </div>

        ${this.options.showPlaylist ? this._getPlaylistTemplate() : ''}

        <!-- Audio Element -->
        <audio class="audio-player__audio" preload="metadata"></audio>
      </div>
    `;
  }

  /**
   * Get volume control template
   * @private
   * @returns {string} HTML template
   */
  _getVolumeTemplate() {
    return `
      <div class="audio-player__volume">
        <button
          class="audio-player__volume-btn"
          aria-label="Mute">
          <svg class="audio-player__control-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
        </button>
        <input
          type="range"
          class="audio-player__volume-slider"
          min="0"
          max="100"
          value="${this.state.volume * 100}"
          aria-label="Volume"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="${this.state.volume * 100}" />
      </div>
    `;
  }

  /**
   * Get playlist template
   * @private
   * @returns {string} HTML template
   */
  _getPlaylistTemplate() {
    return `
      <div class="audio-player__playlist">
        ${this.options.tracks.map((track, index) => `
          <div
            class="audio-player__playlist-item"
            data-index="${index}"
            role="button"
            tabindex="0"
            aria-label="Play ${track.title} by ${track.artist}">
            <img
              class="audio-player__playlist-artwork"
              src="${track.cover || ''}"
              alt="${track.title}" />
            <div class="audio-player__playlist-details">
              <div class="audio-player__playlist-title">${track.title}</div>
              <div class="audio-player__playlist-artist">${track.artist || 'Unknown Artist'}</div>
            </div>
            <div class="audio-player__playlist-duration">${track.duration || '--:--'}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Cache DOM elements
   * @private
   */
  _cacheElements() {
    const root = document.querySelector(this.options.container);

    this.elements = {
      root,
      artwork: root.querySelector('.audio-player__artwork'),
      title: root.querySelector('.audio-player__title'),
      artist: root.querySelector('.audio-player__artist'),
      progressBar: root.querySelector('.audio-player__progress-bar'),
      progressFill: root.querySelector('.audio-player__progress-fill'),
      progressBuffer: root.querySelector('.audio-player__progress-buffer'),
      progressThumb: root.querySelector('.audio-player__progress-thumb'),
      timeCurrent: root.querySelector('.audio-player__time-current'),
      timeTotal: root.querySelector('.audio-player__time-total'),
      playBtn: root.querySelector('.audio-player__play-btn'),
      prevBtn: root.querySelector('.audio-player__prev'),
      nextBtn: root.querySelector('.audio-player__next'),
      shuffleBtn: root.querySelector('.audio-player__shuffle'),
      repeatBtn: root.querySelector('.audio-player__repeat'),
      volumeBtn: root.querySelector('.audio-player__volume-btn'),
      volumeSlider: root.querySelector('.audio-player__volume-slider'),
      playlistItems: Array.from(root.querySelectorAll('.audio-player__playlist-item'))
    };

    this.audio = root.querySelector('.audio-player__audio');
  }

  /**
   * Attach event listeners
   * @private
   */
  _attachEventListeners() {
    // Play/Pause
    this.elements.playBtn?.addEventListener('click', () => this.togglePlay());

    // Previous/Next
    this.elements.prevBtn?.addEventListener('click', () => this.previous());
    this.elements.nextBtn?.addEventListener('click', () => this.next());

    // Shuffle/Repeat
    this.elements.shuffleBtn?.addEventListener('click', () => this.toggleShuffle());
    this.elements.repeatBtn?.addEventListener('click', () => this.toggleRepeat());

    // Progress bar - click to seek
    this.elements.progressBar?.addEventListener('click', (e) => this._handleProgressClick(e));

    // Progress bar - drag to seek
    this.elements.progressBar?.addEventListener('mousedown', (e) => this._startDrag(e));
    document.addEventListener('mousemove', (e) => this._handleDrag(e));
    document.addEventListener('mouseup', () => this._endDrag());

    // Progress bar - keyboard
    this.elements.progressBar?.addEventListener('keydown', (e) => this._handleProgressKeydown(e));

    // Volume
    this.elements.volumeBtn?.addEventListener('click', () => this.toggleMute());
    this.elements.volumeSlider?.addEventListener('input', (e) => {
      this.setVolume(parseFloat(e.target.value) / 100);
    });

    // Playlist items
    this.elements.playlistItems.forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.playTrack(index);
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
          e.preventDefault();
          const index = parseInt(item.dataset.index);
          this.playTrack(index);
        }
      });
    });

    // Audio element events
    this.audio.addEventListener('loadedmetadata', () => this._handleLoadedMetadata());
    this.audio.addEventListener('timeupdate', () => this._handleTimeUpdate());
    this.audio.addEventListener('ended', () => this._handleEnded());
    this.audio.addEventListener('play', () => this._handlePlay());
    this.audio.addEventListener('pause', () => this._handlePause());
    this.audio.addEventListener('error', (e) => this._handleError(e));
    this.audio.addEventListener('progress', () => this._handleProgress());

    // Keyboard shortcuts
    this._keyboardListener = (e) => this._handleKeyboard(e);
    document.addEventListener('keydown', this._keyboardListener);
  }

  /**
   * Load a track
   * @private
   * @param {number} index - Track index
   */
  _loadTrack(index) {
    const track = this.options.tracks[index];
    if (!track) return;

    this.state.currentTrackIndex = index;

    // Update UI
    if (this.elements.artwork) {
      this.elements.artwork.src = track.cover || '';
    }
    if (this.elements.title) {
      this.elements.title.textContent = track.title;
    }
    if (this.elements.artist) {
      this.elements.artist.textContent = track.artist || 'Unknown Artist';
    }

    // Load audio
    const source = Array.isArray(track.sources) ? track.sources[0] : track.sources;
    if (source && source.url) {
      this.audio.src = source.url;
      this.audio.load();
    }

    // Update playlist active state
    this._updatePlaylistActiveState();

    // Reset progress
    this._updateProgress(0, 0);

    this.emit('trackChanged', { track, index });
  }

  /**
   * Play current track
   * @public
   */
  play() {
    const playPromise = this.audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.state.isPlaying = true;
        })
        .catch((error) => {
          console.error('AudioPlayer: Play error:', error);
          this.emit('error', { type: 'play', error });
        });
    }
  }

  /**
   * Pause current track
   * @public
   */
  pause() {
    this.audio.pause();
    this.state.isPlaying = false;
  }

  /**
   * Toggle play/pause
   * @public
   */
  togglePlay() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Play next track
   * @public
   */
  next() {
    let nextIndex;

    if (this.state.shuffle) {
      nextIndex = this._getNextShuffleIndex();
    } else {
      nextIndex = (this.state.currentTrackIndex + 1) % this.options.tracks.length;
    }

    this.playTrack(nextIndex);
  }

  /**
   * Play previous track
   * @public
   */
  previous() {
    // If more than 3 seconds played, restart current track
    if (this.state.currentTime > 3) {
      this.seek(0);
      return;
    }

    let prevIndex;

    if (this.state.shuffle && this.state.shuffleHistory.length > 0) {
      prevIndex = this.state.shuffleHistory.pop();
    } else {
      prevIndex = this.state.currentTrackIndex - 1;
      if (prevIndex < 0) {
        prevIndex = this.options.tracks.length - 1;
      }
    }

    this.playTrack(prevIndex);
  }

  /**
   * Play specific track
   * @public
   * @param {number} index - Track index
   */
  playTrack(index) {
    if (index < 0 || index >= this.options.tracks.length) return;

    const wasPlaying = this.state.isPlaying;
    this._loadTrack(index);

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Seek to position
   * @public
   * @param {number} time - Time in seconds
   */
  seek(time) {
    const clampedTime = Math.max(0, Math.min(time, this.state.duration));
    this.audio.currentTime = clampedTime;
    this.state.currentTime = clampedTime;
    this._updateProgress(clampedTime, this.state.duration);
  }

  /**
   * Set volume
   * @public
   * @param {number} volume - Volume (0-1)
   */
  setVolume(volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.state.volume = clampedVolume;
    this.audio.volume = clampedVolume;

    // Update slider
    if (this.elements.volumeSlider) {
      this.elements.volumeSlider.value = clampedVolume * 100;
    }

    // Save to storage
    Storage.set(STORAGE_KEYS.VOLUME, clampedVolume);

    // Update mute state
    if (clampedVolume > 0) {
      this.state.isMuted = false;
    }

    this._updateVolumeIcon();
    this.emit('volumeChange', { volume: clampedVolume });
  }

  /**
   * Toggle mute
   * @public
   */
  toggleMute() {
    if (this.state.isMuted) {
      this.setVolume(this.state.previousVolume || AUDIO_CONFIG.DEFAULT_VOLUME);
      this.state.isMuted = false;
    } else {
      this.state.previousVolume = this.state.volume;
      this.setVolume(0);
      this.state.isMuted = true;
    }
  }

  /**
   * Toggle shuffle mode
   * @public
   */
  toggleShuffle() {
    this.state.shuffle = !this.state.shuffle;

    // Update button
    if (this.elements.shuffleBtn) {
      this.elements.shuffleBtn.setAttribute('aria-pressed', this.state.shuffle);
      this.elements.shuffleBtn.classList.toggle('audio-player__extra-btn--active', this.state.shuffle);
    }

    // Reset shuffle history
    if (this.state.shuffle) {
      this.state.shuffleHistory = [];
    }

    this.emit('shuffleChange', { shuffle: this.state.shuffle });
  }

  /**
   * Toggle repeat mode
   * @public
   */
  toggleRepeat() {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(this.state.repeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.state.repeat = modes[nextIndex];

    // Update button
    if (this.elements.repeatBtn) {
      const isActive = this.state.repeat !== 'off';
      this.elements.repeatBtn.setAttribute('aria-pressed', isActive);
      this.elements.repeatBtn.classList.toggle('audio-player__extra-btn--active', isActive);
      this.elements.repeatBtn.setAttribute('aria-label', `Repeat: ${this.state.repeat}`);
    }

    this.emit('repeatChange', { repeat: this.state.repeat });
  }

  /**
   * Get next shuffle index
   * @private
   * @returns {number} Next index
   */
  _getNextShuffleIndex() {
    // Save current index to history
    this.state.shuffleHistory.push(this.state.currentTrackIndex);

    // Generate random index (not current)
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * this.options.tracks.length);
    } while (nextIndex === this.state.currentTrackIndex && this.options.tracks.length > 1);

    return nextIndex;
  }

  /**
   * Handle track ended
   * @private
   */
  _handleEnded() {
    this.emit('trackEnded');

    if (this.state.repeat === 'one') {
      this.seek(0);
      this.play();
    } else if (this.state.repeat === 'all' || this.state.currentTrackIndex < this.options.tracks.length - 1) {
      this.next();
    } else {
      this.pause();
    }
  }

  /**
   * Handle loaded metadata
   * @private
   */
  _handleLoadedMetadata() {
    this.state.duration = this.audio.duration;

    if (this.elements.timeTotal) {
      this.elements.timeTotal.textContent = this._formatTime(this.state.duration);
    }

    this.emit('metadataLoaded', { duration: this.state.duration });
  }

  /**
   * Handle time update
   * @private
   */
  _handleTimeUpdate() {
    if (!this.state.isDragging) {
      this.state.currentTime = this.audio.currentTime;
      this._updateProgress(this.state.currentTime, this.state.duration);
    }
  }

  /**
   * Handle progress (buffering)
   * @private
   */
  _handleProgress() {
    if (this.audio.buffered.length > 0) {
      const buffered = this.audio.buffered.end(this.audio.buffered.length - 1);
      this.state.buffered = buffered;

      if (this.elements.progressBuffer) {
        const percent = (buffered / this.state.duration) * 100;
        this.elements.progressBuffer.style.width = `${percent}%`;
      }
    }
  }

  /**
   * Handle play
   * @private
   */
  _handlePlay() {
    this.state.isPlaying = true;

    // Update play button icon
    if (this.elements.playBtn) {
      this.elements.playBtn.innerHTML = `
        <svg class="audio-player__control-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>
      `;
      this.elements.playBtn.setAttribute('aria-label', 'Pause');
    }

    this.emit('play');
  }

  /**
   * Handle pause
   * @private
   */
  _handlePause() {
    this.state.isPlaying = false;

    // Update play button icon
    if (this.elements.playBtn) {
      this.elements.playBtn.innerHTML = `
        <svg class="audio-player__control-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
      this.elements.playBtn.setAttribute('aria-label', 'Play');
    }

    this.emit('pause');
  }

  /**
   * Handle error
   * @private
   * @param {Event} e - Error event
   */
  _handleError(e) {
    console.error('AudioPlayer: Audio error:', e);
    this.emit('error', { type: 'audio', error: e });
  }

  /**
   * Handle progress bar click
   * @private
   * @param {MouseEvent} e - Mouse event
   */
  _handleProgressClick(e) {
    const rect = this.elements.progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * this.state.duration;
    this.seek(time);
  }

  /**
   * Start dragging progress bar
   * @private
   * @param {MouseEvent} e - Mouse event
   */
  _startDrag(e) {
    this.state.isDragging = true;
    this._handleDrag(e);
  }

  /**
   * Handle drag
   * @private
   * @param {MouseEvent} e - Mouse event
   */
  _handleDrag(e) {
    if (!this.state.isDragging) return;

    const rect = this.elements.progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * this.state.duration;

    this._updateProgress(time, this.state.duration);
  }

  /**
   * End dragging
   * @private
   */
  _endDrag() {
    if (!this.state.isDragging) return;

    this.state.isDragging = false;
    this.seek(this.state.currentTime);
  }

  /**
   * Handle progress bar keyboard
   * @private
   * @param {KeyboardEvent} e - Keyboard event
   */
  _handleProgressKeydown(e) {
    if (e.key === KEYS.ARROW_LEFT) {
      e.preventDefault();
      this.seek(this.state.currentTime - 5);
    } else if (e.key === KEYS.ARROW_RIGHT) {
      e.preventDefault();
      this.seek(this.state.currentTime + 5);
    }
  }

  /**
   * Handle keyboard shortcuts
   * @private
   * @param {KeyboardEvent} e - Keyboard event
   */
  _handleKeyboard(e) {
    // Only handle if not in input field
    if (e.target.matches('input, textarea, select')) return;

    if (e.key === KEYS.SPACE) {
      e.preventDefault();
      this.togglePlay();
    } else if (e.key === KEYS.ARROW_LEFT) {
      e.preventDefault();
      this.previous();
    } else if (e.key === KEYS.ARROW_RIGHT) {
      e.preventDefault();
      this.next();
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      this.toggleMute();
    } else if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      this.toggleShuffle();
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      this.toggleRepeat();
    }
  }

  /**
   * Update progress bar
   * @private
   * @param {number} current - Current time
   * @param {number} duration - Duration
   */
  _updateProgress(current, duration) {
    const percent = duration > 0 ? (current / duration) * 100 : 0;

    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${percent}%`;
    }

    if (this.elements.progressThumb) {
      this.elements.progressThumb.style.left = `${percent}%`;
    }

    if (this.elements.timeCurrent) {
      this.elements.timeCurrent.textContent = this._formatTime(current);
    }

    if (this.elements.progressBar) {
      this.elements.progressBar.setAttribute('aria-valuenow', Math.round(percent));
    }
  }

  /**
   * Update volume icon
   * @private
   */
  _updateVolumeIcon() {
    if (!this.elements.volumeBtn) return;

    const volume = this.state.volume;
    let icon;

    if (volume === 0 || this.state.isMuted) {
      icon = `
        <svg class="audio-player__control-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      `;
    } else if (volume < 0.5) {
      icon = `
        <svg class="audio-player__control-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
        </svg>
      `;
    } else {
      icon = `
        <svg class="audio-player__control-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
      `;
    }

    this.elements.volumeBtn.innerHTML = icon;
  }

  /**
   * Update playlist active state
   * @private
   */
  _updatePlaylistActiveState() {
    this.elements.playlistItems.forEach((item, index) => {
      const isActive = index === this.state.currentTrackIndex;
      item.classList.toggle('audio-player__playlist-item--active', isActive);
      item.setAttribute('aria-selected', isActive);
    });
  }

  /**
   * Format time in MM:SS
   * @private
   * @param {number} seconds - Seconds
   * @returns {string} Formatted time
   */
  _formatTime(seconds) {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Destroy the player
   * @public
   */
  destroy() {
    // Pause and cleanup audio
    this.pause();
    this.audio.src = '';

    // Remove event listeners
    if (this._keyboardListener) {
      document.removeEventListener('keydown', this._keyboardListener);
    }

    // Clear intervals
    if (this._progressInterval) {
      clearInterval(this._progressInterval);
    }

    // Remove from DOM
    if (this.elements.root) {
      this.elements.root.innerHTML = '';
    }

    // Clear references
    this.elements = {};
    this.audio = null;

    this.emit('destroyed');
    this.removeAllListeners();
  }
}

export default AudioPlayer;
