/* Copy the visible mail link; shared by the homepage and contact layouts. */
(function () {
  'use strict';
  const link = document.querySelector('[data-mail-link]');
  const buttons = Array.from(document.querySelectorAll('[data-copy-mail]'));
  const status = document.querySelector('[data-copy-status]');
  if (!link || !buttons.length) return;

  const supported = !!navigator.clipboard && typeof navigator.clipboard.writeText === 'function';
  let timer;
  let requestId = 0;

  buttons.forEach(button => {
    button.hidden = !supported;
    if (!supported) return;

    button.addEventListener('click', async () => {
      const request = ++requestId;
      window.clearTimeout(timer);
      try {
        const href = link.getAttribute('href') || '';
        if (!/^mailto:/i.test(href)) throw new Error('Missing mail link');
        const address = decodeURIComponent(href.slice(7).split('?')[0]);
        if (!address) throw new Error('Missing email address');
        await navigator.clipboard.writeText(address);
        if (request !== requestId) return;
        if (status) status.textContent = 'Email address copied.';
      } catch {
        if (request !== requestId) return;
        if (status) status.textContent = 'Select the address to copy it.';
      }
      timer = window.setTimeout(() => { if (status) status.textContent = ''; }, 4000);
    });
  });
})();
