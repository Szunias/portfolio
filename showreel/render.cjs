/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const PROJECT_DIR = __dirname;
function editionPaths(args) {
  const flags = args.filter((value) => value === '--edition' || value.startsWith('--edition='));
  if (flags.length > 1) throw new Error('Specify --edition only once.');
  const flag = flags[0];
  const edition = flag === '--edition'
    ? args[args.indexOf(flag) + 1]
    : flag?.slice('--edition='.length);
  if (flag && (!edition || edition.length > 64 ||
      !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(edition) ||
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/.test(edition))) {
    throw new Error('Edition must be a lowercase slug of at most 64 letters, numbers and hyphens.');
  }
  const directory = edition ? path.join(PROJECT_DIR, 'editions', edition) : PROJECT_DIR;
  return {
    directory,
    build: path.join(directory, 'build'),
    output: path.join(directory, 'output'),
    timeline: path.join(directory, 'timeline.json'),
    filename: `igor-szuniewicz-showreel-2026${edition ? `-${edition}` : ''}.mp4`,
  };
}

const EDITION_PATHS = editionPaths(process.argv.slice(2));
const BUILD_DIR = EDITION_PATHS.build;
const SEGMENT_DIR = path.join(BUILD_DIR, 'segments');
const OUTPUT_DIR = EDITION_PATHS.output;
const FONT_DIR = path.join(PROJECT_DIR, 'assets', 'fonts');
const TIMELINE_PATH = EDITION_PATHS.timeline;
const CAPTIONS_PATH = path.join(BUILD_DIR, 'captions.ass');
const COMPOSE_FILTER_PATH = path.join(BUILD_DIR, 'compose.ffscript');
const COMPOSED_PATH = path.join(BUILD_DIR, 'timeline.mkv');
const FINAL_PATH = path.join(OUTPUT_DIR, EDITION_PATHS.filename);
const POSTER_PATH = path.join(OUTPUT_DIR, 'poster.jpg');
const CONTACT_SHEET_PATH = path.join(OUTPUT_DIR, 'contact-sheet.jpg');
const REPORT_PATH = path.join(OUTPUT_DIR, 'render-report.json');

const FFMPEG = process.env.FFMPEG_BIN || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_BIN || 'ffprobe';

function assertSafeBuildPath(target) {
  const resolved = path.resolve(target);
  const projectPrefix = `${path.resolve(PROJECT_DIR)}${path.sep}`;
  if (resolved !== path.resolve(BUILD_DIR) || !resolved.startsWith(projectPrefix)) {
    throw new Error(`Refusing to remove unexpected path: ${resolved}`);
  }
  // An edition directory must not redirect cleanup through a junction/symlink.
  let existing = resolved;
  while (!fs.existsSync(existing)) existing = path.dirname(existing);
  const realProject = fs.realpathSync(PROJECT_DIR);
  const realTarget = fs.realpathSync(existing);
  const expectedTarget = path.join(realProject, path.relative(PROJECT_DIR, existing));
  if (realTarget !== expectedTarget) {
    throw new Error(`Refusing cleanup through a redirected showreel directory: ${realTarget}`);
  }
}

function cleanBuild() {
  assertSafeBuildPath(BUILD_DIR);
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}

// Some mounts (network shares, sandboxed bridges) allow writes but refuse
// unlink. Every intermediate is regenerated under a deterministic name derived
// from the segment id, so reusing the directory produces the same build; the
// only thing lost is the guarantee that nothing unrelated is left behind.
function prepareBuild() {
  if (process.argv.includes('--keep-build')) {
    console.log(`Reusing ${path.relative(REPO_ROOT, BUILD_DIR)} (--keep-build); intermediates are overwritten in place.`);
    return;
  }
  cleanBuild();
}

if (require.main === module && process.argv.includes('--clean')) {
  cleanBuild();
  console.log(`Removed rebuildable intermediates: ${BUILD_DIR}`);
  process.exit(0);
}

function run(binary, args, options = {}) {
  const capture = Boolean(options.capture);
  const result = spawnSync(binary, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const details = capture ? `\n${result.stderr || result.stdout || ''}` : '';
    throw new Error(`${binary} failed with exit code ${result.status}.${details}`);
  }
  return capture ? { stdout: result.stdout || '', stderr: result.stderr || '' } : result;
}

// FFmpeg renamed the frame-rate conformance flag from -vsync to -fps_mode in 5.0.
// The project targets both, so the renderer probes once and rewrites the flag
// instead of pinning a version the README never promised.
let cachedSupportsFpsMode = null;

function supportsFpsMode() {
  if (cachedSupportsFpsMode === null) {
    const probe = spawnSync(
      FFMPEG,
      ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'nullsrc=d=0.05:r=25',
        '-fps_mode', 'cfr', '-f', 'null', '-'],
      { encoding: 'utf8', stdio: ['ignore', 'ignore', 'pipe'] },
    );
    cachedSupportsFpsMode = probe.status === 0;
    if (!cachedSupportsFpsMode) {
      console.warn('FFmpeg does not support -fps_mode; falling back to -vsync.');
    }
  }
  return cachedSupportsFpsMode;
}

function frameRateModeArgs(mode) {
  return supportsFpsMode() ? ['-fps_mode', mode] : ['-vsync', mode];
}

function ensureTools() {
  run(FFMPEG, ['-version'], { capture: true });
  run(FFPROBE, ['-version'], { capture: true });
  supportsFpsMode();
}

function loadTimeline() {
  const value = JSON.parse(fs.readFileSync(TIMELINE_PATH, 'utf8'));
  if (!Array.isArray(value.segments) || value.segments.length < 2) {
    throw new Error('timeline.json must contain at least two segments.');
  }
  value.segments.forEach((segment, index) => {
    audioShape(segment, value.segments[index - 1]);
    if (index > 0) pictureTransition(segment, value.settings);
  });
  return value;
}

function compositionFingerprint(timeline) {
  const settings = timeline.settings || {};
  const compositionSettings = {
    width: settings.width,
    height: settings.height,
    fps: settings.fps,
    sampleRate: settings.sampleRate,
    losslessIntermediates: settings.losslessIntermediates,
    intermediateCrf: settings.intermediateCrf,
    intermediatePreset: settings.intermediatePreset,
  };
  const segments = timeline.segments.map((segment) => {
    const compositionSegment = JSON.parse(JSON.stringify(segment));
    delete compositionSegment.caption;
    delete compositionSegment.postMasterGainDb;
    delete compositionSegment.postMasterFade;
    return compositionSegment;
  });
  const payload = JSON.stringify({
    compositionSettings,
    style: timeline.style || {},
    segments,
    // The audio layout is baked into build/timeline.mkv, so changing the handles
    // has to invalidate it the same way a re-cut does.
    audioLayout: { handleIn: AUDIO_HANDLE_IN, handleOut: AUDIO_HANDLE_OUT, version: 3 },
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

function assertCompositionIsCurrent(timeline, commandName) {
  if (!fs.existsSync(REPORT_PATH)) {
    console.warn(
      `Warning: ${commandName} cannot verify the lossless timeline because no render report exists.`,
    );
    return;
  }
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  if (!report.compositionFingerprint) {
    console.warn(
      `Warning: ${commandName} is migrating an older report without a composition fingerprint.`,
    );
    return;
  }
  const current = compositionFingerprint(timeline);
  if (report.compositionFingerprint !== current) {
    throw new Error(
      `${commandName} refused to use a stale build/timeline.mkv. ` +
      'Cuts, transitions, source processing or composition settings changed; ' +
      'run npm run showreel:render first.',
    );
  }
}

function ensureFonts() {
  const required = [
    'InterTight.ttf',
    'InterTight-SemiBold.ttf',
    'InterTight-Bold.ttf',
    'Inter.ttf',
    'IBMPlexMono-Regular.ttf',
    'OFL-Inter.txt',
    'OFL-InterTight.txt',
    'OFL-IBMPlexMono.txt',
  ];
  for (const file of required) {
    const full = path.join(FONT_DIR, file);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing showreel font asset: ${full}`);
    }
  }
}

function sourcePath(relativePath) {
  const full = path.resolve(REPO_ROOT, relativePath);
  const rootPrefix = `${path.resolve(REPO_ROOT)}${path.sep}`;
  if (!full.startsWith(rootPrefix)) {
    throw new Error(`Source escapes repository root: ${relativePath}`);
  }
  if (!fs.existsSync(full)) {
    throw new Error(`Missing source: ${relativePath}`);
  }
  return full;
}

function probeJson(file) {
  const result = run(
    FFPROBE,
    [
      '-v', 'error',
      '-show_entries',
      'format=duration,size,bit_rate:stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,sample_rate,channels,channel_layout',
      '-of', 'json',
      file,
    ],
    { capture: true },
  );
  return JSON.parse(result.stdout);
}

function probeDuration(file) {
  const format = probeJson(file).format || {};
  const duration = Number(format.duration);
  if (!Number.isFinite(duration)) {
    throw new Error(`Could not read a duration from ${file}.`);
  }
  return duration;
}

function probeHasAudio(file) {
  const result = run(
    FFPROBE,
    ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=index', '-of', 'csv=p=0', file],
    { capture: true },
  );
  return result.stdout.trim().length > 0;
}

function parseLoudnormJson(stderr) {
  const blocks = stderr.match(/\{\s*"input_i"[\s\S]*?\}/g);
  if (!blocks || blocks.length === 0) {
    throw new Error(`Could not parse loudnorm output:\n${stderr}`);
  }
  return JSON.parse(blocks[blocks.length - 1]);
}

function measureLoudness(file, targetI, targetLra, targetTp) {
  const result = run(
    FFMPEG,
    [
      '-hide_banner', '-nostats',
      '-i', file,
      '-map', '0:a:0',
      '-af', `loudnorm=I=${targetI}:LRA=${targetLra}:TP=${targetTp}:print_format=json`,
      '-f', 'null', '-',
    ],
    { capture: true },
  );
  return parseLoudnormJson(result.stderr);
}

function ffNumber(value) {
  return Number(value).toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

function intermediateVideoArgs(settings) {
  if (settings.losslessIntermediates !== false) {
    return [
      '-c:v', 'ffv1',
      '-level', '3',
      '-g', '1',
      '-slicecrc', '1',
      '-pix_fmt', 'yuv420p',
    ];
  }
  return [
    '-c:v', 'libx264',
    '-preset', settings.intermediatePreset || 'medium',
    '-crf', String(settings.intermediateCrf || 8),
    '-pix_fmt', 'yuv420p',
  ];
}

function sourceVideoFilter(segment, settings) {
  const { width, height, fps } = settings;
  const common = [
    `fps=${fps}`,
    'settb=AVTB',
    'setpts=PTS-STARTPTS',
  ];

  // Some sources are graded so dark that on a laptop they read as black. A small
  // documented lift per segment is preferable to shipping a reel where two
  // projects show nothing; it is deliberately mild and never applied globally.
  if (segment.grade) {
    const g = segment.grade;
    const parts = [];
    if (Number.isFinite(Number(g.brightness))) parts.push(`brightness=${ffNumber(g.brightness)}`);
    if (Number.isFinite(Number(g.contrast))) parts.push(`contrast=${ffNumber(g.contrast)}`);
    if (Number.isFinite(Number(g.saturation))) parts.push(`saturation=${ffNumber(g.saturation)}`);
    if (Number.isFinite(Number(g.gamma))) parts.push(`gamma=${ffNumber(g.gamma)}`);
    if (parts.length) {
      common.push(`eq=${parts.join(':')}`);
    }
  }

  if (segment.crop) {
    const crop = segment.crop;
    const cropWidth = Number(crop.width);
    const cropHeight = Number(crop.height);
    const cropX = Number(crop.x || 0);
    const cropY = Number(crop.y || 0);
    if (![cropWidth, cropHeight, cropX, cropY].every(Number.isFinite)) {
      throw new Error(`Invalid crop for segment ${segment.id}.`);
    }
    common.push(`crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`);
  }

  if (segment.fit === 'tool') {
    common.push(
      `scale=${width - 160}:${height - 300}:force_original_aspect_ratio=decrease:flags=lanczos`,
      `pad=${width}:${height}:(ow-iw)/2:40:color=0x101012`,
    );
  } else if (segment.fit === 'contain') {
    common.push(
      `scale=${width}:${height}:force_original_aspect_ratio=decrease:flags=lanczos`,
      `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=0x101012`,
    );
  } else {
    common.push(
      `scale=${width}:${height}:force_original_aspect_ratio=increase:flags=lanczos`,
      `crop=${width}:${height}`,
    );
  }

  // A segment that lands even one frame short silently breaks the xfade chain
  // downstream, because the compose offsets are computed from the requested
  // durations. Holding the last frame costs nothing -- the output -t caps the
  // segment at its nominal length -- and removes the failure mode entirely.
  common.push('setsar=1', 'format=yuv420p', 'tpad=stop_mode=clone:stop_duration=0.25');
  return common.join(',');
}

function panelVideoFilter(segment, settings, backgroundInputIndex) {
  const presentation = segment.presentation || {};
  const panelWidth = Number(presentation.width || 1060);
  const panelHeight = Number(presentation.height || 596);
  const panelX = Number(presentation.x || 760);
  const panelY = Number(presentation.y || 132);
  const frame = Number(presentation.frame || 18);
  const blur = Number(presentation.blur || 24);

  const background = [
    `[${backgroundInputIndex}:v]fps=${settings.fps}`,
    'settb=AVTB',
    'setpts=PTS-STARTPTS',
    `scale=${settings.width}:${settings.height}:force_original_aspect_ratio=increase:flags=lanczos`,
    `crop=${settings.width}:${settings.height}`,
    `gblur=sigma=${ffNumber(blur)}:steps=2`,
    'eq=brightness=-0.27:saturation=0.58:contrast=1.04',
    'setsar=1',
    'format=yuv420p[panelbg]',
  ].join(',');
  const foreground = [
    `[0:v]fps=${settings.fps}`,
    'settb=AVTB',
    'setpts=PTS-STARTPTS',
    `scale=${panelWidth}:${panelHeight}:force_original_aspect_ratio=decrease:flags=lanczos`,
    `pad=${panelWidth}:${panelHeight}:(ow-iw)/2:(oh-ih)/2:color=0x101012`,
    'unsharp=5:5:0.45:5:5:0',
    'setsar=1',
    'format=yuv420p[panel]',
  ].join(',');
  const frameX = panelX - frame;
  const frameY = panelY - frame;
  const frameWidth = panelWidth + frame * 2;
  const frameHeight = panelHeight + frame * 2;
  return [
    `${background};`,
    `${foreground};`,
    `[panelbg]drawbox=x=${frameX}:y=${frameY}:w=${frameWidth}:h=${frameHeight}:` +
      'color=0x0B0B0D@0.94:t=fill[panelbase];',
    `[panelbase][panel]overlay=x=${panelX}:y=${panelY}:shortest=1,`,
    `drawbox=x=${panelX - 1}:y=${panelY - 1}:w=${panelWidth + 2}:h=${panelHeight + 2}:` +
      'color=0xAAC6DE@0.52:t=2,format=yuv420p[v];',
  ].join('');
}

function sourceAudioFilter(segment, settings) {
  const duration = ffNumber(segment.duration);
  const gain = Number(segment.audio?.gainDb || 0);
  const limiterDb = segment.audio?.limiterDb;
  const asyncPart = segment.audio?.async ? ':async=1:first_pts=0' : '';
  const fadeOutStart = Math.max(0, segment.duration - 0.008);
  const filters = [
    `aresample=${settings.sampleRate}${asyncPart}`,
    `volume=${gain}dB`,
    'afade=t=in:st=0:d=0.008',
    `afade=t=out:st=${ffNumber(fadeOutStart)}:d=0.008`,
  ];
  if (Number.isFinite(Number(limiterDb))) {
    const limit = Math.pow(10, Number(limiterDb) / 20);
    filters.push(`alimiter=limit=${ffNumber(limit)}:attack=5:release=80:level=false:latency=true`);
  }
  filters.push(
    `apad=pad_dur=${duration}`,
    `atrim=duration=${duration}`,
    'asetpts=PTS-STARTPTS',
    `aformat=sample_rates=${settings.sampleRate}:channel_layouts=stereo`,
  );
  return filters.join(',');
}

function bedAudioFilter(segment, settings) {
  const duration = ffNumber(segment.duration);
  const gain = Number(segment.audio?.gainDb ?? -31);
  const fadeOutStart = Math.max(0, segment.duration - 0.35);
  return [
    `volume=${gain}dB`,
    'highpass=f=180',
    'lowpass=f=4200',
    'afade=t=in:st=0:d=0.25',
    `afade=t=out:st=${ffNumber(fadeOutStart)}:d=0.35`,
    `atrim=duration=${duration}`,
    'asetpts=PTS-STARTPTS',
    `aresample=${settings.sampleRate}`,
    `aformat=sample_rates=${settings.sampleRate}:channel_layouts=stereo`,
  ].join(',');
}

function signatureAudioSource(fundamental, duration, sampleRate) {
  const second = fundamental * 1.5;
  const third = fundamental * 2;
  const air = fundamental * 4;
  const left = [
    '0.014*(2*random(0)-1)*(1-exp(-8*t))*exp(-0.18*t)',
    `0.12*(1-exp(-42*t))*exp(-1.0*t)*sin(2*PI*${ffNumber(fundamental)}*t)`,
    `0.11*(1-exp(-34*t))*exp(-0.72*t)*sin(2*PI*${ffNumber(second)}*t+0.22)`,
    `0.09*(1-exp(-30*t))*exp(-0.58*t)*sin(2*PI*${ffNumber(third)}*t+0.44)`,
    `0.035*(1-exp(-26*t))*exp(-0.45*t)*sin(2*PI*${ffNumber(air)}*t+0.58)`,
  ].join('+');
  const right = [
    '0.014*(2*random(1)-1)*(1-exp(-8*t))*exp(-0.18*t)',
    `0.12*(1-exp(-42*t))*exp(-1.0*t)*sin(2*PI*${ffNumber(fundamental)}*t+0.13)`,
    `0.11*(1-exp(-34*t))*exp(-0.72*t)*sin(2*PI*${ffNumber(second)}*t+0.39)`,
    `0.09*(1-exp(-30*t))*exp(-0.58*t)*sin(2*PI*${ffNumber(third)}*t+0.61)`,
    `0.035*(1-exp(-26*t))*exp(-0.45*t)*sin(2*PI*${ffNumber(air)}*t+0.76)`,
  ].join('+');
  return `aevalsrc=${left}|${right}:s=${sampleRate}:d=${duration}`;
}

// The ident is one gesture: a scan crosses the frame and leaves the wordmark,
// its rule and a faint signal field behind it. Both audio sources are anchored
// to IDENT_LAND, the moment the scan reaches the end of the name, so the sound
// and the picture describe the same event instead of running on parallel clocks.
const IDENT_SCAN_START = 0.08;
const IDENT_LAND = 0.92;

function introBodyAudioSource(duration, sampleRate) {
  const onsetLeft = IDENT_LAND;
  const onsetRight = IDENT_LAND + 0.009;
  const body = (onset, phase) => [
    `0.055*gte(t,${onset})*(1-exp(-110*(t-${onset})))*exp(-2.6*(t-${onset}))*sin(2*PI*73.42*(t-${onset})+${phase})`,
    `0.075*gte(t,${onset})*(1-exp(-100*(t-${onset})))*exp(-2.45*(t-${onset}))*sin(2*PI*110*(t-${onset})+${phase + 0.08})`,
    `0.18*gte(t,${onset})*(1-exp(-95*(t-${onset})))*exp(-2.25*(t-${onset}))*sin(2*PI*146.83*(t-${onset})+${phase + 0.15})`,
    `0.13*gte(t,${onset})*(1-exp(-90*(t-${onset})))*exp(-2.6*(t-${onset}))*sin(2*PI*293.66*(t-${onset})+${phase + 0.31})`,
    `0.045*gte(t,${onset})*(1-exp(-85*(t-${onset})))*exp(-3.1*(t-${onset}))*sin(2*PI*587.33*(t-${onset})+${phase + 0.48})`,
  ].join('+');
  const left = body(onsetLeft, 0).replaceAll(',', '\\,');
  const right = body(onsetRight, 0.09).replaceAll(',', '\\,');
  return `aevalsrc=${left}|${right}:s=${sampleRate}:d=${duration}`;
}

// Transients are spaced across the scan travel, not across an arbitrary grid,
// so each tick corresponds to the scan crossing another part of the name.
function introSparkAudioSource(duration, sampleRate) {
  const travel = IDENT_LAND - IDENT_SCAN_START;
  const ticks = [
    { at: 0.18, amp: 0.026, freq: 940, decay: 24 },
    { at: 0.40, amp: 0.031, freq: 1280, decay: 26 },
    { at: 0.62, amp: 0.038, freq: 1690, decay: 28 },
    { at: 0.82, amp: 0.046, freq: 2040, decay: 30 },
  ].map((tick) => ({ ...tick, t: IDENT_SCAN_START + travel * tick.at }));

  const spark = (offset, phase) => {
    const terms = ticks.map((tick, index) => {
      const at = ffNumber(tick.t + offset);
      return `${tick.amp}*gte(t,${at})*exp(-${tick.decay}*(t-${at}))*` +
        `sin(2*PI*${tick.freq}*(t-${at})+${ffNumber(phase + index * 0.12)})`;
    });
    const land = ffNumber(IDENT_LAND + offset);
    terms.push(
      `0.085*gte(t,${land})*exp(-11*(t-${land}))*sin(2*PI*2280*(t-${land})+${ffNumber(phase + 0.34)})`,
    );
    return terms.join('+');
  };
  const left = spark(0, 0).replaceAll(',', '\\,');
  const right = spark(0.008, 0.08).replaceAll(',', '\\,');
  return `aevalsrc=${left}|${right}:s=${sampleRate}:d=${duration}`;
}

// Retained only as provenance for the rejected Signal Syntax symbol direction.
// Active dispatch uses renderWordmarkIntro/renderWordmarkOutro below.
function renderLegacySignalSyntaxIntro(segment, settings, outputPath) {
  const duration = ffNumber(segment.duration);
  const audioFadeOutStart = ffNumber(Math.max(0, segment.duration - 0.34));
  const platePath = sourcePath('showreel/assets/branding/igor-ident-background-v1.png');
  const markPath = sourcePath('showreel/assets/branding/igor-signal-syntax.png');

  const filter = [
    `[0:v]zoompan=z='max(1.015\\,1.08-0.0007*on)':` +
      `x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:` +
      `s=${settings.width}x${settings.height}:fps=${settings.fps},`,
    `format=rgba,eq=contrast=1.08:brightness=-0.045:saturation=0.78,` +
      `vignette=PI/4,fade=t=in:st=0:d=0.34[base];`,
    `[1:v]format=rgba,scale=480:480:flags=lanczos,` +
      `split=9[leftSrc][centreSrc][rightSrc][fullSrc][bloomSrc]` +
      `[echoSrc][glitchTopSrc][glitchBottomSrc][sweepSrc];`,
    `[leftSrc]crop=160:480:0:0,fade=t=in:st=0.24:d=0.3:alpha=1,` +
      `fade=t=out:st=0.92:d=0.14:alpha=1[left];`,
    `[centreSrc]crop=160:480:160:0,fade=t=in:st=0.43:d=0.34:alpha=1,` +
      `fade=t=out:st=0.92:d=0.14:alpha=1[centre];`,
    `[rightSrc]crop=160:480:320:0,fade=t=in:st=0.33:d=0.3:alpha=1,` +
      `fade=t=out:st=0.92:d=0.14:alpha=1[right];`,
    `[fullSrc]fade=t=in:st=0.91:d=0.15:alpha=1[full];`,
    `[bloomSrc]gblur=sigma=16,colorchannelmixer=aa=0.11,` +
      `fade=t=in:st=0.5:d=0.3:alpha=1,fade=t=out:st=1.22:d=0.4:alpha=1[bloom];`,
    `[echoSrc]scale=520:520,gblur=sigma=10,colorchannelmixer=aa=0.045,` +
      `fade=t=in:st=0.14:d=0.34:alpha=1,fade=t=out:st=0.94:d=0.32:alpha=1[echo];`,
    `[glitchTopSrc]crop=480:38:0:126,` +
      `colorchannelmixer=rr=0.34:gg=0.76:bb=1:aa=0.66[glitchTop];`,
    `[glitchBottomSrc]crop=480:34:0:300,` +
      `colorchannelmixer=rr=0.58:gg=0.84:bb=1:aa=0.62[glitchBottom];`,
    `[sweepSrc]crop=42:480:` +
      `x='max(0\\,min(438\\,(t-0.48)/0.62*438))':y=0,` +
      `eq=brightness=0.2:contrast=1.12,gblur=sigma=2.5,` +
      `colorchannelmixer=aa=0.32[sweep];`,
    `[base][echo]overlay=x=700:y=80:shortest=1[withEcho];`,
    `[withEcho][left]overlay=` +
      `x='if(lt(t\\,0.64)\\,704+16*(0.64-t)/0.4\\,704)':y=100:shortest=1[withLeft];`,
    `[withLeft][right]overlay=` +
      `x='if(lt(t\\,0.73)\\,1056-16*(0.73-t)/0.4\\,1056)':y=100:shortest=1[withRight];`,
    `[withRight][centre]overlay=x=864:` +
      `y='if(lt(t\\,0.83)\\,112-12*(t-0.43)/0.4\\,100)':shortest=1[withCentre];`,
    `[withCentre][bloom]overlay=x=720:y=100:shortest=1[withBloom];`,
    `[withBloom][full]overlay=x=720:y=100:shortest=1[withFull];`,
    `[withFull][sweep]overlay=` +
      `x='720+max(0\\,min(438\\,(t-0.48)/0.62*438))':y=100:` +
      `enable='between(t\\,0.48\\,1.1)':shortest=1[withSweep];`,
    `[withSweep][glitchTop]overlay=x=736:y=226:` +
      `enable='between(t\\,1.035\\,1.105)':shortest=1[withGlitchTop];`,
    `[withGlitchTop][glitchBottom]overlay=x=706:y=400:` +
      `enable='between(t\\,1.05\\,1.12)':shortest=1[logoScene];`,
    `[logoScene]split=3[scene][endTopSrc][endBottomSrc];`,
    `[endTopSrc]crop=${settings.width}:42:0:286[endTop];`,
    `[endBottomSrc]crop=${settings.width}:30:0:622[endBottom];`,
    `[scene][endTop]overlay=x=34:y=286:` +
      `enable='between(t\\,2.64\\,2.71)+between(t\\,2.76\\,2.8)'[endGlitchTop];`,
    `[endGlitchTop][endBottom]overlay=x=-26:y=622:` +
      `enable='between(t\\,2.66\\,2.73)+between(t\\,2.77\\,2.81)',` +
      `format=yuv420p,noise=alls=2.4:allf=t+u[v];`,
    `[2:a]highpass=f=44:poles=2,lowpass=f=6500,volume=0.92[body];`,
    `[3:a]pan=stereo|c0=c0|c1=c0,highpass=f=900,lowpass=f=6500,`,
    `volume='if(between(t\\,0.08\\,1.08)\\,0.095*pow((t-0.08)/1\\,1.8)\\,0)':` +
      `eval=frame[air];`,
    `[4:a]pan=stereo|c0=c0|c1=c0,highpass=f=240,lowpass=f=5600,`,
    `afade=t=out:st=0:d=0.18,volume=0.16,adelay=1075|1083[hit];`,
    `[5:a]highpass=f=620,lowpass=f=8800[spark];`,
    `[body][air][hit][spark]amix=inputs=4:normalize=0:dropout_transition=0,`,
    `aecho=0.8:0.72:68|124:0.09|0.038,volume=1.08,`,
    `highpass=f=44:poles=2,lowpass=f=9200,`,
    `alimiter=limit=0.48:attack=3:release=90:level=false:latency=true,`,
    `afade=t=in:st=0:d=0.035,afade=t=out:st=${audioFadeOutStart}:d=0.3,`,
    `apad=pad_dur=${duration},atrim=duration=${duration},`,
    `aresample=${settings.sampleRate},`,
    `aformat=sample_rates=${settings.sampleRate}:channel_layouts=stereo[a]`,
  ].join('');

  run(FFMPEG, [
    '-hide_banner', '-y',
    '-loop', '1', '-framerate', String(settings.fps), '-t', duration, '-i', platePath,
    '-loop', '1', '-framerate', String(settings.fps), '-t', duration, '-i', markPath,
    '-f', 'lavfi', '-i', introBodyAudioSource(duration, settings.sampleRate),
    '-f', 'lavfi', '-i', `anoisesrc=c=white:r=${settings.sampleRate}:d=${duration}:a=0.5`,
    '-f', 'lavfi', '-i', `anoisesrc=c=white:r=${settings.sampleRate}:d=0.18:a=0.7`,
    '-f', 'lavfi', '-i', introSparkAudioSource(duration, settings.sampleRate),
    '-filter_complex', filter,
    '-map', '[v]', '-map', '[a]',
    ...intermediateVideoArgs(settings),
    '-c:a', 'pcm_s24le', '-ar', String(settings.sampleRate), '-ac', '2',
    '-t', duration,
    '-f', 'matroska',
    outputPath,
  ]);
}

function renderLegacySignalSyntaxOutro(segment, settings, outputPath) {
  const duration = ffNumber(segment.duration);
  const fadeOutStart = Math.max(0, segment.duration - 0.55);
  const gradient = [
    `gradients=s=${settings.width}x${settings.height}`,
    `r=${settings.fps}`,
    `d=${duration}`,
    'c0=0x08080A',
    'c1=0x101012',
    'c2=0x121925',
    'n=3',
    `x0=${settings.width}`,
    'y0=0',
    'x1=0',
    `y1=${settings.height}`,
    'speed=0.008',
    'type=linear',
  ].join(':');

  const markPath = sourcePath('showreel/assets/branding/igor-signal-syntax.png');
  const filter = [
    `[1:v]format=rgba,scale=240:240:flags=lanczos,`,
    `fade=t=in:st=0.28:d=0.38:alpha=1,`,
    `fade=t=out:st=${ffNumber(fadeOutStart)}:d=0.45:alpha=1[mark];`,
    `[0:v][mark]overlay=x=96:y=390:shortest=1,noise=alls=2:allf=t+u,format=yuv420p[v];`,
    `[2:a]volume=0.78,highpass=f=90:poles=2,lowpass=f=7200,`,
    'aecho=0.8:0.28:48|96:0.14|0.06,adelay=250|259,',
    'alimiter=limit=0.35:attack=2:release=40:level=false:latency=true,',
    `afade=t=in:st=0:d=0.16,afade=t=out:st=${ffNumber(segment.duration - 0.9)}:d=0.78,`,
    `apad=pad_dur=${duration},atrim=duration=${duration},`,
    `aresample=${settings.sampleRate}[a]`,
  ].join('');

  run(FFMPEG, [
    '-hide_banner', '-y',
    '-f', 'lavfi', '-i', gradient,
    '-loop', '1', '-framerate', String(settings.fps), '-t', duration, '-i', markPath,
    '-f', 'lavfi', '-i', signatureAudioSource(146.83, duration, settings.sampleRate),
    '-filter_complex', filter,
    '-map', '[v]', '-map', '[a]',
    ...intermediateVideoArgs(settings),
    '-c:a', 'pcm_s24le', '-ar', String(settings.sampleRate), '-ac', '2',
    '-t', duration,
    '-f', 'matroska',
    outputPath,
  ]);
}

// Active ident: the name itself is the identity. The older symbol-based
// renderers above remain readable as provenance, but are no longer called.
//
// The plate carries no graphics. Everything that reads as identity -- the
// scan, the wordmark, its rule and the signal field -- is drawn in the caption
// pass, so a single easing curve drives all of it and nothing can drift out of
// sync with anything else. The plate's only jobs are a controlled dark
// gradient, corner falloff, and enough grain to keep 8-bit yuv420p from
// banding across a near-flat dark field.
function identPlateSource(settings, duration, reverse = false) {
  return [
    `gradients=s=${settings.width}x${settings.height}`,
    `r=${settings.fps}`,
    `d=${duration}`,
    'c0=0x090A0D',
    'c1=0x121620',
    'n=2',
    `x0=${reverse ? settings.width : 0}`,
    `y0=${reverse ? 0 : settings.height}`,
    `x1=${reverse ? 0 : settings.width}`,
    `y1=${reverse ? settings.height : 0}`,
    'speed=0.00001',
  ].join(':');
}

function renderWordmarkIntro(segment, settings, outputPath) {
  const duration = ffNumber(segment.duration);
  const audioFadeOutStart = ffNumber(Math.max(0, segment.duration - 0.34));
  const filter = [
    `[0:v]format=rgba,vignette=PI/4.6,`,
    `fade=t=in:st=0:d=0.12,`,
    `noise=alls=3:allf=t,format=yuv420p[v];`,
    `[1:a]highpass=f=44:poles=2,lowpass=f=6800,volume=0.94[body];`,
    `[2:a]pan=stereo|c0=c0|c1=c0,highpass=f=1100,lowpass=f=7200,` +
      `volume='if(between(t\\,${ffNumber(IDENT_SCAN_START)}\\,${ffNumber(IDENT_LAND)})\\,` +
      `0.085*pow((t-${ffNumber(IDENT_SCAN_START)})/${ffNumber(IDENT_LAND - IDENT_SCAN_START)}\\,1.9)\\,` +
      `if(gte(t\\,${ffNumber(IDENT_LAND)})\\,0.085*exp(-1.9*(t-${ffNumber(IDENT_LAND)}))\\,0))':` +
      `eval=frame[air];`,
    `[3:a]pan=stereo|c0=c0|c1=c0,highpass=f=260,lowpass=f=5400,` +
      `afade=t=out:st=0:d=0.16,volume=0.15,` +
      `adelay=${Math.round(IDENT_LAND * 1000)}|${Math.round(IDENT_LAND * 1000) + 9}[hit];`,
    `[4:a]highpass=f=700,lowpass=f=9200[spark];`,
    `[body][air][hit][spark]amix=inputs=4:normalize=0:dropout_transition=0,` +
      `aecho=0.8:0.7:62|118:0.085|0.034,volume=2.7,` +
      `highpass=f=44:poles=2,lowpass=f=9600,` +
      `alimiter=limit=0.63:attack=3:release=90:level=false:latency=true,` +
      `afade=t=in:st=0:d=0.03,afade=t=out:st=${audioFadeOutStart}:d=0.3,` +
      `apad=pad_dur=${duration},atrim=duration=${duration},` +
      `aresample=${settings.sampleRate},` +
      `aformat=sample_rates=${settings.sampleRate}:channel_layouts=stereo[a]`,
  ].join('');

  run(FFMPEG, [
    '-hide_banner', '-y',
    '-f', 'lavfi', '-i', identPlateSource(settings, duration),
    '-f', 'lavfi', '-i', introBodyAudioSource(duration, settings.sampleRate),
    '-f', 'lavfi', '-i', `anoisesrc=c=white:r=${settings.sampleRate}:d=${duration}:a=0.5`,
    '-f', 'lavfi', '-i', `anoisesrc=c=white:r=${settings.sampleRate}:d=0.18:a=0.7`,
    '-f', 'lavfi', '-i', introSparkAudioSource(duration, settings.sampleRate),
    '-filter_complex', filter,
    '-map', '[v]', '-map', '[a]',
    ...intermediateVideoArgs(settings),
    '-c:a', 'pcm_s24le', '-ar', String(settings.sampleRate), '-ac', '2',
    '-t', duration,
    '-f', 'matroska',
    outputPath,
  ]);
}

function renderWordmarkOutro(segment, settings, outputPath) {
  const duration = ffNumber(segment.duration);
  const fadeOutStart = ffNumber(Math.max(0, segment.duration - 0.5));
  const filter = [
    `[0:v]format=rgba,vignette=PI/4.6,`,
    `noise=alls=2.4:allf=t,`,
    `fade=t=out:st=${fadeOutStart}:d=0.48,format=yuv420p[v];`,
    `[1:a]volume=3.9,highpass=f=90:poles=2,lowpass=f=7200,` +
      'aecho=0.8:0.28:48|96:0.14|0.06,adelay=250|259,' +
      'alimiter=limit=0.35:attack=2:release=40:level=false:latency=true,' +
      `afade=t=in:st=0:d=0.16,afade=t=out:st=${ffNumber(segment.duration - 0.9)}:d=0.78,` +
      `apad=pad_dur=${duration},atrim=duration=${duration},` +
      `aresample=${settings.sampleRate}[a]`,
  ].join('');

  run(FFMPEG, [
    '-hide_banner', '-y',
    '-f', 'lavfi', '-i', identPlateSource(settings, duration, true),
    '-f', 'lavfi', '-i', signatureAudioSource(146.83, duration, settings.sampleRate),
    '-filter_complex', filter,
    '-map', '[v]', '-map', '[a]',
    ...intermediateVideoArgs(settings),
    '-c:a', 'pcm_s24le', '-ar', String(settings.sampleRate), '-ac', '2',
    '-t', duration,
    '-f', 'matroska',
    outputPath,
  ]);
}

function renderSourceSegment(segment, settings, outputPath) {
  const videoSource = sourcePath(segment.source);
  const duration = ffNumber(segment.duration);
  const args = [
    '-hide_banner', '-y',
    '-fflags', '+genpts+discardcorrupt',
    '-ss', ffNumber(segment.in || 0),
    '-t', duration,
    '-i', videoSource,
  ];

  let nextInputIndex = 1;
  let audioLabel = segment.audio?.stream || '0:a:0';
  const audioMode = segment.audio?.mode || 'source';

  if (audioMode === 'source' && segment.audio?.source) {
    const separateAudioSource = sourcePath(segment.audio.source);
    audioLabel = `${nextInputIndex}:a:0`;
    nextInputIndex += 1;
    args.push(
      '-ss', ffNumber(segment.audio.in ?? segment.in ?? 0),
      '-t', duration,
      '-i', separateAudioSource,
    );
  } else if (audioMode === 'bed') {
    audioLabel = `${nextInputIndex}:a:0`;
    nextInputIndex += 1;
    const expression = [
      'aevalsrc=',
      '0.34*sin(2*PI*220*t)+0.13*sin(2*PI*330*t)+0.05*sin(2*PI*880*t)',
      '|',
      '0.34*sin(2*PI*220*t+0.20)+0.13*sin(2*PI*330*t+0.20)+0.05*sin(2*PI*880*t+0.11)',
      `:s=${settings.sampleRate}:d=${duration}`,
    ].join('');
    args.push('-f', 'lavfi', '-i', expression);
  }

  let backgroundInputIndex = null;
  if (segment.presentation?.background) {
    backgroundInputIndex = nextInputIndex;
    args.push(
      '-loop', '1',
      '-framerate', String(settings.fps),
      '-t', duration,
      '-i', sourcePath(segment.presentation.background),
    );
  }

  if (audioMode === 'source') {
    const audioFile = segment.audio?.source ? sourcePath(segment.audio.source) : videoSource;
    if (!probeHasAudio(audioFile)) {
      throw new Error(`Segment ${segment.id} requests source audio, but no audio stream exists.`);
    }
  }

  const audioFilter = audioMode === 'bed'
    ? bedAudioFilter(segment, settings)
    : sourceAudioFilter(segment, settings);
  const videoFilter = backgroundInputIndex === null
    ? `[0:v]${sourceVideoFilter(segment, settings)}[v];`
    : panelVideoFilter(segment, settings, backgroundInputIndex);
  const filter = `${videoFilter}[${audioLabel}]${audioFilter}[a]`;

  args.push(
    '-filter_complex', filter,
    '-map', '[v]', '-map', '[a]',
    ...intermediateVideoArgs(settings),
    '-c:a', 'pcm_s24le', '-ar', String(settings.sampleRate), '-ac', '2',
    ...frameRateModeArgs('cfr'),
    '-avoid_negative_ts', 'make_zero',
    '-shortest',
    '-t', duration,
    '-f', 'matroska',
    outputPath,
  );

  run(FFMPEG, args);
}

// ---------------------------------------------------------------------------
// Audio is laid out independently of the picture.
//
// The old composer chained acrossfade with the same duration as the video
// xfade, which meant a two-frame picture cut got a two-frame audio crossfade.
// Sounds cut mid-event simply stopped, and that is what reads as chopped. The
// durations could not just be lengthened either: acrossfade shortens the audio
// timeline by each overlap, so any mismatch with the video overlap accumulates
// into drift across the programme.
//
// So each segment now gets its own audio render with handles -- extra material
// before and after the picture window -- and the handles are placed on a common
// timeline with adelay and summed with amix. A 400 ms audio fade can then sit
// under a two-frame picture cut, and the incoming sound can arrive before its
// picture (pre-lap), which is what actually stitches an edit together.
const AUDIO_HANDLE_IN = 0.34;
const AUDIO_HANDLE_OUT = 0.5;

function audioShape(segment, previous) {
  const audio = segment.audio || {};
  for (const field of ['handleIn', 'handleOut', 'fadeIn', 'fadeOut']) {
    if (audio[field] !== undefined &&
        (!Number.isFinite(Number(audio[field])) || Number(audio[field]) < 0)) {
      throw new Error(`Invalid audio.${field} for segment ${segment.id}: expected a nonnegative number.`);
    }
  }
  const sameProject = Boolean(
    previous && previous.source && segment.source && previous.source === segment.source,
  );
  const isIdent = segment.kind === 'intro' || segment.kind === 'outro';
  if (isIdent && !audio.source) {
    return { handleIn: 0, handleOut: 0, fadeIn: 0, fadeOut: 0 };
  }
  const availableHead = Math.max(0, Number(audio.in ?? segment.in ?? 0));
  const defaults = sameProject
    // Another angle in the same project: keep it tight, the material is related.
    ? { handleIn: AUDIO_HANDLE_IN, handleOut: AUDIO_HANDLE_OUT, fadeIn: 0.2, fadeOut: 0.3 }
    // A new project: pre-lap in over the handle, and let the outgoing one ring
    // out underneath rather than stopping on the cut.
    : { handleIn: AUDIO_HANDLE_IN, handleOut: AUDIO_HANDLE_OUT, fadeIn: 0.3, fadeOut: 0.44 };
  const shape = Object.fromEntries(Object.entries(defaults).map(([field, value]) =>
    [field, Number(audio[field] ?? value)]));
  // A pre-lap cannot start before programme time zero. Reading an earlier
  // source in-point for the opening shot would shift its sync instead.
  shape.handleIn = previous ? Math.min(shape.handleIn, availableHead) : 0;
  return shape;
}

function segmentAudioPath(index, segment) {
  return path.join(
    SEGMENT_DIR,
    `${String(index + 1).padStart(2, '0')}-${segment.id}.audio.wav`,
  );
}

function renderSegmentAudio(segment, settings, shape, outputPath) {
  const window = ffNumber(Number(shape.handleIn) + Number(segment.duration) + Number(shape.handleOut));
  const args = ['-hide_banner', '-y'];
  const mode = segment.audio?.mode || 'source';

  if (mode === 'silence') {
    args.push('-f', 'lavfi', '-i', `anullsrc=r=${settings.sampleRate}:cl=stereo:d=${window}`);
  } else if (mode === 'bed') {
    const expression = [
      'aevalsrc=',
      '0.34*sin(2*PI*220*t)+0.13*sin(2*PI*330*t)+0.05*sin(2*PI*880*t)',
      '|',
      '0.34*sin(2*PI*220*t+0.20)+0.13*sin(2*PI*330*t+0.20)+0.05*sin(2*PI*880*t+0.11)',
      `:s=${settings.sampleRate}:d=${window}`,
    ].join('');
    args.push('-f', 'lavfi', '-i', expression);
  } else {
    const file = segment.audio?.source
      ? sourcePath(segment.audio.source)
      : sourcePath(segment.source);
    const from = Number(segment.audio?.in ?? segment.in ?? 0) - Number(shape.handleIn);
    args.push(
      '-fflags', '+genpts+discardcorrupt',
      '-ss', ffNumber(Math.max(0, from)),
      '-t', window,
      '-i', file,
    );
  }

  const gain = Number(segment.audio?.gainDb || 0);
  const limiterDb = segment.audio?.limiterDb;
  const filters = [
    `aresample=${settings.sampleRate}${segment.audio?.async ? ':async=1:first_pts=0' : ''}`,
    `volume=${gain}dB`,
  ];
  if (mode === 'bed') {
    filters.push('highpass=f=180', 'lowpass=f=4200');
  }
  if (Number.isFinite(Number(limiterDb))) {
    const limit = Math.pow(10, Number(limiterDb) / 20);
    filters.push(`alimiter=limit=${ffNumber(limit)}:attack=5:release=80:level=false:latency=true`);
  }
  // The fades live on the handles, not on the picture cut.
  const fadeIn = Number(shape.fadeIn);
  const fadeOut = Number(shape.fadeOut);
  if (fadeIn > 0) filters.push(`afade=t=in:st=0:d=${ffNumber(fadeIn)}:curve=qsin`);
  if (fadeOut > 0) {
    filters.push(`afade=t=out:st=${ffNumber(Math.max(0, Number(window) - fadeOut))}:d=${ffNumber(fadeOut)}:curve=qsin`);
  }
  filters.push(
    `apad=pad_dur=${window}`,
    `atrim=duration=${window}`,
    'asetpts=PTS-STARTPTS',
    `aformat=sample_rates=${settings.sampleRate}:channel_layouts=stereo`,
  );

  args.push(
    '-filter:a', filters.join(','),
    '-map', mode === 'bed' ? '0:a:0' : (segment.audio?.stream || '0:a:0'),
    '-c:a', 'pcm_s24le', '-ar', String(settings.sampleRate), '-ac', '2',
    '-t', window,
    outputPath,
  );
  run(FFMPEG, args);
}

// Ident plates already carry finished audio; lift it out so the mix graph can
// treat every segment the same way.
function extractSegmentAudio(sourceMkv, settings, outputPath) {
  run(FFMPEG, [
    '-hide_banner', '-y', '-i', sourceMkv,
    '-map', '0:a:0',
    '-c:a', 'pcm_s24le', '-ar', String(settings.sampleRate), '-ac', '2',
    outputPath,
  ]);
}

function renderSegments(timeline) {
  const rendered = [];
  const sourceMetadata = {};

  timeline.segments.forEach((segment, index) => {
    const outputPath = path.join(
      SEGMENT_DIR,
      `${String(index + 1).padStart(2, '0')}-${segment.id}.mkv`,
    );
    console.log(`\n[${index + 1}/${timeline.segments.length}] Rendering ${segment.id}`);

    if (segment.kind === 'intro') {
      renderWordmarkIntro(segment, timeline.settings, outputPath);
    } else if (segment.kind === 'outro') {
      renderWordmarkOutro(segment, timeline.settings, outputPath);
    } else {
      renderSourceSegment(segment, timeline.settings, outputPath);
      if (!sourceMetadata[segment.source]) {
        sourceMetadata[segment.source] = probeJson(sourcePath(segment.source));
      }
    }
    if (segment.audio?.source && !sourceMetadata[segment.audio.source]) {
      sourceMetadata[segment.audio.source] = probeJson(sourcePath(segment.audio.source));
    }

    // The compose stage derives every xfade offset from these requested
    // durations, so a short segment would truncate the programme without any
    // error. Check here, where the message can still name the segment.
    const actual = probeDuration(outputPath);
    const nominal = Number(segment.duration);
    const tolerance = 1 / Number(timeline.settings.fps || 60);
    if (actual + tolerance < nominal) {
      throw new Error(
        `Segment ${segment.id} rendered ${actual.toFixed(3)}s but the timeline ` +
        `asks for ${nominal.toFixed(3)}s. Check the source in-point and length.`,
      );
    }

    const shape = audioShape(segment, timeline.segments[index - 1]);
    const audioPath = segmentAudioPath(index, segment);
    if ((segment.kind === 'intro' || segment.kind === 'outro') &&
        !segment.audio?.source && segment.audio?.mode !== 'silence') {
      extractSegmentAudio(outputPath, timeline.settings, audioPath);
    } else {
      renderSegmentAudio(segment, timeline.settings, shape, audioPath);
    }

    rendered.push({ ...segment, outputPath, audioPath, audioShape: shape });
  });

  return { rendered, sourceMetadata };
}

function pictureTransition(segment, settings = {}) {
  const transition = segment.transitionIn || { type: 'fade', duration: 0.1 };
  const requested = Number(transition.duration ?? 0);
  if (!Number.isFinite(requested) || requested < 0) {
    throw new Error(`Invalid transition duration for segment ${segment.id}.`);
  }
  if (transition.type === 'cut') {
    if (requested !== 0) throw new Error(`Cut transition must have duration 0: ${segment.id}.`);
    return { type: 'cut', duration: 0 };
  }
  return {
    type: transition.type || 'fade',
    duration: Math.max(1 / Number(settings.fps || 60), requested),
  };
}

function resolveTimelineStarts(segments, settings = {}) {
  let compositeDuration = Number(segments[0].duration);
  const resolved = [{ ...segments[0], timelineStart: 0 }];

  for (let index = 1; index < segments.length; index += 1) {
    const segment = segments[index];
    const transitionDuration = pictureTransition(segment, settings).duration;
    const start = compositeDuration - transitionDuration;
    resolved.push({ ...segment, timelineStart: start });
    compositeDuration = start + Number(segment.duration);
  }

  return { resolved, duration: compositeDuration };
}

function buildComposeFilter(resolved, settings) {
  const filters = [];
  const count = resolved.length;
  resolved.forEach((segment, index) => {
    filters.push(
      `[${index}:v]fps=${settings.fps},format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v${index}]`,
    );
  });

  let videoLabel = 'v0';
  let compositeDuration = Number(resolved[0].duration);

  for (let index = 1; index < count; index += 1) {
    const segment = resolved[index];
    const transition = pictureTransition(segment, settings);
    const duration = transition.duration;
    const offset = compositeDuration - duration;
    const nextVideo = `vx${index}`;
    if (transition.type === 'cut') {
      filters.push(
        `[${videoLabel}][v${index}]concat=n=2:v=1:a=0,settb=AVTB[${nextVideo}]`,
      );
    } else {
      filters.push(
        `[${videoLabel}][v${index}]xfade=transition=${transition.type}:duration=${ffNumber(duration)}:offset=${ffNumber(offset)}[${nextVideo}]`,
      );
    }
    videoLabel = nextVideo;
    compositeDuration = offset + Number(segment.duration);
  }

  filters.push(`[${videoLabel}]trim=duration=${ffNumber(compositeDuration)},setpts=PTS-STARTPTS[vout]`);

  // Audio is placed, not chained. Each segment's handled render is delayed to
  // its own start minus its head handle, so the fades sit on the handles and the
  // picture cut lands with both sounds already at level.
  const mixLabels = [];
  resolved.forEach((segment, index) => {
    const shape = segment.audioShape || { handleIn: 0 };
    const at = Math.max(0, Number(segment.timelineStart) - Number(shape.handleIn || 0));
    const delayMs = Math.round(at * 1000);
    const label = `m${index}`;
    const delay = delayMs > 0 ? `,adelay=${delayMs}:all=1` : '';
    filters.push(
      `[${count + index}:a]aresample=${settings.sampleRate},` +
      `aformat=sample_rates=${settings.sampleRate}:channel_layouts=stereo,` +
      `asetpts=PTS-STARTPTS${delay}[${label}]`,
    );
    mixLabels.push(`[${label}]`);
  });
  filters.push(
    `${mixLabels.join('')}amix=inputs=${count}:normalize=0:dropout_transition=0:duration=longest,` +
    `apad=pad_dur=${ffNumber(compositeDuration)},` +
    `atrim=duration=${ffNumber(compositeDuration)},asetpts=PTS-STARTPTS[aout]`,
  );
  return `${filters.join(';\n')}\n`;
}

function composeTimeline(resolved, timeline) {
  fs.writeFileSync(
    COMPOSE_FILTER_PATH,
    buildComposeFilter(resolved, timeline.settings),
    'utf8',
  );

  const args = ['-hide_banner', '-y', '-filter_complex_threads', '2'];
  for (const segment of resolved) {
    args.push('-threads', '2', '-i', segment.outputPath);
  }
  for (const segment of resolved) {
    args.push('-i', segment.audioPath);
  }
  args.push(
    '-filter_complex_script', COMPOSE_FILTER_PATH,
    '-map', '[vout]', '-map', '[aout]',
    ...intermediateVideoArgs(timeline.settings),
    '-c:a', 'pcm_s24le', '-ar', String(timeline.settings.sampleRate), '-ac', '2',
    ...frameRateModeArgs('cfr'),
    '-f', 'matroska',
    COMPOSED_PATH,
  );

  console.log('\nComposing timeline and transitions');
  run(FFMPEG, args);
}

function assTime(seconds) {
  const safe = Math.max(0, Number(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = Math.floor(safe % 60);
  const centis = Math.floor((safe - Math.floor(safe)) * 100 + 0.5);
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(Math.min(99, centis)).padStart(2, '0')}`;
}

function assColour(hex, alpha = '00') {
  const clean = hex.replace('#', '');
  const red = clean.slice(0, 2);
  const green = clean.slice(2, 4);
  const blue = clean.slice(4, 6);
  return `&H${alpha}${blue}${green}${red}&`;
}

function assText(value) {
  return String(value)
    .replace(/\\/g, '＼')
    .replace(/\{/g, '（')
    .replace(/\}/g, '）')
    .replace(/\r?\n/g, '\\N');
}

function eventLine(start, end, style, text, layer = 0) {
  return `Dialogue: ${layer},${assTime(start)},${assTime(end)},${style},,0,0,0,,${text}`;
}

// Ident geometry. The wordmark's optical box drives everything else: the rule
// and the signal field share its left and right edges, and the scan band is
// sized to contain the whole lockup. Keep these in one place so the intro, the
// outro and assets/branding/igor-wordmark.svg stay describable as one layout.
// The ident follows the site's hero rather than a centred title card: mono
// kicker in ice with wide tracking, the name set like the site's h1 -- Inter
// Tight 700 with negative tracking, broken over two lines -- then a mono meta
// line. Everything sits on the same left gutter the site uses, so the reel and
// igorszuniewicz.com read as one system instead of two.
const ASS_DESIGN_WIDTH = 1920;
const ASS_DESIGN_HEIGHT = 1080;

const IDENT_X0 = 150;
const IDENT_X1 = 1160;
const IDENT_KICKER_Y = 376;
const IDENT_LINE1_Y = 500;
const IDENT_LINE2_Y = 612;
const IDENT_RULE_Y = 692;
const IDENT_META_Y = 734;
const IDENT_TAG_Y = 776;
const IDENT_BAND_TOP = 326;
const IDENT_BAND_BOTTOM = 716;
const IDENT_EASE = 0.62;
// Time reserved at the tail of the ident for the lockup to fade out cleanly
// before the plate dissolves into the first shot.
const IDENT_EXIT = 0.45;

const OUTRO_X0 = 150;
const OUTRO_X1 = 1090;
const OUTRO_CENTRE_X = 150;
const OUTRO_FIRST_Y = 430;
const OUTRO_WORDMARK_Y = 512;
const OUTRO_RULE_Y = 578;
const OUTRO_META_Y = 618;
const OUTRO_URL_Y = 664;

function buildAss(resolved, duration, timeline) {
  if (timeline.style?.captionLayout === 'editorial') {
    return require('./editorial-captions.cjs')(resolved, duration, timeline);
  }
  const style = timeline.style;
  const paper = assColour(style.paper);
  const muted = assColour(style.muted);
  const ice = assColour(style.ice);
  const faint = assColour(style.faint);
  const deepOutline = assColour(style.deep, '64');
  const deepBox = assColour(style.deep, '55');
  const lines = [
    '[Script Info]',
    `Title: ${timeline.title}`,
    'ScriptType: v4.00+',
    // Every coordinate in this file is authored against 1920x1080, so PlayRes is
    // pinned rather than following the render size. libass then scales the whole
    // caption layer to whatever the output is, which keeps proxy renders honest
    // and makes a 4K master a settings change rather than a re-layout.
    `PlayResX: ${ASS_DESIGN_WIDTH}`,
    `PlayResY: ${ASS_DESIGN_HEIGHT}`,
    'WrapStyle: 2',
    'ScaledBorderAndShadow: yes',
    'YCbCr Matrix: TV.709',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    `Style: Kicker,IBM Plex Mono,19,${ice},${ice},${deepOutline},${deepBox},0,0,0,0,100,100,2.4,0,1,1.2,0,7,96,96,72,1`,
    `Style: Project,Inter Tight,74,${paper},${paper},${deepOutline},${deepBox},-1,0,0,0,100,100,-1.6,0,1,1.6,0,7,96,96,72,1`,
    `Style: Proof,Inter,25,${muted},${muted},${deepOutline},${deepBox},0,0,0,0,100,100,0,0,1,1.2,0,7,96,96,72,1`,
    `Style: Tag,IBM Plex Mono,15,${muted},${muted},${deepOutline},${deepBox},0,0,0,0,100,100,1.6,0,1,1.2,0,9,72,72,56,1`,
    `Style: IntroFirst,IBM Plex Mono,25,${ice},${ice},${deepOutline},${deepBox},0,0,0,0,100,100,10.0,0,1,0,0,7,96,96,72,1`,
    `Style: IntroWordmark,Inter Tight,168,${paper},${paper},${deepOutline},${deepBox},-1,0,0,0,100,100,-4.2,0,1,0,0,7,96,96,72,1`,
    `Style: IntroMeta,IBM Plex Mono,18,${muted},${muted},${deepOutline},${deepBox},0,0,0,0,100,100,2.4,0,1,0,0,7,96,96,72,1`,
    `Style: IntroTag,IBM Plex Mono,14,${faint},${faint},${deepOutline},${deepBox},0,0,0,0,100,100,2.4,0,1,0,0,7,96,96,72,1`,
    `Style: OutroFirst,IBM Plex Mono,22,${ice},${ice},${deepOutline},${deepBox},0,0,0,0,100,100,10.0,0,1,0,0,7,96,96,72,1`,
    `Style: OutroTitle,Inter Tight,120,${paper},${paper},${deepOutline},${deepBox},-1,0,0,0,100,100,-3.0,0,1,0,0,7,96,96,72,1`,
    `Style: OutroMeta,IBM Plex Mono,17,${muted},${muted},${deepOutline},${deepBox},0,0,0,0,100,100,2.2,0,1,0,0,7,96,96,72,1`,
    `Style: OutroUrl,IBM Plex Mono,19,${ice},${ice},${deepOutline},${deepBox},0,0,0,0,100,100,2.4,0,1,0,0,7,96,96,72,1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ];

  for (const segment of resolved) {
    const start = Number(segment.timelineStart);
    const end = Math.min(duration, start + Number(segment.duration));
    const caption = segment.caption;

    if (caption?.kind === 'intro') {
      const words = String(caption.title || '').trim().split(/\s+/);
      const firstName = words.shift() || 'IGOR';
      const lastName = words.join(' ') || 'SZUNIEWICZ';

      // One scan, one easing curve. Every element below is revealed by the same
      // animated clip rectangle, so the reveal can never drift out of step with
      // the bar that is supposed to be causing it.
      const scanFrom = IDENT_X0 - 34;
      const scanTo = IDENT_X1 + 40;
      const t0 = Math.round(IDENT_SCAN_START * 1000);
      const t1 = Math.round(IDENT_LAND * 1000);
      const bandTop = IDENT_BAND_TOP;
      const bandBottom = IDENT_BAND_BOTTOM;
      const revealed = () =>
        `\\clip(${scanFrom},${bandTop},${scanFrom},${bandBottom})` +
        `\\t(${t0},${t1},${IDENT_EASE},\\clip(${scanFrom},${bandTop},${scanTo},${bandBottom}))`;

      const holdEnd = start + Number(segment.duration) - IDENT_EXIT;
      const landAt = start + IDENT_LAND;

      lines.push(eventLine(
        start, holdEnd, 'IntroFirst',
        `{\\an4\\pos(${IDENT_X0},${IDENT_KICKER_Y})${revealed()}\\fad(0,320)}` +
          `${assText(caption.meta)}`,
        4,
      ));
      lines.push(eventLine(
        start, holdEnd, 'IntroWordmark',
        `{\\an4\\pos(${IDENT_X0},${IDENT_LINE1_Y})${revealed()}\\fad(0,320)}` +
          `${assText(firstName)}`,
        5,
      ));
      lines.push(eventLine(
        start, holdEnd, 'IntroWordmark',
        `{\\an4\\pos(${IDENT_X0},${IDENT_LINE2_Y})${revealed()}\\fad(0,320)}` +
          `${assText(lastName)}`,
        5,
      ));
      lines.push(eventLine(
        start, holdEnd, 'Kicker',
        `{\\an7\\pos(0,0)\\p1\\c${ice}\\1a&HC0&${revealed()}\\fad(0,320)}` +
          `m ${IDENT_X0} ${IDENT_RULE_Y} l ${IDENT_X1} ${IDENT_RULE_Y} ` +
          `l ${IDENT_X1} ${IDENT_RULE_Y + 2} l ${IDENT_X0} ${IDENT_RULE_Y + 2}`,
        3,
      ));

      // The bar: the same plate seen through a travelling slit on the identical
      // curve, so bar position and reveal edge are the same edge by construction.
      const slit = (halfWidth, alpha, blur) => {
        const from = `\\clip(${scanFrom - halfWidth},${bandTop - 8},` +
          `${scanFrom + halfWidth},${bandBottom + 8})`;
        const to = `\\clip(${scanTo - halfWidth},${bandTop - 8},` +
          `${scanTo + halfWidth},${bandBottom + 8})`;
        return `{\\an7\\pos(0,0)\\p1\\c${ice}\\1a&H${alpha}&${blur}` +
          `${from}\\t(${t0},${t1},${IDENT_EASE},${to})\\fad(70,110)}` +
          `m 0 ${bandTop - 8} l 1920 ${bandTop - 8} ` +
          `l 1920 ${bandBottom + 8} l 0 ${bandBottom + 8}`;
      };
      lines.push(eventLine(start, landAt + 0.1, 'Kicker', slit(11, 'E8', '\\blur9'), 6));
      lines.push(eventLine(start, landAt + 0.08, 'Kicker', slit(2, '20', '\\blur0.8'), 7));

      lines.push(eventLine(
        landAt, landAt + 0.42, 'Kicker',
        `{\\an7\\pos(0,0)\\p1\\c${paper}\\1a&H70&\\fad(0,360)\\blur1.5}` +
          `m ${IDENT_X0} ${IDENT_RULE_Y} l ${IDENT_X1} ${IDENT_RULE_Y} ` +
          `l ${IDENT_X1} ${IDENT_RULE_Y + 2} l ${IDENT_X0} ${IDENT_RULE_Y + 2}`,
        4,
      ));

      // Second beat: the site's hero meta line, then the reel's own slug.
      lines.push(eventLine(
        landAt + 0.1, holdEnd, 'IntroMeta',
        `{\\an4\\pos(${IDENT_X0},${IDENT_META_Y})\\fad(200,320)}` +
          `${assText(caption.location || 'Kortrijk, Belgium · Howest DAE · Previously XR Labs Belgium')}`,
        5,
      ));
      lines.push(eventLine(
        landAt + 0.24, holdEnd, 'IntroTag',
        `{\\an4\\pos(${IDENT_X0},${IDENT_TAG_Y})\\fad(220,320)}${assText(caption.tag)}`,
        5,
      ));
    } else if (caption?.kind === 'outro') {
      const words = String(caption.title || '').trim().split(/\s+/);
      const firstName = words.shift() || 'IGOR';
      const lastName = words.join(' ') || 'SZUNIEWICZ';
      const captionEnd = end - 0.12;

      // The outro answers the intro: same lockup, same rule, no scan. It simply
      // resolves, because by this point the mark has already been established.
      lines.push(eventLine(
        start + 0.24, captionEnd, 'OutroFirst',
        `{\\an4\\pos(${OUTRO_X0},${OUTRO_FIRST_Y})\\fad(300,420)}${assText(caption.meta)}`,
        5,
      ));
      lines.push(eventLine(
        start + 0.3, captionEnd, 'OutroTitle',
        `{\\an4\\pos(${OUTRO_X0},${OUTRO_WORDMARK_Y})\\fad(340,420)}${assText(firstName)} ${assText(lastName)}`,
        5,
      ));
      lines.push(eventLine(
        start + 0.46, captionEnd, 'Kicker',
        `{\\an7\\pos(0,0)\\p1\\c${ice}\\1a&HC0&\\fad(340,420)` +
          `\\clip(${OUTRO_X0},${OUTRO_RULE_Y - 4},${OUTRO_X0},${OUTRO_RULE_Y + 6})` +
          `\\t(0,520,${IDENT_EASE},\\clip(${OUTRO_X0},${OUTRO_RULE_Y - 4},` +
          `${OUTRO_X1},${OUTRO_RULE_Y + 6}))}` +
          `m ${OUTRO_X0} ${OUTRO_RULE_Y} l ${OUTRO_X1} ${OUTRO_RULE_Y} ` +
          `l ${OUTRO_X1} ${OUTRO_RULE_Y + 2} l ${OUTRO_X0} ${OUTRO_RULE_Y + 2}`,
        4,
      ));
      lines.push(eventLine(
        start + 0.68, captionEnd, 'OutroMeta',
        `{\\an4\\pos(${OUTRO_X0},${OUTRO_META_Y})\\fad(320,420)}${assText(caption.location || 'Kortrijk, Belgium · Howest DAE')}`,
        5,
      ));
      lines.push(eventLine(
        start + 0.92, captionEnd, 'OutroUrl',
        `{\\an4\\pos(${OUTRO_X0},${OUTRO_URL_Y})\\fad(340,420)}${assText(caption.url)}`,
        5,
      ));
    } else if (caption) {
      const captionStart = start + 0.18;
      const captionEnd = Math.min(duration - 0.08, start + Number(caption.showFor || 4.2));
      const accent = assColour(caption.accent || style.ice);
      const x = IDENT_X0;

      // A soft pad under the block. Thin outlines alone cannot keep white type
      // stable over bright footage; this is the standard broadcast fix, and on
      // the dark segments it stays invisible. Three stacked boxes approximate a
      // gradient, and each runs past the frame edges so the only boundary the
      // viewer can see is the blurred falloff, never a rectangle.
      const scrim = [
        { top: 690, right: 1420, alpha: 'B4', blur: 90 },
        { top: 790, right: 1320, alpha: 'A6', blur: 80 },
        { top: 880, right: 1240, alpha: '96', blur: 70 },
      ];
      scrim.forEach((layer, index) => {
        lines.push(eventLine(
          captionStart - 0.12,
          captionEnd + 0.12,
          'Kicker',
          `{\\an7\\pos(0,0)\\p1\\c${assColour(style.deep)}\\1a&H${layer.alpha}&` +
            `\\blur${layer.blur}\\fad(240,260)}` +
            `m -320 ${layer.top} l ${layer.right} ${layer.top} ` +
            `l ${layer.right} 1220 l -320 1220`,
          index,
        ));
      });

      lines.push(eventLine(
        captionStart,
        captionEnd,
        'Kicker',
        `{\\an7\\pos(${x},788)\\fad(160,140)\\p1\\c${accent}}m 0 0 l 620 0 l 620 2 l 0 2`,
        3,
      ));
      lines.push(eventLine(
        captionStart + 0.05,
        captionEnd,
        'Kicker',
        `{\\an7\\move(${x - 12},810,${x},810,0,220)\\fad(160,150)\\c${accent}}` +
          `${assText(caption.kicker)}`,
        5,
      ));
      lines.push(eventLine(
        captionStart + 0.12,
        captionEnd,
        'Project',
        `{\\an7\\move(${x - 14},848,${x},848,0,240)\\fad(170,150)}${assText(caption.title)}`,
        5,
      ));
      lines.push(eventLine(
        captionStart + 0.2,
        captionEnd,
        'Proof',
        `{\\an7\\move(${x - 12},942,${x},942,0,220)\\fad(180,140)}${assText(caption.proof)}`,
        5,
      ));
    }

    if (segment.tag) {
      const tagEnd = Math.min(
        end - 0.08,
        start + Number(segment.tagShowFor || segment.duration),
      );
      lines.push(eventLine(
        start + 0.1,
        Math.max(start + 0.2, tagEnd),
        'Tag',
        `{\\an9\\pos(1770,64)\\fad(120,110)}${assText(segment.tag)}`,
        6,
      ));
    }
  }

  return `${lines.join('\n')}\n`;
}

function postMasterVolumeFilters(resolved) {
  return resolved
    .filter((segment) => Number.isFinite(Number(segment.postMasterGainDb)))
    .map((segment) => {
      const gain = Math.pow(10, Number(segment.postMasterGainDb) / 20);
      const depth = 1 - gain;
      const start = Number(segment.timelineStart);
      const end = start + Number(segment.duration);
      const requestedFade = Number(segment.postMasterFade || 0.25);
      const fade = Math.min(requestedFade, Number(segment.duration) / 3);
      const fadeInEnd = start + fade;
      const fadeOutStart = end - fade;
      const envelope = [
        `between(t\\,${ffNumber(start)}\\,${ffNumber(fadeInEnd)})*` +
          `(t-${ffNumber(start)})/${ffNumber(fade)}`,
        `between(t\\,${ffNumber(fadeInEnd)}\\,${ffNumber(fadeOutStart)})`,
        `between(t\\,${ffNumber(fadeOutStart)}\\,${ffNumber(end)})*` +
          `(${ffNumber(end)}-t)/${ffNumber(fade)}`,
      ].join('+');
      const expression = `1-${ffNumber(depth)}*(${envelope})`;
      const safeExpression = `if(isnan(t)\\,1\\,${expression})`;
      return `volume=volume='${safeExpression}':eval=frame`;
    });
}

function renderFinal(timeline, resolvedDuration, resolved) {
  const firstPass = measureLoudness(
    COMPOSED_PATH,
    timeline.settings.targetLufs,
    timeline.settings.targetLra,
    timeline.settings.truePeakDb,
  );

  const loudnormFilter = [
    `loudnorm=I=${timeline.settings.targetLufs}`,
    `LRA=${timeline.settings.targetLra}`,
    `TP=${timeline.settings.truePeakDb}`,
    `measured_I=${firstPass.input_i}`,
    `measured_LRA=${firstPass.input_lra}`,
    `measured_TP=${firstPass.input_tp}`,
    `measured_thresh=${firstPass.input_thresh}`,
    `offset=${firstPass.target_offset}`,
    'linear=true',
    'print_format=summary',
  ].join(':');
  const audioFilter = [
    loudnormFilter,
    ...postMasterVolumeFilters(resolved),
    `aresample=${timeline.settings.sampleRate}`,
  ].join(',');

  const assRelative = path.relative(REPO_ROOT, CAPTIONS_PATH).replace(/\\/g, '/');
  const fontsRelative = path.relative(REPO_ROOT, FONT_DIR).replace(/\\/g, '/');
  const filter = [
    `[0:v]ass=filename='${assRelative}':fontsdir='${fontsRelative}',format=yuv420p[v];`,
    `[0:a]${audioFilter}[a]`,
  ].join('');
  const videoRateArgs = ['-crf', String(timeline.settings.deliveryCrf)];
  if (timeline.settings.deliveryMaxrateKbps) {
    videoRateArgs.push(
      '-maxrate', `${timeline.settings.deliveryMaxrateKbps}k`,
      '-bufsize', `${timeline.settings.deliveryBufsizeKbps ||
        timeline.settings.deliveryMaxrateKbps * 2}k`,
    );
  }
  const audioBitrateKbps = timeline.settings.deliveryAudioBitrateKbps || 256;

  console.log('\nBurning captions and applying final two-pass loudness normalization');
  run(FFMPEG, [
    '-hide_banner', '-y', '-filter_complex_threads', '2', '-threads', '2',
    '-i', COMPOSED_PATH,
    '-filter_complex', filter,
    '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-threads', '6',
    '-preset', timeline.settings.deliveryPreset || 'slower',
    ...videoRateArgs,
    '-profile:v', 'high',
    '-level:v', Number(timeline.settings.fps) >= 50 ? '4.2' : '4.1',
    '-pix_fmt', 'yuv420p',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
    '-colorspace', 'bt709',
    '-color_range', 'tv',
    '-c:a', 'aac',
    '-b:a', `${audioBitrateKbps}k`,
    '-ar', String(timeline.settings.sampleRate),
    '-ac', '2',
    '-movflags', '+faststart',
    '-metadata', `title=${timeline.title}`,
    '-metadata', 'artist=Igor Szuniewicz',
    '-metadata', `comment=Rendered from ${path.relative(REPO_ROOT, TIMELINE_PATH).replace(/\\/g, '/')}`,
    '-t', ffNumber(resolvedDuration),
    FINAL_PATH,
  ]);

  const deliveredDuration = probeDuration(FINAL_PATH);
  if (Math.abs(deliveredDuration - resolvedDuration) > 0.25) {
    throw new Error(
      `Delivered ${deliveredDuration.toFixed(2)}s but the timeline resolves to ` +
      `${Number(resolvedDuration).toFixed(2)}s. The transition chain dropped ` +
      'material; do not publish this render.',
    );
  }

  const finalMeasure = measureLoudness(
    FINAL_PATH,
    timeline.settings.targetLufs,
    timeline.settings.targetLra,
    timeline.settings.truePeakDb,
  );
  return { firstPass, finalMeasure };
}

function createContactSheet(resolved, duration, fps) {
  const fontRelative = path
    .relative(REPO_ROOT, path.join(FONT_DIR, 'Inter.ttf'))
    .replace(/\\/g, '/');
  const sampleTimes = resolved
    .filter((segment) => segment.caption)
    .map((segment) => {
      const sampleOffset = segment.kind === 'intro'
        ? Math.min(2.2, Number(segment.duration) / 2)
        : Math.min(0.55, Number(segment.duration) / 2);
      return Math.min(duration - 0.1, Number(segment.timelineStart) + sampleOffset);
    });
  sampleTimes.push(duration * 0.44, duration * 0.85);
  const frames = [...new Set(
    sampleTimes
      .sort((left, right) => left - right)
      .slice(0, 12)
      .map((seconds) => Math.max(0, Math.round(seconds * fps))),
  )];
  const selection = frames.map((frame) => `eq(n\\,${frame})`).join('+');
  const filter = [
    `select='${selection}'`,
    `drawtext=fontfile='${fontRelative}':text='%{pts\\:hms}':x=28:y=28:` +
      'fontsize=38:fontcolor=white:box=1:boxcolor=black@0.62:boxborderw=10',
    'scale=480:270:force_original_aspect_ratio=decrease',
    'pad=480:270:(ow-iw)/2:(oh-ih)/2:black',
    'tile=4x3',
  ].join(',');

  run(FFMPEG, [
    '-hide_banner', '-y',
    '-i', FINAL_PATH,
    '-vf', filter,
    '-frames:v', '1',
    '-update', '1',
    '-q:v', '2',
    CONTACT_SHEET_PATH,
  ]);
}

function createPoster(resolved, duration) {
  const intro = resolved.find((segment) => segment.kind === 'intro') || resolved[0];
  const introStart = Number(intro?.timelineStart || 0);
  const introDuration = Number(intro?.duration || 0);
  const posterTime = Math.min(
    duration - 0.1,
    introStart + Math.max(0, Math.min(2.2, introDuration - 0.3)),
  );

  run(FFMPEG, [
    '-hide_banner', '-y',
    '-ss', ffNumber(posterTime),
    '-i', FINAL_PATH,
    '-frames:v', '1',
    '-update', '1',
    '-q:v', '2',
    POSTER_PATH,
  ]);
}

function collectSourceMetadata(timeline) {
  const sourceMetadata = {};
  for (const segment of timeline.segments) {
    for (const source of [segment.source, segment.audio?.source]) {
      if (source && !sourceMetadata[source]) {
        sourceMetadata[source] = probeJson(sourcePath(source));
      }
    }
  }
  return sourceMetadata;
}

function writeReport(timeline, resolved, duration, sourceMetadata, loudness) {
  const outputProbe = probeJson(FINAL_PATH);
  const report = {
    generatedAt: new Date().toISOString(),
    title: timeline.title,
    settings: timeline.settings,
    compositionFingerprint: compositionFingerprint(timeline),
    delivery: {
      path: path.relative(REPO_ROOT, FINAL_PATH).replace(/\\/g, '/'),
      duration,
      targetLufs: timeline.settings.targetLufs,
      targetLra: timeline.settings.targetLra,
      truePeakDb: timeline.settings.truePeakDb,
      firstPass: loudness.firstPass,
      encodedMeasurement: loudness.finalMeasure,
      probe: outputProbe,
    },
    resolvedTimeline: resolved.map((segment) => ({
      id: segment.id,
      timelineStart: Number(segment.timelineStart.toFixed(3)),
      duration: segment.duration,
      source: segment.source || null,
      sourceIn: segment.in ?? null,
      audio: segment.audio || null,
      postMasterGainDb: segment.postMasterGainDb ?? null,
      postMasterFade: segment.postMasterFade ?? null,
      transitionIn: segment.transitionIn || null,
    })),
    sourceMetadata,
  };
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function main() {
  ensureTools();
  ensureFonts();
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const timeline = loadTimeline();

  // Iterating on the ident should not cost a full programme render. This path
  // rebuilds only the intro (or outro) segment with its captions burned in and
  // writes a small preview plus a frame grid next to it.
  const identArg = process.argv.find((value) => value === '--ident-only' || value === '--outro-only');
  if (identArg) {
    const wanted = identArg === '--outro-only' ? 'outro' : 'intro';
    const segment = timeline.segments.find((entry) => entry.kind === wanted);
    if (!segment) {
      throw new Error(`No ${wanted} segment in timeline.json.`);
    }
    fs.mkdirSync(SEGMENT_DIR, { recursive: true });
    const plate = path.join(SEGMENT_DIR, `preview-${wanted}.mkv`);
    if (wanted === 'intro') {
      renderWordmarkIntro(segment, timeline.settings, plate);
    } else {
      renderWordmarkOutro(segment, timeline.settings, plate);
    }
    const resolved = [{ ...segment, timelineStart: 0 }];
    const assPath = path.join(BUILD_DIR, `preview-${wanted}.ass`);
    fs.writeFileSync(
      assPath,
      buildAss(resolved, Number(segment.duration), timeline),
      'utf8',
    );
    const previewPath = path.join(OUTPUT_DIR, `preview-${wanted}.mp4`);
    const gridPath = path.join(OUTPUT_DIR, `preview-${wanted}-frames.jpg`);
    const assRelative = path.relative(REPO_ROOT, assPath).replace(/\\/g, '/');
    const fontsRelative = path.relative(REPO_ROOT, FONT_DIR).replace(/\\/g, '/');
    run(FFMPEG, [
      '-hide_banner', '-y', '-i', plate,
      '-vf', `ass=filename='${assRelative}':fontsdir='${fontsRelative}',format=yuv420p`,
      '-c:v', 'libx264', '-preset', timeline.settings.deliveryPreset || 'slower', '-crf', '16',
      '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
      previewPath,
    ]);
    run(FFMPEG, [
      '-hide_banner', '-y', '-i', previewPath,
      '-vf', "select='not(mod(n,4))',scale=640:-1,tile=5x8",
      '-frames:v', '1', gridPath,
    ]);
    console.log(`Ident preview: ${previewPath}`);
    console.log(`Frame grid: ${gridPath}`);
    return;
  }

  if (process.argv.includes('--qa-only')) {
    if (!fs.existsSync(FINAL_PATH) || !fs.existsSync(COMPOSED_PATH)) {
      throw new Error('QA-only mode requires an existing final render and build/timeline.mkv.');
    }
    assertCompositionIsCurrent(timeline, 'showreel:qa');
    const { resolved, duration } = resolveTimelineStarts(timeline.segments, timeline.settings);
    const loudness = {
      firstPass: measureLoudness(
        COMPOSED_PATH,
        timeline.settings.targetLufs,
        timeline.settings.targetLra,
        timeline.settings.truePeakDb,
      ),
      finalMeasure: measureLoudness(
        FINAL_PATH,
        timeline.settings.targetLufs,
        timeline.settings.targetLra,
        timeline.settings.truePeakDb,
      ),
    };
    createPoster(resolved, duration);
    createContactSheet(resolved, duration, timeline.settings.fps);
    writeReport(
      timeline,
      resolved,
      duration,
      collectSourceMetadata(timeline),
      loudness,
    );
    console.log(`QA outputs refreshed: ${CONTACT_SHEET_PATH}`);
    console.log(`Encoded loudness: ${loudness.finalMeasure.input_i} LUFS, ` +
      `${loudness.finalMeasure.input_tp} dBTP, LRA ${loudness.finalMeasure.input_lra} LU`);
    return;
  }

  if (process.argv.includes('--master-only')) {
    if (!fs.existsSync(COMPOSED_PATH)) {
      throw new Error('Master-only mode requires build/timeline.mkv.');
    }
    assertCompositionIsCurrent(timeline, 'showreel:master');
    const { resolved, duration } = resolveTimelineStarts(timeline.segments, timeline.settings);
    fs.writeFileSync(
      CAPTIONS_PATH,
      buildAss(resolved, duration, timeline),
      'utf8',
    );
    const loudness = renderFinal(timeline, duration, resolved);
    createPoster(resolved, duration);
    createContactSheet(resolved, duration, timeline.settings.fps);
    writeReport(
      timeline,
      resolved,
      duration,
      collectSourceMetadata(timeline),
      loudness,
    );
    console.log(`Master refreshed: ${FINAL_PATH}`);
    console.log(`Encoded loudness: ${loudness.finalMeasure.input_i} LUFS, ` +
      `${loudness.finalMeasure.input_tp} dBTP, LRA ${loudness.finalMeasure.input_lra} LU`);
    return;
  }

  prepareBuild();
  fs.mkdirSync(SEGMENT_DIR, { recursive: true });
  const { rendered, sourceMetadata } = renderSegments(timeline);
  const { resolved, duration } = resolveTimelineStarts(rendered, timeline.settings);

  fs.writeFileSync(
    CAPTIONS_PATH,
    buildAss(resolved, duration, timeline),
    'utf8',
  );
  composeTimeline(resolved, timeline);
  const loudness = renderFinal(timeline, duration, resolved);
  createPoster(resolved, duration);
  createContactSheet(resolved, duration, timeline.settings.fps);
  writeReport(timeline, resolved, duration, sourceMetadata, loudness);

  console.log('\nShowreel render complete.');
  console.log(`Final: ${FINAL_PATH}`);
  console.log(`Poster: ${POSTER_PATH}`);
  console.log(`Contact sheet: ${CONTACT_SHEET_PATH}`);
  console.log(`Report: ${REPORT_PATH}`);
  console.log(
    `Encoded loudness: ${loudness.finalMeasure.input_i} LUFS, ` +
    `${loudness.finalMeasure.input_tp} dBTP, LRA ${loudness.finalMeasure.input_lra} LU`,
  );
}

if (require.main === module) main();

module.exports = { editionPaths, audioShape, pictureTransition, resolveTimelineStarts, buildComposeFilter };
