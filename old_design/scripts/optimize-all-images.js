// Comprehensive image optimization script for all project images
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Already optimized images to skip
const skipImages = [
  'Black Coal.jpg',
  'Jungle.jpg',
  '8.jpg'
];

// Configuration for different image types
const imageConfig = {
  background: { quality: 85, maxWidth: 1920 },
  thumbnail: { quality: 80, maxWidth: 800 },
  content: { quality: 82, maxWidth: 1600 },
  default: { quality: 80, maxWidth: 1920 }
};

async function* walkDirectory(dir) {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      yield* walkDirectory(fullPath);
    } else {
      yield fullPath;
    }
  }
}

function getImageConfig(filePath) {
  const lower = filePath.toLowerCase();

  if (lower.includes('background')) return imageConfig.background;
  if (lower.includes('thumbnail') || lower.includes('thumb')) return imageConfig.thumbnail;
  if (lower.includes('content') || lower.includes('gallery')) return imageConfig.content;

  return imageConfig.default;
}

function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.jpg', '.jpeg', '.png'].includes(ext);
}

function shouldSkipImage(filePath) {
  const basename = path.basename(filePath);
  return skipImages.includes(basename);
}

async function optimizeImage(filePath, config) {
  const backupPath = filePath + '.backup';

  try {
    // Create backup
    fs.copyFileSync(filePath, backupPath);

    const sizeBefore = fs.statSync(filePath).size;
    const ext = path.extname(filePath).toLowerCase();

    // Build sharp pipeline
    let pipeline = sharp(filePath)
      .resize(config.maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });

    // Apply format-specific optimization
    if (ext === '.png') {
      pipeline = pipeline.png({
        quality: config.quality,
        compressionLevel: 9,
        progressive: true
      });
    } else {
      // JPEG
      pipeline = pipeline.jpeg({
        quality: config.quality,
        progressive: true,
        mozjpeg: true
      });
    }

    // Save to temp file
    await pipeline.toFile(filePath + '.tmp');

    // Replace original
    fs.renameSync(filePath + '.tmp', filePath);

    const sizeAfter = fs.statSync(filePath).size;
    const saved = sizeBefore - sizeAfter;
    const percent = ((saved / sizeBefore) * 100).toFixed(1);

    // Remove backup if successful
    fs.unlinkSync(backupPath);

    return {
      success: true,
      sizeBefore,
      sizeAfter,
      saved,
      percent
    };

  } catch (error) {
    // Restore backup if exists
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, filePath);
      fs.unlinkSync(backupPath);
    }

    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('🖼️  Starting comprehensive image optimization...\n');

  const assetsDir = path.join(__dirname, '../assets/images');
  const imagesToOptimize = [];

  // Find all images
  console.log('📁 Scanning for images...');
  for await (const filePath of walkDirectory(assetsDir)) {
    if (isImageFile(filePath) && !shouldSkipImage(filePath)) {
      imagesToOptimize.push(filePath);
    }
  }

  console.log(`Found ${imagesToOptimize.length} images to optimize\n`);

  let totalSizeBefore = 0;
  let totalSizeAfter = 0;
  let successCount = 0;
  let errorCount = 0;

  // Optimize each image
  for (let i = 0; i < imagesToOptimize.length; i++) {
    const filePath = imagesToOptimize[i];
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    const config = getImageConfig(filePath);

    process.stdout.write(`[${i + 1}/${imagesToOptimize.length}] ${relativePath}... `);

    const result = await optimizeImage(filePath, config);

    if (result.success) {
      totalSizeBefore += result.sizeBefore;
      totalSizeAfter += result.sizeAfter;
      successCount++;

      if (result.saved > 0) {
        console.log(`✓ Saved ${(result.saved / 1024 / 1024).toFixed(2)} MB (${result.percent}%)`);
      } else {
        console.log(`✓ Already optimized`);
      }
    } else {
      errorCount++;
      console.log(`✗ Error: ${result.error}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Optimization Summary');
  console.log('='.repeat(70));
  console.log(`Total images processed: ${imagesToOptimize.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`\nSize before: ${(totalSizeBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Size after:  ${(totalSizeAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total saved: ${((totalSizeBefore - totalSizeAfter) / 1024 / 1024).toFixed(2)} MB`);

  const totalPercent = ((totalSizeBefore - totalSizeAfter) / totalSizeBefore * 100).toFixed(1);
  console.log(`Reduction:   ${totalPercent}%`);
  console.log('='.repeat(70));

  if (errorCount > 0) {
    console.log(`\n⚠️  ${errorCount} images had errors. Check the output above for details.`);
  }

  console.log('\n✅ Image optimization complete!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
