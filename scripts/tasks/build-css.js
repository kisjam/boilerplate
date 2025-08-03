#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import * as sass from "sass";
import config from "../../build.config.js";
import { logger } from "../utils.js";

async function buildCSS() {
	const isProd = process.argv.includes("--prod");
	const startTime = performance.now();
	const outputDir = path.join(
		config.dist,
		config.basePath || "",
		config.output.css
	);

	try {
		await fs.mkdir(outputDir, { recursive: true });

		const files = await fs.readdir(config.assets.css);
		const scssFiles = files.filter(
			(file) => file.endsWith(".scss") && !file.startsWith("_")
		);

		if (scssFiles.length === 0) {
			logger.info("No SCSS files found");
			return;
		}

		for (const scssFile of scssFiles) {
			const inputPath = path.join(config.assets.css, scssFile);
			const outputFileName = scssFile.replace(".scss", ".css");
			const outputPath = path.join(outputDir, outputFileName);

			const result = sass.compile(inputPath, {
				style: isProd ? "compressed" : "expanded",
				sourceMap: !isProd,
				loadPaths: [config.assets.css, "node_modules"],
			});

			const processed = await postcss([
				autoprefixer({
					cascade: false,
					grid: false,
				}),
			]).process(result.css, {
				from: inputPath,
				to: outputPath,
				map: !isProd ? { inline: false, prev: result.sourceMap } : false,
			});

			await fs.writeFile(outputPath, processed.css);

			if (processed.map && !isProd) {
				await fs.writeFile(`${outputPath}.map`, processed.map.toString());
			}
		}

		const totalTime = Math.round(performance.now() - startTime);
		const fileList = scssFiles
			.map((f) => f.replace(".scss", ".css"))
			.join(", ");
		logger.success(`CSS: Compiled ${fileList} (${totalTime}ms)`);
	} catch (error) {
		logger.error(`CSS failed: ${error}`);
		process.exit(1);
	}
}

buildCSS();
