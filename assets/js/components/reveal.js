// Lightweight reveal-on-scroll for elements with [data-reveal]
// Adds 'in-view' once when 12% visible. No animations are injected here;
// CSS can target .in-view to animate.

(function(){
  'use strict';
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach(el=> el.classList.add('in-view'));
    return;
  }
  const obs = new IntersectionObserver((entries)=>{
    for (const e of entries){
      if (e.isIntersecting){
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    }
  },{ threshold: 0.12, rootMargin: '48px 0px' });
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('[data-reveal]').forEach(el=> obs.observe(el));
  });
})();


