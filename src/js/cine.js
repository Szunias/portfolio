/* Progressive enhancement for project-page reveals, stages and reading progress. */
(function () {
  'use strict';

  const reduced = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  const revealables = Array.from(document.querySelectorAll('[data-reveal]'));
  const stages = Array.from(document.querySelectorAll('[data-stage]')).map(element => ({
    element,
    steps: Array.from(element.querySelectorAll('[data-step-index]')),
    current: 0,
  })).filter(stage => stage.steps.length);
  const bar = document.querySelector('[data-progress]');
  const hasProgress = bar || document.querySelector('[data-cine]');
  let observers = [];
  let observedHeight = 0;
  let pending = false;

  function viewportHeight() {
    return window.innerHeight || document.documentElement.clientHeight || 1;
  }

  function setStep(stage, index) {
    stage.current = index;
    const value = stage.steps[index].getAttribute('data-step-index') || String(index);
    stage.element.setAttribute('data-step', value);
    stage.steps.forEach((step, position) => {
      step.classList.toggle('is-dim', position !== index);
    });
  }

  function connectObservers() {
    observers.forEach(observer => observer.disconnect());
    observers = [];
    observedHeight = viewportHeight();

    if ((reduced && reduced.matches) || !('IntersectionObserver' in window)) {
      revealables.forEach(element => element.classList.add('is-in'));
      stages.forEach(stage => {
        stage.element.setAttribute('data-step', 'all');
        stage.steps.forEach(step => step.classList.remove('is-dim'));
      });
      return;
    }

    // Vertical rootMargin percentages are based on WIDTH, not height.
    // Pixel margins keep the activation band valid on wide/landscape screens.
    const revealInset = Math.round(observedHeight * 0.04);
    const unrevealed = revealables.filter(element => !element.classList.contains('is-in'));
    if (unrevealed.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      }, { rootMargin: `0px 0px -${revealInset}px 0px`, threshold: 0.05 });
      unrevealed.forEach(element => observer.observe(element));
      observers.push(observer);
    }

    const stageInset = Math.floor(observedHeight * 0.45);
    stages.forEach(stage => {
      setStep(stage, stage.current);
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (!visible.length) return;
        const index = stage.steps.indexOf(visible[visible.length - 1].target);
        if (index !== -1 && index !== stage.current) setStep(stage, index);
      }, { rootMargin: `-${stageInset}px 0px -${stageInset}px 0px`, threshold: 0 });
      stage.steps.forEach(step => observer.observe(step));
      observers.push(observer);
    });
  }

  function scheduleUpdate() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(() => {
      pending = false;
      const height = viewportHeight();
      if (height !== observedHeight) connectObservers();
      if (!hasProgress) return;
      const root = document.documentElement;
      if (bar) {
        const maximum = root.scrollHeight - height;
        const progress = maximum > 0 ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0;
        bar.style.setProperty('--progress', progress.toFixed(4));
      }
      root.toggleAttribute('data-scrolled', window.scrollY > height * 0.6);
    });
  }

  connectObservers();
  if (hasProgress) window.addEventListener('scroll', scheduleUpdate, { passive: true });
  if (hasProgress || revealables.length || stages.length) {
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    scheduleUpdate();
  }
  if (reduced) {
    const onMotionChange = () => { connectObservers(); scheduleUpdate(); };
    if (typeof reduced.addEventListener === 'function') {
      reduced.addEventListener('change', onMotionChange);
    } else if (typeof reduced.addListener === 'function') {
      reduced.addListener(onMotionChange);
    }
  }
})();
