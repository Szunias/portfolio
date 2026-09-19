'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const {
  editionPaths, audioShape, pictureTransition, resolveTimelineStarts, buildComposeFilter,
} = require('../showreel/render.cjs');

test('edition renders use independent paths and reject path traversal', () => {
  const original = editionPaths([]);
  const editorial = editionPaths(['--edition', 'editorial']);
  assert.equal(original.build, path.resolve(__dirname, '../showreel/build'));
  assert.equal(original.filename, 'igor-szuniewicz-showreel-2026.mp4');
  assert.equal(editorial.build, path.resolve(__dirname, '../showreel/editions/editorial/build'));
  assert.equal(editorial.output, path.resolve(__dirname, '../showreel/editions/editorial/output'));
  assert.equal(editorial.timeline, path.resolve(__dirname, '../showreel/editions/editorial/timeline.json'));
  assert.equal(editorial.filename, 'igor-szuniewicz-showreel-2026-editorial.mp4');
  assert.deepEqual(editionPaths(['--edition=editorial']), editorial);
  for (const slug of ['', '..', '../other', 'x/y', 'x\\y', 'Editorial', '-x', 'x-', 'con', 'a'.repeat(65)]) {
    assert.throws(() => editionPaths(['--edition', slug]), /Edition must/);
  }
  assert.throws(() => editionPaths(['--edition']), /Edition must/);
  assert.throws(() => editionPaths(['--edition', 'one', '--edition', 'two']), /only once/);
});

test('opening sound remains synchronous and later shots accept exact audio envelopes', () => {
  const segment = { id: 'a', source: 'source.mp4', in: 3, duration: 2 };
  assert.equal(audioShape(segment).handleIn, 0);
  assert.equal(audioShape(segment, segment).handleIn, 0.34);
  const custom = {
    ...segment,
    audio: { handleIn: 0.12, handleOut: 0.8, fadeIn: 0, fadeOut: 0.7 },
  };
  assert.deepEqual(audioShape(custom, segment), {
    handleIn: 0.12, handleOut: 0.8, fadeIn: 0, fadeOut: 0.7,
  });
  assert.equal(audioShape(custom).handleIn, 0);
  assert.equal(audioShape({ ...custom, audio: { ...custom.audio, in: 0.05 } }, segment).handleIn, 0.05);
  for (const field of ['handleIn', 'handleOut', 'fadeIn', 'fadeOut']) {
    assert.throws(() => audioShape({ ...segment, audio: { [field]: -0.1 } }), /nonnegative/);
    assert.throws(() => audioShape({ ...segment, audio: { [field]: 'invalid' } }), /nonnegative/);
  }
});

test('outro can continue a source recording with its own audio envelope', () => {
  const previous = { id: 'ray', source: 'ray.mp4', in: 10, duration: 2 };
  const outro = {
    id: 'outro', kind: 'outro', duration: 2,
    audio: { source: 'ray.mp4', in: 12, handleIn: 0, handleOut: 0, fadeIn: 0, fadeOut: 1.5 },
  };
  assert.deepEqual(audioShape(outro, previous), {
    handleIn: 0, handleOut: 0, fadeIn: 0, fadeOut: 1.5,
  });
});

test('cuts consume no overlap and dissolve offsets agree with timeline starts', () => {
  const settings = { fps: 10, sampleRate: 48000 };
  const { resolved, duration } = resolveTimelineStarts([
    { id: 'first', duration: 1 },
    { id: 'cut', duration: 1, transitionIn: { type: 'cut', duration: 0 } },
    { id: 'fade', duration: 1, transitionIn: { type: 'fade', duration: 0.2 } },
  ], settings);
  assert.deepEqual(resolved.map((segment) => segment.timelineStart), [0, 1, 1.8]);
  assert.equal(duration, 2.8);
  const graph = buildComposeFilter(resolved, settings);
  assert.match(graph, /concat=n=2:v=1:a=0/);
  assert.match(graph, /xfade=transition=fade:duration=0\.2:offset=1\.8/);
  assert.doesNotMatch(graph, /xfade=transition=cut/);
  assert.throws(() => pictureTransition({ id: 'bad', transitionIn: { type: 'cut', duration: 0.1 } }), /duration 0/);
});

const ffmpeg = process.env.FFMPEG_BIN || 'ffmpeg';
const ffmpegAvailable = spawnSync(ffmpeg, ['-version'], { stdio: 'ignore' }).status === 0;
test('FFmpeg preserves every picture frame across cuts and can dissolve after concat', {
  skip: !ffmpegAvailable,
}, () => {
  const settings = { fps: 10, sampleRate: 48000 };
  for (const lastTransition of [{ type: 'cut', duration: 0 }, { type: 'fade', duration: 0.2 }]) {
    const { resolved, duration } = resolveTimelineStarts([
      { id: 'red', duration: 1 },
      { id: 'green', duration: 1, transitionIn: { type: 'cut', duration: 0 } },
      { id: 'blue', duration: 1, transitionIn: lastTransition },
    ], settings);
    const args = ['-hide_banner', '-loglevel', 'error'];
    for (const color of ['red', 'green', 'blue']) {
      args.push('-f', 'lavfi', '-i', `color=c=${color}:s=16x16:r=10:d=1`);
    }
    for (let index = 0; index < 3; index += 1) {
      args.push('-f', 'lavfi', '-i', 'sine=f=440:r=48000:d=1');
    }
    args.push('-filter_complex', `${buildComposeFilter(resolved, settings)};[aout]anullsink`,
      '-map', '[vout]', '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1');
    const result = spawnSync(ffmpeg, args, { maxBuffer: 1024 * 1024 });
    assert.equal(result.status, 0, result.stderr?.toString());
    const frameBytes = 16 * 16 * 3;
    assert.equal(result.stdout.length / frameBytes, Math.round(duration * settings.fps));
    const lastRed = result.stdout.subarray(9 * frameBytes, 9 * frameBytes + 3);
    const firstGreen = result.stdout.subarray(10 * frameBytes, 10 * frameBytes + 3);
    assert.ok(lastRed[0] > 240 && lastRed[1] < 5 && lastRed[2] < 5);
    assert.ok(firstGreen[0] < 5 && firstGreen[1] > 120 && firstGreen[2] < 5);
  }
});
