import { elements, state } from "./state.js";
import { formatTime } from "./utils.js";

function getOrCreateCoverObserver() {
  if (!("IntersectionObserver" in window)) {
    return null;
  }

  if (!state.globalCoverObserver) {
    state.globalCoverObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          const src = img.getAttribute("data-src");
          if (src) {
            img.src = src;
            img.removeAttribute("data-src");
            img.classList.add("loaded");
          }
          state.globalCoverObserver.unobserve(img);
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.01,
      },
    );
  }

  return state.globalCoverObserver;
}

function initLazyCoverLoading() {
  if (!elements.playlist) return;
  const lazyCovers = elements.playlist.querySelectorAll(
    "img.lazy-cover[data-src]",
  );
  const observer = getOrCreateCoverObserver();

  if (observer) {
    lazyCovers.forEach((img) => observer.observe(img));
    return;
  }

  // Fallback for browsers without IntersectionObserver
  lazyCovers.forEach((img) => {
    const src = img.getAttribute("data-src");
    if (!src) return;
    img.src = src;
    img.classList.add("loaded");
  });
}

export function renderPlaylist() {
  if (!elements.playlist) return [];

  elements.playlist.innerHTML = "";
  state.durationElements.clear();
  const renderedIndexes = [];

  const filteredTracks =
    state.currentFilter === "all"
      ? state.tracks
      : state.tracks.filter(
          (track) =>
            Array.isArray(track.tags) &&
            track.tags.includes(state.currentFilter),
        );

  const currentLang = localStorage.getItem("language") || "en";

  filteredTracks.forEach((track) => {
    const globalIndex = state.tracks.indexOf(track);
    const item = document.createElement("div");
    item.className = "playlist-item";
    item.dataset.trackIndex = String(globalIndex);
    item.setAttribute("role", "button");
    item.tabIndex = 0;
    item.setAttribute("aria-label", `Play ${track.title} by ${track.artist}`);
    if (globalIndex === state.currentTrackIndex) item.classList.add("active");

    const durationEl = document.createElement("div");
    durationEl.className = "playlist-duration";
    state.durationElements.set(globalIndex, durationEl);

    if (state.trackDurations.has(globalIndex)) {
      durationEl.textContent = state.trackDurations.get(globalIndex);
    } else if (Number.isFinite(track.length) && track.length > 0) {
      const formatted = formatTime(track.length);
      state.trackDurations.set(globalIndex, formatted);
      durationEl.textContent = formatted;
    } else {
      durationEl.textContent = "--:--";
    }

    const description =
      (track.desc &&
        typeof track.desc === "object" &&
        track.desc[currentLang]) ||
      (track.desc && typeof track.desc === "object" && track.desc.en) ||
      (typeof track.desc === "string" ? track.desc : "");

    // Build DOM safely without innerHTML to prevent XSS
    const cover = document.createElement("div");
    cover.className = "playlist-cover";

    const img = document.createElement("img");
    img.setAttribute("data-src", track.cover);
    img.alt = track.title;
    img.className = "lazy-cover";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 60;
    img.height = 60;
    cover.appendChild(img);

    const info = document.createElement("div");
    info.className = "playlist-info";

    const title = document.createElement("div");
    title.className = "playlist-track-title";
    title.textContent = track.title;
    info.appendChild(title);

    const artist = document.createElement("div");
    artist.className = "playlist-track-artist";
    artist.textContent = track.artist;
    info.appendChild(artist);

    if (description) {
      const desc = document.createElement("div");
      desc.className = "playlist-track-desc";
      desc.textContent = description;
      info.appendChild(desc);
    }

    item.appendChild(cover);
    item.appendChild(info);
    item.appendChild(durationEl);
    elements.playlist.appendChild(item);
    renderedIndexes.push(globalIndex);
  });

  requestAnimationFrame(() => initLazyCoverLoading());
  return renderedIndexes;
}

export function updatePlaylistPlayingState() {
  if (!elements.playlist) return;
  elements.playlist.querySelectorAll(".playlist-item").forEach((item) => {
    item.classList.remove("playing");
  });

  if (!state.isPlaying) return;
  const selector = `.playlist-item[data-track-index="${state.currentTrackIndex}"]`;
  const currentItem = elements.playlist.querySelector(selector);
  if (currentItem) {
    currentItem.classList.add("playing");
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

// CRITICAL FIX: Store filter tag handlers for cleanup
const filterTagHandlers = new WeakMap();

export function bindFilterTags(onFilterChange) {
  elements.filterTags.forEach((tag) => {
    const handler = () => {
      elements.filterTags.forEach((t) => t.classList.remove("active"));
      tag.classList.add("active");
      state.currentFilter = tag.dataset.filter || "all";
      if (typeof onFilterChange === "function") {
        onFilterChange();
      }
    };

    // Store handler for cleanup
    filterTagHandlers.set(tag, handler);
    tag.addEventListener("click", handler);
  });
}

// CRITICAL FIX: Cleanup function for filter tags
export function cleanupFilterTags() {
  elements.filterTags.forEach((tag) => {
    const handler = filterTagHandlers.get(tag);
    if (handler) {
      tag.removeEventListener("click", handler);
      filterTagHandlers.delete(tag);
    }
  });
}

// CRITICAL FIX: Cleanup function for global cover observer
export function cleanupCoverObserver() {
  if (state.globalCoverObserver) {
    state.globalCoverObserver.disconnect();
    state.globalCoverObserver = null;
  }
}
