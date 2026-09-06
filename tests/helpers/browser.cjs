const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Small, deterministic DOM doubles for classic-script interaction tests.
// These exercise event handling, not layout or native media playback.
function events(target = {}) {
  const listeners = new Map();
  target.addEventListener = (type, listener) => {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(listener);
  };
  target.dispatch = (type, event = {}) => (listeners.get(type) || [])
    .map(listener => listener({ target, ...event }));
  return target;
}

class Element {
  constructor(attributes = {}) {
    events(this);
    this.attributes = new Map(Object.entries(attributes));
    this.dataset = {};
    this.queries = new Map();
    this.textContent = '';
    this.focusVisible = false;
    const classes = new Set();
    this.classList = {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
      toggle(name, force = !classes.has(name)) {
        if (force) classes.add(name);
        else classes.delete(name);
        return force;
      },
    };
    const styles = new Map();
    this.style = {
      setProperty: (name, value) => styles.set(name, value),
      getPropertyValue: name => styles.get(name),
    };
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  toggleAttribute(name, force) {
    if (force) this.setAttribute(name, '');
    else this.attributes.delete(name);
  }
  querySelectorAll(selector) { return this.queries.get(selector) || []; }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  matches(selector) { return selector === ':focus-visible' && this.focusVisible; }
  closest(selector) { return selector === 'a[href]' && this.href ? this : null; }
}

function createBrowser({ width = 1920, height = 800, reduced = false, fine = true } = {}) {
  const document = events(new Element());
  document.documentElement = new Element();
  document.documentElement.scrollHeight = 4000;
  document.documentElement.clientHeight = height;
  document.hidden = false;
  const appended = [];
  document.head = { appendChild: node => appended.push(node) };
  document.createElement = () => ({ relList: { supports: () => true } });
  const motion = events({ matches: reduced });
  const pointer = events({ matches: fine });
  const connection = events({ saveData: false, effectiveType: '4g' });
  const timers = new Map();
  const frames = new Map();
  let nextId = 0;
  const window = events({
    innerWidth: width,
    innerHeight: height,
    scrollY: 0,
    location: new URL('https://igorszuniewicz.com/'),
    matchMedia: query => query.includes('reduced-motion') ? motion : pointer,
    setTimeout(callback, delay) {
      const id = ++nextId;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout: id => timers.delete(id),
    requestAnimationFrame(callback) {
      const id = ++nextId;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame: id => frames.delete(id),
  });
  const observers = [];
  window.IntersectionObserver = class {
    constructor(callback, options = {}) {
      this.callback = callback;
      this.options = options;
      this.targets = new Set();
      this.disconnected = false;
      observers.push(this);
    }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
    disconnect() { this.disconnected = true; this.targets.clear(); }
    fire(entries) { this.callback(entries); }
  };
  const navigator = { connection };
  const context = vm.createContext({
    window, document, navigator, Element, URL, console,
    IntersectionObserver: window.IntersectionObserver,
    requestAnimationFrame: window.requestAnimationFrame,
  });
  return {
    window, document, navigator, motion, pointer, connection,
    timers, frames, observers, appended,
    load(name) {
      const filename = path.resolve(__dirname, '../../src/js', name + '.js');
      vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
    },
    flushTimers() {
      const pending = Array.from(timers.values());
      timers.clear();
      pending.forEach(({ callback }) => callback());
    },
    flushFrames() {
      const pending = Array.from(frames.values());
      frames.clear();
      pending.forEach(callback => callback(0));
    },
    withoutObserver() {
      delete window.IntersectionObserver;
      delete context.IntersectionObserver;
    },
  };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

module.exports = { createBrowser, deferred, Element };
