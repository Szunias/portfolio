const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createBrowser, deferred, Element } = require('./helpers/browser.cjs');

function cinematic(options) {
  const browser = createBrowser(options);
  const stage = new Element();
  const steps = [0, 1].map(index => new Element({ 'data-step-index': String(index) }));
  const reveal = new Element();
  const bar = new Element();
  stage.queries.set('[data-step-index]', steps);
  browser.document.queries.set('[data-stage]', [stage]);
  browser.document.queries.set('[data-reveal]', [reveal]);
  browser.document.queries.set('[data-progress]', [bar]);
  return { ...browser, stage, steps, reveal, bar };
}

test('cinematic stage activation uses viewport height, not width-based percentages', () => {
  const page = cinematic({ width: 1920, height: 800 });
  page.load('cine');
  const observer = page.observers.find(item => item.targets.has(page.steps[0]));
  assert.equal(observer.options.rootMargin, '-360px 0px -360px 0px');
  observer.fire([{ target: page.steps[1], isIntersecting: true }]);
  assert.equal(page.stage.getAttribute('data-step'), '1');
  assert.equal(page.steps[0].classList.contains('is-dim'), true);
  assert.equal(page.steps[1].classList.contains('is-dim'), false);
});

test('cinematic observers and progress respond to viewport height changes', () => {
  const page = cinematic();
  page.window.scrollY = 1600;
  page.load('cine');
  page.flushFrames();
  assert.equal(page.bar.style.getPropertyValue('--progress'), '0.5000');
  const previous = page.observers.find(item => item.targets.has(page.steps[0]));
  page.window.innerHeight = 1600;
  page.window.dispatch('resize');
  page.flushFrames();
  assert.equal(previous.disconnected, true);
  const current = page.observers.findLast(item => item.targets.has(page.steps[0]));
  assert.equal(current.options.rootMargin, '-720px 0px -720px 0px');
  assert.equal(page.bar.style.getPropertyValue('--progress'), '0.6667');
});

test('changing reduced motion immediately reveals content and restores the static stage', () => {
  const page = cinematic();
  page.load('cine');
  page.motion.matches = true;
  page.motion.dispatch('change');
  assert.equal(page.reveal.classList.contains('is-in'), true);
  assert.equal(page.stage.getAttribute('data-step'), 'all');
  assert.ok(page.steps.every(step => !step.classList.contains('is-dim')));
  assert.ok(page.observers.every(observer => observer.disconnected));
  page.motion.matches = false;
  page.motion.dispatch('change');
  assert.ok(page.observers.some(observer => !observer.disconnected));
});

test('cinematic content stays readable without IntersectionObserver', () => {
  const page = cinematic();
  page.withoutObserver();
  page.load('cine');
  assert.equal(page.reveal.classList.contains('is-in'), true);
  assert.equal(page.stage.getAttribute('data-step'), 'all');
  assert.ok(page.steps.every(step => !step.classList.contains('is-dim')));
});

function previewPage(options) {
  const page = createBrowser(options);
  const card = new Element();
  const video = new Element();
  const attempts = [];
  let pauses = 0;
  video.dataset.src = '/preview.mp4';
  Object.defineProperty(video, 'src', {
    get: () => video.getAttribute('src'),
    set: value => video.setAttribute('src', value),
  });
  video.play = () => {
    const attempt = deferred();
    attempts.push(attempt);
    return attempt.promise;
  };
  video.pause = () => { pauses += 1; };
  card.queries.set('[data-card-preview]', [video]);
  page.document.queries.set('.wcard', [card]);
  return { ...page, card, video, attempts, pauses: () => pauses };
}

test('card previews are lazy and leave touch pointers alone', () => {
  const page = previewPage();
  page.load('project-previews');
  assert.equal(page.video.src, null);
  page.card.dispatch('pointerenter', { pointerType: 'touch' });
  assert.equal(page.timers.size, 0);
  page.card.dispatch('pointerenter', { pointerType: 'mouse' });
  assert.equal(page.attempts.length, 0);
  assert.equal(Array.from(page.timers.values())[0].delay, 180);
  page.flushTimers();
  assert.equal(page.video.src, '/preview.mp4');
  assert.equal(page.attempts.length, 1);
});

test('a stale playback rejection cannot cancel a newer preview on the same card', async () => {
  const page = previewPage();
  page.load('project-previews');
  page.card.dispatch('pointerenter', { pointerType: 'mouse' });
  page.flushTimers();
  page.card.dispatch('pointerleave');
  page.card.dispatch('pointerenter', { pointerType: 'mouse' });
  page.flushTimers();
  page.attempts[0].reject(new Error('old playback request'));
  await Promise.resolve();
  page.video.dispatch('playing');
  assert.equal(page.card.classList.contains('is-previewing'), true);
  assert.equal(page.pauses(), 1);
});

test('a current playback failure still restores the poster', async () => {
  const page = previewPage();
  page.load('project-previews');
  page.card.dispatch('pointerenter', { pointerType: 'mouse' });
  page.flushTimers();
  page.video.dispatch('playing');
  page.attempts[0].reject(new Error('current playback request'));
  await Promise.resolve();
  assert.equal(page.card.classList.contains('is-previewing'), false);
  assert.equal(page.pauses(), 1);
});

test('turning on data saving stops an active card preview', () => {
  const page = previewPage();
  page.load('project-previews');
  page.card.dispatch('pointerenter', { pointerType: 'mouse' });
  page.flushTimers();
  page.video.dispatch('playing');
  page.connection.saveData = true;
  page.connection.dispatch('change');
  assert.equal(page.card.classList.contains('is-previewing'), false);
  assert.equal(page.pauses(), 1);
});

test('missing preview sources never request an undefined URL', () => {
  const page = previewPage();
  delete page.video.dataset.src;
  page.load('project-previews');
  page.card.dispatch('pointerenter', { pointerType: 'mouse' });
  page.flushTimers();
  assert.equal(page.video.src, null);
  assert.equal(page.attempts.length, 0);
});

function mailPage(href = 'mailto:igor%40example.com?subject=Hello') {
  const page = createBrowser();
  const link = new Element({ href });
  const button = new Element();
  const status = new Element();
  const writes = [];
  page.document.queries.set('[data-mail-link]', [link]);
  page.document.queries.set('[data-copy-mail]', [button]);
  page.document.queries.set('[data-copy-status]', [status]);
  page.navigator.clipboard = { writeText(address) {
    const write = deferred();
    writes.push({ address, ...write });
    return write.promise;
  } };
  return { ...page, link, button, status, writes };
}

test('copy email decodes the address and excludes the subject', async () => {
  const page = mailPage();
  page.load('copy-email');
  const completion = Promise.all(page.button.dispatch('click'));
  assert.equal(page.writes[0].address, 'igor@example.com');
  page.writes[0].resolve();
  await completion;
  assert.equal(page.status.textContent, 'Email address copied.');
  page.flushTimers();
  assert.equal(page.status.textContent, '');
});

test('malformed mail links produce a fallback instead of an unhandled rejection', async () => {
  const page = mailPage('mailto:%E0%A4');
  page.load('copy-email');
  await assert.doesNotReject(Promise.all(page.button.dispatch('click')));
  assert.equal(page.writes.length, 0);
  assert.equal(page.status.textContent, 'Select the address to copy it.');
});

test('only the latest clipboard operation may update feedback or schedule its removal', async () => {
  const page = mailPage();
  page.load('copy-email');
  const first = Promise.all(page.button.dispatch('click'));
  const second = Promise.all(page.button.dispatch('click'));
  page.writes[1].resolve();
  await second;
  page.writes[0].reject(new Error('older permission failure'));
  await first;
  assert.equal(page.status.textContent, 'Email address copied.');
  assert.equal(page.timers.size, 1);
});

test('copy controls stay hidden when clipboard support is absent', () => {
  const page = mailPage();
  delete page.navigator.clipboard;
  page.load('copy-email');
  assert.equal(page.button.hidden, true);
});

function anchor(href, attributes) {
  const node = new Element(attributes);
  const url = new URL(href, 'https://igorszuniewicz.com/');
  Object.assign(node, {
    href: url.href, origin: url.origin, pathname: url.pathname,
    search: url.search, target: '',
  });
  return node;
}

test('prefetch preserves query parameters but deduplicates fragment variants', () => {
  const page = createBrowser();
  page.load('prefetch');
  for (const href of ['/music.html?view=all#first', '/music.html?view=all#second']) {
    page.document.dispatch('mouseover', { target: anchor(href) });
  }
  assert.equal(page.appended.length, 1);
  assert.equal(page.appended[0].href, '/music.html?view=all');
});

test('prefetch respects connection changes after page load', () => {
  const page = createBrowser();
  page.load('prefetch');
  page.connection.saveData = true;
  page.document.dispatch('mouseover', { target: anchor('/music.html') });
  assert.equal(page.appended.length, 0);
  page.connection.saveData = false;
  page.connection.effectiveType = '2g';
  page.document.dispatch('touchstart', { target: anchor('/music.html') });
  assert.equal(page.appended.length, 0);
  page.connection.effectiveType = '4g';
  page.document.dispatch('mouseover', { target: anchor('/music.html') });
  assert.equal(page.appended.length, 1);
});

test('prefetch skips external links, downloads, media, new tabs and same-document anchors', () => {
  const page = createBrowser();
  page.load('prefetch');
  const newTab = anchor('/music.html');
  newTab.target = '_blank';
  const links = [
    anchor('https://example.com/page.html'), anchor('/music.html', { download: '' }),
    anchor('/showreel.mp4'), anchor('/cv.pdf'), anchor('/#work'), newTab,
  ];
  links.forEach(target => page.document.dispatch('mouseover', { target }));
  assert.equal(page.appended.length, 0);
});

test('keyboard focus can warm an eligible document', () => {
  const page = createBrowser();
  page.load('prefetch');
  page.document.dispatch('focusin', { target: anchor('/music.html') });
  assert.equal(page.appended.length, 1);
});
