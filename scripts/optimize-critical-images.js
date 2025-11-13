// Quick image optimization script for critical images
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const images = [
  {
    input: '../assets/images/projects-ray/background/Black Coal.jpg',
    output: '../assets/images/projects-ray/background/Black Coal.jpg',
    targetWidth: 1920
  },
  {
    input: '../assets/images/projects-akantilado/background/Jungle.jpg',
    output: '../assets/images/projects-akantilado/background/Jungle.jpg',
    targetWidth: 1920
  },
  {
    input: '../assets/images/projects-amorak/background/8.jpg',
    output: '../assets/images/projects-amorak/background/8.jpg',
    targetWidth: 1920
  }
];

async function optimizeImages() {
  console.log('Starting critical image optimization...\n');

  for (const img of images) {
    const inputPath = path.join(__dirname, img.input);
    const backupPath = inputPath + '.backup';

    try {
      // Create backup
      fs.copyFileSync(inputPath, backupPath);

      const sizeBefore = fs.statSync(inputPath).size;
      console.log(`Optimizing: ${path.basename(img.input)}`);
      console.log(`  Before: ${(sizeBefore / 1024 / 1024).toFixed(2)} MB`);

      // Optimize
      await sharp(inputPath)
        .resize(img.targetWidth, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({
          quality: 85,
          progressive: true,
          mozjpeg: true
        })
        .toFile(inputPath + '.tmp');

      // Replace original
      fs.renameSync(inputPath + '.tmp', inputPath);

      const sizeAfter = fs.statSync(inputPath).size;
      const saved = sizeBefore - sizeAfter;
      const percent = ((saved / sizeBefore) * 100).toFixed(1);

      console.log(`  After: ${(sizeAfter / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Saved: ${(saved / 1024 / 1024).toFixed(2)} MB (${percent}%)`);
      console.log(`  ✓ Success!\n`);

      // Remove backup if successful
      fs.unlinkSync(backupPath);

    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
      // Restore backup if exists
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, inputPath);
        fs.unlinkSync(backupPath);
        console.log('  Restored from backup\n');
      }
    }
  }

  console.log('Critical image optimization complete!');
}

optimizeImages().catch(console.error);
