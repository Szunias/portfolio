/* Small event/DOM doubles for deterministic runtime tests, not a layout engine.
   Each test executes the unmodified browser script in its own VM context. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Target {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  emit(type, detail = {}) {
    const event = { type, target: this, preventDefault() {}, ...detail };
    return Promise.all((this.listeners.get(type) || []).map(listener => listener(event)));
  }
  dispatchEvent(event) { this.emit(event.type, event); return true; }
}

class Element extends Target {
  constructor(tag = 'div', attributes = {}) {
    super();
    this.tagName = tag.toUpperCase();
    this.attributes = new Map();
    this.dataset = {};
    this.children = [];
    this.parentElement = null;
    this.hidden = false;
    this.style = { setProperty() {}, removeProperty() {} };
    this.box = { left: 10, top: 10, right: 210, bottom: 210, width: 200, height: 200 };
    this._text = '';
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(' '); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(name => !names.includes(name)).join(' '); },
      toggle: (name, force) => {
        const present = force === undefined ? !this.classList.contains(name) : force;
        this.classList[present ? 'add' : 'remove'](name);
        return present;
      },
    };
    Object.entries(attributes).forEach(([name, value]) => this.setAttribute(name, value));
  }
  get className() { return this.getAttribute('class') || ''; }
  set className(value) { this.setAttribute('class', value); }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] = String(value);
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  removeAttribute(name) { this.attributes.delete(name); }
  get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
  set textContent(value) {
    this.children.forEach(child => { child.parentElement = null; });
    this.children = [];
    this._text = String(value);
  }
  append(...children) {
    children.forEach(child => { child.remove(); child.parentElement = this; this.children.push(child); });
  }
  appendChild(child) { this.append(child); return child; }
  remove() {
    if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this);
    this.parentElement = null;
  }
  contains(node) { return node === this || this.children.some(child => child.contains(node)); }
  matches(selector) {
    if (selector === ':focus-visible') return !!this.focusVisible;
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    const attr = /^\[([^=\]]+)(?:="([^"]*)")?\]$/.exec(selector);
    if (attr) return this.hasAttribute(attr[1]) && (attr[2] === undefined || this.getAttribute(attr[1]) === attr[2]);
    return this.tagName.toLowerCase() === selector;
  }
  querySelectorAll(selector) {
    return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
  getBoundingClientRect() { return this.box; }
  focus() { this.focused = true; }
  setPointerCapture(id) { this.capturedPointer = id; }
  releasePointerCapture() { this.capturedPointer = null; }
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function browser(selectors = {}) {
  const document = new Target();
  const window = new Target();
  const timers = new Map();
  const media = new Map();
  let sequence = 0;
  document.documentElement = new Element('html');
  document.activeElement = null;
  document.hidden = false;
  document.baseURI = 'https://example.test/';
  document.querySelectorAll = selector => selectors[selector] || [];
  document.querySelector = selector => document.querySelectorAll(selector)[0] || null;
  document.getElementById = id => document.querySelector('#' + id);
  document.createElement = tag => new Element(tag);
  document.createElementNS = (_, tag) => new Element(tag);
  window.matchMedia = query => {
    if (!media.has(query)) media.set(query, Object.assign(new Target(), { matches: false }));
    return media.get(query);
  };
  window.setTimeout = callback => { timers.set(++sequence, callback); return sequence; };
  window.clearTimeout = id => timers.delete(id);
  window.setInterval = () => ++sequence;
  window.clearInterval = () => {};
  window.requestAnimationFrame = window.setTimeout;
  window.cancelAnimationFrame = window.clearTimeout;
  window.scrollBy = () => {};
  window.innerHeight = 800;
  window.localStorage = { getItem: () => null, setItem() {} };
  const navigator = {};
  const context = {
    window, document, navigator, console, URL, atob,
    Audio: class { constructor() { this.volume = 1; } },
    HTMLMediaElement: { HAVE_FUTURE_DATA: 3 },
    CustomEvent: class { constructor(type, options = {}) { this.type = type; Object.assign(this, options); } },
    performance: { now: () => 0 },
    requestAnimationFrame: window.requestAnimationFrame,
    cancelAnimationFrame: window.cancelAnimationFrame,
  };
  return {
    window, document, navigator, context, timers,
    run(file) {
      const absolute = path.join(__dirname, '..', '..', 'src', 'js', file);
      vm.runInNewContext(fs.readFileSync(absolute, 'utf8'), context, { filename: file });
    },
    flushTimers(time = 1000) {
      const pending = [...timers.values()];
      timers.clear();
      pending.forEach(callback => callback(time));
    },
  };
}

module.exports = { Target, Element, browser, deferred };
