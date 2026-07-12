(function () {
  const tracks = Array.from(document.querySelectorAll('#trackData .track-card'));
  const cards = Array.from(document.querySelectorAll('[data-featured-track]'));
  if (!tracks.length || !cards.length) return;

  const byTitle = new Map(tracks.map(track => [track.dataset.title, track]));
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.volume = 0.7;

  const bar = document.getElementById('playerBar');
  const title = document.getElementById('playerTitle');
  const artist = document.getElementById('playerArtist');
  const status = document.getElementById('playerStatus');
  const cover = document.getElementById('playerCover');
  const play = document.getElementById('playPauseBtn');
  const playIcon = document.getElementById('playPauseIcon');
  const previous = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  const repeat = document.getElementById('repeatBtn');
  const shuffle = document.getElementById('shuffleBtn');
  const mute = document.getElementById('muteBtn');
  const progress = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const bufferFill = document.getElementById('progressBuffer');
  const playedClip = document.getElementById('waveformPlayedClip');
  const currentTime = document.getElementById('currentTime');
  const totalTime = document.getElementById('totalTime');
  const volume = document.getElementById('volumeBar');
  const volumeFill = document.getElementById('volumeFill');

  let current = -1;
  let repeatOne = false;
  let shuffleOn = false;
  let lastVolume = audio.volume;

  function source(track) {
    try { return atob(track.dataset.srcE || ''); } catch (_) { return ''; }
  }

  function format(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    return minutes + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
  }

  function setPlayState() {
    const playing = !audio.paused && !!audio.src;
    bar.classList.toggle('is-playing', playing);
    playIcon.innerHTML = playing ? '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>' : '<polygon points="6,3 20,12 6,21"></polygon>';
    cards.forEach(card => {
      const selected = current >= 0 && card.dataset.featuredTrack === tracks[current].dataset.title;
      card.classList.toggle('active', selected);
      card.classList.toggle('is-playing', selected && playing);
      card.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  function select(index, autoplay) {
    current = (index + tracks.length) % tracks.length;
    const track = tracks[current];
    audio.src = source(track);
    title.textContent = track.dataset.title;
    artist.textContent = track.dataset.artist;
    totalTime.textContent = track.dataset.duration || '0:00';
    cover.style.backgroundImage = 'url("' + track.dataset.cover + '")';
    bar.classList.add('has-track');
    progress.setAttribute('tabindex', '0');
    progress.setAttribute('aria-disabled', 'false');
    status.textContent = autoplay ? 'Loading' : 'Ready to play';
    if (autoplay) audio.play().catch(() => { status.textContent = 'Tap play to start'; });
    setPlayState();
  }

  function adjacent(direction) {
    if (current < 0) return select(0, true);
    if (shuffleOn) return select(Math.floor(Math.random() * tracks.length), true);
    select(current + direction, true);
  }

  cards.forEach(card => card.addEventListener('click', () => {
    const track = byTitle.get(card.dataset.featuredTrack);
    const index = tracks.indexOf(track);
    if (index === current && !audio.paused) audio.pause();
    else if (index === current) audio.play().catch(() => {});
    else select(index, true);
  }));

  play.addEventListener('click', () => {
    if (current < 0) return select(0, true);
    if (audio.paused) audio.play().catch(() => {}); else audio.pause();
  });
  previous.addEventListener('click', () => adjacent(-1));
  next.addEventListener('click', () => adjacent(1));
  repeat.addEventListener('click', () => {
    repeatOne = !repeatOne;
    repeat.classList.toggle('active', repeatOne);
    repeat.setAttribute('aria-pressed', String(repeatOne));
    repeat.setAttribute('aria-label', 'Repeat one ' + (repeatOne ? 'on' : 'off'));
  });
  shuffle.addEventListener('click', () => {
    shuffleOn = !shuffleOn;
    shuffle.classList.toggle('active', shuffleOn);
    shuffle.setAttribute('aria-pressed', String(shuffleOn));
    shuffle.setAttribute('aria-label', 'Shuffle ' + (shuffleOn ? 'on' : 'off'));
  });
  mute.addEventListener('click', () => {
    if (audio.volume > 0) { lastVolume = audio.volume; audio.volume = 0; } else audio.volume = lastVolume || 0.7;
  });

  function setVolume(event) {
    const rect = volume.getBoundingClientRect();
    audio.volume = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    if (audio.volume) lastVolume = audio.volume;
  }
  volume.addEventListener('click', setVolume);
  volume.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    audio.volume = Math.max(0, Math.min(1, audio.volume + (event.key === 'ArrowRight' ? 0.05 : -0.05)));
  });

  function seek(event) {
    if (!audio.duration) return;
    const rect = progress.getBoundingClientRect();
    audio.currentTime = Math.max(0, Math.min(audio.duration, ((event.clientX - rect.left) / rect.width) * audio.duration));
  }
  progress.addEventListener('click', seek);
  progress.addEventListener('keydown', event => {
    if (!audio.duration || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + (event.key === 'ArrowRight' ? 5 : -5)));
  });

  audio.addEventListener('play', () => { status.textContent = 'Playing'; setPlayState(); });
  audio.addEventListener('pause', () => { if (current >= 0) status.textContent = 'Paused'; setPlayState(); });
  audio.addEventListener('ended', () => { if (repeatOne) { audio.currentTime = 0; audio.play(); } else adjacent(1); });
  audio.addEventListener('volumechange', () => {
    const percent = Math.round(audio.volume * 100);
    volumeFill.style.width = percent + '%';
    volume.setAttribute('aria-valuenow', String(percent));
    volume.setAttribute('aria-valuetext', percent + '%');
    mute.setAttribute('aria-pressed', String(percent === 0));
  });
  audio.addEventListener('progress', () => {
    if (!audio.duration || !audio.buffered.length) return;
    bufferFill.style.width = Math.min(100, audio.buffered.end(audio.buffered.length - 1) / audio.duration * 100) + '%';
  });
  audio.addEventListener('timeupdate', () => {
    const percent = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
    progressFill.style.width = percent + '%';
    playedClip.style.width = percent + '%';
    currentTime.textContent = format(audio.currentTime);
    if (Number.isFinite(audio.duration)) totalTime.textContent = format(audio.duration);
    progress.setAttribute('aria-valuenow', String(Math.round(percent)));
    progress.setAttribute('aria-valuetext', format(audio.currentTime) + ' of ' + format(audio.duration));
  });
})();
