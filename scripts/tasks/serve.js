#!/usr/bin/env node
const { runCommand, replaceConfig } = require('../lib/task-runner');

const command = replaceConfig(
	"browser-sync start --server ${config.dist} --files '${config.dist}/**/*' --open external"
);

runCommand(command).then(process.exit);