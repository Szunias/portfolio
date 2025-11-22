#!/usr/bin/env node

/**
 * Duplicate Files Cleaner
 * Finds and removes duplicate files based on content hash
 *
 * Usage: node scripts/clean-duplicates.js [--dry-run]
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  directories: [
    path.join(__dirname, '..', 'assets', 'images'),
    path.join(__dirname, '..', 'assets', 'videos'),
    path.join(__dirname, '..', 'assets', 'audio'),
  ],

  // File extensions to check
  extensions: ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mp3', '.wav', '.ogg'],

  // Dry run mode (don't actually delete)
  dryRun: process.argv.includes('--dry-run'),
};

const fileHashes = new Map();
const duplicates = [];
let totalSizeFreed = 0;

/**
 * Calculate file hash
 */
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Format bytes
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get all files recursively
 */
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (config.extensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

/**
 * Find duplicates
 */
function findDuplicates() {
  console.log('🔍 Scanning for duplicate files...\n');

  // Get all files
  let allFiles = [];
  for (const dir of config.directories) {
    allFiles = allFiles.concat(getAllFiles(dir));
  }

  console.log(`Found ${allFiles.length} files to check\n`);

  // Calculate hashes
  for (const filePath of allFiles) {
    try {
      const hash = getFileHash(filePath);
      const fileSize = fs.statSync(filePath).size;

      if (fileHashes.has(hash)) {
        // Duplicate found!
        const original = fileHashes.get(hash);
        duplicates.push({
          original: original.path,
          duplicate: filePath,
          size: fileSize,
          hash,
        });

        console.log(`🔁 Duplicate found!`);
        console.log(`   Original:  ${path.relative(process.cwd(), original.path)}`);
        console.log(`   Duplicate: ${path.relative(process.cwd(), filePath)}`);
        console.log(`   Size:      ${formatBytes(fileSize)}\n`);
      } else {
        fileHashes.set(hash, {
          path: filePath,
          size: fileSize,
        });
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }
}

/**
 * Remove duplicates
 */
function removeDuplicates() {
  if (duplicates.length === 0) {
    console.log('✨ No duplicates found!\n');
    return;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Found ${duplicates.length} duplicate file(s)`);
  console.log('='.repeat(60) + '\n');

  if (config.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be deleted\n');
  }

  duplicates.forEach((dup, index) => {
    console.log(`[${index + 1}/${duplicates.length}] ${path.basename(dup.duplicate)}`);
    console.log(`    Size: ${formatBytes(dup.size)}`);

    if (!config.dryRun) {
      try {
        fs.unlinkSync(dup.duplicate);
        totalSizeFreed += dup.size;
        console.log(`    ✅ Deleted\n`);
      } catch (error) {
        console.log(`    ❌ Failed to delete: ${error.message}\n`);
      }
    } else {
      console.log(`    Would delete: ${path.relative(process.cwd(), dup.duplicate)}\n`);
      totalSizeFreed += dup.size;
    }
  });
}

/**
 * Check for specific known duplicates
 */
function checkKnownDuplicates() {
  console.log('\n🎯 Checking for known duplicates...\n');

  // AudioQ Showcase duplicate (with space in name)
  const audioQPath = path.join(__dirname, '..', 'assets', 'images', 'projects-audioq');
  const files = [
    path.join(audioQPath, 'AudioQ-Showcase.mp4'),
    path.join(audioQPath, 'AudioQ Showcase.mp4'),
  ];

  const existing = files.filter(f => fs.existsSync(f));

  if (existing.length > 1) {
    console.log('Found AudioQ Showcase duplicate:');
    existing.forEach(f => console.log(`  - ${path.basename(f)}`));
    console.log('\n💡 Recommendation: Keep "AudioQ-Showcase.mp4" (no space)\n');
  }
}

/**
 * Main function
 */
function main() {
  console.log('🧹 Duplicate File Cleaner\n');
  console.log('Directories to scan:');
  config.directories.forEach(dir => {
    console.log(`  - ${path.relative(process.cwd(), dir)}`);
  });
  console.log('');

  // Check known duplicates first
  checkKnownDuplicates();

  // Find all duplicates
  findDuplicates();

  // Remove duplicates
  removeDuplicates();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`Duplicates found: ${duplicates.length}`);
  console.log(`Space ${config.dryRun ? 'that would be freed' : 'freed'}: ${formatBytes(totalSizeFreed)}`);

  if (config.dryRun && duplicates.length > 0) {
    console.log('\n💡 Run without --dry-run to actually delete files');
  }

  console.log('\n✨ Done!\n');
}

// Run
main();
