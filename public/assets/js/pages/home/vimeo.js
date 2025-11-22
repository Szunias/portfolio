export function initVimeoFallback() {
  window.addEventListener('load', () => {
    const iframe = document.getElementById('vimeo-iframe');
    if (!iframe) return;
    iframe.style.cssText =
      'position:absolute!important;top:-2px!important;left:-2px!important;width:calc(100% + 4px)!important;' +
      'height:calc(100% + 4px)!important;border:none!important;outline:none!important;';
  }, { once: true });
}
