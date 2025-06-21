#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import * as sass from "sass";
import config from "../../build.config.js";

async function buildCSS() {
	const isProd = process.argv.includes("--prod");
	const startTime = performance.now();

	try {
		// 1. Sassコンパイル（FLOCSS: Foundation, Layout, Component, Page）
		const result = sass.compile(path.join(config.assets.css, "style.scss"), {
			style: isProd ? "compressed" : "expanded",
			sourceMap: !isProd,
			loadPaths: [config.assets.css],
		});

		// 2. 出力ディレクトリを作成
		const outputDir = path.join(config.dist, "assets/css");
		await fs.mkdir(outputDir, { recursive: true });

		// 3. SassコンパイルしたCSSを書き込み
		await fs.writeFile(path.join(outputDir, "style.css"), result.css);

		if (result.sourceMap && !isProd) {
			await fs.writeFile(path.join(outputDir, "style.css.map"), JSON.stringify(result.sourceMap));
		}

		const totalTime = Math.round(performance.now() - startTime);
		console.log(`✓ CSS build completed (${totalTime}ms)`);
	} catch (error) {
		console.error("CSS build failed:", error);
		process.exit(1);
	}
}

// 実行
buildCSS();
