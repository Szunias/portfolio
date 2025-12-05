import { loadScript } from "../../utils/load-script.js";

const VIMEO_SCRIPT_SRC = "https://player.vimeo.com/api/player.js";
let vimeoPromise = null;

/**
 * Ensure that the Vimeo Player API is loaded before interacting with it.
 * Returns a promise that resolves with the global Vimeo object.
 */
export function ensureVimeoPlayerAPI() {
  if (window.Vimeo && typeof window.Vimeo.Player === "function") {
    return Promise.resolve(window.Vimeo);
  }

  if (!vimeoPromise) {
    vimeoPromise = loadScript(VIMEO_SCRIPT_SRC, {
      async: true,
      defer: false,
    }).then(() => window.Vimeo);
  }

  return vimeoPromise;
}
