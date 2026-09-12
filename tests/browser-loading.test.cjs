const test = require('node:test');
const assert = require('node:assert/strict');
const { Target, Element, browser, deferred } = require('./helpers/browser-fixture.cjs');

function connection(saveData = false, effectiveType = '4g') {
  return Object.assign(new Target(), { saveData, effectiveType });
}

function media(attributes) {
  const video = new Element('video', attributes);
  Object.assign(video, { paused: true, plays: 0, pauses: 0 });
  video.play = () => { video.plays++; video.paused = false; return Promise.resolve(); };
  video.pause = () => { video.pauses++; video.paused = true; };
  Object.defineProperty(video, 'src', {
    get: () => video.getAttribute('src'),
    set: value => video.setAttribute('src', value),
  });
  return video;
}

function heroFixture(network = connection()) {
  const scope = new Element('section', { class: 'hero' });
  const video = media({ class: 'hero__film' });
  const preview = media({ 'data-preview-video': '' });
  const launch = new Element('button', { 'data-showreel-play': '' });
  const close = new Element('button', { 'data-showreel-close': '' });
  close.hidden = true;
  scope.append(video, preview, launch, close);
  const env = browser({ '.hero': [scope] });
  if (network) env.navigator.connection = network;
  return { ...env, scope, video, preview, launch, close, network };
}

function cardFixture(network = connection()) {
  const card = new Element('a', { class: 'wcard' });
  const video = media({ 'data-card-preview': '', 'data-src': 'assets/preview.mp4' });
  card.append(video);
  const env = browser({ '.wcard': [card] });
  if (network) env.navigator.connection = network;
  env.window.matchMedia('(hover: hover) and (pointer: fine)').matches = true;
  env.run('project-previews.js');
  return { ...env, card, video, network };
}

function prefetchFixture(network = connection(), supported = true) {
  const env = browser();
  env.context.Element = Element;
  env.window.location = new URL('https://example.test/index.html?view=one');
  env.document.head = new Element('head');
  if (network) env.navigator.connection = network;
  env.document.createElement = tag => {
    const element = new Element(tag);
    if (tag === 'link') element.relList = { supports: value => supported && value === 'prefetch' };
    return element;
  };
  function anchor(href, attributes = {}) {
    const link = new Element('a', { href, ...attributes });
    const url = new URL(href, env.window.location);
    Object.assign(link, { origin: url.origin, pathname: url.pathname, search: url.search,
      target: attributes.target || '' });
    const matches = link.matches.bind(link);
    link.matches = selector => selector === 'a[href]' || matches(selector);
    return link;
  }
  env.run('prefetch.js');
  return { ...env, network, anchor, urls: () => env.document.head.children.map(link => link.href) };
}

test('hero preview responds immediately when data saving changes', async () => {
  const f = heroFixture();
  f.run('home-showreel.js');
  assert.equal(f.preview.plays, 1);
  f.network.saveData = true;
  await f.network.emit('change');
  assert.equal(f.preview.paused, true);
  assert.equal(f.scope.classList.contains('is-settled'), true);
  f.network.saveData = false;
  await f.network.emit('change');
  assert.equal(f.preview.plays, 2);
  assert.equal(f.scope.classList.contains('is-settled'), false);
});

test('hero preview can start after data saving was enabled on page load', async () => {
  const f = heroFixture(connection(true));
  f.run('home-showreel.js');
  assert.equal(f.preview.plays, 0);
  f.network.saveData = false;
  await f.network.emit('change');
  assert.equal(f.preview.plays, 1);
});

test('late preview failure cannot disable a newer playback request', async () => {
  const f = heroFixture();
  const pending = deferred();
  f.preview.play = () => ++f.preview.plays === 1 ? pending.promise : Promise.resolve();
  f.run('home-showreel.js');
  f.document.hidden = true;
  await f.document.emit('visibilitychange');
  f.document.hidden = false;
  await f.document.emit('visibilitychange');
  const pauses = f.preview.pauses;
  pending.reject(new Error('Old playback failed'));
  await Promise.resolve();
  assert.equal(f.preview.pauses, pauses);
  assert.equal(f.scope.classList.contains('is-settled'), false);
});

test('preview failure after stopping does not turn a temporary opt-out into a permanent one', async () => {
  const f = heroFixture();
  const pending = deferred();
  f.preview.play = () => ++f.preview.plays === 1 ? pending.promise : Promise.resolve();
  f.run('home-showreel.js');
  f.document.hidden = true;
  await f.document.emit('visibilitychange');
  pending.reject(new Error('Old playback failed'));
  await Promise.resolve();
  f.document.hidden = false;
  await f.document.emit('visibilitychange');
  assert.equal(f.preview.plays, 2);
  assert.equal(f.scope.classList.contains('is-settled'), false);
});

test('a current preview failure preserves the static cover and explicit full-player controls', async () => {
  const f = heroFixture();
  f.preview.play = () => Promise.reject(new Error('Playback unavailable'));
  f.run('home-showreel.js');
  await Promise.resolve();
  assert.equal(f.scope.classList.contains('is-settled'), true);
  await f.launch.emit('click');
  assert.equal(f.video.plays, 1);
  assert.equal(f.video.controls, true);
  assert.equal(f.close.hidden, false);
  await f.close.emit('click');
  assert.equal(f.video.paused, true);
  assert.equal(f.launch.focused, true);
});

test('an aborted preview request remains eligible for a later attempt', async () => {
  const f = heroFixture();
  f.preview.play = () => ++f.preview.plays === 1
    ? Promise.reject(Object.assign(new Error('Paused'), { name: 'AbortError' })) : Promise.resolve();
  f.run('home-showreel.js');
  await Promise.resolve();
  assert.equal(f.scope.classList.contains('is-settled'), false);
  await f.document.emit('visibilitychange');
  assert.equal(f.preview.plays, 2);
});

test('network updates do not override reduced motion or an explicitly open showreel', async () => {
  const f = heroFixture(connection(true));
  const reduced = f.window.matchMedia('(prefers-reduced-motion: reduce)');
  reduced.matches = true;
  f.run('home-showreel.js');
  f.network.saveData = false;
  await f.network.emit('change');
  assert.equal(f.preview.plays, 0);
  await f.launch.emit('click');
  reduced.matches = false;
  await reduced.emit('change');
  await f.network.emit('change');
  assert.equal(f.preview.plays, 0);
  assert.equal(f.video.paused, false);
  await f.close.emit('click');
  assert.equal(f.preview.plays, 1);
});

test('hero and card previews work without the optional connection API', async () => {
  const hero = heroFixture(null);
  hero.run('home-showreel.js');
  assert.equal(hero.preview.plays, 1);
  const card = cardFixture(null);
  await card.card.emit('pointerenter', { pointerType: 'mouse' });
  card.flushTimers();
  assert.equal(card.video.plays, 1);
});

test('data saving stops an active card preview and removes its playing state', async () => {
  const f = cardFixture();
  await f.card.emit('pointerenter', { pointerType: 'mouse' });
  f.flushTimers();
  await f.video.emit('playing');
  assert.equal(f.card.classList.contains('is-previewing'), true);
  f.network.saveData = true;
  await f.network.emit('change');
  assert.equal(f.video.paused, true);
  assert.equal(f.card.classList.contains('is-previewing'), false);
});

test('data saving cancels a pending hover before assigning a video source', async () => {
  const f = cardFixture();
  await f.card.emit('pointerenter', { pointerType: 'mouse' });
  assert.equal(f.timers.size, 1);
  f.network.saveData = true;
  await f.network.emit('change');
  assert.equal(f.timers.size, 0);
  f.flushTimers();
  assert.equal(f.video.getAttribute('src'), null);
  assert.equal(f.video.plays, 0);
});

test('card previews still require deliberate interaction after data saving ends', async () => {
  const f = cardFixture(connection(true));
  await f.card.emit('pointerenter', { pointerType: 'mouse' });
  f.flushTimers();
  assert.equal(f.video.plays, 0);
  f.network.saveData = false;
  await f.network.emit('change');
  f.flushTimers();
  assert.equal(f.video.plays, 0);
  f.card.focusVisible = true;
  await f.card.emit('focus');
  f.flushTimers();
  assert.equal(f.video.plays, 1);
});

test('a stale card rejection cannot stop a newer attempt after the network changes', async () => {
  const f = cardFixture();
  const pending = deferred();
  f.video.play = () => ++f.video.plays === 1 ? pending.promise : Promise.resolve();
  await f.card.emit('pointerenter', { pointerType: 'mouse' });
  f.flushTimers();
  f.network.saveData = true;
  await f.network.emit('change');
  f.network.saveData = false;
  await f.network.emit('change');
  await f.card.emit('pointerenter', { pointerType: 'mouse' });
  f.flushTimers();
  await f.video.emit('playing');
  const pauses = f.video.pauses;
  pending.reject(new Error('Old playback failed'));
  await Promise.resolve();
  assert.equal(f.video.pauses, pauses);
  assert.equal(f.card.classList.contains('is-previewing'), true);
});

test('prefetch keeps query variants distinct while deduplicating fragment-only changes', async () => {
  const f = prefetchFixture();
  for (const href of ['/music.html?sort=new#top', '/music.html?sort=new#bottom', '/music.html?sort=old']) {
    await f.document.emit('mouseover', { target: f.anchor(href) });
  }
  assert.deepEqual(f.urls(), ['/music.html?sort=new', '/music.html?sort=old']);
});

test('prefetch skips the current document but not a different query on the same path', async () => {
  const f = prefetchFixture();
  await f.document.emit('mouseover', { target: f.anchor('/index.html?view=one#work') });
  assert.deepEqual(f.urls(), []);
  await f.document.emit('mouseover', { target: f.anchor('/index.html?view=two') });
  assert.deepEqual(f.urls(), ['/index.html?view=two']);
});

test('prefetch rechecks current data-saving and slow-network preferences on every interaction', async () => {
  const f = prefetchFixture();
  const link = f.anchor('/music.html');
  f.network.saveData = true;
  await f.document.emit('mouseover', { target: link });
  assert.deepEqual(f.urls(), []);
  f.network.saveData = false;
  for (const type of ['slow-2g', '2g', '3g']) {
    f.network.effectiveType = type;
    await f.document.emit('touchstart', { target: link });
    assert.deepEqual(f.urls(), []);
  }
  f.network.effectiveType = '4g';
  await f.document.emit('mouseover', { target: link });
  assert.deepEqual(f.urls(), ['/music.html']);
});

test('prefetch can recover from an initially restricted connection without reloading', async () => {
  for (const network of [connection(true), connection(false, '2g')]) {
    const f = prefetchFixture(network);
    const target = f.anchor('/contact.html');
    await f.document.emit('mouseover', { target });
    assert.deepEqual(f.urls(), []);
    Object.assign(network, { saveData: false, effectiveType: '4g' });
    await f.document.emit('mouseover', { target });
    assert.deepEqual(f.urls(), ['/contact.html']);
  }
});

test('keyboard focus prefetches nested links once across focus, hover and touch', async () => {
  const f = prefetchFixture();
  const link = f.anchor('/music.html');
  const target = new Element('span');
  link.append(target);
  await f.document.emit('focusin', { target });
  assert.deepEqual(f.urls(), ['/music.html']);
  await f.document.emit('mouseover', { target });
  await f.document.emit('touchstart', { target });
  assert.deepEqual(f.urls(), ['/music.html']);
});

test('prefetch excludes external URLs, downloads, non-documents and new tabs', async () => {
  const f = prefetchFixture(null);
  const links = [
    f.anchor('https://other.test/music.html'), f.anchor('mailto:hello@example.test'),
    f.anchor('/cv.pdf'), f.anchor('/audio.mp3'), f.anchor('/download.html', { download: '' }),
    f.anchor('/other.html', { target: '_blank' }), f.anchor('/another.html', { target: '_BLANK' }),
  ];
  for (const target of [...links, null, new Element('span')]) {
    await f.document.emit('mouseover', { target });
  }
  assert.deepEqual(f.urls(), []);
  await f.document.emit('touchstart', { target: f.anchor('/projects/') });
  assert.deepEqual(f.urls(), ['/projects/']);
  assert.equal(f.document.head.children[0].rel, 'prefetch');
  assert.equal(f.document.head.children[0].as, 'document');
});

test('unsupported prefetch does not install speculative-loading listeners', async () => {
  const f = prefetchFixture(null, false);
  assert.equal(f.document.listeners.size, 0);
  await f.document.emit('mouseover', { target: f.anchor('/music.html') });
  assert.deepEqual(f.urls(), []);
});
