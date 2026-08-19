/* Scroll machinery for the cinematic project pages.

   Three jobs, no dependencies:

   1. reveal      elements marked [data-reveal] fade and rise once, when they
                  first enter the viewport.
   2. stage       a scrollytelling stage: a sticky visual that changes state as
                  its step blocks scroll past. The stage carries data-step with
                  the index of the step the reader is on, and the CSS decides
                  what that means for this particular page.
   3. progress    a hairline at the top of the page showing how far in you are,
                  and a data-scrolled flag on <html> after the first screen.

   Everything here is decoration over markup that already reads without it:
   the steps are ordinary blocks, the visual is an ordinary figure, and with
   JavaScript off or reduced motion on, all of it simply sits still and
   visible. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. reveal ---------- */
  var revealables = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (revealables.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
      revealables.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ---------- 2. stages ---------- */
  var stages = [].slice.call(document.querySelectorAll('[data-stage]'));
  stages.forEach(function (stage) {
    var steps = [].slice.call(stage.querySelectorAll('[data-step-index]'));
    if (!steps.length) return;

    // The last step is the resting state without JS, so every fact a step
    // carries has already been read by the time the page ends.
    stage.setAttribute('data-step', '0');
    steps.forEach(function (step, i) { if (i > 0) step.classList.add('is-dim'); });

    if (reduce || !('IntersectionObserver' in window)) {
      steps.forEach(function (step) { step.classList.remove('is-dim'); });
      stage.setAttribute('data-step', 'all');
      return;
    }

    var current = 0;
    function setStep(next) {
      if (next === current) return;
      current = next;
      stage.setAttribute('data-step', String(next));
      steps.forEach(function (step, i) { step.classList.toggle('is-dim', i !== next); });
    }

    // A band across the middle of the screen decides which step is current:
    // whichever step block covers it wins, so the visual changes exactly when
    // the matching sentence is where the reader is looking.
    var stepObserver = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) best = entry;
      });
      if (!best) return;
      setStep(Number(best.target.getAttribute('data-step-index')) || 0);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    steps.forEach(function (step) { stepObserver.observe(step); });
  });

  /* ---------- 3. progress ---------- */
  var bar = document.querySelector('[data-progress]');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      var doc = document.documentElement;
      if (bar) {
        var max = doc.scrollHeight - window.innerHeight;
        var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        bar.style.setProperty('--progress', ratio.toFixed(4));
      }
      doc.toggleAttribute('data-scrolled', window.scrollY > window.innerHeight * 0.6);
    });
  }

  if (bar || document.querySelector('[data-cine]')) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
