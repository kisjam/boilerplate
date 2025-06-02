#!/usr/bin/env node
import { spawn } from 'node:child_process';
import config from '../../build.config.js';

const command = `browser-sync start --server ${config.dist} --files '${config.dist}/**/*' --open external`;
console.log(`Starting server: ${command}`);

const child = spawn(command, { shell: true, stdio: 'inherit' });
child.on('exit', (code) => {
	process.exit(code);
});