// Theme toggle (project pages)
(function(){
  // Apply saved theme immediately to avoid flash
  try {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch(e) {}

  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  function updateToggle() {
    themeToggle.textContent = document.documentElement.getAttribute('data-theme') === 'light' ? '☽' : '☀';
  }
  updateToggle();

  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch(e) {}
    updateToggle();
  });
})();
