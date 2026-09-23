/* Click-to-load facade for embedded YouTube.
   A bare <iframe> shows nothing until YouTube answers, so on a slow link, a
   blocked tracker or a cold cache the reader gets a black rectangle where the
   work should be. Every other video on the site is a local <video poster>
   that paints its first frame instantly; this gives the embeds the same
   behaviour, and as a side effect nothing is requested from YouTube until the
   reader asks for it. The <noscript> iframe inside each facade stays as the
   no-JS fallback, so the video is never unreachable. */
(function () {
  var facades = [].slice.call(document.querySelectorAll('[data-yt-facade]'));
  if (!facades.length) return;

  facades.forEach(function (facade) {
    var launch = facade.querySelector('[data-yt-launch]');
    var id = facade.getAttribute('data-video-id');
    if (!launch || !id) return;

    launch.addEventListener('click', function () {
      var frame = document.createElement('iframe');
      // autoplay is safe here: it only ever runs from this click.
      // enablejsapi=1 lets a page script pause the player through postMessage
      // (ifmc.js pauses a film when a score reel starts). The player sends
      // nothing and changes nothing until a script talks to it.
      frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&enablejsapi=1';
      frame.title = launch.getAttribute('data-video-title') || 'Embedded video';
      frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      frame.setAttribute('allowfullscreen', '');
      facade.classList.add('is-loaded');
      launch.remove();
      facade.appendChild(frame);
      frame.focus();
    });
  });
})();
