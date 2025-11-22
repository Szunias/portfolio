const STYLE_ID = 'amorak-audio-player-styles';
const DEFAULT_AUDIO = '../assets/audio/tracks/placeholder.wav';

function injectPlayerStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const css = `
    .audio-player{ --p:0deg; position:relative; width:220px; height:220px; margin:1.5rem auto; display:block; }
    .audio-player::before{ content:''; position:absolute; inset:0; border-radius:50%;
      background:
        radial-gradient(circle at 50% 50%, rgba(139,69,19,0.08) 0 40%, transparent 41%),
        conic-gradient(#8b4513 var(--p), rgba(255,255,255,0.08) 0);
      box-shadow: inset 0 0 0 6px rgba(139,69,19,0.15), 0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(139,69,19,0.2);
    }
    .audio-player .inner{ position:absolute; inset:18px; border-radius:50%; background:rgba(18,6,7,0.8);
      display:flex; align-items:center; justify-content:center; box-shadow: inset 0 0 0 2px rgba(139,69,19,0.12);
    }
    .audio-player button{ width:96px; height:96px; border-radius:50%; border:none; cursor:pointer; color:#120607;
      background: linear-gradient(135deg,#8b4513,#cd853f); box-shadow: 0 8px 24px rgba(139,69,19,.4);
      transition: transform .2s ease, box-shadow .2s ease; position:relative; display:flex; align-items:center; justify-content:center; }
    .audio-player button:hover{ transform: scale(1.05); box-shadow:0 12px 32px rgba(139,69,19,.6); }
    .audio-player button .tri{ width:0; height:0; border-left:26px solid #120607; border-top:16px solid transparent; border-bottom:16px solid transparent; margin-left:3px; }
    .audio-player button.paused .tri{ border-left-color:transparent; border-top:0; border-bottom:0; width:20px; height:20px; position:relative; }
    .audio-player button.paused .tri::before,.audio-player button.paused .tri::after{ content:''; position:absolute; top:0; width:6px; height:24px; background:#120607; border-radius:2px; }
    .audio-player button.paused .tri::before{ left:-8px; }
    .audio-player button.paused .tri::after{ left:4px; }

    .fixed-player {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 320px;
      background: rgba(18,6,7,0.92);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(139,69,19,0.3);
      border-radius: 16px;
      padding: 1rem 1.25rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(139,69,19,0.15);
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }

    .fixed-player.active {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .fixed-player-top { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem; }
    .fixed-player-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #8b4513, #cd853f);
      color: #120607;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(139,69,19,0.3);
    }
    .fixed-player-btn:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(139,69,19,0.4); }
    .fixed-player-btn .icon {
      width: 0;
      height: 0;
      border-left: 16px solid #120607;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      margin-left: 2px;
      transition: all 0.3s ease;
    }
    .fixed-player-btn.playing .icon {
      width: 12px;
      height: 20px;
      border: none;
      background: #120607;
      position: relative;
      margin-left: 0;
    }
    .fixed-player-btn.playing .icon::before,
    .fixed-player-btn.playing .icon::after {
      content: '';
      position: absolute;
      top: 0;
      width: 4px;
      height: 20px;
      background: #120607;
      border-radius: 1px;
    }
    .fixed-player-btn.playing .icon::before { left: 0; }
    .fixed-player-btn.playing .icon::after { right: 0; }
    .fixed-player-info { flex:1; min-width:0; }
    .fixed-player-title { color:#fff; font-weight:600; font-size:0.95rem; margin-bottom:0.25rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .fixed-player-subtitle { color:#cd853f; font-size:0.75rem; letter-spacing:0.05em; text-transform:uppercase; }
    .fixed-player-progress { width:100%; height:4px; background:rgba(139,69,19,0.25); border-radius:2px; overflow:hidden; margin-bottom:0.6rem; cursor:pointer; }
    .fixed-player-progress-bar { height:100%; background: linear-gradient(90deg, #cd853f, #8b4513); width:0%; transition: width 0.1s linear; }
    .fixed-player-time { display:flex; justify-content:space-between; font-size:0.7rem; color:#9f7a52; }
  `;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function initAudioPlayers() {
  document.addEventListener('DOMContentLoaded', () => {
    const players = document.querySelectorAll('.audio-player');
    if (!players.length) return;

    injectPlayerStyles();

    const fixedPlayer = document.getElementById('fixedPlayer');
    const fixedBtn = document.getElementById('fixedPlayerBtn');
    const fixedTitle = document.getElementById('fixedPlayerTitle');
    const fixedProgressBar = document.getElementById('fixedPlayerProgressBar');
    const fixedProgress = document.getElementById('fixedPlayerProgress');
    const fixedCurrentTime = document.getElementById('fixedPlayerCurrentTime');
    const fixedDuration = document.getElementById('fixedPlayerDuration');

    if (!fixedPlayer || !fixedBtn || !fixedTitle || !fixedProgressBar || !fixedProgress || !fixedCurrentTime || !fixedDuration) {
      return;
    }

    let active = { audio: null, el: null, raf: null };

    const stopActive = () => {
      if (active.audio) {
        try {
          active.audio.pause();
        } catch (error) {
          // ignore pause error
        }
      }
      if (active.el) {
        active.el.querySelector('button')?.classList.remove('paused');
        active.el.style.setProperty('--p', '0deg');
      }
      fixedPlayer.classList.remove('active');
      fixedBtn.classList.remove('playing');
      cancelAnimationFrame(active.raf);
      active = { audio: null, el: null, raf: null };
    };

    const bindPlayer = (element) => {
      const src = element.getAttribute('data-audio') || DEFAULT_AUDIO;
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Play audio sample');
      const inner = document.createElement('div');
      inner.className = 'inner';
      const tri = document.createElement('div');
      tri.className = 'tri';
      button.appendChild(tri);
      inner.appendChild(button);
      element.appendChild(inner);

      const audio = new Audio(src);
      audio.preload = 'metadata';
      let raf = null;

      const loop = () => {
        if (!audio.duration) {
          raf = requestAnimationFrame(loop);
          return;
        }
        const progress = Math.min(1, audio.currentTime / audio.duration);
        element.style.setProperty('--p', `${(progress * 360).toFixed(1)}deg`);
        fixedProgressBar.style.width = `${(progress * 100).toFixed(1)}%`;
        fixedCurrentTime.textContent = formatTime(audio.currentTime || 0);
        fixedDuration.textContent = formatTime(audio.duration || 0);
        if (!audio.paused) {
          raf = requestAnimationFrame(loop);
        }
      };

      const play = () => {
        if (active.el && active.el !== element) {
          stopActive();
        }
        active = { audio, el: element, raf: null };
        button.classList.add('paused');
        fixedPlayer.classList.add('active');
        fixedBtn.classList.add('playing');
        const rowTitle = element.closest('.row')?.querySelector('h3')?.textContent || 'Audio Sample';
        fixedTitle.textContent = rowTitle;
        audio
          .play()
          .then(() => {
            raf = requestAnimationFrame(loop);
            active.raf = raf;
          })
          .catch(() => {
            stopActive();
          });
      };

      const pause = () => {
        audio.pause();
        button.classList.remove('paused');
        cancelAnimationFrame(raf);
        raf = null;
      };

      button.addEventListener('click', () => {
        if (audio.paused) {
          play();
        } else {
          pause();
        }
      });

      audio.addEventListener('ended', () => {
        pause();
        audio.currentTime = 0;
        element.style.setProperty('--p', '0deg');
        fixedProgressBar.style.width = '0%';
      });

      audio.addEventListener('error', stopActive);
    };

    fixedBtn.addEventListener('click', () => {
      if (!active.audio) return;
      if (active.audio.paused) {
        active.audio.play().catch(() => {});
        fixedBtn.classList.add('playing');
        active.el?.querySelector('button')?.classList.add('paused');
      } else {
        active.audio.pause();
        fixedBtn.classList.remove('playing');
        active.el?.querySelector('button')?.classList.remove('paused');
      }
    });

    fixedProgress.addEventListener('click', (event) => {
      if (!active.audio || !active.audio.duration) return;
      const rect = fixedProgress.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / rect.width;
      active.audio.currentTime = active.audio.duration * percent;
    });

    players.forEach(bindPlayer);
  });
}
