const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Element, browser } = require('./helpers/browser-fixture.cjs');

function contactFixture({ reduced = false, fine = true } = {}) {
  const hero = new Element('section');
  const properties = new Map();
  hero.style.setProperty = (name, value) => properties.set(name, value);
  hero.style.removeProperty = name => properties.delete(name);
  const fixture = browser({ '[data-spot-root]': [hero] });
  const reducedMotion = fixture.window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = fixture.window.matchMedia('(pointer: fine)');
  reducedMotion.matches = reduced;
  finePointer.matches = fine;
  fixture.run('contact-actions.js');
  return { ...fixture, hero, properties, reducedMotion, finePointer };
}

test('contact spotlight stops immediately when motion is reduced after loading', async () => {
  const fixture = contactFixture();
  await fixture.hero.emit('pointermove', { clientX: 60, clientY: 160 });
  assert.equal(fixture.properties.get('--spot-x'), '25.00%');
  assert.equal(fixture.properties.get('--spot-y'), '75.00%');
  fixture.reducedMotion.matches = true;
  await fixture.reducedMotion.emit('change');
  assert.equal(fixture.properties.size, 0);
  await fixture.hero.emit('pointermove', { clientX: 110, clientY: 110 });
  assert.equal(fixture.properties.size, 0);
});

test('contact spotlight can follow the pointer when an initial motion restriction is lifted', async () => {
  const fixture = contactFixture({ reduced: true });
  await fixture.hero.emit('pointermove', { clientX: 60, clientY: 160 });
  assert.equal(fixture.properties.size, 0);
  fixture.reducedMotion.matches = false;
  await fixture.reducedMotion.emit('change');
  await fixture.hero.emit('pointermove', { clientX: 60, clientY: 160 });
  assert.equal(fixture.properties.size, 2);
  await fixture.hero.emit('pointerleave');
  assert.equal(fixture.properties.size, 0);
});

test('contact spotlight follows live fine-pointer availability', async () => {
  const fixture = contactFixture({ fine: false });
  await fixture.hero.emit('pointermove', { clientX: 60, clientY: 160 });
  assert.equal(fixture.properties.size, 0);
  fixture.finePointer.matches = true;
  await fixture.finePointer.emit('change');
  await fixture.hero.emit('pointermove', { clientX: 60, clientY: 160 });
  assert.equal(fixture.properties.size, 2);
  fixture.finePointer.matches = false;
  await fixture.finePointer.emit('change');
  assert.equal(fixture.properties.size, 0);
});
