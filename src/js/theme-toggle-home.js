const toggle = document.getElementById('themeToggle');
toggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch(e) {}
});
try { const saved = localStorage.getItem('theme'); document.documentElement.setAttribute('data-theme', saved || 'dark'); } catch(e) {}
