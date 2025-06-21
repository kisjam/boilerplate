#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import * as sass from "sass";
import config from "../../build.config.js";

async function buildCSS() {
	const isProd = process.argv.includes("--prod");
	const startTime = performance.now();
	const outputDir = path.join(config.dist, "assets/css");

	try {
		// 出力ディレクトリを作成
		await fs.mkdir(outputDir, { recursive: true });

		// CSSディレクトリ内のファイルを読み取り
		const files = await fs.readdir(config.assets.css);
		const scssFiles = files.filter(
			(file) => file.endsWith(".scss") && !file.startsWith("_")
		);

		if (scssFiles.length === 0) {
			console.log("No SCSS files found to compile");
			return;
		}

		// 各SCSSファイルをコンパイル
		for (const scssFile of scssFiles) {
			const inputPath = path.join(config.assets.css, scssFile);
			const outputFileName = scssFile.replace(".scss", ".css");
			const outputPath = path.join(outputDir, outputFileName);

			const result = sass.compile(inputPath, {
				style: isProd ? "compressed" : "expanded",
				sourceMap: !isProd,
				loadPaths: [config.assets.css],
			});

			await fs.writeFile(outputPath, result.css);

			if (result.sourceMap && !isProd) {
				await fs.writeFile(`${outputPath}.map`, JSON.stringify(result.sourceMap));
			}
		}

		const totalTime = Math.round(performance.now() - startTime);
		const fileList = scssFiles.map(f => f.replace(".scss", ".css")).join(", ");
		console.log(`✓ CSS build completed (${totalTime}ms) - ${fileList}`);
	} catch (error) {
		console.error("CSS build failed:", error);
		process.exit(1);
	}
}

// 実行
buildCSS();
