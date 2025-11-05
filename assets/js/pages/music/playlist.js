import { elements, state } from './state.js';
import { formatTime } from './utils.js';

function getOrCreateCoverObserver() {
  if (!('IntersectionObserver' in window)) {
    return null;
  }

  if (!state.globalCoverObserver) {
    state.globalCoverObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
          }
          state.globalCoverObserver.unobserve(img);
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );
  }

  return state.globalCoverObserver;
}

function initLazyCoverLoading() {
  if (!elements.playlist) return;
  const lazyCovers = elements.playlist.querySelectorAll('img.lazy-cover[data-src]');
  const observer = getOrCreateCoverObserver();

  if (observer) {
    lazyCovers.forEach((img) => observer.observe(img));
    return;
  }

  // Fallback for browsers without IntersectionObserver
  lazyCovers.forEach((img) => {
    const src = img.getAttribute('data-src');
    if (!src) return;
    img.src = src;
    img.classList.add('loaded');
  });
}

export function renderPlaylist() {
  if (!elements.playlist) return;

  elements.playlist.innerHTML = '';
  state.durationElements.clear();

  const filteredTracks =
    state.currentFilter === 'all'
      ? state.tracks
      : state.tracks.filter((track) => Array.isArray(track.tags) && track.tags.includes(state.currentFilter));

  const currentLang = localStorage.getItem('language') || 'en';

  filteredTracks.forEach((track) => {
    const globalIndex = state.tracks.indexOf(track);
    const item = document.createElement('div');
    item.className = 'playlist-item';
    item.dataset.trackIndex = String(globalIndex);
    item.setAttribute('role', 'button');
    item.tabIndex = 0;
    item.setAttribute('aria-label', `Play ${track.title} by ${track.artist}`);
    if (globalIndex === state.currentTrackIndex) item.classList.add('active');

    const durationEl = document.createElement('div');
    durationEl.className = 'playlist-duration';
    state.durationElements.set(globalIndex, durationEl);

    if (state.trackDurations.has(globalIndex)) {
      durationEl.textContent = state.trackDurations.get(globalIndex);
    } else {
      durationEl.textContent = '--:--';
    }

    const description =
      (track.desc && typeof track.desc === 'object' && track.desc[currentLang]) ||
      (track.desc && typeof track.desc === 'object' && track.desc.en) ||
      (typeof track.desc === 'string' ? track.desc : '');

    item.innerHTML = `
      <div class="playlist-cover">
        <img data-src="${track.cover}" alt="${track.title}" class="lazy-cover" loading="lazy" decoding="async" width="60" height="60">
      </div>
      <div class="playlist-info">
        <div class="playlist-track-title">${track.title}</div>
        <div class="playlist-track-artist">${track.artist}</div>
        ${description ? `<div class="playlist-track-desc">${description}</div>` : ''}
      </div>
    `;

    item.appendChild(durationEl);
    elements.playlist.appendChild(item);
  });

  requestAnimationFrame(() => initLazyCoverLoading());
}

export function updatePlaylistPlayingState() {
  if (!elements.playlist) return;
  elements.playlist.querySelectorAll('.playlist-item').forEach((item) => {
    item.classList.remove('playing');
  });

  if (!state.isPlaying) return;
  const selector = `.playlist-item[data-track-index="${state.currentTrackIndex}"]`;
  const currentItem = elements.playlist.querySelector(selector);
  if (currentItem) {
    currentItem.classList.add('playing');
  }
}

export function updateDurationDisplay(index, durationSeconds) {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;

  const formatted = formatTime(durationSeconds);
  state.trackDurations.set(index, formatted);
  const durationEl = state.durationElements.get(index);
  if (durationEl) {
    durationEl.textContent = formatted;
  }
}

export function bindFilterTags(onFilterChange) {
  elements.filterTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      elements.filterTags.forEach((t) => t.classList.remove('active'));
      tag.classList.add('active');
      state.currentFilter = tag.dataset.filter || 'all';
      if (typeof onFilterChange === 'function') {
        onFilterChange();
      }
    });
  });
}
