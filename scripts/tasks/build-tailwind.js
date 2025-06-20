#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import config from "../../build.config.js";

async function buildTailwind() {
	const startTime = performance.now();
	const timings = {};

	try {
		// 1. Tailwind専用のCSSを作成
		const tailwindCSS = `/* Tailwind CSS - Theme & Utilities */\n@import "tailwindcss/theme";\n@import "tailwindcss/utilities";`;

		// 2. PostCSS処理（Tailwind + Autoprefixer）
		const postcssStart = performance.now();
		const processed = await postcss([
			tailwindcss,
			autoprefixer({
				cascade: false,
				grid: false, // Tailwind v4との互換性のため無効化
			}),
		]).process(tailwindCSS, {
			from: path.join(config.assets.css, "style.scss"),
			to: path.join(config.assets.css, "utilities/_tailwind.scss"),
			map: false,
		});
		timings.postcss = performance.now() - postcssStart;

		// 3. TailwindのCSSを_tailwind.scssとして書き込み
		const writeStart = performance.now();
		await fs.writeFile(path.join(config.assets.css, "utilities/_tailwind.scss"), processed.css);
		timings.write = performance.now() - writeStart;

		const totalTime = performance.now() - startTime;

		console.log("✓ Tailwind build completed");
		console.log(`  Total: ${totalTime.toFixed(2)}ms`);
		console.log(`  - PostCSS (Tailwind + Autoprefixer): ${timings.postcss.toFixed(2)}ms`);
		console.log(`  - File write: ${timings.write.toFixed(2)}ms`);
	} catch (error) {
		console.error("Tailwind build failed:", error);
		process.exit(1);
	}
}

// 実行
buildTailwind();