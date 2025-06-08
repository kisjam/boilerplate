#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import * as sass from "sass";
import config from "../../build.config.js";

async function buildCSS() {
	const isProd = process.argv.includes("--prod");
	const startTime = performance.now();
	const timings = {};

	try {
		// 1. sass-globを実行
		const globStart = performance.now();
		await import("./sass-glob.js");
		timings.sassGlob = performance.now() - globStart;

		// 2. Sassコンパイル（FLOCSS: Foundation, Layout, Component, Page）
		const sassStart = performance.now();
		const result = sass.compile(path.join(config.assets.css, "style.scss"), {
			style: isProd ? "compressed" : "expanded",
			sourceMap: !isProd,
			loadPaths: [config.assets.css],
		});
		timings.sassCompile = performance.now() - sassStart;

		// 3. 出力ディレクトリを作成
		const mkdirStart = performance.now();
		const outputDir = path.join(config.dist, "assets/css");
		await fs.mkdir(outputDir, { recursive: true });
		timings.mkdir = performance.now() - mkdirStart;

		// 4. SassのCSS末尾にTailwindテーマ・ユーティリティを追加
		const cssWithTailwind = `${result.css}\n\n/* Tailwind CSS - Theme & Utilities */\n@import "tailwindcss/theme";\n@import "tailwindcss/utilities";`;

		// 5. PostCSS処理（Tailwind + Autoprefixer）
		const postcssStart = performance.now();
		const processed = await postcss([
			tailwindcss,
			autoprefixer({
				cascade: false,
				grid: false, // Tailwind v4との互換性のため無効化
			}),
		]).process(cssWithTailwind, {
			from: path.join(config.assets.css, "style.scss"),
			to: path.join(outputDir, "style.css"),
			map: isProd ? false : { inline: false },
		});
		timings.postcss = performance.now() - postcssStart;

		// 6. 最終CSSを書き込み
		const writeStart = performance.now();
		await fs.writeFile(path.join(outputDir, "style.css"), processed.css);

		if (processed.map && !isProd) {
			await fs.writeFile(
				path.join(outputDir, "style.css.map"),
				processed.map.toString()
			);
		}
		timings.write = performance.now() - writeStart;

		const totalTime = performance.now() - startTime;

		console.log("✓ CSS build completed");
		console.log(`  Total: ${totalTime.toFixed(2)}ms`);
		console.log(`  - Sass glob: ${timings.sassGlob.toFixed(2)}ms`);
		console.log(`  - Sass compile: ${timings.sassCompile.toFixed(2)}ms`);
		console.log(`  - PostCSS (Tailwind + Autoprefixer): ${timings.postcss.toFixed(2)}ms`);
		console.log(`  - File write: ${timings.write.toFixed(2)}ms`);
	} catch (error) {
		console.error("CSS build failed:", error);
		process.exit(1);
	}
}

// 実行
buildCSS();
