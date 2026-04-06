/**
 * Generate all project hero/thumb screenshots by:
 * 1. Copying existing static images from old/public/assets/
 * 2. Extracting video frames for projects without static images
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'screenshots');
const ASSETS = path.join(REPO, 'old', 'public', 'assets');
const IMG = path.join(ASSETS, 'images');
const VID = path.join(ASSETS, 'videos');

function cp(src, dst) {
  if (!fs.existsSync(src)) { console.log(`[MISS] ${src}`); return false; }
  fs.copyFileSync(src, path.join(OUT, dst));
  console.log(`[COPY] ${dst}`);
  return true;
}

function frame(videoPath, time, dst) {
  if (!fs.existsSync(videoPath)) { console.log(`[MISS VIDEO] ${videoPath}`); return; }
  const outPath = path.join(OUT, dst);
  try {
    execSync(`ffmpeg -y -ss ${time} -i "${videoPath}" -vframes 1 -q:v 2 "${outPath}"`, { stdio: 'pipe' });
    console.log(`[FRAME] ${dst} (from ${path.basename(videoPath)} @ ${time})`);
  } catch (e) {
    console.log(`[FAIL] ${dst}: ${e.message.slice(0, 80)}`);
  }
}

// ============ SHADOW FRAMES ============
cp(path.join(IMG, 'projects-shadowframes', '22_ShadowFrames_03.jpg'), 'shadowframes-hero.jpg');
cp(path.join(IMG, 'projects-shadowframes', 'MasterMixerHierarchy.png'), 'shadowframes-wwise.jpg');
cp(path.join(IMG, 'projects-shadowframes', 'BP_Footstep_AudioManager.png'), 'shadowframes-code.jpg');

// ============ NOT TODAY, DARLING! ============
cp(path.join(IMG, 'projects-nottoday', 'Nottodaytrailer.jpeg'), 'nottoday-hero.jpg');
cp(path.join(IMG, 'projects-nottoday', 'MS_Pickup.png'), 'nottoday-metasounds.jpg');
cp(path.join(IMG, 'projects-nottoday', 'SoundClasses.png'), 'nottoday-soundclasses.jpg');

// ============ TRANSIENTICA ============
frame(path.join(VID, 'AudioLab_2425_Szuniewicz_Igor_GAMEDemoVideo_Transientica.mp4'), '00:00:15', 'transientica-hero.jpg');
frame(path.join(VID, 'AudioLab_2425_Szuniewicz_Igor_GAMEDemoVideo_Transientica.mp4'), '00:00:35', 'transientica-features.jpg');
frame(path.join(VID, 'AudioLab_2425_Szuniewicz_Igor_GAMEDemoVideo_Transientica.mp4'), '00:00:55', 'transientica-training.jpg');

// ============ RAY ANIMATION ============
cp(path.join(IMG, 'projects-ray', 'rayinlight.png'), 'ray-hero.jpg');
cp(path.join(IMG, 'projects-ray', 'rayaloneinthecave.png'), 'ray-scene.jpg');
frame(path.join(VID, 'ray-animation.mp4'), '00:00:25', 'ray-reaper.jpg');

// ============ AUDIOQ ============
cp(path.join(REPO, 'audioqscreenshot.png'), 'audioq-ui.jpg');
cp(path.join(IMG, 'projects-audioq', 'AudioQPicture.png'), 'audioq-waveform.jpg');
// code screenshot - try to find one or use text
frame(path.join(IMG, 'projects-audioq', 'AudioQ Showcase.mp4'), '00:00:20', 'audioq-code.jpg');

// ============ AMORAK ============
cp(path.join(IMG, 'projects-amorak', 'basement.png'), 'amorak-hero.jpg');
cp(path.join(IMG, 'projects-amorak', 'creatureviewfrombasement.png'), 'amorak-layers.jpg');
cp(path.join(IMG, 'projects-amorak', 'chimneywithaknife.png'), 'amorak-binaural.jpg');

// ============ AKANTILADO ============
cp(path.join(IMG, 'projects-akantilado', 'jungleviewfromtopshot.png'), 'akantilado-hero.jpg');
cp(path.join(IMG, 'projects-akantilado', 'orangecatalikecreaturewithgoldenball.png'), 'akantilado-51.jpg');
cp(path.join(IMG, 'projects-akantilado', 'pinkcatalikecreature.png'), 'akantilado-reaper.jpg');

// ============ XR LABS ============
cp(path.join(REPO, 'belgian military university.png'), 'xrlabs-hero.jpg');
frame(path.join(VID, 'xrlabs-training-dsu.mp4'), '00:00:10', 'xrlabs-steamaudio.jpg');
frame(path.join(VID, 'xrlabs-training-dsu.mp4'), '00:00:30', 'xrlabs-scene.jpg');

// ============ RICHTER ============
cp(path.join(IMG, 'projects-daw2', 'vlcsnap-2025-09-28-00h05m22s506.png'), 'richter-hero.jpg');
cp(path.join(IMG, 'projects-daw2', 'vlcsnap-2025-09-28-00h05m42s119.png'), 'richter-foley.jpg');
cp(path.join(IMG, 'projects-daw2', 'vlcsnap-2025-09-28-00h05m31s882.png'), 'richter-synth.jpg');

// ============ AI AUDIO RESEARCH ============
cp(path.join(REPO, 'aithesiscover.png'), 'thesis-hero.jpg');
frame(path.join(REPO, 'UnrealEngineDemo.mp4'), '00:00:15', 'thesis-architecture.jpg');
frame(path.join(REPO, 'PythonPrototypeDemo.mp4'), '00:00:08', 'thesis-results.jpg');

// ============ SOUND DESIGN REEL ============
cp(path.join(IMG, 'godofwarkrotos.jpg'), 'reel-hero.jpg');
frame(path.join(VID, 'krotosvideo.mp4'), '00:00:10', 'reel-godofwar.jpg');
cp(path.join(IMG, 'baldurspreview.png'), 'reel-baldurs.jpg');

// ============ WWISE PROJECTS ============
cp(path.join(REPO, 'old', 'public', 'wwiseprojectsinfo', 'images', 'BoneyBoogaloo.png'), 'wwise-hero.jpg');
cp(path.join(REPO, 'old', 'public', 'wwiseprojectsinfo', 'images', 'Ellen.png'), 'wwise-voices.jpg');
cp(path.join(REPO, 'old', 'public', 'wwiseprojectsinfo', 'images', 'StomachAches.png'), 'wwise-memory.jpg');

// ============ PAUSE & DESERVE ============
cp(path.join(IMG, 'projects-pausedeserve', 'redcorridor.png'), 'pausedeserve-hero.jpg');
cp(path.join(IMG, 'projects-pausedeserve', 'caughtbydeath.png'), 'pausedeserve-scene.jpg');
cp(path.join(IMG, 'projects-pausedeserve', 'deathapproaches.png'), 'pausedeserve-metasounds.jpg');

console.log('\nDone. Checking output:');
const files = fs.readdirSync(OUT).filter(f => !f.startsWith('site-') && f !== 'signature.png').sort();
console.log(`Total project screenshots: ${files.length}`);
