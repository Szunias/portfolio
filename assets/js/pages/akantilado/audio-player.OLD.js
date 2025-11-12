const STYLE_ID = 'akantilado-audio-player-styles';
const DEFAULT_AUDIO = '../assets/audio/tracks/placeholder.wav';

function injectPlayerStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const css = `
    .audio-player{ --p:0deg; position:relative; width:220px; height:220px; margin:1rem auto; display:block; }
    .audio-player::before{ content:''; position:absolute; inset:0; border-radius:50%;
      background:
        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0 40%, transparent 41%),
        conic-gradient(#22c55e var(--p), rgba(255,255,255,0.08) 0);
      box-shadow: inset 0 0 0 6px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.4);
    }
    .audio-player .inner{ position:absolute; inset:18px; border-radius:50%; background:rgba(0,0,0,0.6);
      display:flex; align-items:center; justify-content:center; box-shadow: inset 0 0 0 2px rgba(255,255,255,0.08);
    }
    .audio-player button{ width:96px; height:96px; border-radius:50%; border:none; cursor:pointer; color:#fff;
      background: linear-gradient(135deg,#059669,#34d399); box-shadow: 0 8px 24px rgba(52,211,153,.35);
      transition: transform .2s ease, box-shadow .2s ease; position:relative; display:flex; align-items:center; justify-content:center; }
    .audio-player button:hover{ transform: scale(1.05); box-shadow:0 12px 32px rgba(52,211,153,.5); }
    .audio-player button .tri{ width:0; height:0; border-left:26px solid #fff; border-top:16px solid transparent; border-bottom:16px solid transparent; margin-left:3px; }
    .audio-player button.paused .tri{ border-left-color:transparent; border-top:0; border-bottom:0; width:20px; height:20px; position:relative; }
    .audio-player button.paused .tri::before,.audio-player button.paused .tri::after{ content:''; position:absolute; top:0; width:6px; height:24px; background:#fff; border-radius:2px; }
    .audio-player button.paused .tri::before{ left:-8px; }
    .audio-player button.paused .tri::after{ left:4px; }
    .fixed-player { position: fixed; bottom: 2rem; right: 2rem; width: 320px; background: rgba(12, 18, 16, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 16px; padding: 1rem 1.25rem; box-shadow: 0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(34,197,94,0.1); z-index: 999; opacity: 0; pointer-events: none; transform: translateY(20px); transition: all 0.3s ease; }
    .fixed-player.active { opacity: 1; pointer-events: all; transform: translateY(0); }
    .fixed-player-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; }
    .fixed-player-btn { width: 48px; height: 48px; border-radius: 50%; border: none; background: linear-gradient(135deg, #059669, #34d399); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3); flex-shrink: 0; }
    .fixed-player-btn:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(34, 197, 94, 0.5); }
    .fixed-player-btn .icon { width: 0; height: 0; border-left: 14px solid white; border-top: 8px solid transparent; border-bottom: 8px solid transparent; margin-left: 3px; }
    .fixed-player-btn.playing .icon { border: none; width: 12px; height: 12px; position: relative; }
    .fixed-player-btn.playing .icon::before, .fixed-player-btn.playing .icon::after { content: ''; position: absolute; width: 4px; height: 16px; background: white; border-radius: 2px; }
    .fixed-player-btn.playing .icon::before { left: 0; } .fixed-player-btn.playing .icon::after { left: 8px; }
    .fixed-player-info { flex: 1; overflow: hidden; }
    .fixed-player-title { font-size: 0.9rem; font-weight: 600; color: #fff; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .fixed-player-subtitle { font-size: 0.75rem; color: #88aa88; }
    .fixed-player-progress { width: 100%; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden; margin-bottom: 0.5rem; cursor: pointer; }
    .fixed-player-progress-bar { height: 100%; background: linear-gradient(90deg, #22c55e, #34d399); width: 0%; transition: width 0.1s linear; }
    .fixed-player-time { display: flex; justify-content: space-between; font-size: 0.7rem; color: #6b8f6b; }
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
    const audioPlayers = document.querySelectorAll('.audio-player');
    if (!audioPlayers.length) return;

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
        const sectionTitle = element.closest('section')?.querySelector('h2')?.textContent || 'Audio Sample';
        fixedTitle.textContent = sectionTitle;
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

    audioPlayers.forEach(bindPlayer);
  });
}
