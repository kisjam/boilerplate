#!/usr/bin/env node
import * as sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import tailwindcss from '@tailwindcss/postcss';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import config from '../../build.config.js';

async function buildCSS() {
	const isProd = process.argv.includes('--prod');
	
	try {
		// 1. sass-globを実行
		await import('./sass-glob.js');
		
		// 2. Sassコンパイル
		const result = sass.compile(
			path.join(config.assets.css, 'style.scss'),
			{
				style: isProd ? 'compressed' : 'expanded',
				sourceMap: !isProd,
				loadPaths: [config.assets.css]
			}
		);
		
		// 3. 出力ディレクトリを作成
		const outputDir = path.join(config.dist, 'assets/css');
		await fs.mkdir(outputDir, { recursive: true });
		
		// 4. PostCSS処理
		const processed = await postcss([
			tailwindcss,
			autoprefixer({
				cascade: false,
				grid: 'autoplace'
			})
		]).process(result.css, {
			from: path.join(config.assets.css, 'style.scss'),
			to: path.join(outputDir, 'style.css'),
			map: isProd ? false : { inline: false }
		});
		
		// 5. ファイルに書き込み
		await fs.writeFile(
			path.join(outputDir, 'style.css'),
			processed.css
		);
		
		if (processed.map && !isProd) {
			await fs.writeFile(
				path.join(outputDir, 'style.css.map'),
				processed.map.toString()
			);
		}
		
		console.log('✓ CSS build completed');
		
	} catch (error) {
		console.error('CSS build failed:', error);
		process.exit(1);
	}
}

// 実行
buildCSS();