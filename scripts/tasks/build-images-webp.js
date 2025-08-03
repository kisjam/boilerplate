#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { glob } from "glob";
import sharp from "sharp";
import config from "../../build.config.js";
import { logger } from "../utils.js";

const srcDir = config.assets.images;
const distDir = path.join(config.dist, config.basePath || "", config.output.images);

async function convertToWebP(file) {
	const inputPath = path.join(srcDir, file);
	const ext = path.extname(inputPath).toLowerCase();
	const basename = path.basename(inputPath, ext);
	const outputDir = path.join(distDir, path.dirname(file));
	const outputWebP = path.join(outputDir, `${basename}.webp`);

	if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
		return null;
	}

	await fs.mkdir(outputDir, { recursive: true });

	try {
		await sharp(inputPath).webp({ quality: 80 }).toFile(outputWebP);
		logger.success(`Converted: ${basename}.webp`);
		return outputWebP;
	} catch (error) {
		logger.error(`Failed: ${file} - ${error.message}`);
		return null;
	}
}

async function buildImagesWebP() {
	try {
		const args = process.argv.slice(2);
		const singleFileIndex = args.findIndex((arg) => arg === "--single" || arg === "-s");
		let singleFilePath = null;

		if (singleFileIndex !== -1) {
			const remainingArgs = args.slice(singleFileIndex + 1);
			singleFilePath = remainingArgs.join(" ");
		}

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

			const fs = await import("node:fs");
			if (!fs.default.existsSync(fullPath)) {
				logger.error(`Not found: ${fullPath}`);
				process.exit(1);
			}

			const result = await convertToWebP(relativePath);
			if (!result) {
				logger.info(`Skipped: ${relativePath}`);
			}
		} else {
			const pattern = "**/*.{jpg,jpeg,png}";
			const files = await glob(pattern, { cwd: srcDir });

			if (files.length === 0) {
				logger.info("No images found");
				return;
			}

			const results = await Promise.all(files.map((file) => convertToWebP(file)));
			const converted = results.filter((r) => r !== null).length;
			logger.success(`WebP: ${converted} files`);
		}
	} catch (error) {
		logger.error(`WebP failed: ${error}`);
		process.exit(1);
	}
}

buildImagesWebP();
