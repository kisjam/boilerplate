#!/usr/bin/env node
const { runCommand, replaceConfig } = require('../lib/task-runner');

const command = replaceConfig(
	'chokidar "${config.assets.css}/**/*.scss" --ignore "**/_index.scss" -c "npm run build:css"'
);

runCommand(command).then(process.exit);