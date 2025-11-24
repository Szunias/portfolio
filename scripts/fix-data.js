import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFile = path.resolve(__dirname, '../src/data/portfolioData.json');

console.log(`Reading data from: ${dataFile}`);

try {
  const rawData = fs.readFileSync(dataFile, 'utf-8');
  const data = JSON.parse(rawData);

  // 1. REMOVE interactive_music
  if (data.featured_projects) {
      data.featured_projects = data.featured_projects.filter(p => p.id !== 'interactive_music');
  }
  if (data.additional_projects) {
      data.additional_projects = data.additional_projects.filter(p => p.id !== 'interactive_music');
  }

  // 2. Fix Transientica (AudioLab)
  const transientica = data.featured_projects?.find(p => p.id === 'transientica_audiolab');
  if (transientica) {
    transientica.media = transientica.media || {};
    transientica.media.video = "assets/videos/AudioLab_2425_Szuniewiczigor_NIMEorGAMEDemoVideo_Title.mp4";
    transientica.media.images = [
        "assets/videos/AudioLab_2425_Szuniewicz_Igor_GAMEDemoVideo_Transientica.mp4"
    ];
    transientica.media.thumbnail = "assets/videos/AudioLab_preview.webm";
    
    transientica.full_description = "Real-time ML beatbox detection system. Control rhythm games with your voice.\n\nOptimized audio buffer sizes and ML inference pipeline to stay well below the 60ms threshold for rhythm games. Decoupled Python analysis and Unity gameplay communicating via UDP/OSC ensures zero frame drops.\n\nSpectral Analysis: Kick drums are deep, snares have noise. I trained the system to recognize these spectral fingerprints along with temporal envelopes.";
  }

  // 3. Fix AudioQ
  const audioq = data.featured_projects?.find(p => p.id === 'audioq');
  if (audioq) {
      if (!audioq.full_description.includes("Technical Details")) {
          audioq.full_description += "\n\nTechnical Details:\n- Circular Buffer Implementation\n- FFT Windowing (Hanning)\n- Lock-free Parameter Updates (APVTS)\n- Custom Look-and-Feel GUI";
      }
      audioq.media = audioq.media || {};
      audioq.media.video = "assets/images/projects-audioq/AudioQ-Showcase.mp4";
  }

  // 4. Fix Pause & Deserve
  const pause = data.featured_projects?.find(p => p.id === 'pause_and_deserve');
  if (pause) {
      pause.links = pause.links || {};
      pause.links.video = "https://www.youtube.com/watch?v=bBuhTHrN81k";
      pause.media = pause.media || {};
      pause.media.video = "https://www.youtube.com/embed/bBuhTHrN81k";
  }

  // 5. Fix Amorak
  const amorak = data.featured_projects?.find(p => p.id === 'amorak');
  if (amorak) {
      if (!amorak.full_description.includes("Shadow Creatures")) {
          amorak.full_description += "\n\nShadow Creatures: The creatures aren't just seen, they are heard. Their movement triggers a specific layer of 'shadow' sounds—reversed reverbs and granular whispers.\n\nVignette Pulse: The audio system is synced to the visual vignette effect. As the screen darkens, the low-pass filter on the environment closes, simulating the character's fear and focus.";
      }
  }

  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log("All issues fixed successfully.");

} catch (error) {
  console.error("Error updating data:", error);
  process.exit(1);
}
