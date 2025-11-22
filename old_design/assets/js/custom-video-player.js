/**
 * Simple Custom Video Player
 * Clean and working implementation
 */

(function() {
  'use strict';
  
  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    initPlayer();
  }
  
  function initPlayer() {
    const video = document.getElementById('showreel-video');
    const wrapper = document.querySelector('.video-wrapper');
    const playBtn = document.getElementById('play-btn');
    const bigPlayBtn = document.getElementById('big-play-btn');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressFilled = document.getElementById('progress-filled');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    
    if (!video) return;
    
    // Debug log removed
    
    // Force video to fit container
    function resizeVideo() {
      video.style.width = '100%';
      video.style.maxWidth = '100%';
      video.style.height = 'auto';
      video.style.display = 'block';
      // Debug log removed
    }
    
    // Resize on load and metadata loaded
    resizeVideo();
    video.addEventListener('loadedmetadata', resizeVideo);
    window.addEventListener('resize', resizeVideo);
    
    // Show controls initially
    wrapper.classList.add('show-controls');
    setTimeout(() => wrapper.classList.remove('show-controls'), 3000);
    
    // Play/Pause
    function togglePlay() {
      if (video.paused) {
        video.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        bigPlayBtn.classList.add('hidden');
        wrapper.classList.add('playing');
      } else {
        video.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        bigPlayBtn.classList.remove('hidden');
        wrapper.classList.remove('playing');
      }
    }
    
    playBtn.addEventListener('click', togglePlay);
    bigPlayBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    
    // Update progress
    video.addEventListener('timeupdate', function() {
      const percent = (video.currentTime / video.duration) * 100;
      progressFilled.style.width = percent + '%';
      currentTimeEl.textContent = formatTime(video.currentTime);
    });
    
    // Set duration
    video.addEventListener('loadedmetadata', function() {
      totalTimeEl.textContent = formatTime(video.duration);
    });
    
    // Seek
    progressBar.addEventListener('click', function(e) {
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      video.currentTime = percent * video.duration;
    });
    
    // Volume
    volumeSlider.addEventListener('input', function() {
      video.volume = this.value / 100;
      updateVolumeIcon();
    });
    
    volumeBtn.addEventListener('click', function() {
      if (video.volume > 0) {
        video.volume = 0;
        volumeSlider.value = 0;
      } else {
        video.volume = 1;
        volumeSlider.value = 100;
      }
      updateVolumeIcon();
    });
    
    function updateVolumeIcon() {
      const icon = volumeBtn.querySelector('i');
      if (video.volume === 0) {
        icon.className = 'fas fa-volume-mute';
      } else if (video.volume < 0.5) {
        icon.className = 'fas fa-volume-down';
      } else {
        icon.className = 'fas fa-volume-up';
      }
    }
    
    // Fullscreen
    fullscreenBtn.addEventListener('click', function() {
      if (!document.fullscreenElement) {
        if (wrapper.requestFullscreen) {
          wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) {
          wrapper.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    });
    
    // Update fullscreen icon
    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
    
    function updateFullscreenIcon() {
      const icon = fullscreenBtn.querySelector('i');
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        icon.className = 'fas fa-compress';
      } else {
        icon.className = 'fas fa-expand';
      }
    }
    
    // Video ended
    video.addEventListener('ended', function() {
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
      bigPlayBtn.classList.remove('hidden');
      wrapper.classList.remove('playing');
      video.currentTime = 0;
    });
    
    // Show controls on mouse move
    let hideControlsTimeout;
    wrapper.addEventListener('mousemove', function() {
      wrapper.classList.add('show-controls');
      clearTimeout(hideControlsTimeout);
      if (!video.paused) {
        hideControlsTimeout = setTimeout(() => {
          wrapper.classList.remove('show-controls');
        }, 3000);
      }
    });
    
    // Keyboard controls
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT') return;
      
      switch(e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'KeyM':
          e.preventDefault();
          volumeBtn.click();
          break;
        case 'KeyF':
          e.preventDefault();
          fullscreenBtn.click();
          break;
      }
    });
    
    // Format time helper
    function formatTime(seconds) {
      if (isNaN(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
  }
})();

