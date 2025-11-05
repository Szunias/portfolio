// Simplified Projects Page - Live Search Only
document.addEventListener('DOMContentLoaded', function() {
  const list = document.getElementById('projects-list');
  if (!list) return;

  const cards = Array.from(list.querySelectorAll('.project-card'));
  const searchInput = document.getElementById('projects-search');
  const countEl = document.getElementById('projects-count');

  let activeQuery = '';

  // Simple live search function
  function applySearch() {
    const q = (activeQuery || '').trim().toLowerCase();
    let visible = 0;

    cards.forEach(card => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const type = (card.getAttribute('data-type') || '').toLowerCase();
      const content = (card.textContent || '').toLowerCase();

      // Search in title, type, and content
      const matches = !q || title.includes(q) || type.includes(q) || content.includes(q);
      
      if (matches) {
        card.classList.remove('hidden');
        visible++;
        // Lazy load images
        const img = card.querySelector('img[data-src]');
        if (img && !img.src) {
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
        }
      } else {
        card.classList.add('hidden');
      }
    });

    // Update count
    if (countEl) {
      if (visible === 0 && q) {
        countEl.textContent = 'No matches';
        countEl.style.color = '#ff6ea9';
      } else if (q) {
        countEl.textContent = `${visible} found`;
        countEl.style.color = '#18bfef';
      } else {
        countEl.textContent = `${visible} projects`;
        countEl.style.color = '#888';
      }
    }
  }


  // Search input with debouncing
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        activeQuery = searchInput.value || '';
        applySearch();
      }, 200);
    });

    // Clear search on Escape key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        activeQuery = '';
        applySearch();
        searchInput.blur();
      }
    });
  }

  // Initial render
  applySearch();

  // Lazy-load images with IntersectionObserver
  const lazyImgs = Array.from(list.querySelectorAll('img[data-src]'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          io.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    lazyImgs.forEach(img => io.observe(img));
  } else {
    lazyImgs.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
});

