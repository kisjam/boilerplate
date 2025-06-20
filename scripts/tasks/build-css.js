#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import * as sass from "sass";
import config from "../../build.config.js";

async function buildCSS() {
	const isProd = process.argv.includes("--prod");
	const startTime = performance.now();
	const timings = {};

	try {
		// 1. Sassコンパイル（FLOCSS: Foundation, Layout, Component, Page）
		const sassStart = performance.now();
		const result = sass.compile(path.join(config.assets.css, "style.scss"), {
			style: isProd ? "compressed" : "expanded",
			sourceMap: !isProd,
			loadPaths: [config.assets.css],
		});
		timings.sassCompile = performance.now() - sassStart;

		// 2. 出力ディレクトリを作成
		const mkdirStart = performance.now();
		const outputDir = path.join(config.dist, "assets/css");
		await fs.mkdir(outputDir, { recursive: true });
		timings.mkdir = performance.now() - mkdirStart;

		// 3. SassコンパイルしたCSSを書き込み
		const writeStart = performance.now();
		await fs.writeFile(path.join(outputDir, "style.css"), result.css);

		if (result.sourceMap && !isProd) {
			await fs.writeFile(
				path.join(outputDir, "style.css.map"),
				JSON.stringify(result.sourceMap)
			);
		}
		timings.write = performance.now() - writeStart;

		const totalTime = performance.now() - startTime;

		console.log("✓ CSS build completed");
		console.log(`  Total: ${totalTime.toFixed(2)}ms`);
		console.log(`  - Sass compile: ${timings.sassCompile.toFixed(2)}ms`);
		console.log(`  - File write: ${timings.write.toFixed(2)}ms`);
	} catch (error) {
		console.error("CSS build failed:", error);
		process.exit(1);
	}
}

// 実行
buildCSS();