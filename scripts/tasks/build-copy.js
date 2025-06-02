#!/usr/bin/env node
const { runCommand, replaceConfig } = require('../lib/task-runner');

const command = replaceConfig("npx cpx2 '${config.public}/**/*' ${config.dist}");
runCommand(command).then(process.exit);