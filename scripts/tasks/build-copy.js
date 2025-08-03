#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { glob } from "glob";
import config from "../../build.config.js";
import { logger } from "../utils.js";

async function buildCopy() {
	try {
		const srcDir = config.public;
		const distDir = path.join(config.dist, config.basePath || "");

		await fs.mkdir(distDir, { recursive: true });

		const files = await glob("**/*", {
			cwd: srcDir,
			nodir: true,
		});

		if (files.length === 0) {
			logger.info("No files to copy from public directory");
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

		logger.success(`Copied ${files.length} files from ${srcDir} to ${distDir}`);
	} catch (error) {
		logger.error(`Copy failed: ${error.message}`);
		process.exit(1);
	}
}

buildCopy();
