'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

// These doubles exercise our event/state contracts, not browser layout or codecs.
class Events {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  emit(type, detail = {}) {
    const event = { type, target: this, ...detail };
    return (this.listeners.get(type) || []).map(listener => listener(event));
  }
  dispatchEvent(event) { this.emit(event.type, event); return true; }
}

class Element extends Events {
  constructor() {
    super();
    this.attributes = new Map();
    this.childrenBySelector = new Map();
    this.dataset = {};
    this.hidden = false;
    this.textContent = '';
    this.focusVisible = false;
    const classes = new Set();
    this.classList = {
      add: (...values) => values.forEach(value => classes.add(value)),
      remove: (...values) => values.forEach(value => classes.delete(value)),
      contains: value => classes.has(value),
      toggle(value, force = !classes.has(value)) {
        if (force) classes.add(value); else classes.delete(value);
        return force;
      }
    };
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  hasAttribute(name) { return this.attributes.has(name); }
  querySelector(selector) { return this.childrenBySelector.get(selector) || null; }
  matches(selector) { return selector === ':focus-visible' && this.focusVisible; }
  closest() { return this.anchor || null; }
  focus() { this.focused = true; }
  getBoundingClientRect() { return { top: 100, bottom: 160 }; }
  contains(element) { return [...this.childrenBySelector.values()].includes(element); }
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

class Media extends Element {
  constructor() { super(); this.attempts = []; this.pauseCount = 0; }
  play() {
    const attempt = deferred();
    this.attempts.push(attempt);
    return attempt.promise;
  }
  pause() { this.pauseCount += 1; }
}

function environment({ observe = true, prefetch = true } = {}) {
  const document = new Events();
  const single = new Map();
  const multiple = new Map();
  const appended = [];
  document.hidden = false;
  document.querySelector = selector => single.get(selector) || null;
  document.querySelectorAll = selector => multiple.get(selector) || [];
  document.head = { appendChild: element => appended.push(element) };
  document.createElement = () => Object.assign(new Element(), {
    relList: { supports: () => prefetch }
  });

  const window = new Events();
  const timers = new Map();
  let timerId = 0;
  window.setTimeout = callback => { timers.set(++timerId, callback); return timerId; };
  window.clearTimeout = id => timers.delete(id);
  window.location = new URL('https://example.test/');
  window.innerHeight = 900;
  window.scrollBy = () => {};
  const queries = new Map();
  window.matchMedia = query => {
    if (!queries.has(query)) {
      const media = new Events();
      media.matches = query.includes('pointer: fine');
      queries.set(query, media);
    }
    return queries.get(query);
  };

  const observers = [];
  class Observer {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.targets = new Set();
      this.disconnected = false;
      observers.push(this);
    }
    observe(element) { this.targets.add(element); }
    unobserve(element) { this.targets.delete(element); }
    disconnect() { this.disconnected = true; this.targets.clear(); }
    deliver(entries) { this.callback(entries); }
  }
  if (observe) window.IntersectionObserver = Observer;
  const connection = Object.assign(new Events(), { saveData: false, effectiveType: '4g' });
  const navigator = { connection };
  const context = vm.createContext({
    document, window, navigator, Element, URL, console,
    IntersectionObserver: observe ? Observer : undefined,
    CustomEvent: class { constructor(type, options) { this.type = type; Object.assign(this, options); } }
  });

  return {
    document, window, navigator, connection, single, multiple, appended, timers, observers,
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)'),
    run(name) {
      const root = process.env.PORTFOLIO_SOURCE_ROOT || path.join(__dirname, '..');
      const file = path.join(root, 'src', 'js', name + '.js');
      vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
    },
    flushTimers() {
      const queued = [...timers.entries()];
      queued.forEach(([id, callback]) => { if (timers.delete(id)) callback(); });
    }
  };
}

function anchor(href, target = '') {
  const element = new Element();
  const url = new URL(href, 'https://example.test/');
  Object.assign(element, {
    origin: url.origin, pathname: url.pathname, search: url.search, target
  });
  element.anchor = element;
  return element;
}

function previewEnvironment() {
  const env = environment();
  const cards = [new Element(), new Element()];
  const videos = cards.map(card => {
    const video = new Media();
    video.dataset.src = 'assets/preview.mp4';
    card.childrenBySelector.set('[data-card-preview]', video);
    return video;
  });
  env.multiple.set('.wcard', cards);
  return { ...env, cards, videos };
}

function copyEnvironment(href = 'mailto:hello@example.test') {
  const env = environment();
  const link = new Element();
  const button = new Element();
  const status = new Element();
  link.setAttribute('href', href);
  env.single.set('[data-mail-link]', link);
  env.single.set('[data-copy-status]', status);
  env.multiple.set('[data-copy-mail]', [button]);
  const writes = [];
  env.navigator.clipboard = {
    writeText(address) {
      const attempt = deferred();
      writes.push({ address, ...attempt });
      return attempt.promise;
    }
  };
  return { ...env, link, button, status, writes };
}

function showreelEnvironment() {
  const env = environment();
  const scope = new Element();
  const video = new Media();
  const preview = new Media();
  const launch = new Element();
  const close = new Element();
  close.hidden = true;
  scope.childrenBySelector.set('.hero__film', video);
  scope.childrenBySelector.set('[data-preview-video]', preview);
  scope.childrenBySelector.set('[data-showreel-play]', launch);
  scope.childrenBySelector.set('[data-showreel-close]', close);
  env.single.set('.hero', scope);
  const notifications = [];
  scope.addEventListener('hero:playback', event => notifications.push(event.detail.playing));
  return { ...env, scope, video, preview, launch, close, notifications };
}

const hover = card => card.emit('pointerenter', { pointerType: 'mouse' });

test('prefetch preserves queries and deduplicates fragments', () => {
  const env = environment();
  env.run('prefetch');
  for (const href of ['/music.html?view=a#one', '/music.html?view=a#two', '/music.html?view=b']) {
    env.document.emit('mouseover', { target: anchor(href) });
  }
  assert.deepEqual(env.appended.map(link => link.href), ['/music.html?view=a', '/music.html?view=b']);
});

test('prefetch handles keyboard focus and same-path query changes', () => {
  const env = environment();
  env.window.location = new URL('https://example.test/music.html?view=a');
  env.run('prefetch');
  env.document.emit('focusin', { target: anchor('/music.html?view=a#track') });
  env.document.emit('focusin', { target: anchor('/music.html?view=b') });
  assert.deepEqual(env.appended.map(link => link.href), ['/music.html?view=b']);
});

test('prefetch ignores external documents, downloads, media and other browsing contexts', () => {
  const env = environment();
  env.run('prefetch');
  const download = anchor('/download.html');
  download.setAttribute('download', '');
  const ignored = [
    anchor('https://other.test/page.html'), anchor('/cv.pdf'), download,
    anchor('/new.html', '_blank'), anchor('/parent.html', '_parent'), anchor('/named.html', 'other'),
    anchor('/#about')
  ];
  ignored.forEach(target => env.document.emit('mouseover', { target }));
  assert.equal(env.appended.length, 0);
  env.document.emit('mouseover', { target: anchor('/contact.html', '_self') });
  assert.equal(env.appended.length, 1);
});

test('prefetch rechecks connection preferences at interaction time', () => {
  const env = environment();
  env.run('prefetch');
  env.connection.saveData = true;
  env.document.emit('mouseover', { target: anchor('/a.html') });
  env.connection.saveData = false;
  env.connection.effectiveType = '3g';
  env.document.emit('mouseover', { target: anchor('/b.html') });
  assert.equal(env.appended.length, 0);
  env.connection.effectiveType = '4g';
  env.document.emit('touchstart', { target: anchor('/c.html') });
  assert.equal(env.appended.length, 1);
});

test('prefetch can resume when data saving was enabled at startup', () => {
  const env = environment();
  env.connection.saveData = true;
  env.run('prefetch');
  env.connection.saveData = false;
  env.document.emit('mouseover', { target: anchor('/music.html') });
  assert.equal(env.appended.length, 1);
});

test('prefetch leaves unsupported browsers and non-element event targets alone', () => {
  const unsupported = environment({ prefetch: false });
  unsupported.run('prefetch');
  assert.equal(unsupported.document.listeners.size, 0);
  const env = environment();
  env.run('prefetch');
  assert.doesNotThrow(() => env.document.emit('mouseover', { target: {} }));
  assert.equal(env.appended.length, 0);
});

test('card preview waits for intent, lazily loads media and exposes only playing video', () => {
  const env = previewEnvironment();
  env.run('project-previews');
  hover(env.cards[0]);
  assert.equal(env.videos[0].attempts.length, 0);
  env.flushTimers();
  assert.equal(env.videos[0].src, 'assets/preview.mp4');
  assert.equal(env.videos[0].muted, true);
  assert.equal(env.cards[0].classList.contains('is-previewing'), false);
  env.videos[0].emit('playing');
  assert.equal(env.cards[0].classList.contains('is-previewing'), true);
});

test('stale play rejection cannot stop a newer preview of the same card', async () => {
  const env = previewEnvironment();
  env.run('project-previews');
  hover(env.cards[0]);
  env.flushTimers();
  env.cards[0].emit('pointerleave');
  hover(env.cards[0]);
  env.flushTimers();
  const pauses = env.videos[0].pauseCount;
  env.videos[0].attempts[0].reject(new Error('Previous attempt was interrupted'));
  await Promise.resolve();
  assert.equal(env.videos[0].pauseCount, pauses);
  env.videos[0].emit('playing');
  assert.equal(env.cards[0].classList.contains('is-previewing'), true);
});

test('hover and keyboard focus do not restart the same pending preview', () => {
  const env = previewEnvironment();
  env.run('project-previews');
  hover(env.cards[0]);
  env.flushTimers();
  env.cards[0].focusVisible = true;
  env.cards[0].emit('focus');
  env.flushTimers();
  assert.equal(env.videos[0].attempts.length, 1);
});

test('switching preview cards pauses the previous card and cancels abandoned timers', () => {
  const env = previewEnvironment();
  env.run('project-previews');
  hover(env.cards[0]);
  hover(env.cards[1]);
  env.flushTimers();
  assert.equal(env.videos[0].attempts.length, 0);
  assert.equal(env.videos[1].attempts.length, 1);
  env.videos[0].emit('playing');
  assert.equal(env.cards[0].classList.contains('is-previewing'), false);
  assert.ok(env.videos[0].pauseCount > 0);
});

test('a current play failure restores the still image', async () => {
  const env = previewEnvironment();
  env.run('project-previews');
  hover(env.cards[0]);
  env.flushTimers();
  env.videos[0].emit('playing');
  env.videos[0].attempts[0].reject(new Error('Unavailable media'));
  await Promise.resolve();
  assert.equal(env.cards[0].classList.contains('is-previewing'), false);
});

test('touch and reduced-motion preferences do not start card previews', () => {
  const env = previewEnvironment();
  env.run('project-previews');
  env.cards[0].emit('pointerenter', { pointerType: 'touch' });
  env.reduced.matches = true;
  hover(env.cards[0]);
  env.flushTimers();
  assert.equal(env.videos[0].attempts.length, 0);
});

test('changing data-saving preference stops an active card preview', () => {
  const env = previewEnvironment();
  env.run('project-previews');
  hover(env.cards[0]);
  env.flushTimers();
  env.videos[0].emit('playing');
  env.connection.saveData = true;
  env.connection.emit('change');
  assert.equal(env.cards[0].classList.contains('is-previewing'), false);
  assert.ok(env.videos[0].pauseCount > 0);
});

test('hidden documents and offscreen cards stop active previews', () => {
  const env = previewEnvironment();
  env.run('project-previews');
  hover(env.cards[0]);
  env.flushTimers();
  env.videos[0].emit('playing');
  env.document.hidden = true;
  env.document.emit('visibilitychange');
  assert.equal(env.cards[0].classList.contains('is-previewing'), false);
  env.document.hidden = false;
  hover(env.cards[0]);
  env.flushTimers();
  env.videos[0].emit('playing');
  env.observers[0].deliver([{ target: env.cards[0], isIntersecting: false }]);
  assert.equal(env.cards[0].classList.contains('is-previewing'), false);
});

test('leaving a keyboard-focused card preserves its preview until blur', () => {
  const env = previewEnvironment();
  env.run('project-previews');
  env.cards[0].focusVisible = true;
  env.cards[0].emit('focus');
  env.flushTimers();
  env.videos[0].emit('playing');
  env.cards[0].emit('pointerleave');
  assert.equal(env.cards[0].classList.contains('is-previewing'), true);
  env.cards[0].emit('blur');
  assert.equal(env.cards[0].classList.contains('is-previewing'), false);
});

test('copy-email decodes only the address and clears feedback after the timeout', async () => {
  const env = copyEnvironment('mailto:hello%2Bwork@example.test?subject=Work');
  env.run('copy-email');
  const [task] = env.button.emit('click');
  assert.equal(env.writes[0].address, 'hello+work@example.test');
  env.writes[0].resolve();
  await task;
  assert.equal(env.status.textContent, 'Email address copied.');
  env.flushTimers();
  assert.equal(env.status.textContent, '');
});

test('copy-email accepts case-insensitive mailto and rereads the current link', async () => {
  const env = copyEnvironment();
  env.run('copy-email');
  env.link.setAttribute('href', 'MAILTO:updated@example.test?subject=New');
  const [task] = env.button.emit('click');
  assert.equal(env.writes[0].address, 'updated@example.test');
  env.writes[0].resolve();
  await task;
});

test('malformed email encoding produces feedback rather than an unhandled rejection', async () => {
  const env = copyEnvironment('mailto:%ZZ@example.test');
  env.run('copy-email');
  const [task] = env.button.emit('click');
  await assert.doesNotReject(task);
  assert.equal(env.writes.length, 0);
  assert.equal(env.status.textContent, 'Select the address to copy it.');
});

test('copy-email does not copy a missing or non-mail link', async () => {
  for (const href of ['', 'https://example.test/', 'mailto:']) {
    const env = copyEnvironment(href);
    env.run('copy-email');
    const [task] = env.button.emit('click');
    assert.equal(env.writes.length, 0);
    await task;
    assert.equal(env.status.textContent, 'Select the address to copy it.');
  }
});

test('copy-email hides unsupported controls without binding an unusable handler', () => {
  const env = copyEnvironment();
  delete env.navigator.clipboard;
  env.run('copy-email');
  assert.equal(env.button.hidden, true);
  assert.equal(env.button.listeners.has('click'), false);
});

test('older clipboard completion cannot replace feedback from the latest click', async () => {
  const env = copyEnvironment();
  env.run('copy-email');
  const [first] = env.button.emit('click');
  const [second] = env.button.emit('click');
  env.writes[1].reject(new Error('Permission denied'));
  await second;
  env.writes[0].resolve();
  await first;
  assert.equal(env.status.textContent, 'Select the address to copy it.');
  assert.equal(env.timers.size, 1);
});

test('cine reveals visible content once and registers no legacy scroll machinery', () => {
  const env = environment();
  const element = new Element();
  env.multiple.set('[data-reveal]', [element]);
  env.run('cine');
  assert.equal(env.observers[0].targets.has(element), true);
  env.observers[0].deliver([{ target: element, isIntersecting: false }]);
  assert.equal(element.classList.contains('is-in'), false);
  env.observers[0].deliver([{ target: element, isIntersecting: true }]);
  assert.equal(element.classList.contains('is-in'), true);
  assert.equal(env.observers[0].targets.has(element), false);
  assert.equal(env.window.listeners.has('scroll'), false);
});

test('cine immediately reveals everything when reduced motion is enabled after load', () => {
  const env = environment();
  const elements = [new Element(), new Element()];
  env.multiple.set('[data-reveal]', elements);
  env.run('cine');
  env.reduced.matches = true;
  env.reduced.emit('change');
  assert.equal(env.observers[0].disconnected, true);
  assert.ok(elements.every(element => element.classList.contains('is-in')));
  env.reduced.matches = false;
  env.reduced.emit('change');
  assert.equal(env.observers.length, 1, 'Already revealed content must not animate again');
});

test('cine preserves content without IntersectionObserver or with reduced motion at load', () => {
  for (const observe of [false, true]) {
    const env = environment({ observe });
    env.reduced.matches = observe;
    const element = new Element();
    env.multiple.set('[data-reveal]', [element]);
    env.run('cine');
    assert.equal(element.classList.contains('is-in'), true);
    assert.equal(env.observers.length, 0);
  }
});

test('cine does nothing on a page without reveal hooks', () => {
  const env = environment();
  env.run('cine');
  assert.equal(env.observers.length, 0);
  assert.equal(env.window.listeners.size, 0);
  assert.equal(env.reduced.listeners.size, 0);
});

test('showreel opens explicitly and emits one notification despite native play events', () => {
  const env = showreelEnvironment();
  env.run('home-showreel');
  assert.equal(env.video.attempts.length, 0);
  env.launch.emit('click');
  env.video.emit('play');
  assert.equal(env.video.controls, true);
  assert.equal(env.close.hidden, false);
  assert.equal(env.close.focused, true);
  assert.deepEqual(env.notifications, [true]);
});

test('a delayed play event cannot reopen the showreel after closing', () => {
  const env = showreelEnvironment();
  env.run('home-showreel');
  env.launch.emit('click');
  env.close.emit('click');
  env.video.emit('play');
  assert.equal(env.scope.classList.contains('is-playing'), false);
  assert.equal(env.video.controls, false);
  assert.equal(env.close.hidden, true);
  assert.equal(env.launch.focused, true);
  assert.deepEqual(env.notifications, [true, false]);
});

test('showreel Escape respects fullscreen, then restores the launch control', () => {
  const env = showreelEnvironment();
  env.run('home-showreel');
  env.launch.emit('click');
  env.document.fullscreenElement = env.video;
  env.scope.emit('keydown', { key: 'Escape' });
  assert.equal(env.scope.classList.contains('is-playing'), true);
  env.document.fullscreenElement = null;
  env.scope.emit('keydown', { key: 'Escape' });
  assert.equal(env.scope.classList.contains('is-playing'), false);
  assert.equal(env.launch.focused, true);
});

test('a rejected showreel play attempt keeps native controls available', async () => {
  const env = showreelEnvironment();
  env.run('home-showreel');
  env.launch.emit('click');
  env.video.attempts[0].reject(new Error('Autoplay blocked'));
  await Promise.resolve();
  assert.equal(env.video.controls, true);
  assert.equal(env.close.hidden, false);
});

test('showreel preview pauses for reduced motion and hidden documents', () => {
  const env = showreelEnvironment();
  env.run('home-showreel');
  const initial = env.preview.pauseCount;
  env.reduced.matches = true;
  env.reduced.emit('change');
  assert.ok(env.preview.pauseCount > initial);
  const next = env.preview.pauseCount;
  env.document.hidden = true;
  env.document.emit('visibilitychange');
  assert.ok(env.preview.pauseCount > next);
});
