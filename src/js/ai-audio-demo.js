(function () {
  const demo = document.querySelector('[data-ai-latency-demo]');
  if (!demo) return;

  const trigger = demo.querySelector('[data-ai-demo-trigger]');
  const status = demo.querySelector('[data-ai-demo-status]');
  if (!trigger) return;

  let timers = [];
  let audioContext = null;
  let isRunning = false;
  let signalTimer = 0;
  const prefersReducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const arrivalDelay = prefersReducedMotion ? 900 : 3000;

  function clearTimers() {
    timers.forEach(window.clearTimeout);
    timers = [];
    if (signalTimer) {
      window.clearInterval(signalTimer);
      signalTimer = 0;
    }
  }

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function playArrivalTone() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioContext = audioContext || new Ctx();
      if (audioContext.state === 'suspended') audioContext.resume();
      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.16);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch (_) {}
  }

  function primeAudio() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioContext = audioContext || new Ctx();
      if (audioContext.state === 'suspended') audioContext.resume();
    } catch (_) {}
  }

  function setSignalProgress(progress) {
    const eased = 1 - Math.pow(1 - Math.max(0, Math.min(1, progress)), 3);
    const x = 7 + eased * 86;
    const ghostOne = Math.max(0, eased - 0.08);
    const ghostTwo = Math.max(0, eased - 0.16);
    demo.style.setProperty('--ai-signal-progress', eased.toFixed(4));
    demo.style.setProperty('--ai-signal-live', progress > 0.02 ? '1' : '0');
    demo.style.setProperty('--ai-signal-x', `${x.toFixed(2)}%`);
    demo.style.setProperty('--ai-signal-x-1', `${(7 + ghostOne * 86).toFixed(2)}%`);
    demo.style.setProperty('--ai-signal-x-2', `${(7 + ghostTwo * 86).toFixed(2)}%`);
    demo.style.setProperty('--ai-signal-ghost-1', progress > 0.12 ? '0.54' : '0');
    demo.style.setProperty('--ai-signal-ghost-2', progress > 0.2 ? '0.34' : '0');
  }

  function animateSignal() {
    const startedAt = window.performance.now();
    setSignalProgress(0);
    signalTimer = window.setInterval(() => {
      const now = window.performance.now();
      const progress = Math.min(1, (now - startedAt) / arrivalDelay);
      setSignalProgress(progress);
      if (progress >= 1 || !isRunning) {
        window.clearInterval(signalTimer);
        signalTimer = 0;
      }
    }, 33);
  }

  function runDemo() {
    if (isRunning) return;
    isRunning = true;
    clearTimers();
    primeAudio();
    demo.setAttribute('data-state', 'idle');
    setSignalProgress(0);
    demo.offsetHeight;
    demo.setAttribute('data-state', 'running');
    trigger.setAttribute('aria-disabled', 'true');
    animateSignal();
    setStatus('0ms: UE5 sends the request. The signal starts moving through the audio path.');

    timers.push(window.setTimeout(() => {
      setStatus('150ms: the gameplay deadline passes while the model is still thinking.');
    }, 150));

    timers.push(window.setTimeout(() => {
      demo.setAttribute('data-state', 'arrived');
      setSignalProgress(1);
      trigger.removeAttribute('aria-disabled');
      isRunning = false;
      setStatus(prefersReducedMotion
        ? 'Delayed sound arrives, but the moment is gone.'
        : '3.0s: the sound finally lands, but the action already happened.');
      playArrivalTone();
    }, arrivalDelay));
  }

  trigger.addEventListener('click', runDemo);
})();

(function () {
  const browser = document.querySelector('[data-ai-sample-browser]');
  if (!browser) return;

  const base = 'old/public/assets/images/projects-ai-audio-research/presentation';
  const models = {
    dsp: {
      label: 'Procedural DSP',
      latency: '15-25ms',
      use: 'Fallback',
      image: `${base}/images/procedural-dsp.png`,
      caption: 'Procedural DSP: fast, synthetic, useful as fallback.',
      note: 'Low latency, but clearly synthetic.'
    },
    audiogen: {
      label: 'AudioGen',
      latency: '2.1-2.8s',
      use: 'Ambience',
      image: `${base}/images/audiogen.png`,
      caption: 'AudioGen: useful texture, too late for first playback.',
      note: 'Better texture, but the response lands seconds late.'
    },
    mmaudio: {
      label: 'MMAudio',
      latency: '1.4-3.4s',
      use: 'Prepared content',
      image: `${base}/images/mmaudio.png`,
      caption: 'MMAudio: stronger texture, still needs preparation.',
      note: 'The best local trade-off when the sound is generated ahead of time.'
    },
    elevenlabs: {
      label: 'ElevenLabs',
      latency: '1.8-3.5s',
      use: 'Pregeneration',
      image: `${base}/images/elevenlabs.png`,
      caption: 'ElevenLabs: clean output, cloud latency.',
      note: 'Often the cleanest sample, but not safe for instant gameplay response.'
    }
  };

  const prompts = {
    footstep: {
      title: 'Heavy footstep on wet stone',
      files: {
        dsp: `${base}/audio/dsp-footstep.wav`,
        audiogen: `${base}/audio/audiogen-footstep.wav`,
        mmaudio: `${base}/audio/mmaudio-footstep.wav`,
        elevenlabs: `${base}/audio/elevenlabs-footstep.wav`
      }
    },
    machine: {
      title: 'Machine gun burst',
      files: {
        dsp: `${base}/audio/dsp-machine-gun.wav`,
        audiogen: `${base}/audio/audiogen-machine-gun.wav`,
        mmaudio: `${base}/audio/mmaudio-machine-gun.wav`,
        elevenlabs: `${base}/audio/elevenlabs-machine-gun.wav`
      }
    },
    cat: {
      title: 'Cat meowing sample',
      files: {
        dsp: `${base}/audio/dsp-cat.wav`,
        audiogen: `${base}/audio/audiogen-cat.wav`,
        mmaudio: `${base}/audio/mmaudio-cat.wav`,
        elevenlabs: `${base}/audio/elevenlabs-cat.wav`
      }
    },
    door: {
      title: 'Wooden door slam',
      files: {
        dsp: `${base}/audio/dsp-door.wav`,
        audiogen: `${base}/audio/audiogen-door.wav`,
        mmaudio: `${base}/audio/mmaudio-door.mp3`,
        elevenlabs: `${base}/audio/elevenlabs-door.wav`
      }
    }
  };

  const audio = browser.querySelector('[data-ai-sample-audio]');
  const play = browser.querySelector('[data-ai-sample-play]');
  const image = browser.querySelector('[data-ai-sample-image]');
  const caption = browser.querySelector('[data-ai-sample-caption]');
  const modelLabel = browser.querySelector('[data-ai-sample-model-label]');
  const title = browser.querySelector('[data-ai-sample-title]');
  const note = browser.querySelector('[data-ai-sample-note]');
  const latency = browser.querySelector('[data-ai-sample-latency]');
  const use = browser.querySelector('[data-ai-sample-use]');
  const wave = browser.querySelector('[data-ai-sample-wave]');
  const promptButtons = Array.from(browser.querySelectorAll('[data-ai-sample-prompt]'));
  const modelButtons = Array.from(browser.querySelectorAll('[data-ai-sample-model]'));
  let currentPrompt = 'footstep';
  let currentModel = 'dsp';

  function setPlayLabel(text) {
    if (!play) return;
    const label = play.querySelector('strong');
    if (label) label.textContent = text;
  }

  function makeWave(seed) {
    if (!wave) return;
    wave.innerHTML = '';
    for (let i = 0; i < 32; i += 1) {
      const code = seed.charCodeAt(i % seed.length);
      const height = 18 + ((code + i * 13) % 62);
      const bar = document.createElement('i');
      bar.style.setProperty('--h', `${height}%`);
      bar.style.setProperty('--d', `${(i % 8) * 42}ms`);
      wave.appendChild(bar);
    }
  }

  function stopAudio() {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    browser.classList.remove('is-playing');
    setPlayLabel('Play sample');
  }

  function setPressed(buttons, key, attr) {
    buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.getAttribute(attr) === key));
    });
  }

  function render() {
    const model = models[currentModel];
    const prompt = prompts[currentPrompt];
    if (!model || !prompt) return;

    stopAudio();
    if (audio) audio.src = prompt.files[currentModel];
    if (image) {
      image.src = model.image;
      image.alt = `${model.label} presentation visual`;
    }
    if (caption) caption.textContent = model.caption;
    if (modelLabel) modelLabel.textContent = model.label;
    if (title) title.textContent = prompt.title;
    if (note) note.textContent = model.note;
    if (latency) latency.textContent = model.latency;
    if (use) use.textContent = model.use;
    setPressed(promptButtons, currentPrompt, 'data-ai-sample-prompt');
    setPressed(modelButtons, currentModel, 'data-ai-sample-model');
    makeWave(`${currentPrompt}-${currentModel}`);
  }

  promptButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentPrompt = button.getAttribute('data-ai-sample-prompt') || currentPrompt;
      render();
    });
  });

  modelButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentModel = button.getAttribute('data-ai-sample-model') || currentModel;
      render();
    });
  });

  if (play && audio) {
    play.addEventListener('click', () => {
      if (!audio.paused) {
        stopAudio();
        return;
      }
      const promise = audio.play();
      if (promise && promise.catch) {
        promise.catch(() => {
          setPlayLabel('Tap to retry');
        });
      }
    });
    audio.addEventListener('play', () => {
      browser.classList.add('is-playing');
      setPlayLabel('Stop sample');
    });
    audio.addEventListener('pause', () => {
      browser.classList.remove('is-playing');
      setPlayLabel('Play sample');
    });
    audio.addEventListener('ended', stopAudio);
  }

  render();
})();
