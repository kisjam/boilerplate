#!/usr/bin/env node
const { spawn } = require('node:child_process');
const path = require('node:path');
const config = require('../../build.config');

/**
 * タスクを実行するユーティリティ関数
 * @param {string} command - 実行するコマンド
 * @returns {Promise<number>} - 終了コード
 */
function runCommand(command) {
	console.log(`Running: ${command}`);
	
	return new Promise((resolve) => {
		const child = spawn(command, { shell: true, stdio: 'inherit' });
		child.on('exit', (code) => {
			resolve(code || 0);
		});
	});
}

/**
 * テンプレート文字列内の設定値を置換
 * @param {string} template - テンプレート文字列
 * @returns {string} - 置換後の文字列
 */
function replaceConfig(template) {
	return template
		.replace(/\${config\.dist}/g, config.dist)
		.replace(/\${config\.src}/g, config.src)
		.replace(/\${config\.public}/g, config.public)
		.replace(/\${config\.assets\.html}/g, config.assets.html)
		.replace(/\${config\.assets\.css}/g, config.assets.css)
		.replace(/\${config\.assets\.js}/g, config.assets.js)
		.replace(/\${config\.assets\.images}/g, config.assets.images);
}

module.exports = {
	config,
	runCommand,
	replaceConfig,
};