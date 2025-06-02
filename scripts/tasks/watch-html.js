#!/usr/bin/env node
const { runCommand, replaceConfig } = require('../lib/task-runner');

const command = replaceConfig(
	'chokidar "${config.assets.html}/**/*.liquid" "${config.assets.html}/_config/*.json" -c "npm run build:html"'
);

runCommand(command).then(process.exit);