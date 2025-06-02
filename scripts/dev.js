#!/usr/bin/env node
const { spawn } = require('node:child_process');

// dev: build + watch + serve を並列実行
const command = 'npm-run-all build -p watch serve';
console.log(`Running: ${command}`);

const child = spawn(command, { shell: true, stdio: 'inherit' });
child.on('exit', (code) => {
	process.exit(code);
});