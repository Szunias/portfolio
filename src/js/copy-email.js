/* Copy the visible mail link; shared by the homepage and contact layouts.
   Until the message clears, the clicked button and the status carry
   data-copy-state (copied or failed), so a page can confirm on the button
   itself: contact.html says "Copied" there and shows its status line only
   on failure, while the homepage keeps its visible status line. */
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

  function show(clicked, state, message) {
    buttons.forEach(button => button.setAttribute('data-copy-state', button === clicked ? state : 'idle'));
    if (!status) return;
    status.setAttribute('data-copy-state', state);
    status.textContent = message;
  }

  buttons.forEach(button => {
    button.hidden = !canCopy;
    if (!canCopy) return;
    button.addEventListener('click', async () => {
      const version = ++requestVersion;
      window.clearTimeout(timer);
      let state;
      let message;
      try {
        const href = link.getAttribute('href') || '';
        if (!/^mailto:/i.test(href)) throw new Error('Not a mail link');
        const address = decodeURIComponent(href.slice(7).split('?')[0]);
        if (!address.trim()) throw new Error('Empty email address');
        await clipboard.writeText(address);
        state = 'copied';
        message = 'Email address copied.';
      } catch {
        state = 'failed';
        message = 'Select the address to copy it.';
      }
      // Only the newest click owns the shared status and its expiry timer.
      if (version !== requestVersion) return;
      show(button, state, message);
      timer = window.setTimeout(() => show(null, 'idle', ''), 4000);
    });
  });
})();
