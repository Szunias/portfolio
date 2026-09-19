const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Element, browser } = require('./helpers/browser-fixture.cjs');

function imageViewer() {
  const link = new Element('a', { 'data-image-zoom': '' });
  link.href = 'https://example.test/original.webp';
  const thumbnail = new Element('img');
  thumbnail.alt = 'Application screenshot';
  link.append(thumbnail);
  const fixture = browser({ '[data-image-zoom]': [link] });
  fixture.window.HTMLDialogElement = class {};
  fixture.document.body = new Element('body');
  const dialog = new Element('dialog');
  const surface = new Element('div', { class: 'image-viewer__surface' });
  const caption = new Element('p', { class: 'image-viewer__caption' });
  const original = new Element('a', { 'data-original': '' });
  const zoom = new Element('button', { 'data-zoom-toggle': '' });
  const close = new Element('button', { 'data-close': '' });
  dialog.append(surface, caption, original, zoom, close);
  dialog.open = false;
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.dispatchEvent({ type: 'close' }); };
  fixture.document.createElement = tag => tag === 'dialog' ? dialog : new Element(tag);
  fixture.run('image-viewer.js');
  return { ...fixture, link, dialog, surface, close };
}

test('image dialog padding stays open while a complete backdrop click closes it', async () => {
  const f = imageViewer();
  await f.link.emit('click', { button: 0 });
  assert.equal(f.dialog.open, true);
  assert.equal(f.document.documentElement.classList.contains('image-viewer-open'), true);
  await f.dialog.emit('pointerdown', { clientX: 15, clientY: 15 });
  await f.dialog.emit('click', { clientX: 15, clientY: 15 });
  assert.equal(f.dialog.open, true, 'The dialog owns its padding; it is not the backdrop');
  await f.dialog.emit('pointerdown', { clientX: 250, clientY: 250 });
  await f.dialog.emit('click', { clientX: 250, clientY: 250 });
  assert.equal(f.dialog.open, false);
  assert.equal(f.document.documentElement.classList.contains('image-viewer-open'), false);
  assert.equal(f.link.focused, true);
});

test('dragging from image dialog padding onto the backdrop does not close the image', async () => {
  const f = imageViewer();
  await f.link.emit('click', { button: 0 });
  await f.dialog.emit('pointerdown', { clientX: 15, clientY: 15 });
  await f.dialog.emit('click', { clientX: 250, clientY: 250 });
  assert.equal(f.dialog.open, true);
});

test('dragging from the backdrop onto dialog padding does not close the image', async () => {
  const f = imageViewer();
  await f.link.emit('click', { button: 0 });
  await f.dialog.emit('pointerdown', { clientX: 250, clientY: 250 });
  await f.dialog.emit('click', { clientX: 15, clientY: 15 });
  assert.equal(f.dialog.open, true);
});

test('a cancelled backdrop gesture does not arm a later dialog click', async () => {
  const f = imageViewer();
  await f.link.emit('click', { button: 0 });
  await f.dialog.emit('pointerdown', { clientX: 250, clientY: 250 });
  await f.dialog.emit('pointercancel');
  await f.dialog.emit('click', { clientX: 250, clientY: 250 });
  assert.equal(f.dialog.open, true);
});
