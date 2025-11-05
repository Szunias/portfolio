document.addEventListener('DOMContentLoaded', function() {
  const STORAGE_KEY = 'theme-preference';
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'dark'); // default dark
  document.body.setAttribute('data-theme', initial);

  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function setTheme(next) {
    document.body.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
    const icon = btn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-moon', next !== 'dark');
      icon.classList.toggle('fa-sun', next === 'dark');
    }
  }

  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const current = document.body.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });
});

