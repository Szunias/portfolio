(function () {
  const browser = document.querySelector('[data-ai-sample-browser]');
  if (!browser) return;

  const base = 'old/public/assets/images/projects-ai-audio-research/presentation';
  const models = {
    dsp: {
      label: 'Procedural DSP',
      latency: '15–25 ms',
      use: 'Fallback',
      note: 'Low latency, but clearly synthetic.'
    },
    audiogen: {
      label: 'AudioGen',
      latency: '2.1–2.8 s',
      use: 'Ambience',
      note: 'Better texture, but the response lands seconds late.'
    },
    mmaudio: {
      label: 'MMAudio',
      latency: '1.4–3.4 s across variants',
      use: 'Prepared content',
      note: 'The benchmark separates Small and Large; this selected sample is not used to compare them.'
    },
    elevenlabs: {
      label: 'ElevenLabs',
      latency: '1.8–3.5 s',
      use: 'Pregeneration',
      note: 'Often the cleanest result in this sample set, but not safe for instant gameplay response.'
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
  const modelLabel = browser.querySelector('[data-ai-sample-model-label]');
  const title = browser.querySelector('[data-ai-sample-title]');
  const note = browser.querySelector('[data-ai-sample-note]');
  const latency = browser.querySelector('[data-ai-sample-latency]');
  const use = browser.querySelector('[data-ai-sample-use]');
  const promptButtons = Array.from(browser.querySelectorAll('[data-ai-sample-prompt]'));
  const modelButtons = Array.from(browser.querySelectorAll('[data-ai-sample-model]'));
  if (!audio || !play || !promptButtons.length || !modelButtons.length) return;

  audio.controls = false;
  browser.classList.add('is-enhanced');
  let currentPrompt = 'footstep';
  let currentModel = 'dsp';

  function setPlayLabel(text) {
    if (!play) return;
    const label = play.querySelector('strong');
    if (label) label.textContent = text;
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
    if (audio) {
      audio.src = prompt.files[currentModel];
      // The static markup labels the first sample; keep the accessible name in
      // step with whichever model/prompt combination is actually loaded.
      audio.setAttribute('aria-label', `${model.label}: ${prompt.title}`);
    }
    if (modelLabel) modelLabel.textContent = model.label;
    if (title) title.textContent = prompt.title;
    if (note) note.textContent = model.note;
    if (latency) latency.textContent = model.latency;
    if (use) use.textContent = model.use;
    setPressed(promptButtons, currentPrompt, 'data-ai-sample-prompt');
    setPressed(modelButtons, currentModel, 'data-ai-sample-model');
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
