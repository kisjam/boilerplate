#!/usr/bin/env node
const { spawn } = require('node:child_process');

// watch: 全てのwatchタスクを並列実行
const command = 'npm-run-all -p watch:*';
console.log(`Running: ${command}`);

const child = spawn(command, { shell: true, stdio: 'inherit' });
child.on('exit', (code) => {
	process.exit(code);
});