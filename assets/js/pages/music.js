import { initElements, elements, state } from './music/state.js';
import { renderPlaylist, bindFilterTags } from './music/playlist.js';
import { preloadAllDurations, bindDurationRequests } from './music/durations.js';
import { bindPlayerEvents, loadTrack, cleanupPlayerEvents } from './music/player-controls.js';
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
  console.log('[Music] Exposing refreshMusicList hook');
  window.refreshMusicList = () => {
    console.log('[Music] refreshMusicList() called');
    console.log('[Music] state.tracks.length:', state.tracks?.length || 0);
    console.log('[Music] elements.playlist:', elements.playlist);

    try {
      if (!state.tracks || state.tracks.length === 0) {
        console.warn('[Music] No tracks available to render');
        return;
      }

      renderPlaylistAndPrefetch();
      console.log('[Music] Playlist refreshed successfully');
    } catch (error) {
      console.error('[Music] Failed to refresh music list', error);
    }
  };
  console.log('[Music] window.refreshMusicList is now:', typeof window.refreshMusicList);
}

async function init() {
  console.log('[Music] init() called');
  const elementsReady = initElements();
  console.log('[Music] Elements ready:', elementsReady);

  if (!elementsReady) {
    console.error('[Music] Failed to initialize - required elements not found');
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
    console.log('[Music] Fetching tracks...');
    state.tracks = await fetchTracks();
    console.log('[Music] Tracks loaded:', state.tracks.length);

    renderPlaylistAndPrefetch();
    console.log('[Music] Playlist rendered');

    if (state.tracks.length > 0) {
      loadTrack(0);
      console.log('[Music] First track loaded');

      if (elements.playerBar) {
        elements.playerBar.classList.add('visible');
        console.log('[Music] Player bar visible');
      }
    }

    // CRITICAL: Reapply translations after rendering playlist
    // This ensures all dynamically generated elements are translated
    if (window.i18n && window.i18n._applyTranslations) {
      console.log('[Music] Reapplying translations after init');
      window.i18n._applyTranslations();
    }
  } catch (error) {
    console.error('[Music] Error during init:', error);
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

// Flag to prevent double initialization
let isInitialized = false;

// Wrapper function to prevent double init
async function initOnce() {
  if (isInitialized) {
    console.log('[Music] Already initialized, skipping duplicate init');
    return;
  }

  isInitialized = true;
  await init();
}

// Initialize on first load
initOnce();

// Export init function for AJAX navigation (wrapped to prevent duplicates)
window.initMusicPage = initOnce;

// Listen for AJAX navigation
window.addEventListener('pageContentLoaded', () => {
  console.log('[Music] pageContentLoaded event received');
  console.log('[Music] window.location.pathname:', window.location.pathname);
  console.log('[Music] Includes "music"?', window.location.pathname.includes('music'));

  if (window.location.pathname.includes('music')) {
    console.log('[Music] Reinitializing after AJAX navigation');
    // CRITICAL: Cleanup old event listeners before reinit to prevent duplicates
    cleanupPlayerEvents();
    isInitialized = false; // Reset flag to allow reinit
    initOnce();
  } else {
    console.log('[Music] Left music page - cleaning up player events');
    // CRITICAL: Cleanup when navigating AWAY from music page
    try {
      cleanupPlayerEvents();
      isInitialized = false; // Reset flag
      // Pause audio if playing
      if (elements?.audio && !elements.audio.paused) {
        elements.audio.pause();
      }
    } catch (error) {
      console.warn('[Music] Cleanup error:', error);
    }
  }
});
