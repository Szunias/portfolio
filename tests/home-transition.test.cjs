const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Element, browser } = require('./helpers/browser-fixture.cjs');

function transitionFixture({ height = 568, openingHeight = 662, reduced = false } = {}) {
  const scene = new Element('div', { 'data-home-scene': '' });
  const opening = new Element('div', { class: 'home-scene__opening' });
  const hero = new Element('section', { class: 'hero' });
  const controls = new Element('div', { class: 'hero__base' });
  const launch = new Element('button');
  const header = new Element('header');
  scene.append(opening);
  opening.append(hero);
  hero.append(controls);
  controls.append(launch);
  opening.offsetHeight = openingHeight;
  header.offsetHeight = 70;
  const fixture = browser({ '[data-home-scene]': [scene], '.site-header': [header] });
  fixture.window.innerHeight = height;
  fixture.window.scrollY = 0;
  scene.getBoundingClientRect = () => ({ top: 70 - fixture.window.scrollY });
  const scrolls = [];
  fixture.window.scrollTo = options => {
    scrolls.push(options);
    fixture.window.scrollY = options.top;
  };
  const media = fixture.window.matchMedia('(prefers-reduced-motion: reduce)');
  media.matches = reduced;
  fixture.run('home-transition.js');
  async function focus({ keyboard = true } = {}) {
    launch.focusVisible = keyboard;
    fixture.document.activeElement = launch;
    await controls.emit('focusin', { target: launch });
  }
  return { ...fixture, scene, opening, hero, controls, launch, media, scrolls, focus };
}

test('keyboard entry into a short hero cancels native focus scrolling before it covers the control', async () => {
  const fixture = transitionFixture();
  await fixture.focus();
  // Native focus scroll starts after focusin and can center this low control
  // beyond the sticky boundary, despite it having been visible before pinning.
  fixture.window.scrollY = 343;
  await fixture.window.emit('scroll');
  fixture.flushTimers();
  assert.equal(fixture.scrolls.length, 1);
  assert.equal(fixture.scrolls[0].behavior, 'instant');
  assert.equal(fixture.window.scrollY, 164);
  assert.equal(fixture.controls.inert, false);
  assert.equal(fixture.opening.inert, false);
  assert.equal(fixture.document.activeElement, fixture.launch);
  assert.equal(fixture.hero.style.opacity, '1.0000');
});

test('keyboard reveal cancels focus scroll even before its first smooth-scroll frame', async () => {
  const fixture = transitionFixture();
  await fixture.focus();
  fixture.flushTimers();
  assert.equal(fixture.window.scrollY, 164);
  assert.equal(fixture.scrolls[0].behavior, 'instant');
  assert.equal(fixture.controls.inert, false);
});

test('a pointer focus does not cancel Explore work anchor navigation', async () => {
  const fixture = transitionFixture();
  await fixture.focus({ keyboard: false });
  fixture.window.scrollY = 400;
  await fixture.window.emit('scroll');
  fixture.flushTimers();
  assert.equal(fixture.scrolls.length, 0);
  assert.equal(fixture.controls.inert, true);
});

test('manual scrolling after keyboard entry still covers and disables the hero', async () => {
  const fixture = transitionFixture();
  await fixture.focus();
  fixture.flushTimers();
  fixture.window.scrollY = 700;
  await fixture.window.emit('scroll');
  fixture.flushTimers();
  assert.equal(fixture.scrolls.length, 1);
  assert.equal(fixture.controls.inert, true);
  assert.equal(fixture.opening.inert, true);
});

test('reduced motion keeps native focus scrolling and ordinary document flow', async () => {
  const fixture = transitionFixture({ reduced: true });
  await fixture.focus();
  fixture.window.scrollY = 343;
  await fixture.window.emit('scroll');
  fixture.flushTimers();
  assert.equal(fixture.scrolls.length, 0);
  assert.equal(fixture.window.scrollY, 343);
  assert.equal(fixture.controls.inert, false);
  assert.equal(fixture.scene.classList.contains('has-cinematic-transition'), false);
});

test('a pending hero reveal cannot pull focus back from another section', async () => {
  const fixture = transitionFixture();
  await fixture.focus();
  fixture.document.activeElement = new Element('a');
  fixture.window.scrollY = 343;
  fixture.flushTimers();
  assert.equal(fixture.scrolls.length, 0);
});

test('keyboard reveal also keeps controls visible when the hero fits the viewport', async () => {
  const fixture = transitionFixture({ height: 900, openingHeight: 830 });
  await fixture.focus();
  fixture.window.scrollY = 80;
  fixture.flushTimers();
  assert.equal(fixture.window.scrollY, 0);
  assert.equal(fixture.controls.inert, false);
});
