// CRITICAL FIX: Store event handlers for cleanup using WeakMap
const cardHandlers = new WeakMap();

export function initProjectCardHover() {
  const setup = () => {
    document.querySelectorAll('.project-card').forEach((card) => {
      const handler = (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      };

      // Store handler for cleanup
      cardHandlers.set(card, handler);
      card.addEventListener('mousemove', handler);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }

  // CRITICAL FIX: Expose cleanup function to remove event listeners
  return function cleanup() {
    document.querySelectorAll('.project-card').forEach((card) => {
      const handler = cardHandlers.get(card);
      if (handler) {
        card.removeEventListener('mousemove', handler);
        cardHandlers.delete(card);
      }
    });
  };
}
