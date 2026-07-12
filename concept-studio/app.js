const menuButton = document.querySelector('.menu-button');
const mainNav = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.textContent = open ? 'Close' : 'Menu';
  mainNav.classList.toggle('open', open);
});

mainNav?.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;
  menuButton?.setAttribute('aria-expanded', 'false');
  if (menuButton) menuButton.textContent = 'Menu';
  mainNav.classList.remove('open');
});

const player = document.querySelector('[data-player]');
const audio = player?.querySelector('[data-audio]');
const play = player?.querySelector('[data-play]');
const title = player?.querySelector('[data-title]');
const cover = player?.querySelector('[data-cover]');
const tracks = [...document.querySelectorAll('.track')];

function updatePlayButton() {
  if (!audio || !play) return;
  play.textContent = audio.paused ? 'Play' : 'Pause';
  play.setAttribute('aria-label', `${audio.paused ? 'Play' : 'Pause'} ${title.textContent}`);
}

play?.addEventListener('click', () => {
  if (audio.paused) audio.play(); else audio.pause();
});
audio?.addEventListener('play', updatePlayButton);
audio?.addEventListener('pause', updatePlayButton);
audio?.addEventListener('ended', updatePlayButton);

tracks.forEach((track) => {
  track.addEventListener('click', async () => {
    const keepPlaying = audio && !audio.paused;
    tracks.forEach((item) => item.classList.remove('active'));
    track.classList.add('active');
    audio.src = track.dataset.src;
    title.textContent = track.dataset.title;
    cover.src = track.dataset.cover;
    cover.alt = `${track.dataset.title} cover`;
    updatePlayButton();
    if (keepPlaying) {
      try { await audio.play(); } catch (_) { updatePlayButton(); }
    }
  });
});
