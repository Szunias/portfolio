/* Copy the visible mail link; shared by the homepage and contact layouts. */
(function () {
  const link = document.querySelector('[data-mail-link]');
  const buttons = Array.from(document.querySelectorAll('[data-copy-mail]'));
  const status = document.querySelector('[data-copy-status]');
  if (!link || !buttons.length) return;

  let clipboard;
  try { clipboard = navigator.clipboard; } catch (_) { /* access can be denied */ }
  const canCopy = !!clipboard && typeof clipboard.writeText === 'function';
  let timer;
  let requestVersion = 0;

  buttons.forEach(button => {
    button.hidden = !canCopy;
    if (!canCopy) return;
    button.addEventListener('click', async () => {
      const version = ++requestVersion;
      window.clearTimeout(timer);
      let message;
      try {
        const href = link.getAttribute('href') || '';
        if (!/^mailto:/i.test(href)) throw new Error('Not a mail link');
        const address = decodeURIComponent(href.slice(7).split('?')[0]);
        if (!address.trim()) throw new Error('Empty email address');
        await clipboard.writeText(address);
        message = 'Email address copied.';
      } catch {
        message = 'Select the address to copy it.';
      }
      // Only the newest click owns the shared status and its expiry timer.
      if (version !== requestVersion) return;
      if (status) status.textContent = message;
      timer = window.setTimeout(() => { if (status) status.textContent = ''; }, 4000);
    });
  });
})();
