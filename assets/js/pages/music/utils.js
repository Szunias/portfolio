// TIME_UPDATE_INTERVAL moved to constants.js for centralization
// Import from there: import { AUDIO_CONFIG } from '../../config/constants.js';
// Use as: AUDIO_CONFIG.TIME_UPDATE_INTERVAL

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds) || !Number.isFinite(seconds)) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function isValidDuration(duration) {
  return (
    Boolean(duration) &&
    !Number.isNaN(duration) &&
    Number.isFinite(duration) &&
    duration > 0
  );
}
