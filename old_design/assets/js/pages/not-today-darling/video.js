export function initVideoPlayer() {
  document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.querySelector('.video-container');
    if (!videoContainer) return;

    const thumbnail = videoContainer.querySelector('.video-thumbnail');
    const iframe = videoContainer.querySelector('iframe');
    if (!thumbnail || !iframe) return;

    thumbnail.addEventListener('click', () => {
      thumbnail.style.display = 'none';
      iframe.classList.add('active');
      const videoSrc = iframe.getAttribute('data-src');
      if (videoSrc) {
        iframe.src = videoSrc;
      }
    });
  });
}
