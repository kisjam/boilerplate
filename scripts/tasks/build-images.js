#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import config from '../../build.config.js';

async function buildImages() {
	try {
		const srcDir = config.assets.images;
		const distDir = path.join(config.dist, 'assets/images');
		
		// 出力ディレクトリを作成
		await fs.mkdir(distDir, { recursive: true });
		
		// 画像ファイルを検索
		const files = await glob('**/*', { 
			cwd: srcDir,
			nodir: true 
		});
		
		if (files.length === 0) {
			console.log('No images to copy');
			return;
		}
		
		// ファイルを並列でコピー
		await Promise.all(files.map(async (file) => {
			const srcPath = path.join(srcDir, file);
			const distPath = path.join(distDir, file);
			
			// 出力ディレクトリを作成
			await fs.mkdir(path.dirname(distPath), { recursive: true });
			
			// ファイルをコピー
			await fs.copyFile(srcPath, distPath);
		}));
		
		console.log(`✓ Copied ${files.length} images from ${srcDir} to ${distDir}`);
		
	} catch (error) {
		console.error('Image copy failed:', error.message);
		process.exit(1);
	}
}

buildImages();