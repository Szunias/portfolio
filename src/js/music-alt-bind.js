/* Capture the Audio node created by music-selected.js so the alternate
   layout can attach a visualiser without editing the shared player. */
(function () {
  var NativeAudio = window.Audio;
  if (typeof NativeAudio !== 'function') return;

  function CapturedAudio(src) {
    var node = arguments.length ? new NativeAudio(src) : new NativeAudio();
    // music-selected.js constructs a second, unused Audio to probe volume.
    // Keep the first instance: that is the player.
    if (!window.__musicAudio) window.__musicAudio = node;
    return node;
  }

  CapturedAudio.prototype = NativeAudio.prototype;
  window.Audio = CapturedAudio;
})();
