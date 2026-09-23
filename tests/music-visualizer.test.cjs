const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Target, Element, browser, deferred } = require('./helpers/browser-fixture.cjs');

// A real stage/canvas fixture is necessary: the visualizer deliberately exits
// before touching audio when either DOM hook is absent. The level meter
// stands for the playing row's three bars, observed like the canvas.
function visualizer({ reduced = false, failure, initialState = 'running' } = {}) {
  const audio = Object.assign(new Target(), { paused: true, ended: false, error: null, readyState: 4 });
  const stage = new Element();
  const canvas = new Element('canvas');
  const meter = new Element('span', { class: 'vu' });
  const calls = { contexts: 0, sources: 0, reads: 0, resumes: 0, disconnects: 0, connections: [] };
  const observed = [];
  let context;
  let intersection;
  let resumeGate;
  canvas.getContext = () => ({ clearRect() {}, beginPath() {}, rect() {}, fill() {} });
  const fixture = browser({ '[data-music-audio]': [audio], '.stage': [stage],
    '.stage__spectrum': [canvas], '.vu': [meter] });
  const motion = fixture.window.matchMedia('(prefers-reduced-motion: reduce)');
  motion.matches = reduced;
  const analyser = { frequencyBinCount: 1024, getByteFrequencyData(bins) { calls.reads++; bins.fill(128); } };
  const source = {
    connect(target) {
      if (target === analyser && failure === 'analyser-connect') throw new Error('Analyser connection failed');
      calls.connections.push(target);
    },
    disconnect() { calls.disconnects++; },
  };
  fixture.window.AudioContext = class extends Target {
    constructor() {
      super();
      calls.contexts++;
      if (failure === 'constructor') throw new Error('Audio unavailable');
      context = this;
      this.state = initialState;
      this.destination = {};
      this.sampleRate = 48000;
    }
    resume() {
      calls.resumes++;
      if (failure === 'resume') return Promise.reject(new Error('Resume blocked'));
      return (resumeGate ? resumeGate.promise : Promise.resolve()).then(() => { this.state = 'running'; });
    }
    createMediaElementSource(element) {
      assert.equal(element, audio, 'The graph must use the player’s existing element');
      calls.sources++;
      return source;
    }
    createAnalyser() {
      if (failure === 'analyser') throw new Error('Analyser unavailable');
      return analyser;
    }
  };
  fixture.context.getComputedStyle = () => ({ getPropertyValue: () => '' });
  fixture.context.IntersectionObserver = class {
    constructor(callback) { intersection = callback; }
    observe(target) { observed.push(target); }
  };
  fixture.run('music-visualizer.js');
  return { ...fixture, audio, stage, canvas, meter, observed, calls, motion, get audioContext() { return context; },
    setVisible(value, target = canvas) { intersection([{ target, isIntersecting: value }]); },
    blockResume() { resumeGate = deferred(); return resumeGate; },
    async play() { audio.paused = false; await audio.emit('play'); await audio.emit('playing'); await settle(); },
  };
}

const settle = () => new Promise(resolve => setImmediate(resolve));

test('spectrum gates drawing without disconnecting playback or creating another source', async () => {
  const f = visualizer();
  assert.equal(f.calls.contexts, 0, 'Do not create audio contexts before playback');
  await f.play();
  assert.equal(f.calls.sources, 1);
  assert.ok(f.calls.connections.includes(f.audioContext.destination));
  f.flushTimers();
  assert.ok(f.calls.reads > 0, 'The fixture must reach actual frequency sampling');
  for (const gate of ['hidden', 'offscreen', 'reduced', 'buffering', 'paused']) {
    if (gate === 'hidden') { f.document.hidden = true; await f.document.emit('visibilitychange'); }
    if (gate === 'offscreen') f.setVisible(false);
    if (gate === 'reduced') { f.motion.matches = true; await f.motion.emit('change'); }
    if (gate === 'buffering') await f.audio.emit('waiting');
    if (gate === 'paused') { f.audio.paused = true; await f.audio.emit('pause'); }
    const reads = f.calls.reads;
    assert.equal(f.timers.size, 0, gate + ' should stop the drawing loop');
    f.flushTimers();
    assert.equal(f.calls.reads, reads);
    if (gate === 'hidden') { f.document.hidden = false; await f.document.emit('visibilitychange'); }
    if (gate === 'offscreen') f.setVisible(true);
    if (gate === 'reduced') { f.motion.matches = false; await f.motion.emit('change'); }
    if (gate === 'buffering') await f.audio.emit('playing');
    if (gate === 'paused') await f.play();
    await settle();
    f.flushTimers();
    assert.ok(f.calls.reads > reads, gate + ' should allow drawing to resume');
  }
  assert.equal(f.calls.sources, 1, 'A media element can only be attached once');
  assert.equal(f.calls.disconnects, 0);
  assert.equal(f.audio.paused, false);
});

test('a playing row on screen keeps the analyser running after the bridge scrolls away', async () => {
  const f = visualizer();
  assert.deepEqual(f.observed, [f.canvas, f.meter], 'The bridge and every row meter are observed');
  await f.play();
  f.setVisible(true, f.meter);
  f.setVisible(false);
  let reads = f.calls.reads;
  f.flushTimers();
  assert.ok(f.calls.reads > reads, 'The visible row meter still needs live levels');
  f.setVisible(false, f.meter);
  assert.equal(f.timers.size, 0, 'Nothing on screen stops the drawing loop');
  reads = f.calls.reads;
  f.flushTimers();
  assert.equal(f.calls.reads, reads);
  f.setVisible(true);
  f.flushTimers();
  assert.ok(f.calls.reads > reads, 'The bridge coming back resumes drawing');
  assert.equal(f.calls.sources, 1);
  assert.equal(f.calls.disconnects, 0);
  assert.equal(f.audio.paused, false);
});

test('reduced motion retains native playback until the listener enables the spectrum', async () => {
  const f = visualizer({ reduced: true });
  await f.play();
  assert.equal(f.calls.contexts, 0);
  assert.equal(f.audio.paused, false);
  f.motion.matches = false;
  await f.motion.emit('change');
  await settle();
  assert.equal(f.calls.sources, 1);
});

for (const failure of ['constructor', 'resume']) {
  test('unavailable audio context leaves the native media path intact: ' + failure, async () => {
    const f = visualizer({ failure, initialState: 'suspended' });
    await f.play();
    assert.equal(f.calls.sources, 0);
    assert.equal(f.timers.size, 0);
    assert.equal(f.audio.paused, false);
    f.document.hidden = false;
    await f.document.emit('visibilitychange');
    await settle();
    assert.equal(f.calls.sources, 0);
  });
}

for (const failure of ['analyser', 'analyser-connect']) {
  test('optional spectrum failure preserves the connected audible path: ' + failure, async () => {
    const f = visualizer({ failure });
    await f.play();
    assert.ok(f.calls.connections.includes(f.audioContext.destination));
    assert.equal(f.calls.disconnects, 0);
    assert.equal(f.calls.sources, 1);
    assert.equal(f.timers.size, 0);
    await f.play();
    assert.equal(f.calls.sources, 1, 'Do not bind an already-owned media element again');
    assert.equal(f.audio.paused, false);
  });
}

test('returning to a visible page resumes an interrupted context without rebuilding the graph', async () => {
  const f = visualizer();
  await f.play();
  f.document.hidden = true;
  await f.document.emit('visibilitychange');
  f.audioContext.state = 'interrupted';
  const resume = f.blockResume();
  f.document.hidden = false;
  await f.document.emit('visibilitychange');
  assert.equal(f.calls.resumes, 1);
  resume.resolve();
  await settle();
  f.flushTimers();
  assert.equal(f.audioContext.state, 'running');
  assert.ok(f.calls.reads > 0);
  assert.equal(f.calls.sources, 1);
  assert.ok(f.calls.connections.includes(f.audioContext.destination));
});
