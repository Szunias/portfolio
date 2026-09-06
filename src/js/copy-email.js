/* Copy the visible mail link; shared by the homepage and contact layouts. */
(function () {
  'use strict';

  const link = document.querySelector('[data-mail-link]');
  const buttons = Array.from(document.querySelectorAll('[data-copy-mail]'));
  const status = document.querySelector('[data-copy-status]');
  if (!link || !buttons.length) return;

  const clipboard = navigator.clipboard;
  const available = clipboard && typeof clipboard.writeText === 'function';
  let timer = 0;
  let latestRequest = 0;

  buttons.forEach(button => {
    button.hidden = !available;
    if (!available) return;
    button.addEventListener('click', async () => {
      const request = ++latestRequest;
      window.clearTimeout(timer);
      let message;
      try {
        const href = link.getAttribute('href') || '';
        if (!/^mailto:/i.test(href)) throw new Error('Expected a mail link');
        const address = decodeURIComponent(href.slice(7).split('?')[0]);
        if (!address.trim()) throw new Error('Empty mail address');
        await clipboard.writeText(address);
        message = 'Email address copied.';
      } catch {
        message = 'Select the address to copy it.';
      }
      // Clipboard permission prompts can resolve in a different click order.
      if (request !== latestRequest) return;
      if (status) {
        status.textContent = message;
        timer = window.setTimeout(() => { status.textContent = ''; }, 4000);
      }
    });
  });
})();
