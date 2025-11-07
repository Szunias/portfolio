/**
 * Demo Reel Timestamps - Interactive Vimeo Player Controls
 * Allows users to jump to specific moments in the demo reel
 */

export function initTimestamps() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupTimestamps);
  } else {
    setupTimestamps();
  }
}

function setupTimestamps() {
  const iframe = document.getElementById('vimeo-iframe');
  const timestampButtons = document.querySelectorAll('.timestamp-item');

  if (!iframe || timestampButtons.length === 0) {
    console.log('Timestamps: iframe or buttons not found');
    return;
  }

  // Initialize Vimeo Player
  // Player.js is already loaded via script tag in index.html
  if (typeof Vimeo === 'undefined') {
    console.error('Vimeo Player API not loaded');
    return;
  }

  const player = new Vimeo.Player(iframe);

  // Add click handlers to all timestamp buttons
  timestampButtons.forEach(button => {
    button.addEventListener('click', () => {
      const time = parseInt(button.getAttribute('data-time'), 10);

      if (!isNaN(time)) {
        // Set the video time
        player.setCurrentTime(time).then(() => {
          console.log(`Jumped to ${time}s`);

          // Play the video if it's not already playing
          player.getPaused().then(paused => {
            if (paused) {
              player.play();
            }
          });

          // Scroll to video smoothly
          const demoReelPlayer = document.getElementById('demo-reel-player');
          if (demoReelPlayer) {
            demoReelPlayer.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }

          // Visual feedback - add active class temporarily
          button.classList.add('active');
          setTimeout(() => {
            button.classList.remove('active');
          }, 300);
        }).catch(error => {
          console.error('Error setting time:', error);
        });
      }
    });
  });

  // Optional: Highlight current timestamp as video plays
  player.on('timeupdate', data => {
    const currentTime = data.seconds;

    timestampButtons.forEach(button => {
      const time = parseInt(button.getAttribute('data-time'), 10);
      const nextButton = button.nextElementSibling;
      const nextTime = nextButton ? parseInt(nextButton.getAttribute('data-time'), 10) : Infinity;

      // If current time is between this timestamp and the next one
      if (currentTime >= time && currentTime < nextTime) {
        button.classList.add('playing');
      } else {
        button.classList.remove('playing');
      }
    });
  });

  console.log('✓ Timestamps initialized');
}
