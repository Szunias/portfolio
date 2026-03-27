// Theme toggle
const themeToggle = document.getElementById('themeToggle');
try { const savedTheme = localStorage.getItem('theme'); if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme); } catch(e) {}
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
