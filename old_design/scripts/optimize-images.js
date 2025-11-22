#!/usr/bin/env node

/**
 * Image Optimization Script
 * Compresses and converts images to modern formats (WebP, AVIF)
 *
 * Usage: node scripts/optimize-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  inputDir: path.join(__dirname, '..', 'assets', 'images'),
  outputDir: path.join(__dirname, '..', 'assets', 'images', 'optimized'),

  formats: {
    webp: { quality: 85, effort: 6 },
    avif: { quality: 80, effort: 4 }, // Lower effort for faster processing
    jpeg: { quality: 85, mozjpeg: true },
    png: { quality: 90, compressionLevel: 9 },
  },

  // Skip files smaller than this
  minFileSize: 10 * 1024, // 10KB

  // Max dimensions
  maxWidth: 2400,
  maxHeight: 2400,

  // Thumbnail sizes
  thumbnails: [
    { suffix: '-thumb', width: 400, height: 400 },
    { suffix: '-medium', width: 800, height: 800 },
  ],
};

let stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  originalSize: 0,
  optimizedSize: 0,
};

/**
 * Get all image files recursively
 */
function getAllImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip optimized directory
      if (!filePath.includes('optimized')) {
        getAllImages(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Optimize single image
 */
async function optimizeImage(inputPath) {
  try {
    const fileName = path.basename(inputPath, path.extname(inputPath));
    const relativePath = path.relative(config.inputDir, path.dirname(inputPath));
    const outputPath = path.join(config.outputDir, relativePath);

    // Create output directory
    fs.mkdirSync(outputPath, { recursive: true });

    // Get file size
    const inputStat = fs.statSync(inputPath);
    const inputSize = inputStat.size;

    // Skip small files
    if (inputSize < config.minFileSize) {
      console.log(`⏭️  Skipping ${path.basename(inputPath)} (too small)`);
      stats.skipped++;
      return;
    }

    stats.originalSize += inputSize;

    console.log(`\n🖼️  Processing: ${path.basename(inputPath)} (${formatBytes(inputSize)})`);

    // Load image
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize if too large
    let needsResize = false;
    if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
      needsResize = true;
      image.resize(config.maxWidth, config.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const outputs = [];

    // Generate WebP
    const webpPath = path.join(outputPath, `${fileName}.webp`);
    await image
      .clone()
      .webp(config.formats.webp)
      .toFile(webpPath);
    outputs.push(webpPath);

    // Generate AVIF (smaller but slower)
    const avifPath = path.join(outputPath, `${fileName}.avif`);
    await image
      .clone()
      .avif(config.formats.avif)
      .toFile(avifPath);
    outputs.push(avifPath);

    // Generate optimized original format
    const ext = path.extname(inputPath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
      const jpegPath = path.join(outputPath, `${fileName}.jpg`);
      await image
        .clone()
        .jpeg(config.formats.jpeg)
        .toFile(jpegPath);
      outputs.push(jpegPath);
    } else if (ext === '.png') {
      const pngPath = path.join(outputPath, `${fileName}.png`);
      await image
        .clone()
        .png(config.formats.png)
        .toFile(pngPath);
      outputs.push(pngPath);
    }

    // Generate thumbnails
    for (const thumb of config.thumbnails) {
      const thumbPath = path.join(outputPath, `${fileName}${thumb.suffix}.webp`);
      await sharp(inputPath)
        .resize(thumb.width, thumb.height, {
          fit: 'cover',
          position: 'center',
        })
        .webp(config.formats.webp)
        .toFile(thumbPath);
      outputs.push(thumbPath);
    }

    // Calculate total optimized size
    let totalOutputSize = 0;
    for (const outPath of outputs) {
      const stat = fs.statSync(outPath);
      totalOutputSize += stat.size;
    }

    stats.optimizedSize += totalOutputSize;

    const savings = ((1 - totalOutputSize / inputSize) * 100).toFixed(1);
    console.log(`✅ Saved ${savings}% (${formatBytes(inputSize)} → ${formatBytes(totalOutputSize)})`);
    console.log(`   Generated: ${outputs.length} files`);

    stats.processed++;

  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
    stats.errors++;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting image optimization...\n');
  console.log(`Input:  ${config.inputDir}`);
  console.log(`Output: ${config.outputDir}\n`);

  // Create output directory
  fs.mkdirSync(config.outputDir, { recursive: true });

  // Get all images
  const images = getAllImages(config.inputDir);
  console.log(`Found ${images.length} images to process\n`);

  // Process each image
  for (const imagePath of images) {
    await optimizeImage(imagePath);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 OPTIMIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Processed: ${stats.processed}`);
  console.log(`⏭️  Skipped:   ${stats.skipped}`);
  console.log(`❌ Errors:    ${stats.errors}`);
  console.log(`\n📦 Original size:  ${formatBytes(stats.originalSize)}`);
  console.log(`📦 Optimized size: ${formatBytes(stats.optimizedSize)}`);

  if (stats.originalSize > 0) {
    const totalSavings = ((1 - stats.optimizedSize / stats.originalSize) * 100).toFixed(1);
    const savedBytes = stats.originalSize - stats.optimizedSize;
    console.log(`💾 Total savings:  ${formatBytes(savedBytes)} (${totalSavings}%)`);
  }

  console.log('\n✨ Optimization complete!\n');
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
