#!/usr/bin/env node
const { Liquid } = require('liquidjs');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const config = require('../build.config');

const srcDir = config.assets.html;
const distDir = config.dist;

// Configure LiquidJS
const engine = new Liquid({
  root: [srcDir, path.join(srcDir, '_components')],
  extname: '.liquid',
  cache: false
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

function parseFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (match) {
    const yaml = require('js-yaml');
    try {
      const frontMatter = yaml.load(match[1]);
      return {
        frontMatter,
        content: match[2]
      };
    } catch (e) {
      console.error('Error parsing YAML front matter:', e);
      return {
        frontMatter: {},
        content
      };
    }
  }
  
  return {
    frontMatter: {},
    content
  };
}

async function buildHTML() {
  const siteData = await loadSiteData();
  const files = await glob('pages/**/*.liquid', { cwd: srcDir });

  for (const file of files) {
    const inputPath = path.join(srcDir, file);
    const relativePath = path.relative(path.join(srcDir, 'pages'), inputPath);
    const outputPath = path.join(distDir, relativePath.replace('.liquid', '.html'));
    
    try {
      // Read template content
      const templateContent = await fs.readFile(inputPath, 'utf8');
      
      // Parse front matter
      const { frontMatter, content } = parseFrontMatter(templateContent);
      
      // Prepare template data
      const filenameParts = file
        .replace('pages/', '')
        .replace('.liquid', '')
        .split('/');
      
      const data = {
        ...siteData,
        ...frontMatter,
        filename: filenameParts,
        content: content
      };

      let html;
      if (frontMatter.layout) {
        // First render the content
        const renderedContent = await engine.parseAndRender(content, data);
        
        // Then render with layout
        const layoutPath = path.join(srcDir, frontMatter.layout);
        const layoutContent = await fs.readFile(layoutPath, 'utf8');
        const layoutData = {
          ...data,
          content: renderedContent
        };
        html = await engine.parseAndRender(layoutContent, layoutData);
      } else {
        // Render standalone
        html = await engine.parseAndRender(content, data);
      }
      
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