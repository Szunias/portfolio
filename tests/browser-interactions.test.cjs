const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Element, browser, deferred } = require('./helpers/browser-fixture.cjs');

function musicFixture({ first = 'Track 1', saved = null } = {}) {
  const tracks = [1, 2, 3].map(i => new Element('div', {
    'data-title': 'Track ' + i, 'data-year': '202' + (7 - i),
    'data-kind': 'release', 'data-src-e': btoa('track-' + i + '.mp3'),
  }));
  const title = new Element('span');
  const queue = new Element('ol');
  const next = new Element('button');
  const sheet = new Element('dialog');
  sheet.open = false;
  sheet.showModal = () => { sheet.open = true; };
  sheet.close = () => { sheet.open = false; };
  const opener = new Element('button');
  const audio = new Element('audio');
  Object.assign(audio, { paused: true, ended: false, duration: 120, currentTime: 0, readyState: 4, buffered: { length: 0 } });
  audio.load = () => {};
  audio.pause = () => { audio.paused = true; };
  audio.play = () => { audio.paused = false; return Promise.resolve(); };
  const fixture = browser({
    '#trackData .track-card': tracks,
    '[data-featured-track]': [new Element('button', { 'data-featured-track': first })],
    '[data-player="bar"]': [new Element()],
    '[data-player="title"]': [title],
    '[data-player="queue"]': [queue],
    '[data-player="next"]': [next],
    '[data-player="sheet"]': [sheet],
    '[data-player="open-sheet"]': [opener],
    '[data-music-audio]': [audio],
  });
  fixture.window.localStorage.getItem = () => saved ? JSON.stringify(saved) : null;
  fixture.run('music-player.js');
  return { ...fixture, title, queue, next, sheet, opener };
}

test('the initial featured selection is excluded from the upcoming queue', async () => {
  const fixture = musicFixture();
  assert.equal(fixture.title.textContent, 'Track 1');
  assert.deepEqual(fixture.queue.querySelectorAll('.now-playing__queue-name').map(el => el.textContent), ['Track 2', 'Track 3']);
  await fixture.next.emit('click');
  assert.equal(fixture.title.textContent, 'Track 2');
});

test('Next follows a featured selection that is not first in chronological order', async () => {
  const fixture = musicFixture({ first: 'Track 2' });
  await fixture.next.emit('click');
  assert.equal(fixture.title.textContent, 'Track 3');
});

test('restored shuffle does not put the current selection in its upcoming queue', () => {
  const fixture = musicFixture({ saved: { shuffle: true } });
  assert.equal(fixture.queue.querySelectorAll('.now-playing__queue-name').length, 2);
  assert.ok(!fixture.queue.textContent.includes('Track 1'));
});

test('dialog padding is not a backdrop; a genuine outside click closes the sheet', async () => {
  const fixture = musicFixture();
  await fixture.opener.emit('click');
  await fixture.sheet.emit('click', { clientX: 30, clientY: 30 });
  assert.equal(fixture.sheet.open, true);
  await fixture.sheet.emit('click', { clientX: 250, clientY: 250 });
  assert.equal(fixture.sheet.open, false);
});

function previewFixture() {
  const card = new Element('a', { class: 'wcard' });
  const video = new Element('video', { 'data-card-preview': '', 'data-src': 'preview.mp4' });
  const attempts = [];
  let pauses = 0;
  video.pause = () => { pauses++; };
  video.play = () => { const attempt = deferred(); attempts.push(attempt); return attempt.promise; };
  card.append(video);
  const fixture = browser({ '.wcard': [card] });
  fixture.window.matchMedia('(hover: hover) and (pointer: fine)').matches = true;
  fixture.run('project-previews.js');
  return { ...fixture, card, video, attempts, pauses: () => pauses };
}

test('a stale play rejection cannot cancel a new hover on the same preview', async () => {
  const fixture = previewFixture();
  await fixture.card.emit('pointerenter', { pointerType: 'mouse' });
  fixture.flushTimers();
  await fixture.card.emit('pointerleave');
  await fixture.card.emit('pointerenter', { pointerType: 'mouse' });
  fixture.attempts[0].reject(Object.assign(new Error('old request aborted'), { name: 'AbortError' }));
  await Promise.resolve();
  fixture.flushTimers();
  assert.equal(fixture.attempts.length, 2);
  fixture.attempts[1].resolve();
});

test('a current preview failure still stops playback and clears its visible state', async () => {
  const fixture = previewFixture();
  await fixture.card.emit('pointerenter', { pointerType: 'mouse' });
  fixture.flushTimers();
  await fixture.video.emit('playing');
  assert.equal(fixture.card.classList.contains('is-previewing'), true);
  fixture.attempts[0].reject(new Error('cannot decode'));
  await Promise.resolve();
  assert.equal(fixture.card.classList.contains('is-previewing'), false);
  assert.equal(fixture.pauses(), 1);
});

function copyFixture(href = 'mailto:hello%2Bwork@example.test?subject=Hello') {
  const link = new Element('a', href === null ? {} : { href });
  const button = new Element('button');
  const status = new Element('span');
  const fixture = browser({ '[data-mail-link]': [link], '[data-copy-mail]': [button], '[data-copy-status]': [status] });
  const writes = [];
  fixture.navigator.clipboard = { writeText(address) { const task = deferred(); writes.push({ address, ...task }); return task.promise; } };
  return { ...fixture, link, button, status, writes };
}

test('copying decodes the address without copying mail subject or body', async () => {
  const fixture = copyFixture();
  fixture.run('copy-email.js');
  const click = fixture.button.emit('click');
  assert.equal(fixture.writes[0].address, 'hello+work@example.test');
  fixture.writes[0].resolve();
  await click;
  assert.equal(fixture.status.textContent, 'Email address copied.');
});

test('malformed, missing and non-mail links fail gracefully without clipboard writes', async () => {
  for (const href of ['mailto:%E0%A4%A', null, 'https://example.test/', 'mailto:?subject=Hello']) {
    const fixture = copyFixture(href);
    fixture.run('copy-email.js');
    await fixture.button.emit('click');
    assert.equal(fixture.writes.length, 0);
    assert.equal(fixture.status.textContent, 'Select the address to copy it.');
  }
});

test('an old clipboard completion cannot replace the latest copy result', async () => {
  const fixture = copyFixture();
  fixture.run('copy-email.js');
  const oldClick = fixture.button.emit('click');
  const newClick = fixture.button.emit('click');
  fixture.writes[1].resolve();
  await newClick;
  fixture.writes[0].reject(new Error('old request denied'));
  await oldClick;
  assert.equal(fixture.status.textContent, 'Email address copied.');
  assert.equal(fixture.timers.size, 1);
});

test('copy buttons stay hidden when clipboard access is unavailable', () => {
  const fixture = copyFixture();
  delete fixture.navigator.clipboard;
  fixture.run('copy-email.js');
  assert.equal(fixture.button.hidden, true);
});

function showreelFixture() {
  const scope = new Element('section', { class: 'hero' });
  const video = new Element('video', { class: 'hero__film' });
  const preview = new Element('video', { 'data-preview-video': '' });
  const launch = new Element('button', { 'data-showreel-play': '' });
  const close = new Element('button', { 'data-showreel-close': '' });
  video.paused = true;
  video.play = () => { video.paused = false; return Promise.resolve(); };
  video.pause = () => { video.paused = true; };
  preview.play = () => Promise.resolve();
  preview.pause = () => {};
  scope.append(video, preview, launch, close);
  const fixture = browser({ '.hero': [scope] });
  const states = [];
  scope.addEventListener('hero:playback', event => states.push(event.detail.playing));
  fixture.run('home-showreel.js');
  return { ...fixture, scope, video, launch, close, states };
}

test('a queued play event cannot reopen a showreel after it has been closed', async () => {
  const fixture = showreelFixture();
  await fixture.launch.emit('click');
  await fixture.close.emit('click');
  await fixture.video.emit('play');
  assert.equal(fixture.scope.classList.contains('is-playing'), false);
  assert.equal(fixture.video.controls, false);
  assert.deepEqual(fixture.states, [true, false]);
});

test('opening the showreel emits one state change, not another on native play', async () => {
  const fixture = showreelFixture();
  await fixture.launch.emit('click');
  await fixture.video.emit('play');
  assert.deepEqual(fixture.states, [true]);
});

function clockFixture() {
  const root = new Element();
  const svg = new Element('svg');
  const fixture = browser({ '[data-time-root]': [root], '.ck__dial': [svg] });
  fixture.window.matchMedia('(prefers-reduced-motion: reduce)').matches = true;
  fixture.run('contact-clock.js');
  return { ...fixture, root, svg };
}
const pointer = (id, x = 110, y = 10) => ({ pointerId: id, pointerType: 'touch', isPrimary: id === 1, button: 0, clientX: x, clientY: y });

test('a second finger cannot move or release the clock being wound', async () => {
  const { svg, root } = clockFixture();
  await svg.emit('pointerdown', pointer(1));
  await svg.emit('pointermove', pointer(2, 210, 110));
  assert.equal(svg.getAttribute('aria-valuenow'), '0');
  await svg.emit('pointerup', pointer(2));
  assert.equal(root.classList.contains('ck--scrubbing'), true);
  await svg.emit('pointermove', pointer(1, 210, 110));
  assert.equal(svg.getAttribute('aria-valuenow'), '3');
  await svg.emit('pointerup', pointer(1));
  assert.equal(root.classList.contains('ck--scrubbing'), false);
});

test('losing pointer capture releases the clock instead of leaving it stuck', async () => {
  const { svg, root } = clockFixture();
  await svg.emit('pointerdown', pointer(1));
  await svg.emit('lostpointercapture', pointer(1));
  assert.equal(root.classList.contains('ck--scrubbing'), false);
  assert.equal(svg.getAttribute('aria-valuenow'), '0');
});
