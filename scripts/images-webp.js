#!/usr/bin/env node
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const config = require('../build.config');

const srcDir = config.assets.images;
const distDir = path.join(config.dist, 'assets/images');

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

async function processImages() {
  const patterns = ['**/*.{jpg,jpeg,png}'];
  const files = await glob(patterns, { cwd: srcDir });

  await ensureDir(distDir);

  for (const file of files) {
    const inputPath = path.join(srcDir, file);
    const outputPath = path.join(distDir, file);
    
    await ensureDir(path.dirname(outputPath));
    await convertToWebP(inputPath, outputPath);
  }
}

processImages().catch(console.error);