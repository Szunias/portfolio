const test = require('node:test');
const assert = require('node:assert/strict');
const { Element, browser, deferred } = require('./helpers/browser-fixture.cjs');

// Exercise the real player with controllable media tasks and capture failures.
// Layout, the queue and per-route script order have separate integration tests.
function fixture() {
  const track = new Element('div', {
    'data-title': 'Recovery track', 'data-year': '2026', 'data-kind': 'release',
    'data-src-e': btoa('recovery.mp3'),
  });
  const roles = Object.fromEntries(['bar', 'status', 'play', 'progress', 'volume']
    .map(name => [name, new Element(name === 'play' ? 'button' : 'div')]));
  const audio = new Element('audio');
  const attempts = [];
  Object.assign(audio, {
    paused: true, ended: false, error: null, duration: 120, currentTime: 0,
    readyState: 4, buffered: { length: 0 }, loads: 0,
    load() { this.loads++; this.error = null; },
    pause() { this.paused = true; },
    play() {
      this.paused = false;
      const attempt = deferred();
      attempts.push(attempt);
      return attempt.promise;
    },
  });
  const env = browser({
    ...Object.fromEntries(Object.entries(roles).map(([name, element]) => [`[data-player="${name}"]`, [element]])),
    '#trackData .track-card': [track],
    '[data-featured-track]': [new Element('button', { 'data-featured-track': 'Recovery track' })],
    '[data-music-audio]': [audio],
  });
  env.window.PointerEvent = class {};
  env.run('music-library.js');
  env.run('music-player.js');
  env.flushTimers();
  return { ...env, ...roles, audio, attempts };
}

for (const type of ['loadstart', 'waiting', 'stalled', 'playing', 'canplay', 'loadedmetadata']) {
  test(`late ${type} cannot erase a rejected play request`, async () => {
    const f = fixture();
    await f.play.emit('click');
    f.attempts[0].reject(Object.assign(new Error('Playback denied'), { name: 'NotAllowedError' }));
    await Promise.resolve();
    assert.equal(f.status.textContent, 'Press play to allow audio.');
    await f.audio.emit(type);
    assert.equal(f.status.textContent, 'Press play to allow audio.');
    assert.equal(f.status.getAttribute('role'), 'alert');
    assert.equal(f.bar.getAttribute('aria-busy'), 'false');
    assert.equal(f.bar.classList.contains('has-error'), true);
    assert.equal(f.play.getAttribute('aria-label'), 'Retry Recovery track');
    const loads = f.audio.loads;
    await f.play.emit('click');
    assert.equal(f.audio.loads, loads + 1);
    assert.equal(f.attempts.length, 2);
    f.attempts[1].resolve();
    await f.audio.emit('playing');
    assert.equal(f.status.textContent, 'Playing');
    assert.equal(f.bar.classList.contains('has-error'), false);
  });
}

for (const type of ['waiting', 'stalled', 'playing']) {
  test(`late ${type} does not change a deliberately paused player`, async () => {
    const f = fixture();
    await f.play.emit('click');
    f.attempts[0].resolve();
    await f.audio.emit('playing');
    await f.play.emit('click');
    await f.audio.emit('pause');
    await f.audio.emit(type);
    assert.equal(f.status.textContent, 'Paused');
    assert.equal(f.bar.getAttribute('aria-busy'), 'false');
    assert.equal(f.audio.paused, true);
  });
}

test('a media error keeps its diagnostic through queued loading notifications', async () => {
  const f = fixture();
  await f.play.emit('click');
  f.attempts[0].resolve();
  await f.audio.emit('playing');
  f.audio.error = { code: 2 };
  await f.audio.emit('error');
  for (const type of ['loadstart', 'waiting', 'stalled', 'playing']) await f.audio.emit(type);
  assert.equal(f.status.textContent, 'A network error stopped the audio.');
  assert.equal(f.play.getAttribute('aria-label'), 'Retry Recovery track');
  assert.equal(f.bar.getAttribute('aria-busy'), 'false');
});

test('active playback still reports loading, buffering and recovery', async () => {
  const f = fixture();
  await f.audio.emit('loadstart');
  assert.equal(f.status.textContent, 'Loading');
  await f.audio.emit('loadedmetadata');
  assert.equal(f.status.textContent, 'Ready to play');
  await f.play.emit('click');
  f.attempts[0].resolve();
  await f.audio.emit('playing');
  await f.audio.emit('waiting');
  assert.equal(f.status.textContent, 'Buffering');
  assert.equal(f.bar.getAttribute('aria-busy'), 'true');
  await f.audio.emit('stalled');
  assert.equal(f.status.textContent, 'Network stalled. Retrying…');
  await f.audio.emit('playing');
  assert.equal(f.status.textContent, 'Playing');
  assert.equal(f.bar.getAttribute('aria-busy'), 'false');
});

function pointer(pointerId, clientX) {
  return { pointerId, clientX, isPrimary: true, pointerType: 'mouse', button: 0 };
}

for (const name of ['progress', 'volume']) {
  for (const ending of ['pointerup', 'pointercancel', 'blur']) {
    test(`${name} recovers from ${ending} outside a rail when capture fails`, async () => {
      const f = fixture();
      const rail = f[name];
      rail.setPointerCapture = () => { throw new Error('Capture unavailable'); };
      await rail.emit('pointerdown', pointer(1, 60));
      assert.equal(rail.classList.contains('is-scrubbing'), true);
      const before = name === 'progress' ? f.audio.currentTime : f.audio.volume;
      await f.window.emit(ending, pointer(1, 210));
      assert.equal(rail.classList.contains('is-scrubbing'), false);
      if (ending !== 'pointerup') {
        assert.equal(name === 'progress' ? f.audio.currentTime : f.audio.volume, before);
      }
      await rail.emit('pointerdown', pointer(2, 110));
      assert.equal(rail.classList.contains('is-scrubbing'), true);
      assert.equal(name === 'progress' ? f.audio.currentTime : f.audio.volume, name === 'progress' ? 60 : 0.5);
      await rail.emit('pointerup', pointer(2, 110));
      assert.equal(rail.classList.contains('is-scrubbing'), false);
    });
  }
}

test('unrelated window pointers cannot end a drag and bubbled releases do not seek twice', async () => {
  const f = fixture();
  let writes = 0;
  let position = 0;
  Object.defineProperty(f.audio, 'currentTime', {
    get: () => position,
    set: value => { writes++; position = value; },
  });
  await f.progress.emit('pointerdown', pointer(1, 60));
  await f.window.emit('pointerup', pointer(2, 210));
  assert.equal(f.progress.classList.contains('is-scrubbing'), true);
  await f.progress.emit('pointerup', pointer(1, 110));
  assert.equal(position, 60);
  const finishedWrites = writes;
  await f.window.emit('pointerup', pointer(1, 210));
  assert.equal(writes, finishedWrites);
  assert.equal(f.progress.classList.contains('is-scrubbing'), false);
});
