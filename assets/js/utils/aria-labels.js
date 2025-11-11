/**
 * ARIA Labels Utility
 * Dynamically adds accessibility labels to interactive elements
 * Improves screen reader support across the application
 */

import { IS_DEV } from '../config/constants.js';

/**
 * Add ARIA labels to music player controls
 * @returns {void}
 */
export function enhanceMusicPlayerAccessibility() {
  // Play/Pause button
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.setAttribute('aria-label', 'Play or pause track');
    playBtn.setAttribute('role', 'button');

    // Update label dynamically based on state
    const updatePlayButtonLabel = () => {
      const audio = document.getElementById('audio-player');
      if (audio && !audio.paused) {
        playBtn.setAttribute('aria-label', 'Pause track');
        playBtn.setAttribute('aria-pressed', 'true');
      } else {
        playBtn.setAttribute('aria-label', 'Play track');
        playBtn.setAttribute('aria-pressed', 'false');
      }
    };

    playBtn.addEventListener('click', () => {
      setTimeout(updatePlayButtonLabel, 100);
    });
  }

  // Previous track button
  const prevBtn = document.getElementById('prev-btn');
  if (prevBtn) {
    prevBtn.setAttribute('aria-label', 'Previous track');
    prevBtn.setAttribute('role', 'button');
  }

  // Next track button
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.setAttribute('aria-label', 'Next track');
    nextBtn.setAttribute('role', 'button');
  }

  // Volume icon/button
  const volumeIcon = document.getElementById('volume-icon');
  if (volumeIcon) {
    volumeIcon.setAttribute('aria-label', 'Toggle mute');
    volumeIcon.setAttribute('role', 'button');
    volumeIcon.setAttribute('tabindex', '0');
  }

  // Volume slider
  const volumeSlider = document.getElementById('volume-slider');
  if (volumeSlider) {
    volumeSlider.setAttribute('aria-label', 'Volume control');
    volumeSlider.setAttribute('aria-valuemin', '0');
    volumeSlider.setAttribute('aria-valuemax', '100');
    volumeSlider.setAttribute('aria-valuenow', volumeSlider.value || '70');
    volumeSlider.setAttribute('role', 'slider');

    // Update aria-valuenow on change
    volumeSlider.addEventListener('input', (e) => {
      volumeSlider.setAttribute('aria-valuenow', e.target.value);
    });
  }

  // Progress bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.setAttribute('aria-label', 'Track progress');
    progressBar.setAttribute('role', 'slider');
    progressBar.setAttribute('tabindex', '0');
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
    progressBar.setAttribute('aria-valuenow', '0');

    // Update progress aria-valuenow during playback
    const audio = document.getElementById('audio-player');
    if (audio) {
      audio.addEventListener('timeupdate', () => {
        if (audio.duration && !isNaN(audio.duration)) {
          const percentage = (audio.currentTime / audio.duration) * 100;
          progressBar.setAttribute('aria-valuenow', Math.round(percentage).toString());
        }
      });
    }
  }

  // Current time display
  const currentTime = document.getElementById('current-time');
  if (currentTime) {
    currentTime.setAttribute('aria-live', 'off'); // Don't announce every second
    currentTime.setAttribute('role', 'timer');
  }

  // Duration display
  const duration = document.getElementById('duration');
  if (duration) {
    duration.setAttribute('aria-label', 'Track duration');
  }

  // Track info (now playing)
  const playerTitle = document.querySelector('.player-title');
  if (playerTitle) {
    playerTitle.setAttribute('aria-live', 'polite');
    playerTitle.setAttribute('aria-atomic', 'true');
  }

  if (IS_DEV) {
    console.log('✓ Music player ARIA labels enhanced');
  }
}

/**
 * Add ARIA labels to filter tags
 * @returns {void}
 */
export function enhanceFilterTagsAccessibility() {
  const filterTags = document.querySelectorAll('.filter-tag, .chip');

  filterTags.forEach((tag) => {
    if (!tag.hasAttribute('aria-label')) {
      const tagText = tag.textContent.trim();
      tag.setAttribute('aria-label', `Filter by ${tagText}`);
      tag.setAttribute('role', 'button');
      tag.setAttribute('tabindex', '0');

      // Toggle aria-pressed on click
      tag.addEventListener('click', () => {
        const isActive = tag.classList.contains('active');
        tag.setAttribute('aria-pressed', isActive.toString());
      });

      // Allow keyboard activation
      tag.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tag.click();
        }
      });
    }
  });

  if (IS_DEV && filterTags.length > 0) {
    console.log(`✓ Enhanced ${filterTags.length} filter tags with ARIA labels`);
  }
}

/**
 * Add ARIA labels to playlist items
 * @returns {void}
 */
export function enhancePlaylistAccessibility() {
  const playlistItems = document.querySelectorAll('.playlist-item');

  playlistItems.forEach((item, index) => {
    const title = item.querySelector('.playlist-track-title')?.textContent.trim();
    const artist = item.querySelector('.playlist-track-artist')?.textContent.trim();
    const duration = item.querySelector('.playlist-duration')?.textContent.trim();

    if (title) {
      const label = `Play ${title}${artist ? ` by ${artist}` : ''}${duration ? `, duration ${duration}` : ''}`;
      item.setAttribute('aria-label', label);
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      // Update aria-pressed when playing
      const observer = new MutationObserver(() => {
        const isPlaying = item.classList.contains('playing');
        const isActive = item.classList.contains('active');
        item.setAttribute('aria-pressed', (isPlaying || isActive).toString());

        if (isPlaying) {
          item.setAttribute('aria-label', `Pause ${title}`);
        } else {
          item.setAttribute('aria-label', label);
        }
      });

      observer.observe(item, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
  });

  if (IS_DEV && playlistItems.length > 0) {
    console.log(`✓ Enhanced ${playlistItems.length} playlist items with ARIA labels`);
  }
}

/**
 * Add ARIA labels to language buttons
 * @returns {void}
 */
export function enhanceLanguageButtonsAccessibility() {
  const langButtons = document.querySelectorAll('.lang-btn');

  langButtons.forEach((btn) => {
    const lang = btn.dataset.lang;
    if (lang) {
      const langNames = {
        en: 'English',
        pl: 'Polski',
        nl: 'Nederlands'
      };

      btn.setAttribute('aria-label', `Switch to ${langNames[lang] || lang}`);
      btn.setAttribute('role', 'button');

      // Update aria-pressed based on active state
      const updatePressed = () => {
        btn.setAttribute('aria-pressed', btn.classList.contains('active').toString());
      };

      updatePressed();
      btn.addEventListener('click', () => setTimeout(updatePressed, 100));
    }
  });

  if (IS_DEV && langButtons.length > 0) {
    console.log(`✓ Enhanced ${langButtons.length} language buttons with ARIA labels`);
  }
}

/**
 * Add ARIA labels to project cards
 * @returns {void}
 */
export function enhanceProjectCardsAccessibility() {
  const projectCards = document.querySelectorAll('.project-card, .timeline-nav-item');

  projectCards.forEach((card) => {
    if (!card.hasAttribute('aria-label')) {
      const title = card.querySelector('h3, h4, .project-title')?.textContent.trim();
      const link = card.querySelector('a');

      if (title) {
        card.setAttribute('aria-label', `View ${title} project`);
        card.setAttribute('tabindex', '0');

        // Make card keyboard accessible
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (link) {
              link.click();
            } else {
              card.click();
            }
          }
        });
      }
    }
  });

  if (IS_DEV && projectCards.length > 0) {
    console.log(`✓ Enhanced ${projectCards.length} project cards with ARIA labels`);
  }
}

/**
 * Initialize all ARIA enhancements
 * Call this after DOM content is loaded
 * @returns {void}
 */
export function initAriaLabels() {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    enhanceMusicPlayerAccessibility();
    enhanceFilterTagsAccessibility();
    enhancePlaylistAccessibility();
    enhanceLanguageButtonsAccessibility();
    enhanceProjectCardsAccessibility();

    if (IS_DEV) {
      console.log('✓ All ARIA labels initialized');
    }
  });
}

export default { initAriaLabels };
