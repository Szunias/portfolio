/* Copy the visible mail link; shared by the homepage and contact layouts. */
(function () {
  const link = document.querySelector('[data-mail-link]');
  const buttons = Array.from(document.querySelectorAll('[data-copy-mail]'));
  const status = document.querySelector('[data-copy-status]');
  if (!link || !buttons.length) return;
  let timer;
  buttons.forEach(button => {
    button.hidden = !navigator.clipboard || !navigator.clipboard.writeText;
    button.addEventListener('click', async () => {
      const address = decodeURIComponent(link.getAttribute('href').replace(/^mailto:/, '').split('?')[0]);
      window.clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(address);
        if (status) status.textContent = 'Email address copied.';
      } catch {
        if (status) status.textContent = 'Select the address to copy it.';
      }
      timer = window.setTimeout(() => { if (status) status.textContent = ''; }, 4000);
    });
  });
})();
