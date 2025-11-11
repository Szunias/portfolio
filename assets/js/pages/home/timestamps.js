import { ensureVimeoPlayerAPI } from "./vimeo-api.js";

/**
 * Demo Reel Timestamps - Interactive Vimeo Player Controls
 * Allows users to jump to specific moments in the demo reel
 */

export function initTimestamps() {
  const init = () => {
    const iframe = document.getElementById("vimeo-iframe");
    const timestampButtons = document.querySelectorAll(".timestamp-item");

    if (!iframe || timestampButtons.length === 0) {
      return;
    }

    ensureVimeoPlayerAPI()
      .then((Vimeo) => {
        const player = new Vimeo.Player(iframe);
        wireTimestampButtons(player, timestampButtons);
        setupActiveTimestampHighlight(player, timestampButtons);
      })
      .catch((error) => {
        console.error("Unable to load Vimeo API", error);
      });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}

function wireTimestampButtons(player, timestampButtons) {
  timestampButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const time = parseInt(button.getAttribute("data-time"), 10);
      if (Number.isNaN(time)) return;

      player
        .setCurrentTime(time)
        .then(() => {
          player.getPaused().then((paused) => {
            if (paused) {
              player.play();
            }
          });

          const demoReelPlayer = document.getElementById("demo-reel-player");
          if (demoReelPlayer) {
            demoReelPlayer.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }

          button.classList.add("active");
          setTimeout(() => button.classList.remove("active"), 300);
        })
        .catch((error) => {
          console.error("Error setting time:", error);
        });
    });
  });
}

function setupActiveTimestampHighlight(player, timestampButtons) {
  player.on("timeupdate", (data) => {
    const currentTime = data.seconds;

    timestampButtons.forEach((button) => {
      const time = parseInt(button.getAttribute("data-time"), 10);
      const nextButton = button.nextElementSibling;
      const nextTime = nextButton
        ? parseInt(nextButton.getAttribute("data-time"), 10)
        : Infinity;

      if (currentTime >= time && currentTime < nextTime) {
        button.classList.add("playing");
      } else {
        button.classList.remove("playing");
      }
    });
  });
}
