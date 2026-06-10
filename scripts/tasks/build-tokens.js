#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import config from "../../build.config.js";
import tokens from "../../design-tokens.js";
import { logger } from "../utils.js";

async function buildTokens() {
	const startTime = performance.now();

	try {
		const lines = Object.entries(tokens.breakpoints)
			.map(([key, value]) => `\t${key}: ${value}px,`)
			.join("\n");

		const sassContent = `// [AUTO-GENERATED] This file is managed by build-tokens.js
$breakpoints: (
${lines}
);
`;

		const outputPath = path.join(config.assets.css, "global/variable-sass/_breakpoints.scss");
		await fs.writeFile(outputPath, sassContent);

		const totalTime = Math.round(performance.now() - startTime);
		logger.success(`Tokens build completed (${totalTime}ms)`);
	} catch (error) {
		logger.error(`Tokens build failed: ${error}`);
		process.exit(1);
	}
}

buildTokens();
