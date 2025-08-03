#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { glob } from "glob";
import { Liquid } from "liquidjs";
import config from "../../build.config.js";
import { processImageSizes } from "../lib/image-size-processor.js";
import { ensureDir, logger, processInParallel, readJSON } from "../utils.js";

const fsPromises = fs.promises;

const srcDir = config.assets.html;
const distDir = path.join(config.dist, config.basePath || "");

const engine = new Liquid({
	root: [srcDir, path.join(srcDir, "_components")],
	extname: ".liquid",
	cache: false,
	globals: {
		timestamp: Date.now(),
	},
});

engine.registerFilter("parse_json", (input) => {
	try {
		return JSON.parse(input);
	} catch (error) {
		logger.error(`JSON parse error: ${error.message}`);
		return null;
	}
});

async function processHTMLFile(file, siteData) {
	const inputPath = path.join(srcDir, file);
	const relativePath = path.relative(path.join(srcDir, "pages"), inputPath);
	const outputPath = path.join(
		distDir,
		relativePath.replace(".liquid", ".html")
	);

	try {
		const templateContent = await fsPromises.readFile(inputPath, "utf8");
		const filenameParts = file
			.replace("pages/", "")
			.replace(".liquid", "")
			.split("/");

		const data = {
			...siteData,
			filename: filenameParts,
		};

		let html = await engine.parseAndRender(templateContent, data);
		html = processImageSizes(html, process.cwd());

		await ensureDir(path.dirname(outputPath));
		await fsPromises.writeFile(outputPath, html);

		return path.basename(outputPath);
	} catch (err) {
		logger.error(`Failed to build ${file}: ${err.message}`);
		throw err;
	}
}

async function main() {
	try {
		const args = process.argv.slice(2);
		const singleFileIndex = args.findIndex(
			(arg) => arg === "--single" || arg === "-s"
		);
		let singleFilePath = null;

		if (singleFileIndex !== -1) {
			const remainingArgs = args.slice(singleFileIndex + 1);
			singleFilePath = remainingArgs.join(" ");
		}

		if (!singleFilePath) {
			logger.info("Starting HTML build...");
		}

		const dataPath = path.join(srcDir, "_config/site.json");
		const siteData = await readJSON(dataPath);

		if (!siteData) {
			logger.error("Site configuration not found at _config/site.json");
			process.exit(1);
		}

		let files;

		if (singleFilePath) {
			let relativePath;
			let fullPath;

			if (path.isAbsolute(singleFilePath)) {
				fullPath = singleFilePath;
				relativePath = path.relative(srcDir, singleFilePath);
			} else {
				relativePath = singleFilePath;
				fullPath = path.join(srcDir, singleFilePath);
			}

			if (
				!relativePath.startsWith("pages/") ||
				!relativePath.endsWith(".liquid")
			) {
				logger.error(
					`Invalid file path: ${singleFilePath}. Must be a .liquid file in pages directory.`
				);
				process.exit(1);
			}

			if (!fs.existsSync(fullPath)) {
				logger.error(`File not found: ${fullPath}`);
				process.exit(1);
			}

			files = [relativePath];
		} else {
			files = await glob("pages/**/*.liquid", { cwd: srcDir });

			if (files.length === 0) {
				logger.warning("No .liquid files found in pages directory");
				return;
			}
		}

		const builtFiles = await processInParallel(
			files,
			(file) => processHTMLFile(file, siteData),
			5
		);

		if (files.length === 1) {
			logger.success(`Built: ${builtFiles[0]}`);
			logger.success(`HTML build completed - 1 file`);
		} else {
			logger.success(`HTML build completed - ${files.length} files`);
		}
	} catch (error) {
		logger.error(`Build failed: ${error.message}`);
		process.exit(1);
	}
}

main();
