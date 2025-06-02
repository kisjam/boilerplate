#!/usr/bin/env node
const { runCommand, replaceConfig } = require('../lib/task-runner');

const command = replaceConfig("npx cpx2 '${config.assets.images}/**/*' ${config.dist}/assets/images");
runCommand(command).then(process.exit);