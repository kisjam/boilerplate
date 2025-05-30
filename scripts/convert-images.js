#!/usr/bin/env node
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

const srcDir = 'src/assets/images';
const distDir = 'dist/assets/images';

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error(`Error creating directory ${dir}:`, err);
  }
}

async function convertToWebP(inputPath, outputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const basename = path.basename(inputPath, ext);
  const outputWebP = path.join(path.dirname(outputPath), `${basename}.webp`);

  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    try {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputWebP);
      console.log(`Converted: ${inputPath} -> ${outputWebP}`);
    } catch (err) {
      console.error(`Error converting ${inputPath}:`, err);
    }
  }
}

async function copyFile(inputPath, outputPath) {
  try {
    await ensureDir(path.dirname(outputPath));
    await fs.copyFile(inputPath, outputPath);
    console.log(`Copied: ${inputPath} -> ${outputPath}`);
  } catch (err) {
    console.error(`Error copying ${inputPath}:`, err);
  }
}

async function processImages() {
  const patterns = ['**/*.{jpg,jpeg,png,webp,svg,gif}'];
  const files = await glob(patterns, { cwd: srcDir });

  for (const file of files) {
    const inputPath = path.join(srcDir, file);
    const outputPath = path.join(distDir, file);
    
    await ensureDir(path.dirname(outputPath));
    
    // Copy original file
    await copyFile(inputPath, outputPath);
    
    // Convert to WebP if applicable
    await convertToWebP(inputPath, outputPath);
  }
}

processImages().catch(console.error);