const cachedScripts = new Map();

/**
 * Dynamically load an external script and return a promise that resolves once it is ready.
 * Subsequent calls with the same src return the same promise.
 *
 * @param {string} src - The script URL.
 * @param {Object} [options]
 * @param {boolean} [options.async=true] - Whether to load the script asynchronously.
 * @param {boolean} [options.defer=false] - Defer execution (only relevant for classic scripts).
 * @param {string} [options.crossOrigin] - Value for crossorigin attribute.
 * @param {string} [options.referrerPolicy] - Value for referrerpolicy attribute.
 * @returns {Promise<HTMLScriptElement>}
 */
export function loadScript(
  src,
  { async = true, defer = false, crossOrigin, referrerPolicy } = {},
) {
  if (cachedScripts.has(src)) {
    return cachedScripts.get(src);
  }

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;

    if (crossOrigin) {
      script.crossOrigin = crossOrigin;
    }

    if (referrerPolicy) {
      script.referrerPolicy = referrerPolicy;
    }

    script.onload = () => resolve(script);
    script.onerror = (event) => {
      cachedScripts.delete(src);
      reject(event);
    };

    document.head.appendChild(script);
  });

  cachedScripts.set(src, promise);
  return promise;
}
