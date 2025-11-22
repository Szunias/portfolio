const DEFAULT_AUDIO = '../assets/audio/tracks/placeholder.wav';

function injectPlayerStyles() {
  if (document.getElementById('not-today-darling-player-styles')) return;

  const css = `
    .audio-player{ --p:0deg; position:relative; width:220px; height:220px; margin:1rem auto; display:block; }
    .audio-player::before{ content:''; position:absolute; inset:0; border-radius:50%;
      background:
        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0 40%, transparent 41%),
        conic-gradient(#4ecdc4 var(--p), rgba(255,255,255,0.08) 0);
      box-shadow: inset 0 0 0 6px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.4);
    }
    .audio-player .inner{ position:absolute; inset:18px; border-radius:50%; background:rgba(0,0,0,0.6);
      display:flex; align-items:center; justify-content:center; box-shadow: inset 0 0 0 2px rgba(255,255,255,0.08);
    }
    .audio-player button{ width:96px; height:96px; border-radius:50%; border:none; cursor:pointer; color:#fff;
      background: linear-gradient(135deg,#ff6b6b,#ff9ff3); box-shadow: 0 8px 24px rgba(255,107,107,.35);
      transition: transform .2s ease, box-shadow .2s ease; position:relative; display:flex; align-items:center; justify-content:center; }
    .audio-player button:hover{ transform: scale(1.05); box-shadow:0 12px 32px rgba(255,107,107,.5); }
    .audio-player button .tri{ width:0; height:0; border-left:26px solid #fff; border-top:16px solid transparent; border-bottom:16px solid transparent; margin-left:3px; }
    .audio-player button.paused .tri{ border-left-color:transparent; border-top:0; border-bottom:0; width:20px; height:20px; position:relative; }
    .audio-player button.paused .tri::before,.audio-player button.paused .tri::after{ content:''; position:absolute; top:0; width:6px; height:24px; background:#fff; border-radius:2px; }
    .audio-player button.paused .tri::before{ left:-8px; }
    .audio-player button.paused .tri::after{ left:4px; }
  `;

  const style = document.createElement('style');
  style.id = 'not-today-darling-player-styles';
  style.textContent = css;
  document.head.appendChild(style);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function initAudioPlayers() {
  injectPlayerStyles();

  document.addEventListener('DOMContentLoaded', () => {
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

      const label =
        window.translations?.[window.currentLang]?.player?.label ||
        'Play sample';
      button.setAttribute('aria-label', label);

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
        const sectionTitle = element.closest('.row')?.querySelector('h3')?.textContent || 'Audio Sample';
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

    document.querySelectorAll('.audio-player').forEach(bindPlayer);
  });
}
