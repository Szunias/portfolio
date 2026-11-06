/* Header state on scroll: .is-scrolled once the page has moved past the top. */
(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  var pending = false;
  function updateHeader() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
    });
  }
  window.addEventListener('scroll', updateHeader, { passive:true });
  window.addEventListener('resize', updateHeader, { passive:true });
  updateHeader();
})();
