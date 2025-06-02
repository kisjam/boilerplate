#!/usr/bin/env node
const { runCommand, replaceConfig } = require('../lib/task-runner');

const command = replaceConfig(
	'chokidar "${config.assets.images}/**/*" -c "npm run build:images && npm run build:images-webp"'
);

runCommand(command).then(process.exit);