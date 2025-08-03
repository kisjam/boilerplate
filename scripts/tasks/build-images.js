#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { glob } from "glob";
import config from "../../build.config.js";
import { logger } from "../utils.js";

async function buildImages() {
	try {
		const args = process.argv.slice(2);
		const singleFileIndex = args.findIndex((arg) => arg === "--single" || arg === "-s");
		let singleFilePath = null;

		if (singleFileIndex !== -1) {
			const remainingArgs = args.slice(singleFileIndex + 1);
			singleFilePath = remainingArgs.join(" ");
		}

		const srcDir = config.assets.images;
		const distDir = path.join(config.dist, config.basePath || "", config.output.images);

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

			const fsSync = await import("node:fs");
			if (!fsSync.default.existsSync(fullPath)) {
				logger.error(`Not found: ${fullPath}`);
				process.exit(1);
			}

			const srcPath = fullPath;
			const distPath = path.join(distDir, relativePath);

			await fs.mkdir(path.dirname(distPath), { recursive: true });
			await fs.copyFile(srcPath, distPath);
			logger.success(`Copied: ${path.basename(relativePath)}`);
		} else {
			await fs.mkdir(distDir, { recursive: true });

			const files = await glob("**/*", {
				cwd: srcDir,
				nodir: true,
			});

			if (files.length === 0) {
				logger.info("No images found");
				return;
			}

			await Promise.all(
				files.map(async (file) => {
					const srcPath = path.join(srcDir, file);
					const distPath = path.join(distDir, file);

					await fs.mkdir(path.dirname(distPath), { recursive: true });
					await fs.copyFile(srcPath, distPath);
				}),
			);

			logger.success(`Images: ${files.length} files`);
		}
	} catch (error) {
		logger.error(`Images failed: ${error.message}`);
		process.exit(1);
	}
}

buildImages();
