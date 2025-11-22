/**
 * Track Info Modal Component
 * Displays detailed track information in an accessible modal overlay
 */

const TrackInfoModal = {
  modal: null,
  backdrop: null,
  closeBtn: null,
  focusableElements: [],
  lastFocusedElement: null,
  currentTrackIndex: null,

  init() {
    // Create modal HTML structure if it doesn't exist
    if (!document.getElementById("track-info-modal")) {
      this.createModalHTML();
    }

    this.modal = document.getElementById("track-info-modal");
    this.backdrop = document.getElementById("track-info-backdrop");
    this.closeBtn = document.getElementById("track-info-close");

    // Event listeners
    this.closeBtn.addEventListener("click", () => this.close());
    this.backdrop.addEventListener("click", () => this.close());

    // Escape key handler
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("visible")) {
        this.close();
      }
    });

    // Focus trap
    this.modal.addEventListener("keydown", (e) => {
      if (e.key === "Tab" && this.modal.classList.contains("visible")) {
        this.handleTabKey(e);
      }
    });
  },

  createModalHTML() {
    const modalHTML = `
      <div class="track-info-modal" id="track-info-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="track-info-backdrop" id="track-info-backdrop"></div>
        <div class="track-info-content">
          <button class="track-info-close" id="track-info-close" aria-label="Close">×</button>
          <div class="track-info-header">
            <img class="track-info-cover" id="modal-cover" src="" alt="">
            <div class="track-info-meta">
              <h2 class="track-info-track-title" id="modal-title"></h2>
              <p class="track-info-artist" id="modal-artist"></p>
            </div>
          </div>
          <div class="track-info-body">
            <div class="track-info-description" id="modal-description"></div>
            <div class="track-info-details">
              <div class="track-info-detail">
                <span class="track-info-label" data-i18n="track_info_year">Year</span>
                <span class="track-info-value" id="modal-year"></span>
              </div>
              <div class="track-info-detail">
                <span class="track-info-label" data-i18n="track_info_duration">Duration</span>
                <span class="track-info-value" id="modal-duration"></span>
              </div>
            </div>
            <div class="track-info-tags" id="modal-tags"></div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Add CSS if not already present
    if (!document.getElementById("track-info-modal-styles")) {
      this.createModalCSS();
    }
  },

  createModalCSS() {
    const style = document.createElement("style");
    style.id = "track-info-modal-styles";
    style.textContent = `
      .track-info-modal {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: none;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .track-info-modal.visible {
        display: flex;
        opacity: 1;
      }

      .track-info-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
      }

      .track-info-content {
        position: relative;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        background: rgba(15, 23, 42, 0.95);
        border-radius: 20px;
        border: 1px solid rgba(236, 72, 153, 0.3);
        padding: 2rem;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }

      .track-info-modal.visible .track-info-content {
        transform: scale(1);
      }

      .track-info-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        width: 44px;
        height: 44px;
        min-width: 44px;
        min-height: 44px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .track-info-close:hover {
        background: rgba(236, 72, 153, 0.3);
        border-color: rgba(236, 72, 153, 0.5);
        transform: scale(1.1);
      }

      .track-info-header {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .track-info-cover {
        width: 120px;
        height: 120px;
        border-radius: 10px;
        object-fit: cover;
        flex-shrink: 0;
      }

      .track-info-meta {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .track-info-track-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0 0 0.5rem 0;
        color: #fff;
      }

      .track-info-artist {
        font-size: 1rem;
        color: #ec4899;
        margin: 0;
      }

      .track-info-body {
        color: rgba(255, 255, 255, 0.8);
      }

      .track-info-description {
        margin-bottom: 1.5rem;
        line-height: 1.6;
      }

      .track-info-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .track-info-detail {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .track-info-label {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .track-info-value {
        font-size: 1rem;
        color: #fff;
        font-weight: 500;
      }

      .track-info-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .track-info-tag {
        padding: 0.5rem 1rem;
        background: rgba(236, 72, 153, 0.2);
        border: 1px solid rgba(236, 72, 153, 0.3);
        border-radius: 20px;
        font-size: 0.875rem;
        color: #ec4899;
      }

      @media (max-width: 768px) {
        .track-info-content {
          width: 95%;
          padding: 1.5rem;
        }

        .track-info-header {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .track-info-cover {
          width: 100px;
          height: 100px;
        }

        .track-info-track-title {
          font-size: 1.25rem;
        }
      }
    `;
    document.head.appendChild(style);
  },

  open(trackIndex) {
    if (!window.tracks || !window.tracks[trackIndex]) return;

    // Store current track index for language updates
    this.currentTrackIndex = trackIndex;
    this.lastFocusedElement = document.activeElement;

    // Populate modal with track data
    this.populateModalContent(trackIndex);

    // Show modal
    this.modal.classList.add("visible");
    document.body.style.overflow = "hidden";

    // Setup focus trap
    this.setupFocusTrap();

    // Focus close button
    setTimeout(() => this.closeBtn.focus(), 100);
  },

  populateModalContent(trackIndex) {
    const track = window.tracks[trackIndex];
    if (!track) return;

    // Cover image with fallback
    const coverEl = document.getElementById("modal-cover");
    coverEl.src = track.cover || "assets/images/covers/project5.webp";
    coverEl.alt = track.title || "Track cover";

    // Title with fallback
    document.getElementById("modal-title").textContent =
      track.title || "Unknown Track";

    // Artist with fallback
    document.getElementById("modal-artist").textContent =
      track.artist || "Unknown Artist";

    // Get current language for description
    const currentLang = localStorage.getItem("language") || "en";
    const description =
      track.desc && track.desc[currentLang]
        ? track.desc[currentLang]
        : track.desc && track.desc.en
          ? track.desc.en
          : "";

    const descriptionEl = document.getElementById("modal-description");
    if (description) {
      descriptionEl.textContent = description;
      descriptionEl.style.display = "block";
    } else {
      // Use translation key for fallback message
      const translations = window.translations || {};
      const lang = translations[currentLang] || translations["en"] || {};
      descriptionEl.textContent =
        lang.track_info_no_description ||
        "No description available for this track.";
      descriptionEl.style.display = "block";
    }

    // Year with fallback
    const yearEl = document.getElementById("modal-year");
    yearEl.textContent = track.year || "—";

    // Duration with fallback
    const durationEl = document.getElementById("modal-duration");
    let durationText = "—";

    if (track.length && track.length > 0) {
      durationText = this.formatTime(track.length);
    }

    durationEl.textContent = durationText;

    // Tags with fallback
    const tagsContainer = document.getElementById("modal-tags");
    tagsContainer.innerHTML = "";

    if (track.tags && track.tags.length > 0) {
      track.tags.forEach((tag) => {
        const tagEl = document.createElement("span");
        tagEl.className = "track-info-tag";
        tagEl.textContent = tag;
        tagsContainer.appendChild(tagEl);
      });
      tagsContainer.style.display = "flex";
    } else {
      tagsContainer.style.display = "none";
    }
  },

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },

  close() {
    this.modal.classList.remove("visible");
    document.body.style.overflow = "";
    this.currentTrackIndex = null;

    // Restore focus
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
    }
  },

  setupFocusTrap() {
    const focusableSelectors =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    this.focusableElements = Array.from(
      this.modal.querySelectorAll(focusableSelectors),
    ).filter(
      (el) => !el.hasAttribute("disabled") && !el.hasAttribute("hidden"),
    );
  },

  handleTabKey(e) {
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement =
      this.focusableElements[this.focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  },

  updateLanguage() {
    // Re-apply translations to modal elements with data-i18n attributes
    if (this.modal.classList.contains("visible")) {
      // Apply translations to static elements
      if (window.applyTranslations) {
        window.applyTranslations();
      }

      // Re-populate dynamic content (description) with new language
      if (this.currentTrackIndex !== null) {
        const track = window.tracks[this.currentTrackIndex];
        if (track) {
          const currentLang = localStorage.getItem("language") || "en";
          const description =
            track.desc && track.desc[currentLang]
              ? track.desc[currentLang]
              : track.desc && track.desc.en
                ? track.desc.en
                : "";

          const descriptionEl = document.getElementById("modal-description");
          if (description) {
            descriptionEl.textContent = description;
          } else {
            // Use translation key for fallback message
            const translations = window.translations || {};
            const lang = translations[currentLang] || translations["en"] || {};
            descriptionEl.textContent =
              lang.track_info_no_description ||
              "No description available for this track.";
          }
        }
      }
    }
  },
};

// Expose to window
if (typeof window !== "undefined") {
  window.TrackInfoModal = TrackInfoModal;
}
