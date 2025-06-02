#!/usr/bin/env node
const { runCommand, replaceConfig } = require('../lib/task-runner');

const command = replaceConfig(
	'chokidar "${config.public}/**/*" -c "npm run build:copy"'
);

runCommand(command).then(process.exit);