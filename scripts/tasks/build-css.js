#!/usr/bin/env node
const { runCommand, replaceConfig } = require('../lib/task-runner');

const isProd = process.argv.includes('--prod');

const sassStyle = isProd ? 'compressed' : 'expanded';
const sourceMap = isProd ? ' --no-source-map' : '';

const command = replaceConfig(
	`npm run sass-glob && sass ${config.assets.css}:${config.dist}/assets/css --style=${sassStyle}${sourceMap} && postcss ${config.dist}/assets/css/style.css -o ${config.dist}/assets/css/style.css`
);

runCommand(command).then(process.exit);