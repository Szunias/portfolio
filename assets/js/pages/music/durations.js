import { elements, state } from "./state.js";
import { updateDurationDisplay } from "./playlist.js";

const DURATION_TIMEOUT_MS = 10000;
const MAX_INITIAL_PREFETCH = 2;
const scheduledDurationIndexes = new Set();
let durationListenersBound = false;

const idleCallback =
  typeof window !== "undefined" &&
  typeof window.requestIdleCallback === "function"
    ? (cb, options) => window.requestIdleCallback(cb, options)
    : (cb) =>
        setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 1);

function preloadSingleDuration(track, index) {
  if (state.trackDurations.has(index)) return;
  if (!track || !Array.isArray(track.sources) || track.sources.length === 0) {
    scheduledDurationIndexes.delete(index);
    return;
  }

  const source = track.sources[0];
  if (!source || !source.url) {
    scheduledDurationIndexes.delete(index);
    return;
  }

  const tempAudio = new Audio();
  tempAudio.preload = "metadata";

  const cleanup = (allowRetry = false) => {
    tempAudio.removeAttribute("src");
    tempAudio.load();
    if (allowRetry && !state.trackDurations.has(index)) {
      scheduledDurationIndexes.delete(index);
    }
  };

  const timeout = setTimeout(() => {
    cleanup(true);
  }, DURATION_TIMEOUT_MS);

  tempAudio.addEventListener(
    "loadedmetadata",
    () => {
      clearTimeout(timeout);
      if (
        !Number.isNaN(tempAudio.duration) &&
        Number.isFinite(tempAudio.duration)
      ) {
        updateDurationDisplay(index, tempAudio.duration);
      }
      scheduledDurationIndexes.delete(index);
      cleanup(false);
    },
    { once: true },
  );

  tempAudio.addEventListener(
    "error",
    () => {
      clearTimeout(timeout);
      cleanup(true);
    },
    { once: true },
  );

  tempAudio.src = source.url;
}

function scheduleDurationLoad(index) {
  if (state.trackDurations.has(index)) return;
  if (scheduledDurationIndexes.has(index)) return;

  const track = state.tracks[index];
  if (!track) return;

  if (Number.isFinite(track.length) && track.length > 0) {
    updateDurationDisplay(index, track.length);
    return;
  }

  scheduledDurationIndexes.add(index);
  idleCallback(() => preloadSingleDuration(track, index), { timeout: 1500 });
}

function normalizeIndexes(indexes) {
  return indexes
    .map((idx) => Number.parseInt(idx, 10))
    .filter(
      (idx) => Number.isFinite(idx) && idx >= 0 && idx < state.tracks.length,
    );
}

export function preloadAllDurations(priorityIndexes = []) {
  if (!state.tracks.length) return;

  const normalized = normalizeIndexes(priorityIndexes);
  const fallbacks =
    normalized.length > 0
      ? normalized
      : Array.from(
          { length: Math.min(MAX_INITIAL_PREFETCH, state.tracks.length) },
          (_, i) => i,
        );

  fallbacks
    .slice(0, MAX_INITIAL_PREFETCH)
    .forEach((index) => scheduleDurationLoad(index));
}

function handlePlaylistInteraction(event) {
  const item = event.target.closest(".playlist-item");
  if (!item) return;
  const index = Number.parseInt(item.dataset.trackIndex, 10);
  if (Number.isNaN(index)) return;

  scheduleDurationLoad(index);
}

export function bindDurationRequests() {
  if (durationListenersBound) return;
  if (!elements.playlist) return;

  const passive = { passive: true };
  elements.playlist.addEventListener(
    "mouseenter",
    handlePlaylistInteraction,
    true,
  );
  elements.playlist.addEventListener("focusin", handlePlaylistInteraction);
  elements.playlist.addEventListener("click", handlePlaylistInteraction);
  elements.playlist.addEventListener(
    "touchstart",
    handlePlaylistInteraction,
    passive,
  );
  durationListenersBound = true;
}
