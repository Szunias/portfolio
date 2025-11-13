import { initElements, elements, state } from './music/state.js';
import { renderPlaylist, bindFilterTags } from './music/playlist.js';
import {
  preloadAllDurations,
  bindDurationRequests,
} from './music/durations.js';
import {
  bindPlayerEvents,
  loadTrack,
  cleanupPlayerEvents,
} from './music/player-controls.js';
import { initPageEffects } from './music/ui-effects.js';
import { IS_DEV } from '../config/constants.js';

// Initialize error tracking (auto-initializes)
import '../utils/error-tracker.js';

// Initialize ARIA labels for accessibility
import { initAriaLabels } from '../utils/aria-labels.js';

async function fetchTracks() {
  try {
    const response = await fetch('assets/audio/tracks.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid track data format');
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to load tracks');
  }
}

function showError(message) {
  if (!elements.playlist) return;
  elements.playlist.innerHTML = `<p style="color: #ef4444; text-align: center; padding: 2rem;">${message}</p>`;
}

function renderPlaylistAndPrefetch() {
  const renderedIndexes = renderPlaylist();
  preloadAllDurations(renderedIndexes || []);
}

function initialiseFilters() {
  bindFilterTags(() => {
    renderPlaylistAndPrefetch();
  });
}

function exposeRefreshHook() {
  window.refreshMusicList = () => {
    try {
      renderPlaylistAndPrefetch();
    } catch (error) {
      if (IS_DEV) {
        console.error('Failed to refresh music list', error);
      }
    }
  };
}

async function init() {
  if (!initElements()) {
    return;
  }

  initPageEffects();
  bindPlayerEvents();
  bindDurationRequests();
  initialiseFilters();
  exposeRefreshHook();

  // Initialize accessibility enhancements
  initAriaLabels();

  try {
    state.tracks = await fetchTracks();
    renderPlaylistAndPrefetch();

    if (state.tracks.length > 0) {
      loadTrack(0);
      if (elements.playerBar) {
        elements.playerBar.classList.add('visible');
      }
    }
  } catch (error) {
    showError(`Failed to load tracks. Error: ${error.message}`);
  }
}

// Cleanup on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
  cleanupPlayerEvents();
});

// Cleanup for smooth navigation (if implemented)
if (window.smoothNav) {
  window.smoothNav.onNavigateAway?.(() => {
    cleanupPlayerEvents();
  });
}

init();
