export const state = {
  tracks: [],
  currentTrackIndex: 0,
  isPlaying: false,
  currentFilter: 'all',
  isDragging: false,
  wasPlayingBeforeDrag: false,
  dragMoved: false,
  dragStartX: 0,
  lastTimeUpdate: 0,
  hoverUpdateFrame: null,
  previousVolume: 0.7,
  trackDurations: new Map(),
  durationElements: new Map(),
  globalCoverObserver: null
};

export const elements = {
  audio: null,
  playBtn: null,
  prevBtn: null,
  nextBtn: null,
  progressBar: null,
  progressFill: null,
  currentTime: null,
  totalTime: null,
  volumeSlider: null,
  volumeIcon: null,
  albumArt: null,
  playerBar: null,
  playerCover: null,
  playerTitle: null,
  playerArtist: null,
  playlist: null,
  progressHover: null,
  progressTooltip: null,
  filterTags: []
};

export function initElements() {
  elements.audio = document.getElementById('audio-player');
  elements.playBtn = document.getElementById('player-play-btn');
  elements.prevBtn = document.getElementById('player-prev-btn');
  elements.nextBtn = document.getElementById('player-next-btn');
  elements.progressBar = document.getElementById('player-progress-bar');
  elements.progressFill = document.getElementById('player-progress-fill');
  elements.currentTime = document.getElementById('player-current-time');
  elements.totalTime = document.getElementById('player-total-time');
  elements.volumeSlider = document.getElementById('player-volume-slider');
  elements.volumeIcon = document.getElementById('player-volume-icon');
  elements.albumArt = document.getElementById('player-album-art');
  elements.playerBar = document.getElementById('player-bar');
  elements.playerCover = document.getElementById('player-cover');
  elements.playerTitle = document.getElementById('player-title');
  elements.playerArtist = document.getElementById('player-artist');
  elements.playlist = document.getElementById('playlist');
  elements.progressHover = document.getElementById('player-progress-hover');
  elements.progressTooltip = document.getElementById('player-progress-tooltip');
  elements.filterTags = Array.from(document.querySelectorAll('.filter-tag'));

  const required = [
    elements.audio,
    elements.playBtn,
    elements.prevBtn,
    elements.nextBtn,
    elements.progressBar,
    elements.progressFill,
    elements.currentTime,
    elements.totalTime,
    elements.volumeSlider,
    elements.volumeIcon,
    elements.albumArt,
    elements.playerBar,
    elements.playerCover,
    elements.playerTitle,
    elements.playerArtist,
    elements.playlist
  ];

  return required.every(Boolean);
}
