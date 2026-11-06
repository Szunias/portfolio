const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Element, browser } = require('./helpers/browser-fixture.cjs');

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function cineFixture({ reduced = false, intersection = true } = {}) {
  const reveal = new Element('figure', { 'data-reveal': '' });
  const fixture = browser({ '[data-reveal]': [reveal] });
  const media = fixture.window.matchMedia(MOTION_QUERY);
  media.matches = reduced;
  const observers = [];
  if (intersection) {
    fixture.context.IntersectionObserver = fixture.window.IntersectionObserver = class {
      constructor(callback) { this.callback = callback; this.targets = new Set(); observers.push(this); }
      observe(node) { this.targets.add(node); }
      unobserve(node) { this.targets.delete(node); }
      disconnect() { this.targets.clear(); }
    };
  }
  fixture.run('cine.js');
  return { ...fixture, reveal, media, observers };
}

test('cinematic reveals remain one-shot when motion is reduced after initialization', async () => {
  const fixture = cineFixture();
  assert.equal(fixture.reveal.classList.contains('is-in'), false);
  fixture.media.matches = true;
  await fixture.media.emit('change');
  assert.equal(fixture.reveal.classList.contains('is-in'), true);
  assert.equal(fixture.observers[0].targets.size, 0);
  fixture.media.matches = false;
  await fixture.media.emit('change');
  assert.equal(fixture.reveal.classList.contains('is-in'), true);
  assert.equal(fixture.observers.length, 1);
});

test('cinematic reveal fallback works without IntersectionObserver and with reduced motion', () => {
  for (const options of [{ intersection: false }, { reduced: true }]) {
    const fixture = cineFixture(options);
    assert.equal(fixture.reveal.classList.contains('is-in'), true);
  }
});

test('ordinary cinematic reveals ignore non-intersections and unobserve after entry', () => {
  const fixture = cineFixture();
  const observer = fixture.observers[0];
  observer.callback([{ target: fixture.reveal, isIntersecting: false }]);
  assert.equal(fixture.reveal.classList.contains('is-in'), false);
  observer.callback([{ target: fixture.reveal, isIntersecting: true }]);
  assert.equal(fixture.reveal.classList.contains('is-in'), true);
  assert.equal(observer.targets.size, 0);
});

function clockFixture(file, { reduced = false, AudioContext } = {}) {
  const root = new Element('section');
  const svg = new Element('svg');
  const second = new Element('line');
  // The second caption line: "Graz, Austria" at rest, the offset while wound.
  const caption = new Element('span');
  caption.textContent = 'Graz, Austria';
  const fixture = browser({
    '[data-time-root]': [root], '.ck__dial': [svg],
    '[data-hand="second"]': [second], '[data-cap-where]': [caption],
  });
  const intervals = new Map();
  let sequence = 0;
  fixture.window.setInterval = (callback, delay) => {
    intervals.set(++sequence, { callback, delay });
    return sequence;
  };
  fixture.window.clearInterval = id => intervals.delete(id);
  const media = fixture.window.matchMedia(MOTION_QUERY);
  media.matches = reduced;
  if (AudioContext) fixture.window.AudioContext = AudioContext;
  fixture.run('clock-face.js');
  fixture.run(file);
  return { ...fixture, root, svg, second, caption, intervals, media };
}

for (const file of ['contact-clock.js', 'contact-time.js']) {
  test(file + ' responds to live motion preferences without accumulating timers', async () => {
    const fixture = clockFixture(file);
    assert.equal(fixture.second.hasAttribute('visibility'), false);
    for (const reduced of [true, false, true, false]) {
      fixture.media.matches = reduced;
      await fixture.media.emit('change');
      assert.equal(fixture.second.getAttribute('visibility'), reduced ? 'hidden' : null);
      assert.equal(fixture.intervals.size, 1);
      assert.equal([...fixture.intervals.values()][0].delay, reduced ? 15000 : 1000);
    }
  });

  test(file + ' can restore normal motion when the page initially requested reduced motion', async () => {
    const fixture = clockFixture(file, { reduced: true });
    assert.equal(fixture.second.getAttribute('visibility'), 'hidden');
    fixture.media.matches = false;
    await fixture.media.emit('change');
    assert.equal(fixture.second.hasAttribute('visibility'), false);
    assert.equal([...fixture.intervals.values()][0].delay, 1000);
  });
}

test('reducing motion finishes an in-flight clock rewind without leaving another animation frame', async () => {
  const fixture = clockFixture('contact-clock.js');
  await fixture.svg.emit('keydown', { key: 'ArrowRight' });
  await fixture.svg.emit('keydown', { key: 'Home' });
  assert.equal(fixture.timers.size, 1);
  fixture.media.matches = true;
  await fixture.media.emit('change');
  assert.equal(fixture.timers.size, 0);
  assert.equal(fixture.svg.getAttribute('aria-valuenow'), '0');
  assert.equal(fixture.caption.textContent, 'Graz, Austria');
});

test('changing motion preference preserves the clock offset during an active drag', async () => {
  const fixture = clockFixture('contact-clock.js');
  const pointer = { pointerId: 1, pointerType: 'touch', isPrimary: true, clientX: 110, clientY: 10 };
  await fixture.svg.emit('pointerdown', pointer);
  await fixture.svg.emit('pointermove', { ...pointer, clientX: 210, clientY: 110 });
  assert.equal(fixture.svg.getAttribute('aria-valuenow'), '3');
  fixture.media.matches = true;
  await fixture.media.emit('change');
  assert.equal(fixture.svg.getAttribute('aria-valuenow'), '3');
  assert.equal(fixture.root.classList.contains('ck--scrubbing'), true);
  await fixture.svg.emit('pointerup', pointer);
  // The lifted finger holds the preview; reduced motion then returns without animating.
  assert.equal(fixture.svg.getAttribute('aria-valuenow'), '3');
  assert.equal(fixture.timers.size, 1);
  fixture.flushTimers();
  assert.equal(fixture.svg.getAttribute('aria-valuenow'), '0');
  assert.equal(fixture.timers.size, 0);
});

function audioStub({ state = 'running', failure = '' } = {}) {
  const nodes = [];
  let caught = false;
  let resumes = 0;
  function node(kind) {
    const result = {
      kind, disconnected: false, stopped: false,
      frequency: {}, Q: {},
      gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
      connect(target) { return target; },
      disconnect() { this.disconnected = true; },
      start() { if (failure === 'start') throw new Error('start unavailable'); },
      stop() { this.stopped = true; },
    };
    nodes.push(result);
    return result;
  }
  class AudioContext {
    constructor() { this.state = state; this.currentTime = 0; this.sampleRate = 48000; this.destination = {}; }
    resume() {
      resumes++;
      if (failure === 'resume') throw new Error('resume unavailable');
      // Track attachment of a rejection handler without leaking a rejected
      // promise from the deliberately broken baseline into unrelated tests.
      return { catch(handler) { caught = true; handler(new Error('resume rejected')); } };
    }
    createBuffer(channels, length) {
      if (failure === 'buffer') throw new Error('buffer unavailable');
      const data = new Float32Array(length);
      return { length, getChannelData: () => data };
    }
    createBufferSource() {
      if (failure === 'source') throw new Error('buffer source unavailable');
      return node('source');
    }
    createBiquadFilter() {
      if (failure === 'filter') throw new Error('filter unavailable');
      return node('filter');
    }
    createGain() {
      if (failure === 'gain') throw new Error('gain unavailable');
      return node('gain');
    }
  }
  return { AudioContext, nodes, caught: () => caught, resumes: () => resumes };
}

for (const state of ['suspended', 'interrupted']) {
  test('clock audio handles a rejected resume from ' + state + ' without queuing stale ticks', async () => {
    const stub = audioStub({ state });
    const fixture = clockFixture('contact-clock.js', stub);
    await fixture.svg.emit('keydown', { key: 'ArrowRight' });
    assert.equal(stub.resumes(), 1);
    assert.equal(stub.caught(), true);
    assert.equal(stub.nodes.length, 0);
    assert.equal(fixture.svg.getAttribute('aria-valuenow'), '1');
    assert.match(fixture.caption.textContent, /in 1 h/);
  });
}

for (const failure of ['resume', 'buffer', 'source', 'filter', 'gain', 'start']) {
  test('optional clock audio failure at ' + failure + ' never blocks keyboard state or leaves connected nodes', async () => {
    const stub = audioStub({ state: failure === 'resume' ? 'suspended' : 'running', failure });
    const fixture = clockFixture('contact-clock.js', stub);
    await assert.doesNotReject(async () => { await fixture.svg.emit('keydown', { key: 'ArrowRight' }); });
    assert.equal(fixture.svg.getAttribute('aria-valuenow'), '1');
    assert.match(fixture.caption.textContent, /in 1 h/);
    assert.ok(stub.nodes.every(node => node.disconnected));
  });
}

test('a clock click is 12 ms of band-passed noise whose nodes disconnect after it ends', async () => {
  const stub = audioStub();
  const fixture = clockFixture('contact-clock.js', stub);
  await fixture.svg.emit('keydown', { key: 'ArrowRight' });
  assert.deepEqual(stub.nodes.map(node => node.kind), ['source', 'filter', 'gain']);
  const [source, filter] = stub.nodes;
  assert.equal(source.buffer.length, 576);
  assert.equal(filter.type, 'bandpass');
  assert.equal(filter.frequency.value, 1700);
  assert.equal(source.stopped, true);
  assert.equal(typeof source.onended, 'function');
  source.onended();
  assert.ok(stub.nodes.every(node => node.disconnected));
});

test('the half-hour click sits an octave above the full-hour click', async () => {
  const stub = audioStub();
  const fixture = clockFixture('contact-clock.js', stub);
  const pointer = { pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, clientX: 110, clientY: 10 };
  await fixture.svg.emit('pointerdown', pointer);
  // 20 degrees of turn is 40 minutes: one half-hour step.
  await fixture.svg.emit('pointermove', { ...pointer, clientX: 144.2, clientY: 16.03 });
  assert.equal(fixture.svg.getAttribute('aria-valuenow'), '1');
  assert.deepEqual(stub.nodes.filter(node => node.kind === 'filter').map(node => node.frequency.value), [3400]);
});

test('enabling reduced motion suppresses further optional clock tones', async () => {
  const stub = audioStub();
  const fixture = clockFixture('contact-clock.js', stub);
  await fixture.svg.emit('keydown', { key: 'ArrowRight' });
  const before = stub.nodes.length;
  fixture.media.matches = true;
  await fixture.media.emit('change');
  await fixture.svg.emit('keydown', { key: 'ArrowRight' });
  assert.equal(stub.nodes.length, before);
  assert.equal(fixture.svg.getAttribute('aria-valuenow'), '2');
});
