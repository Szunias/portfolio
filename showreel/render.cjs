/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const PROJECT_DIR = __dirname;
const BUILD_DIR = path.join(PROJECT_DIR, 'build');
const SEGMENT_DIR = path.join(BUILD_DIR, 'segments');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'output');
const FONT_DIR = path.join(PROJECT_DIR, 'assets', 'fonts');
const TIMELINE_PATH = path.join(PROJECT_DIR, 'timeline.json');
const CAPTIONS_PATH = path.join(BUILD_DIR, 'captions.ass');
const COMPOSE_FILTER_PATH = path.join(BUILD_DIR, 'compose.ffscript');
const COMPOSED_PATH = path.join(BUILD_DIR, 'timeline.mkv');
const FINAL_PATH = path.join(OUTPUT_DIR, 'igor-szuniewicz-showreel-2026.mp4');
const POSTER_PATH = path.join(OUTPUT_DIR, 'poster.jpg');
const CONTACT_SHEET_PATH = path.join(OUTPUT_DIR, 'contact-sheet.jpg');
const REPORT_PATH = path.join(OUTPUT_DIR, 'render-report.json');

const FFMPEG = process.env.FFMPEG_BIN || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_BIN || 'ffprobe';

function assertSafeBuildPath(target) {
  const resolved = path.resolve(target);
  const projectPrefix = `${path.resolve(PROJECT_DIR)}${path.sep}`;
  if (!resolved.startsWith(projectPrefix) || path.basename(resolved) !== 'build') {
    throw new Error(`Refusing to remove unexpected path: ${resolved}`);
  }
}

function cleanBuild() {
  assertSafeBuildPath(BUILD_DIR);
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}

if (process.argv.includes('--clean')) {
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

function ensureTools() {
  run(FFMPEG, ['-version'], { capture: true });
  run(FFPROBE, ['-version'], { capture: true });
}

function loadTimeline() {
  const value = JSON.parse(fs.readFileSync(TIMELINE_PATH, 'utf8'));
  if (!Array.isArray(value.segments) || value.segments.length < 2) {
    throw new Error('timeline.json must contain at least two segments.');
  }
  return value;
}

function ensureFonts() {
  const required = [
    'InterTight.ttf',
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
    '-preset', 'medium',
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

  if (segment.fit === 'contain') {
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

  common.push('setsar=1', 'format=yuv420p');
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
    filters.push(`alimiter=limit=${ffNumber(limit)}:attack=5:release=80:level=false`);
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

function introBodyAudioSource(duration, sampleRate) {
  const onsetLeft = 1.42;
  const onsetRight = 1.429;
  const body = (onset, phase) => [
    `0.055*gte(t,${onset})*(1-exp(-110*(t-${onset})))*exp(-2.35*(t-${onset}))*sin(2*PI*73.42*(t-${onset})+${phase})`,
    `0.075*gte(t,${onset})*(1-exp(-100*(t-${onset})))*exp(-2.2*(t-${onset}))*sin(2*PI*110*(t-${onset})+${phase + 0.08})`,
    `0.18*gte(t,${onset})*(1-exp(-95*(t-${onset})))*exp(-2.05*(t-${onset}))*sin(2*PI*146.83*(t-${onset})+${phase + 0.15})`,
    `0.13*gte(t,${onset})*(1-exp(-90*(t-${onset})))*exp(-2.35*(t-${onset}))*sin(2*PI*293.66*(t-${onset})+${phase + 0.31})`,
    `0.045*gte(t,${onset})*(1-exp(-85*(t-${onset})))*exp(-2.8*(t-${onset}))*sin(2*PI*587.33*(t-${onset})+${phase + 0.48})`,
  ].join('+');
  const left = body(onsetLeft, 0).replaceAll(',', '\\,');
  const right = body(onsetRight, 0.09).replaceAll(',', '\\,');
  return `aevalsrc=${left}|${right}:s=${sampleRate}:d=${duration}`;
}

function introSparkAudioSource(duration, sampleRate) {
  const spark = (offset, phase) => [
    `0.03*gte(t,${0.62 + offset})*exp(-22*(t-${0.62 + offset}))*sin(2*PI*920*(t-${0.62 + offset})+${phase})`,
    `0.036*gte(t,${0.84 + offset})*exp(-24*(t-${0.84 + offset}))*sin(2*PI*1260*(t-${0.84 + offset})+${phase + 0.12})`,
    `0.045*gte(t,${1.08 + offset})*exp(-27*(t-${1.08 + offset}))*sin(2*PI*1710*(t-${1.08 + offset})+${phase + 0.24})`,
    `0.09*gte(t,${1.43 + offset})*exp(-10*(t-${1.43 + offset}))*sin(2*PI*2280*(t-${1.43 + offset})+${phase + 0.34})`,
    `0.026*gte(t,${1.78 + offset})*exp(-30*(t-${1.78 + offset}))*sin(2*PI*1510*(t-${1.78 + offset})+${phase + 0.1})`,
    `0.02*gte(t,${2.04 + offset})*exp(-32*(t-${2.04 + offset}))*sin(2*PI*1790*(t-${2.04 + offset})+${phase + 0.2})`,
    `0.018*gte(t,${2.28 + offset})*exp(-34*(t-${2.28 + offset}))*sin(2*PI*2130*(t-${2.28 + offset})+${phase + 0.3})`,
    `0.05*between(t,${4.02 + offset},${4.3 + offset})*exp(-13*(t-${4.02 + offset}))*sin(2*PI*(1480+2200*(t-${4.02 + offset}))*(t-${4.02 + offset})+${phase + 0.44})`,
  ].join('+');
  const left = spark(0, 0).replaceAll(',', '\\,');
  const right = spark(0.008, 0.08).replaceAll(',', '\\,');
  return `aevalsrc=${left}|${right}:s=${sampleRate}:d=${duration}`;
}

function renderIntro(segment, settings, outputPath) {
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
    `alimiter=limit=0.48:attack=3:release=90:level=false,`,
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

function renderOutro(segment, settings, outputPath) {
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
    'alimiter=limit=0.35:attack=2:release=40:level=false,',
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
function renderWordmarkIntro(segment, settings, outputPath) {
  const duration = ffNumber(segment.duration);
  const audioFadeOutStart = ffNumber(Math.max(0, segment.duration - 0.42));
  const gradient = [
    `gradients=s=${settings.width}x${settings.height}`,
    `r=${settings.fps}`,
    `d=${duration}`,
    'c0=0x050506',
    'c1=0x0B0B0D',
    'c2=0x10141A',
    'n=3',
    'x0=0',
    'y0=0',
    `x1=${settings.width}`,
    `y1=${settings.height}`,
    'speed=0.004',
    'type=linear',
  ].join(':');
  const signalPlate = [
    `color=c=black@0.0:s=${settings.width}x${settings.height}`,
    `r=${settings.fps}`,
    `d=${duration}`,
  ].join(':');
  const filaments = Array.from({ length: 58 }, (_, index) => {
    const x = 252 + index * 25;
    const wave = Math.abs(Math.sin(index * 0.71) * 0.58 + Math.cos(index * 0.27) * 0.42);
    const height = Math.round(36 + wave * 258);
    const y = Math.round(520 - height / 2);
    const width = index % 9 === 0 ? 3 : 1;
    const alpha = (0.045 + (index % 7) * 0.009).toFixed(3);
    return `drawbox=x=${x}:y=${y}:w=${width}:h=${height}:color=0xAAC6DE@${alpha}:t=fill`;
  }).join(',');
  const filter = [
    `[0:v]format=rgba,eq=contrast=1.1:brightness=-0.055:saturation=0.62,` +
      `vignette=PI/4.2,fade=t=in:st=0:d=0.28[base];`,
    `[1:v]format=rgba,colorchannelmixer=aa=0,${filaments},` +
      `fade=t=in:st=0.26:d=0.58:alpha=1,` +
      `fade=t=out:st=3.62:d=0.58:alpha=1,gblur=sigma=0.55[signal];`,
    `[base][signal]overlay=x=0:y=0:shortest=1,` +
      `noise=alls=1.8:allf=t+u,format=yuv420p[v];`,
    `[2:a]highpass=f=44:poles=2,lowpass=f=6500,volume=0.92[body];`,
    `[3:a]pan=stereo|c0=c0|c1=c0,highpass=f=900,lowpass=f=6500,` +
      `volume='if(between(t\\,0.16\\,1.42)\\,0.1*pow((t-0.16)/1.26\\,1.7)\\,` +
      `if(between(t\\,1.42\\,4.12)\\,0.1*exp(-0.74*(t-1.42))\\,0))':` +
      `eval=frame[air];`,
    `[4:a]pan=stereo|c0=c0|c1=c0,highpass=f=240,lowpass=f=5600,` +
      `afade=t=out:st=0:d=0.2,volume=0.16,adelay=1420|1429[hit];`,
    `[5:a]highpass=f=620,lowpass=f=8800[spark];`,
    `[body][air][hit][spark]amix=inputs=4:normalize=0:dropout_transition=0,` +
      `aecho=0.8:0.72:68|124:0.09|0.038,volume=1.08,` +
      `highpass=f=44:poles=2,lowpass=f=9200,` +
      `alimiter=limit=0.48:attack=3:release=90:level=false,` +
      `afade=t=in:st=0:d=0.035,afade=t=out:st=${audioFadeOutStart}:d=0.36,` +
      `apad=pad_dur=${duration},atrim=duration=${duration},` +
      `aresample=${settings.sampleRate},` +
      `aformat=sample_rates=${settings.sampleRate}:channel_layouts=stereo[a]`,
  ].join('');

  run(FFMPEG, [
    '-hide_banner', '-y',
    '-f', 'lavfi', '-i', gradient,
    '-f', 'lavfi', '-i', signalPlate,
    '-f', 'lavfi', '-i', introBodyAudioSource(duration, settings.sampleRate),
    '-f', 'lavfi', '-i', `anoisesrc=c=white:r=${settings.sampleRate}:d=${duration}:a=0.5`,
    '-f', 'lavfi', '-i', `anoisesrc=c=white:r=${settings.sampleRate}:d=0.2:a=0.7`,
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
  const fadeOutStart = Math.max(0, segment.duration - 0.48);
  const gradient = [
    `gradients=s=${settings.width}x${settings.height}`,
    `r=${settings.fps}`,
    `d=${duration}`,
    'c0=0x050506',
    'c1=0x0B0B0D',
    'c2=0x10141A',
    'n=3',
    `x0=${settings.width}`,
    'y0=0',
    'x1=0',
    `y1=${settings.height}`,
    'speed=0.006',
    'type=linear',
  ].join(':');
  const filaments = Array.from({ length: 34 }, (_, index) => {
    const x = 534 + index * 25;
    const height = Math.round(24 + Math.abs(Math.sin(index * 0.82)) * 104);
    const y = Math.round(526 - height / 2);
    return `drawbox=x=${x}:y=${y}:w=1:h=${height}:color=0xAAC6DE@0.035:t=fill`;
  }).join(',');
  const filter = [
    `[0:v]format=rgba,${filaments},vignette=PI/4.2,` +
      `noise=alls=1.7:allf=t+u,fade=t=out:st=${ffNumber(fadeOutStart)}:d=0.46,` +
      `format=yuv420p[v];`,
    `[1:a]volume=0.78,highpass=f=90:poles=2,lowpass=f=7200,` +
      'aecho=0.8:0.28:48|96:0.14|0.06,adelay=250|259,' +
      'alimiter=limit=0.35:attack=2:release=40:level=false,' +
      `afade=t=in:st=0:d=0.16,afade=t=out:st=${ffNumber(segment.duration - 0.9)}:d=0.78,` +
      `apad=pad_dur=${duration},atrim=duration=${duration},` +
      `aresample=${settings.sampleRate}[a]`,
  ].join('');

  run(FFMPEG, [
    '-hide_banner', '-y',
    '-f', 'lavfi', '-i', gradient,
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
    '-fps_mode', 'cfr',
    '-avoid_negative_ts', 'make_zero',
    '-shortest',
    '-t', duration,
    '-f', 'matroska',
    outputPath,
  );

  run(FFMPEG, args);
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
      if (segment.audio?.source && !sourceMetadata[segment.audio.source]) {
        sourceMetadata[segment.audio.source] = probeJson(sourcePath(segment.audio.source));
      }
    }

    rendered.push({ ...segment, outputPath });
  });

  return { rendered, sourceMetadata };
}

function resolveTimelineStarts(segments) {
  let compositeDuration = Number(segments[0].duration);
  const resolved = [{ ...segments[0], timelineStart: 0 }];

  for (let index = 1; index < segments.length; index += 1) {
    const segment = segments[index];
    const transitionDuration = Number(segment.transitionIn?.duration || 0);
    const start = compositeDuration - transitionDuration;
    resolved.push({ ...segment, timelineStart: start });
    compositeDuration = start + Number(segment.duration);
  }

  return { resolved, duration: compositeDuration };
}

function buildComposeFilter(resolved, settings) {
  const filters = [];
  resolved.forEach((segment, index) => {
    filters.push(
      `[${index}:v]fps=${settings.fps},format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[v${index}]`,
    );
    filters.push(
      `[${index}:a]aresample=${settings.sampleRate},aformat=sample_rates=${settings.sampleRate}:channel_layouts=stereo,asetpts=PTS-STARTPTS[a${index}]`,
    );
  });

  let videoLabel = 'v0';
  let audioLabel = 'a0';
  let compositeDuration = Number(resolved[0].duration);

  for (let index = 1; index < resolved.length; index += 1) {
    const segment = resolved[index];
    const transition = segment.transitionIn || { type: 'fade', duration: 0.1 };
    const duration = Math.max(0.04, Number(transition.duration || 0.04));
    const offset = compositeDuration - duration;
    const nextVideo = `vx${index}`;
    const nextAudio = `ax${index}`;
    filters.push(
      `[${videoLabel}][v${index}]xfade=transition=${transition.type || 'fade'}:duration=${ffNumber(duration)}:offset=${ffNumber(offset)}[${nextVideo}]`,
    );
    filters.push(
      `[${audioLabel}][a${index}]acrossfade=d=${ffNumber(duration)}:c1=tri:c2=tri[${nextAudio}]`,
    );
    videoLabel = nextVideo;
    audioLabel = nextAudio;
    compositeDuration = offset + Number(segment.duration);
  }

  filters.push(`[${videoLabel}]trim=duration=${ffNumber(compositeDuration)},setpts=PTS-STARTPTS[vout]`);
  filters.push(`[${audioLabel}]atrim=duration=${ffNumber(compositeDuration)},asetpts=PTS-STARTPTS[aout]`);
  return `${filters.join(';\n')}\n`;
}

function composeTimeline(resolved, timeline) {
  fs.writeFileSync(
    COMPOSE_FILTER_PATH,
    buildComposeFilter(resolved, timeline.settings),
    'utf8',
  );

  const args = ['-hide_banner', '-y'];
  for (const segment of resolved) {
    args.push('-i', segment.outputPath);
  }
  args.push(
    '-filter_complex_script', COMPOSE_FILTER_PATH,
    '-map', '[vout]', '-map', '[aout]',
    ...intermediateVideoArgs(timeline.settings),
    '-c:a', 'pcm_s24le', '-ar', String(timeline.settings.sampleRate), '-ac', '2',
    '-fps_mode', 'cfr',
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

function buildAss(resolved, duration, timeline) {
  const style = timeline.style;
  const paper = assColour(style.paper);
  const muted = assColour(style.muted);
  const ice = assColour(style.ice);
  const deepOutline = assColour(style.deep, '64');
  const deepBox = assColour(style.deep, '55');
  const lines = [
    '[Script Info]',
    `Title: ${timeline.title}`,
    'ScriptType: v4.00+',
    `PlayResX: ${timeline.settings.width}`,
    `PlayResY: ${timeline.settings.height}`,
    'WrapStyle: 2',
    'ScaledBorderAndShadow: yes',
    'YCbCr Matrix: TV.709',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    `Style: Kicker,IBM Plex Mono,18,${ice},${ice},${deepOutline},${deepBox},0,0,0,0,100,100,2.2,0,1,1.0,1.0,7,96,96,72,1`,
    `Style: Project,Inter Tight,60,${paper},${paper},${deepOutline},${deepBox},-1,0,0,0,100,100,-1.1,0,1,1.4,1.25,7,96,96,72,1`,
    `Style: Proof,Inter,27,${paper},${paper},${deepOutline},${deepBox},0,0,0,0,100,100,0,0,1,1.15,1.0,7,96,96,72,1`,
    `Style: Tag,IBM Plex Mono,16,${paper},${paper},${deepOutline},${deepBox},0,0,0,0,100,100,1.2,0,3,1.0,0,9,72,72,56,1`,
    `Style: IntroFirst,IBM Plex Mono,26,${ice},${ice},${deepOutline},${deepBox},0,0,0,0,100,100,8.0,0,1,1.0,0.6,5,96,96,72,1`,
    `Style: IntroWordmark,Inter Tight,136,${paper},${paper},${deepOutline},${deepBox},-1,0,0,0,100,100,-1.4,0,1,1.8,1.0,5,96,96,72,1`,
    `Style: IntroMeta,IBM Plex Mono,19,${paper},${paper},${deepOutline},${deepBox},0,0,0,0,100,100,2.6,0,1,1.1,0.6,5,96,96,72,1`,
    `Style: IntroTag,IBM Plex Mono,14,${muted},${muted},${deepOutline},${deepBox},0,0,0,0,100,100,2.2,0,1,1.0,0.5,5,96,96,72,1`,
    `Style: OutroFirst,IBM Plex Mono,24,${ice},${ice},${deepOutline},${deepBox},0,0,0,0,100,100,7.0,0,1,1.0,0.6,5,96,96,72,1`,
    `Style: OutroTitle,Inter Tight,104,${paper},${paper},${deepOutline},${deepBox},-1,0,0,0,100,100,-1.2,0,1,2.0,1.0,5,96,96,72,1`,
    `Style: OutroMeta,IBM Plex Mono,18,${muted},${muted},${deepOutline},${deepBox},0,0,0,0,100,100,1.8,0,1,1.2,0.6,5,96,96,72,1`,
    `Style: OutroUrl,IBM Plex Mono,20,${ice},${ice},${deepOutline},${deepBox},0,0,0,0,100,100,2.0,0,1,1.3,0.7,5,96,96,72,1`,
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
      const wordmarkEnd = end - 0.1;

      // A moving scan line establishes the motion language, then the name
      // assembles in vertical samples. The wordmark itself is the identity:
      // there is deliberately no separate monogram or app-like symbol.
      lines.push(eventLine(
        start + 0.34,
        start + 1.5,
        'Kicker',
        `{\\an7\\move(430,342,1490,342,0,980)\\fad(120,180)\\p1\\c${ice}\\1a&H68&}` +
          'm 0 0 l 2 0 l 2 360 l 0 360',
        3,
      ));
      lines.push(eventLine(
        start + 0.5,
        start + 1.52,
        'IntroWordmark',
        `{\\an5\\pos(960,520)\\blur13\\1c${ice}\\1a&HBC&\\fad(180,260)}` +
          `${assText(lastName)}`,
        3,
      ));
      lines.push(eventLine(
        start + 0.62,
        wordmarkEnd,
        'IntroFirst',
        `{\\an5\\move(960,414,960,400,0,300)\\blur5\\t(0,280,\\blur0)\\fad(130,280)}` +
          `${assText(firstName)}`,
        5,
      ));

      const strips = [
        { x1: 820, x2: 1100, delay: 0.7 },
        { x1: 640, x2: 820, delay: 0.8 },
        { x1: 1100, x2: 1280, delay: 0.88 },
        { x1: 460, x2: 640, delay: 0.96 },
        { x1: 1280, x2: 1460, delay: 1.04 },
      ];
      for (const strip of strips) {
        lines.push(eventLine(
          start + strip.delay,
          wordmarkEnd,
          'IntroWordmark',
          `{\\an5\\clip(${strip.x1},420,${strip.x2},610)` +
            `\\move(960,550,960,520,0,380)\\blur8\\t(0,360,\\blur0)\\fad(120,280)}` +
            `${assText(lastName)}`,
          5,
        ));
      }

      lines.push(eventLine(
        start + 1.44,
        wordmarkEnd,
        'Kicker',
        `{\\an7\\pos(530,592)\\fad(180,260)\\p1\\c${ice}\\1a&H28&}` +
          'm 0 0 l 860 0 l 860 2 l 0 2',
        4,
      ));
      lines.push(eventLine(
        start + 1.62,
        wordmarkEnd,
        'IntroMeta',
        `{\\an5\\move(960,650,960,638,0,280)\\blur6\\t(0,260,\\blur0)\\fad(160,260)}` +
          `${assText(caption.meta)}`,
        5,
      ));
      lines.push(eventLine(
        start + 1.88,
        wordmarkEnd,
        'IntroTag',
        `{\\an5\\move(960,694,960,682,0,240)\\blur5\\t(0,220,\\blur0)\\fad(150,240)}` +
          `${assText(caption.tag)}`,
        5,
      ));

      // One restrained spectral displacement during the hold. No RGB split.
      lines.push(eventLine(
        start + 2.74,
        start + 2.82,
        'IntroWordmark',
        `{\\an5\\clip(450,474,1470,503)\\pos(972,520)\\1c${ice}\\1a&H38&\\blur1}` +
          `${assText(lastName)}`,
        7,
      ));
      lines.push(eventLine(
        start + 2.76,
        start + 2.84,
        'IntroWordmark',
        `{\\an5\\clip(450,538,1470,560)\\pos(948,520)\\1c${ice}\\1a&H50&\\blur1}` +
          `${assText(lastName)}`,
        7,
      ));
    } else if (caption?.kind === 'outro') {
      const words = String(caption.title || '').trim().split(/\s+/);
      const firstName = words.shift() || 'IGOR';
      const lastName = words.join(' ') || 'SZUNIEWICZ';
      const captionEnd = end - 0.1;
      const accent = assColour(style.ice);
      lines.push(eventLine(
        start + 0.72,
        captionEnd,
        'Kicker',
        `{\\an7\\pos(580,594)\\fad(240,320)\\p1\\c${accent}\\1a&H30&}` +
          'm 0 0 l 760 0 l 760 2 l 0 2',
        4,
      ));
      lines.push(eventLine(
        start + 0.28,
        captionEnd,
        'OutroFirst',
        `{\\an5\\move(960,434,960,420,0,320)\\blur5\\t(0,300,\\blur0)` +
          `\\fad(220,360)}${assText(firstName)}`,
        5,
      ));
      lines.push(eventLine(
        start + 0.4,
        captionEnd,
        'OutroTitle',
        `{\\an5\\move(960,532,960,510,0,360)\\blur7\\t(0,340,\\blur0)` +
          `\\fad(240,360)}${assText(lastName)}`,
        5,
      ));
      lines.push(eventLine(
        start + 0.84,
        captionEnd,
        'OutroMeta',
        `{\\an5\\move(960,626,960,614,0,280)\\blur4\\t(0,260,\\blur0)` +
          `\\fad(240,340)}${assText(caption.meta)}`,
        5,
      ));
      lines.push(eventLine(
        start + 1.08,
        captionEnd,
        'OutroUrl',
        `{\\an5\\move(960,678,960,666,0,260)\\blur4\\t(0,240,\\blur0)` +
          `\\fad(260,320)}${assText(caption.url)}`,
        5,
      ));
    } else if (caption) {
      const captionStart = start + 0.18;
      const captionEnd = Math.min(duration - 0.08, start + Number(caption.showFor || 4.2));
      const accent = assColour(caption.accent || style.ice);
      lines.push(eventLine(
        captionStart,
        captionEnd,
        'Kicker',
        `{\\an7\\pos(96,758)\\fad(160,140)\\p1\\c${accent}}m 0 0 l 760 0 l 760 2 l 0 2`,
        3,
      ));
      lines.push(eventLine(
        captionStart + 0.05,
        captionEnd,
        'Kicker',
        `{\\an7\\move(84,779,96,779,0,220)\\fad(160,150)\\c${accent}}${assText(caption.kicker)}`,
        5,
      ));
      lines.push(eventLine(
        captionStart + 0.12,
        captionEnd,
        'Project',
        `{\\an7\\move(82,815,96,815,0,240)\\fad(170,150)}${assText(caption.title)}`,
        5,
      ));
      lines.push(eventLine(
        captionStart + 0.2,
        captionEnd,
        'Proof',
        `{\\an7\\move(86,892,98,892,0,220)\\fad(180,140)}${assText(caption.proof)}`,
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
        `{\\an9\\pos(1848,58)\\fad(120,110)}${assText(segment.tag)}`,
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

  console.log('\nBurning captions and applying final two-pass loudness normalization');
  run(FFMPEG, [
    '-hide_banner', '-y',
    '-i', COMPOSED_PATH,
    '-filter_complex', filter,
    '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264',
    '-preset', 'slower',
    '-crf', String(timeline.settings.deliveryCrf),
    '-profile:v', 'high',
    '-level:v', Number(timeline.settings.fps) >= 50 ? '4.2' : '4.1',
    '-pix_fmt', 'yuv420p',
    '-color_primaries', 'bt709',
    '-color_trc', 'bt709',
    '-colorspace', 'bt709',
    '-color_range', 'tv',
    '-c:a', 'aac',
    '-b:a', '320k',
    '-ar', String(timeline.settings.sampleRate),
    '-ac', '2',
    '-movflags', '+faststart',
    '-metadata', `title=${timeline.title}`,
    '-metadata', 'artist=Igor Szuniewicz',
    '-metadata', 'comment=Rendered from showreel/timeline.json',
    '-t', ffNumber(resolvedDuration),
    FINAL_PATH,
  ]);

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
    .map((segment) => Math.min(
      duration - 0.1,
      Number(segment.timelineStart) + Math.min(0.55, Number(segment.duration) / 2),
    ));
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
  if (process.argv.includes('--qa-only')) {
    if (!fs.existsSync(FINAL_PATH) || !fs.existsSync(COMPOSED_PATH)) {
      throw new Error('QA-only mode requires an existing final render and build/timeline.mkv.');
    }
    const { resolved, duration } = resolveTimelineStarts(timeline.segments);
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
    if (!fs.existsSync(COMPOSED_PATH) || !fs.existsSync(CAPTIONS_PATH)) {
      throw new Error('Master-only mode requires build/timeline.mkv and build/captions.ass.');
    }
    const { resolved, duration } = resolveTimelineStarts(timeline.segments);
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

  cleanBuild();
  fs.mkdirSync(SEGMENT_DIR, { recursive: true });
  const { rendered, sourceMetadata } = renderSegments(timeline);
  const { resolved, duration } = resolveTimelineStarts(rendered);

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

main();
