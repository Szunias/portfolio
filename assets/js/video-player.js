/**
 * Modern Video Player for Showreel
 * Custom video player with modern controls and smooth animations
 */

import { IS_DEV } from "./config/constants.js";

class ModernVideoPlayer {
  constructor() {
    this.video = document.getElementById("showreel-video");
    this.container = document.querySelector(".video-player-container");
    this.controls = document.getElementById("video-controls");
    this.playOverlay = document.getElementById("video-play-overlay");
    this.playOverlayBtn = document.getElementById("play-overlay-btn");
    this.playPauseBtn = document.getElementById("play-pause-btn");
    this.volumeBtn = document.getElementById("volume-btn");
    this.volumeSlider = document.getElementById("volume-slider");
    this.fullscreenBtn = document.getElementById("fullscreen-btn");
    this.progress = document.getElementById("video-progress");
    this.progressFilled = document.getElementById("video-progress-filled");
    this.progressHandle = document.getElementById("video-progress-handle");
    this.currentTimeEl = document.getElementById("current-time");
    this.durationEl = document.getElementById("duration");

    // Debug: Check if all elements are found
    // Debug log removed
    // Debug log removed
    // Debug log removed
    // Debug log removed

    this.isPlaying = false;
    this.isMuted = false;
    this.isFullscreen = false;
    this.controlsTimeout = null;
    this.isDragging = false;

    this.init();
  }

  init() {
    if (!this.video) {
      if (IS_DEV) {
        console.error("Video element not found!");
      }
      return;
    }

    // Debug log removed
    this.setupEventListeners();
    this.updateDuration();
    this.setVolume(1);

    // Show controls initially
    this.showControls();
  }

  setupEventListeners() {
    // Debug log removed

    // Video events
    this.video.addEventListener("loadedmetadata", () => {
      // Debug log removed
      this.updateDuration();
    });
    this.video.addEventListener("timeupdate", () => this.updateProgress());
    this.video.addEventListener("play", () => this.onPlay());
    this.video.addEventListener("pause", () => this.onPause());
    this.video.addEventListener("ended", () => this.onEnded());
    this.video.addEventListener("waiting", () => this.showLoading());
    this.video.addEventListener("canplay", () => this.hideLoading());

    // Play overlay
    this.playOverlayBtn.addEventListener("click", () => this.play());
    this.video.addEventListener("click", () => this.togglePlay());

    // Control buttons
    this.playPauseBtn.addEventListener("click", () => this.togglePlay());
    this.volumeBtn.addEventListener("click", () => this.toggleMute());
    this.volumeSlider.addEventListener("input", (e) =>
      this.setVolume(e.target.value / 100),
    );
    this.fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());

    // Progress bar
    this.progress.addEventListener("click", (e) => this.seekTo(e));
    this.progress.addEventListener("mousedown", (e) => this.startDragging(e));
    this.progress.addEventListener("mousemove", (e) => this.drag(e));
    this.progress.addEventListener("mouseup", () => this.stopDragging());
    this.progress.addEventListener("mouseleave", () => this.stopDragging());

    // Container events
    this.container.addEventListener("mouseenter", () => this.showControls());
    this.container.addEventListener("mouseleave", () => this.hideControls());
    this.container.addEventListener("mousemove", () => this.showControls());

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeyboard(e));

    // Fullscreen events
    document.addEventListener("fullscreenchange", () =>
      this.onFullscreenChange(),
    );
    document.addEventListener("webkitfullscreenchange", () =>
      this.onFullscreenChange(),
    );
    document.addEventListener("mozfullscreenchange", () =>
      this.onFullscreenChange(),
    );
    document.addEventListener("MSFullscreenChange", () =>
      this.onFullscreenChange(),
    );
  }

  play() {
    this.video.play();
    this.hidePlayOverlay();
  }

  pause() {
    this.video.pause();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  onPlay() {
    this.isPlaying = true;
    this.updatePlayButton();
    this.hidePlayOverlay();
  }

  onPause() {
    this.isPlaying = false;
    this.updatePlayButton();
  }

  onEnded() {
    this.isPlaying = false;
    this.updatePlayButton();
    this.showPlayOverlay();
    this.video.currentTime = 0;
  }

  toggleMute() {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  mute() {
    this.video.muted = true;
    this.isMuted = true;
    this.updateVolumeButton();
  }

  unmute() {
    this.video.muted = false;
    this.isMuted = false;
    this.updateVolumeButton();
  }

  setVolume(volume) {
    this.video.volume = Math.max(0, Math.min(1, volume));
    this.volumeSlider.value = this.video.volume * 100;
    this.updateVolumeButton();
  }

  updateVolumeButton() {
    const icon = this.volumeBtn.querySelector("i");
    if (this.video.volume === 0 || this.isMuted) {
      icon.className = "fas fa-volume-mute";
    } else if (this.video.volume < 0.5) {
      icon.className = "fas fa-volume-down";
    } else {
      icon.className = "fas fa-volume-up";
    }
  }

  toggleFullscreen() {
    if (!this.isFullscreen) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  enterFullscreen() {
    const element = this.container;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  onFullscreenChange() {
    this.isFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
    this.updateFullscreenButton();
  }

  updateFullscreenButton() {
    const icon = this.fullscreenBtn.querySelector("i");
    icon.className = this.isFullscreen ? "fas fa-compress" : "fas fa-expand";
  }

  seekTo(event) {
    if (this.isDragging) return;

    const rect = this.progress.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const time = percentage * this.video.duration;

    this.video.currentTime = time;
  }

  startDragging(event) {
    this.isDragging = true;
    this.pause();
    this.seekTo(event);
  }

  drag(event) {
    if (!this.isDragging) return;
    this.seekTo(event);
  }

  stopDragging() {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.isPlaying) {
      this.play();
    }
  }

  updateProgress() {
    if (this.video.duration) {
      const percentage = (this.video.currentTime / this.video.duration) * 100;
      this.progressFilled.style.width = percentage + "%";
      this.progressHandle.style.left = percentage + "%";
      this.currentTimeEl.textContent = this.formatTime(this.video.currentTime);
    }
  }

  updateDuration() {
    if (this.video.duration) {
      this.durationEl.textContent = this.formatTime(this.video.duration);
    }
  }

  updatePlayButton() {
    const icon = this.playPauseBtn.querySelector("i");
    icon.className = this.isPlaying ? "fas fa-pause" : "fas fa-play";
  }

  showPlayOverlay() {
    this.playOverlay.classList.remove("hidden");
  }

  hidePlayOverlay() {
    this.playOverlay.classList.add("hidden");
  }

  showControls() {
    this.controls.style.opacity = "1";
    this.container.classList.add("controls-visible");
    this.clearControlsTimeout();
  }

  hideControls() {
    if (this.isPlaying) {
      this.controlsTimeout = setTimeout(() => {
        this.controls.style.opacity = "0";
        this.container.classList.remove("controls-visible");
      }, 3000);
    }
  }

  clearControlsTimeout() {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
      this.controlsTimeout = null;
    }
  }

  showLoading() {
    this.container.classList.add("loading");
  }

  hideLoading() {
    this.container.classList.remove("loading");
  }

  handleKeyboard(event) {
    // Only handle keyboard events when video is focused or playing
    if (!this.video || (!this.isPlaying && event.target !== this.video)) return;

    switch (event.code) {
      case "Space":
        event.preventDefault();
        this.togglePlay();
        break;
      case "KeyM":
        event.preventDefault();
        this.toggleMute();
        break;
      case "KeyF":
        event.preventDefault();
        this.toggleFullscreen();
        break;
      case "ArrowLeft":
        event.preventDefault();
        this.video.currentTime = Math.max(0, this.video.currentTime - 10);
        break;
      case "ArrowRight":
        event.preventDefault();
        this.video.currentTime = Math.min(
          this.video.duration,
          this.video.currentTime + 10,
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        this.setVolume(Math.min(1, this.video.volume + 0.1));
        break;
      case "ArrowDown":
        event.preventDefault();
        this.setVolume(Math.max(0, this.video.volume - 0.1));
        break;
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}

// Initialize video player when DOM is loaded
function initVideoPlayer() {
  // Check if video element exists
  const video = document.getElementById("showreel-video");
  if (!video) {
    // Debug log removed
    setTimeout(initVideoPlayer, 100);
    return;
  }

  // Debug log removed
  new ModernVideoPlayer();
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVideoPlayer);
} else {
  initVideoPlayer();
}
