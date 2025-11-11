import { initElements, elements, state } from "./music/state.js";
import { renderPlaylist, bindFilterTags } from "./music/playlist.js";
import {
  preloadAllDurations,
  bindDurationRequests,
} from "./music/durations.js";
import { bindPlayerEvents, loadTrack } from "./music/player-controls.js";
import { initPageEffects } from "./music/ui-effects.js";

async function fetchTracks() {
  try {
    const response = await fetch("assets/audio/tracks.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Invalid track data format");
    }
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to load tracks");
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
      // eslint-disable-next-line no-console
      console.error("Failed to refresh music list", error);
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

  try {
    state.tracks = await fetchTracks();
    renderPlaylistAndPrefetch();

    if (state.tracks.length > 0) {
      loadTrack(0);
      if (elements.playerBar) {
        elements.playerBar.classList.add("visible");
      }
    }
  } catch (error) {
    showError(`Failed to load tracks. Error: ${error.message}`);
  }
}

init();
