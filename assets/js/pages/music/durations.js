import { state } from './state.js';
import { updateDurationDisplay } from './playlist.js';

const DURATION_TIMEOUT_MS = 10000;

function preloadSingleDuration(track, index) {
  if (state.trackDurations.has(index)) return;
  if (!track || !Array.isArray(track.sources) || track.sources.length === 0) return;

  const source = track.sources[0];
  if (!source || !source.url) return;

  const tempAudio = new Audio();
  tempAudio.preload = 'metadata';

  const cleanup = () => {
    tempAudio.removeAttribute('src');
    tempAudio.load();
  };

  const timeout = setTimeout(cleanup, DURATION_TIMEOUT_MS);

  tempAudio.addEventListener(
    'loadedmetadata',
    () => {
      clearTimeout(timeout);
      if (!Number.isNaN(tempAudio.duration) && Number.isFinite(tempAudio.duration)) {
        updateDurationDisplay(index, tempAudio.duration);
      }
      cleanup();
    },
    { once: true }
  );

  tempAudio.addEventListener(
    'error',
    () => {
      clearTimeout(timeout);
      cleanup();
    },
    { once: true }
  );

  tempAudio.src = source.url;
}

export function preloadAllDurations() {
  if (!state.tracks.length) return;

  const initialBatch = state.tracks.slice(0, 5);
  initialBatch.forEach((track, index) => preloadSingleDuration(track, index));

  setTimeout(() => {
    state.tracks.forEach((track, index) => {
      if (index >= 5 && !state.trackDurations.has(index)) {
        preloadSingleDuration(track, index);
      }
    });
  }, 2000);
}
