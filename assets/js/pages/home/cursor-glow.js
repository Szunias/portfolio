export function initCursorGlow() {
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let rafId = null;

  const updateCursor = () => {
    cursorX += (mouseX - cursorX) * 0.1;
    cursorY += (mouseY - cursorY) * 0.1;

    document.body.style.setProperty('--cursor-x', `${cursorX}px`);
    document.body.style.setProperty('--cursor-y', `${cursorY}px`);

    if (document.body.classList.contains('cursor-active')) {
      document.body.style.setProperty('--before-left', `${cursorX - 150}px`);
      document.body.style.setProperty('--before-top', `${cursorY - 150}px`);
    }

    rafId = requestAnimationFrame(updateCursor);
  };

  const startAnimation = () => {
    if (rafId != null) return;
    rafId = requestAnimationFrame(updateCursor);
  };

  const onMouseMove = (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    document.body.classList.add('cursor-active');
  };

  document.addEventListener('mousemove', onMouseMove, { passive: true });

  if (document.readyState === 'complete') {
    startAnimation();
  } else {
    window.addEventListener('load', startAnimation, { once: true });
  }
}
