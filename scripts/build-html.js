#!/usr/bin/env node
const nunjucks = require('nunjucks');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

const srcDir = 'src/assets/html';
const distDir = 'dist';

// Configure Nunjucks
const env = nunjucks.configure(srcDir, {
  autoescape: true,
  noCache: true
});

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error(`Error creating directory ${dir}:`, err);
  }
}

async function loadSiteData() {
  try {
    const dataPath = path.join(srcDir, '_config/site.json');
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading site data:', err);
    return {};
  }
}

async function buildHTML() {
  const siteData = await loadSiteData();
  const files = await glob('pages/**/*.njk', { cwd: srcDir });

  for (const file of files) {
    const inputPath = path.join(srcDir, file);
    const relativePath = path.relative(path.join(srcDir, 'pages'), inputPath);
    const outputPath = path.join(distDir, relativePath.replace('.njk', '.html'));
    
    try {
      // Prepare template data
      const filenameParts = file
        .replace('pages/', '')
        .replace('.njk', '')
        .split('/');
      
      const data = {
        ...siteData,
        filename: filenameParts
      };

      // Render template
      const html = env.render(file, data);
      
      // Ensure output directory exists
      await ensureDir(path.dirname(outputPath));
      
      // Write output file
      await fs.writeFile(outputPath, html);
      console.log(`Built: ${file} -> ${outputPath}`);
    } catch (err) {
      console.error(`Error building ${file}:`, err);
    }
  }
}

buildHTML().catch(console.error);