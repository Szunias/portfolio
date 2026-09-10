const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Element, browser } = require('./helpers/browser-fixture.cjs');

const MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function cineFixture({ reduced = false, intersection = true, resize = true } = {}) {
  const reveal = new Element('figure', { 'data-reveal': '' });
  const bar = new Element('div');
  const progress = new Map();
  bar.style.setProperty = (key, value) => progress.set(key, value);
  const fixture = browser({ '[data-reveal]': [reveal], '[data-progress]': [bar] });
  const doc = fixture.document.documentElement;
  doc.scrollHeight = 2400;
  doc.toggleAttribute = (name, enabled) => enabled ? doc.setAttribute(name, '') : doc.removeAttribute(name);
  fixture.window.scrollY = 800;
  fixture.window.innerHeight = 800;
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
  const sizeObservers = [];
  if (resize) {
    fixture.context.ResizeObserver = fixture.window.ResizeObserver = class {
      constructor(callback) { this.callback = callback; this.targets = new Set(); sizeObservers.push(this); }
      observe(node) { this.targets.add(node); }
    };
  }
  fixture.run('cine.js');
  fixture.flushTimers();
  return { ...fixture, doc, reveal, progress, media, observers, sizeObservers };
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

test('reading progress updates after viewport resize without waiting for another scroll', async () => {
  const fixture = cineFixture();
  assert.equal(fixture.progress.get('--progress'), '0.5000');
  fixture.window.innerHeight = 400;
  await fixture.window.emit('resize');
  fixture.flushTimers();
  assert.equal(fixture.progress.get('--progress'), '0.4000');
});

test('reading progress reacts to lazy content changing the document height', () => {
  const fixture = cineFixture();
  const observer = fixture.sizeObservers.find(item => item.targets.has(fixture.doc));
  assert.ok(observer, 'the document height must be observed');
  fixture.doc.scrollHeight = 4000;
  observer.callback([]);
  fixture.flushTimers();
  assert.equal(fixture.progress.get('--progress'), '0.2500');
});

test('load and resize remain useful when ResizeObserver is unavailable', async () => {
  const fixture = cineFixture({ resize: false });
  fixture.doc.scrollHeight = 4000;
  await fixture.window.emit('load');
  fixture.flushTimers();
  assert.equal(fixture.progress.get('--progress'), '0.2500');
});

test('reading progress clamps overscroll and coalesces events into one frame', async () => {
  const fixture = cineFixture();
  fixture.window.scrollY = -100;
  await fixture.window.emit('scroll');
  await fixture.window.emit('resize');
  await fixture.window.emit('scroll');
  assert.equal(fixture.timers.size, 1);
  fixture.flushTimers();
  assert.equal(fixture.progress.get('--progress'), '0.0000');
  fixture.window.scrollY = 10000;
  await fixture.window.emit('scroll');
  fixture.flushTimers();
  assert.equal(fixture.progress.get('--progress'), '1.0000');
  fixture.doc.scrollHeight = 500;
  await fixture.window.emit('scroll');
  fixture.flushTimers();
  assert.equal(fixture.progress.get('--progress'), '0.0000');
});

function clockFixture(file, { reduced = false, AudioContext } = {}) {
  const root = new Element('section');
  const svg = new Element('svg');
  const second = new Element('line');
  const caption = new Element('span');
  const fixture = browser({
    '[data-time-root]': [root], '.ck__dial': [svg],
    '[data-hand="second"]': [second], '[data-cap-preview]': [caption],
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
  assert.equal(fixture.caption.hidden, true);
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
  assert.equal(fixture.svg.getAttribute('aria-valuenow'), '0');
  assert.equal(fixture.timers.size, 0);
});

function audioStub({ state = 'running', failure = '' } = {}) {
  const nodes = [];
  let caught = false;
  let resumes = 0;
  let audio;
  function node(kind) {
    const result = {
      kind, disconnected: false, stopped: false,
      frequency: { setValueAtTime() {} },
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
    constructor() { this.state = state; this.currentTime = 0; this.destination = {}; audio = this; }
    resume() {
      resumes++;
      if (failure === 'resume') throw new Error('resume unavailable');
      // Track attachment of a rejection handler without leaking a rejected
      // promise from the deliberately broken baseline into unrelated tests.
      return { catch(handler) { caught = true; handler(new Error('resume rejected')); } };
    }
    createOscillator() {
      if (failure === 'oscillator') throw new Error('oscillator unavailable');
      return node('oscillator');
    }
    createGain() {
      if (failure === 'gain') throw new Error('gain unavailable');
      return node('gain');
    }
  }
  return { AudioContext, nodes, caught: () => caught, resumes: () => resumes, audio: () => audio };
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

for (const failure of ['resume', 'oscillator', 'gain', 'start']) {
  test('optional clock audio failure at ' + failure + ' never blocks keyboard state or leaves connected nodes', async () => {
    const stub = audioStub({ state: failure === 'resume' ? 'suspended' : 'running', failure });
    const fixture = clockFixture('contact-clock.js', stub);
    await assert.doesNotReject(async () => { await fixture.svg.emit('keydown', { key: 'ArrowRight' }); });
    assert.equal(fixture.svg.getAttribute('aria-valuenow'), '1');
    assert.match(fixture.caption.textContent, /in 1 h/);
    assert.ok(stub.nodes.every(node => node.disconnected));
  });
}

test('clock tick nodes disconnect after a successful tone ends', async () => {
  const stub = audioStub();
  const fixture = clockFixture('contact-clock.js', stub);
  await fixture.svg.emit('keydown', { key: 'ArrowRight' });
  assert.equal(stub.nodes.length, 2);
  const oscillator = stub.nodes.find(node => node.kind === 'oscillator');
  assert.equal(oscillator.stopped, true);
  assert.equal(typeof oscillator.onended, 'function');
  oscillator.onended();
  assert.ok(stub.nodes.every(node => node.disconnected));
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
