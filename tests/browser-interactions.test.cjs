const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { Element, browser, deferred } = require('./helpers/browser-fixture.cjs');
const { pages } = require('../site.config.cjs');

function musicFixture({ first = 'Track 1', saved = null, deferredPlayback = false, pointers = false, pageSlug = 'music' } = {}) {
  const tracks = [1, 2, 3].map(i => new Element('div', {
    'data-title': 'Track ' + i, 'data-year': '202' + (7 - i),
    'data-kind': 'release', 'data-src-e': btoa('track-' + i + '.mp3'),
  }));
  const title = new Element('span');
  const queue = new Element('ol');
  const next = new Element('button');
  const bar = new Element();
  const status = new Element('span');
  const play = new Element('button');
  const repeat = new Element('button');
  const progress = new Element();
  const currentTime = new Element('span');
  const totalTime = new Element('span');
  const attempts = [];
  const sheet = new Element('dialog');
  sheet.open = false;
  sheet.showModal = () => { sheet.open = true; };
  sheet.close = () => { sheet.open = false; };
  const opener = new Element('button');
  const audio = new Element('audio');
  Object.assign(audio, { paused: true, ended: false, duration: 120, currentTime: 0, readyState: 4, buffered: { length: 0 } });
  audio.load = () => {};
  audio.pause = () => { audio.paused = true; };
  audio.play = () => {
    audio.paused = false;
    if (!deferredPlayback) return Promise.resolve();
    const attempt = deferred();
    attempts.push(attempt);
    return attempt.promise;
  };
  const fixture = browser({
    '#trackData .track-card': tracks,
    '[data-featured-track]': [new Element('button', { 'data-featured-track': first })],
    '[data-player="bar"]': [bar],
    '[data-player="status"]': [status],
    '[data-player="play"]': [play],
    '[data-player="repeat"]': [repeat],
    '[data-player="progress"]': [progress],
    '[data-player="current-time"]': [currentTime],
    '[data-player="total-time"]': [totalTime],
    '[data-player="title"]': [title],
    '[data-player="queue"]': [queue],
    '[data-player="next"]': [next],
    '[data-player="sheet"]': [sheet],
    '[data-player="open-sheet"]': [opener],
    '[data-music-audio]': [audio],
  });
  if (pointers) fixture.window.PointerEvent = class {};
  fixture.window.localStorage.getItem = () => saved ? JSON.stringify(saved) : null;
  pages.find(page => page.slug === pageSlug).js.forEach(name => fixture.run(name + '.js'));
  return { ...fixture, title, queue, next, sheet, opener, audio, bar, status, play, repeat, progress, currentTime, totalTime, attempts };
}

for (const page of pages.filter(page => page.layout === 'music')) {
  test(page.slug + ' initializes the player using its configured script order', () => {
    const fixture = musicFixture({ pageSlug: page.slug });
    assert.equal(fixture.title.textContent, 'Track 1');
    assert.equal(fixture.bar.hidden, false);
    assert.equal(fixture.queue.querySelectorAll('.now-playing__queue-row').length, 2);
  });
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

test('track totals round to the nearest second while elapsed playback stays truncated', async () => {
  const fixture = musicFixture();
  fixture.audio.duration = 116.6;
  fixture.audio.currentTime = 116.6;
  await fixture.audio.emit('loadedmetadata');
  assert.equal(fixture.totalTime.textContent, '1:57');
  assert.equal(fixture.currentTime.textContent, '1:56');
  assert.equal(fixture.progress.getAttribute('aria-valuetext'), '1:56 of 1:57');

  fixture.audio.duration = 59.8;
  fixture.audio.currentTime = 59.8;
  await fixture.audio.emit('timeupdate');
  assert.equal(fixture.totalTime.textContent, '1:00');
  assert.equal(fixture.currentTime.textContent, '0:59');
  assert.equal(fixture.progress.getAttribute('aria-valuetext'), '0:59 of 1:00');
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

test('an earlier play rejection cannot overwrite a resumed track', async () => {
  const fixture = musicFixture({ deferredPlayback: true });
  await fixture.play.emit('click');
  await fixture.play.emit('click'); // Pause while the first play is pending.
  await fixture.play.emit('click');
  fixture.attempts[1].resolve();
  await fixture.audio.emit('playing');
  fixture.attempts[0].reject(Object.assign(new Error('earlier play aborted'), { name: 'AbortError' }));
  await Promise.resolve();
  assert.equal(fixture.status.textContent, 'Playing');
  assert.equal(fixture.bar.classList.contains('has-error'), false);
});

test('the current play rejection still presents a retryable error', async () => {
  const fixture = musicFixture({ deferredPlayback: true });
  await fixture.play.emit('click');
  fixture.audio.paused = true;
  fixture.attempts[0].reject(new Error('decoder failed'));
  await Promise.resolve();
  assert.equal(fixture.status.textContent, 'Playback failed. Try again.');
  assert.equal(fixture.play.getAttribute('aria-label'), 'Retry Track 1');
});

test('a playback failure stops a pending element and retries on the next click', async () => {
  const fixture = musicFixture({ deferredPlayback: true });
  await fixture.play.emit('click');
  fixture.attempts[0].reject(new Error('decoder failed'));
  await Promise.resolve();
  assert.equal(fixture.audio.paused, true);
  assert.equal(fixture.play.getAttribute('aria-label'), 'Retry Track 1');
  await fixture.play.emit('click');
  assert.equal(fixture.attempts.length, 2);
  fixture.attempts[1].resolve();
});

test('a media error during playback leaves one-click recovery instead of a Pause control', async () => {
  const fixture = musicFixture();
  await fixture.play.emit('click');
  await fixture.audio.emit('playing');
  fixture.audio.error = { code: 2 };
  await fixture.audio.emit('error');
  assert.equal(fixture.audio.paused, true);
  assert.equal(fixture.play.getAttribute('aria-label'), 'Retry Track 1');
  assert.equal(fixture.bar.classList.contains('is-playing'), false);
  let reloads = 0;
  fixture.audio.load = () => { reloads++; fixture.audio.error = null; };
  await fixture.play.emit('click');
  assert.equal(reloads, 1);
  assert.equal(fixture.audio.paused, false);
});

test('loading a different track ignores the previous source play failure', async () => {
  const fixture = musicFixture({ deferredPlayback: true });
  await fixture.play.emit('click');
  await fixture.next.emit('click');
  fixture.attempts[1].resolve();
  await fixture.audio.emit('playing');
  fixture.attempts[0].reject(new Error('previous file failed'));
  await Promise.resolve();
  assert.equal(fixture.title.textContent, 'Track 2');
  assert.equal(fixture.status.textContent, 'Playing');
});

test('play and pause preserve the existing queue controls', async () => {
  const fixture = musicFixture();
  const row = fixture.queue.querySelector('.now-playing__queue-row');
  fixture.document.activeElement = row;
  for (const event of ['play', 'playing', 'pause', 'canplay']) await fixture.audio.emit(event);
  assert.equal(fixture.queue.querySelector('.now-playing__queue-row'), row);
  assert.ok(fixture.queue.contains(fixture.document.activeElement));
  await row.emit('click');
  assert.equal(fixture.title.textContent, 'Track 2');
});

test('queue controls and the end message still update after navigation or repeat changes', async () => {
  const fixture = musicFixture();
  await fixture.next.emit('click');
  assert.deepEqual(fixture.queue.querySelectorAll('.now-playing__queue-name').map(el => el.textContent), ['Track 3']);
  await fixture.next.emit('click');
  assert.equal(fixture.queue.textContent, 'End of the queue.');
  await fixture.repeat.emit('click');
  assert.equal(fixture.queue.textContent, 'End of the queue. Repeat is on, so it starts over.');
});

test('a primary mouse cannot take over an active touch seek', async () => {
  const fixture = musicFixture({ pointers: true });
  await fixture.progress.emit('pointerdown', { pointerId: 1, pointerType: 'touch', isPrimary: true, clientX: 60 });
  assert.equal(fixture.audio.currentTime, 30);
  await fixture.progress.emit('pointerdown', { pointerId: 2, pointerType: 'mouse', isPrimary: true, button: 0, clientX: 160 });
  assert.equal(fixture.audio.currentTime, 30);
  await fixture.progress.emit('pointermove', { pointerId: 1, clientX: 110 });
  assert.equal(fixture.audio.currentTime, 60);
  await fixture.progress.emit('lostpointercapture', { pointerId: 1 });
  assert.equal(fixture.progress.classList.contains('is-scrubbing'), false);
  await fixture.progress.emit('pointermove', { pointerId: 1, clientX: 210 });
  assert.equal(fixture.audio.currentTime, 60);
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

function clockFixture(selectors = {}) {
  const root = new Element();
  const svg = new Element('svg');
  const fixture = browser({ '[data-time-root]': [root], '.ck__dial': [svg], ...selectors });
  // Record the hold delays; animation frames keep the fixture's own timer queue.
  const holds = [];
  const setTimeout = fixture.window.setTimeout;
  fixture.window.setTimeout = (callback, delay) => { holds.push(delay); return setTimeout(callback, delay); };
  fixture.window.matchMedia('(prefers-reduced-motion: reduce)').matches = true;
  fixture.run('clock-face.js');
  fixture.run('contact-clock.js');
  return { ...fixture, root, svg, holds };
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

test('a lifted pointer holds the wound preview, 2.2 s for touch and 1 s for a mouse', async () => {
  for (const [pointerType, delay] of [['touch', 2200], ['pen', 2200], ['mouse', 1000]]) {
    const { svg, root, holds, timers, flushTimers } = clockFixture();
    const at = (x, y) => ({ pointerId: 1, pointerType, isPrimary: true, button: 0, clientX: x, clientY: y });
    await svg.emit('pointerdown', at(110, 10));
    await svg.emit('pointermove', at(210, 110));
    await svg.emit('pointerup', at(210, 110));
    assert.equal(root.classList.contains('ck--scrubbing'), false);
    assert.equal(root.classList.contains('ck--preview'), true);
    assert.equal(svg.getAttribute('aria-valuenow'), '3');
    assert.deepEqual(holds, [delay]);
    flushTimers();
    assert.equal(svg.getAttribute('aria-valuenow'), '0');
    assert.equal(root.classList.contains('ck--preview'), false);
    assert.equal(timers.size, 0);
  }
});

test('a cancelled gesture or a capture lost without a lift rewinds at once', async () => {
  for (const type of ['pointercancel', 'lostpointercapture']) {
    const { svg, holds } = clockFixture();
    await svg.emit('pointerdown', pointer(1));
    await svg.emit('pointermove', pointer(1, 210, 110));
    await svg.emit(type, pointer(1, 210, 110));
    assert.equal(svg.getAttribute('aria-valuenow'), '0');
    assert.deepEqual(holds, []);
  }
});

test('taking hold of the dial again during the hold keeps the wound offset', async () => {
  const { svg, timers } = clockFixture();
  await svg.emit('pointerdown', pointer(1));
  await svg.emit('pointermove', pointer(1, 210, 110));
  await svg.emit('pointerup', pointer(1, 210, 110));
  assert.equal(timers.size, 1);
  await svg.emit('pointerdown', pointer(1, 210, 110));
  assert.equal(timers.size, 0);
  assert.equal(svg.getAttribute('aria-valuenow'), '3');
});

// contact.html adds the visitor's own clock to the caption and the dial's
// text when the device is not on Graz time, so these checks set the process
// zone (a CI runner is on UTC). Node on Windows keeps the last zone it was
// given, so the previous one is set back instead of deleted.
async function inZone(zone, run) {
  const saved = process.env.TZ;
  const system = Intl.DateTimeFormat().resolvedOptions().timeZone;
  process.env.TZ = zone;
  try {
    return await run();
  } finally {
    process.env.TZ = saved === undefined ? system : saved;
  }
}

test('the dial speaks the previewed hour in words while the caption time keeps its line', () => inZone('Europe/Vienna', async () => {
  const hm = new Element('span');
  const where = new Element('span');
  const you = new Element('span');
  where.textContent = 'Graz, Austria';
  you.hidden = true;
  const { svg, root } = clockFixture({ '[data-cap-hm]': [hm], '[data-cap-where]': [where], '[data-cap-you]': [you] });
  const phase = '(day|dawn|dusk|night)';
  assert.match(svg.getAttribute('aria-valuetext'), /^\d\d:\d\d in Graz, now$/);
  assert.match(hm.textContent, /^\d\d:\d\d$/);
  await svg.emit('keydown', { key: 'ArrowRight' });
  assert.match(svg.getAttribute('aria-valuetext'), new RegExp('^' + hm.textContent + ' in Graz, in 1 hour, ' + phase + '$'));
  assert.match(where.textContent, new RegExp('^in 1 h · ' + phase + '$'));
  assert.equal(root.getAttribute('data-phase'), where.textContent.split(' · ')[1]);
  await svg.emit('keydown', { key: 'ArrowLeft' });
  await svg.emit('keydown', { key: 'ArrowLeft' });
  await svg.emit('keydown', { key: 'ArrowLeft' });
  assert.match(svg.getAttribute('aria-valuetext'), new RegExp(' in Graz, 2 hours ago, ' + phase + '$'));
  assert.match(where.textContent, new RegExp('^2 h ago · ' + phase + '$'));
  await svg.emit('keydown', { key: 'Home' });
  assert.equal(where.textContent, 'Graz, Austria');
  assert.match(svg.getAttribute('aria-valuetext'), / in Graz, now$/);
  assert.equal(you.hidden, true);
}));

test('a visitor on another clock reads the gap at rest and their own time while winding', async () => {
  // London stays an hour behind Graz and Helsinki an hour ahead all year:
  // the three change to and from summer time at the same instant.
  for (const [zone, rest, spoken, shift] of [
    ['Europe/London', '1 h ahead of you', '1 hour ahead of you', -1],
    ['Europe/Helsinki', '1 h behind you', '1 hour behind you', 1],
  ]) {
    await inZone(zone, async () => {
      const hm = new Element('span');
      const you = new Element('span');
      you.hidden = true;
      const { svg } = clockFixture({ '[data-cap-hm]': [hm], '[data-cap-you]': [you] });
      assert.equal(you.hidden, false);
      assert.equal(you.textContent, rest);
      assert.match(svg.getAttribute('aria-valuetext'), new RegExp('^\\d\\d:\\d\\d in Graz, now, ' + spoken + '$'));
      await svg.emit('keydown', { key: 'ArrowRight' });
      const [h, m] = hm.textContent.split(':').map(Number);
      const local = String((h + shift + 24) % 24).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ' your time';
      assert.equal(you.textContent, local);
      assert.match(svg.getAttribute('aria-valuetext'), new RegExp(' in Graz, in 1 hour, (day|dawn|dusk|night), ' + local + '$'));
      await svg.emit('keydown', { key: 'Home' });
      assert.equal(you.textContent, rest);
    });
  }
});

test('the contact-wind review caption swaps its resting line for a one-line preview', async () => {
  const now = new Element('span');
  const preview = new Element('span');
  preview.hidden = true;
  const { svg } = clockFixture({ '[data-cap-now]': [now], '[data-cap-preview]': [preview] });
  await svg.emit('keydown', { key: 'ArrowRight' });
  assert.equal(now.hidden, true);
  assert.equal(preview.hidden, false);
  assert.match(preview.textContent, /^\d\d:\d\d in Graz · in 1 h · (day|dawn|dusk|night)$/);
  await svg.emit('keydown', { key: 'Escape' });
  assert.equal(now.hidden, false);
  assert.equal(preview.hidden, true);
});

test('the phase of the day follows the sun over Graz, not fixed hours', () => {
  const fixture = browser();
  fixture.run('clock-face.js');
  const face = vm.runInContext('PortfolioClockFace', fixture.context);
  const phase = iso => face.phaseName(Date.parse(iso));
  // 17:18 CEST in September: the sun is still about 15 deg up (fixed hours said dusk).
  assert.equal(phase('2026-09-23T15:18:00Z'), 'day');
  assert.ok(Math.abs(face.sunAltitude(Date.parse('2026-09-23T10:51:00Z')) - 42.8) < 0.5);
  // 07:00 CEST at midsummer is two hours after sunrise (fixed hours said dawn).
  assert.equal(phase('2026-06-21T05:00:00Z'), 'day');
  // 16:45 CET at midwinter is half an hour after sunset (fixed hours said day).
  assert.equal(phase('2026-12-21T15:45:00Z'), 'dusk');
  assert.equal(phase('2026-09-23T04:30:00Z'), 'dawn');
  assert.equal(phase('2026-09-23T20:00:00Z'), 'night');
});
