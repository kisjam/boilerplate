#!/usr/bin/env node
const { runCommand, replaceConfig } = require('../lib/task-runner');

const command = replaceConfig('rimraf ${config.dist}');
runCommand(command).then(process.exit);