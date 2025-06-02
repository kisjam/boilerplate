#!/usr/bin/env node
const { spawn } = require('node:child_process');

// 引数で本番ビルドとキャッシュオプションを制御
const args = process.argv.slice(2);
const isProd = args.includes('--prod');
const isCached = args.includes('--cached');

let buildTasks = 'build:copy build:js build:css build:images build:images-webp build:html';

// 本番ビルド時の設定
if (isProd) {
	buildTasks = buildTasks.replace('build:js', 'build:js:prod').replace('build:css', 'build:css:prod');
}

// キャッシュオプションの設定
if (isCached) {
	buildTasks = buildTasks.replace('build:images-webp', 'build:images-webp:cached');
	buildTasks = buildTasks.replace('build:html', 'build:html:optimized');
}

const command = `npm-run-all clean -p ${buildTasks}`;
console.log(`Running: ${command}`);

const child = spawn(command, { shell: true, stdio: 'inherit' });
child.on('exit', (code) => {
	process.exit(code);
});