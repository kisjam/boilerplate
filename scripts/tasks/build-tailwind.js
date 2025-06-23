#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import postcss from "postcss";
import config from "../../build.config.js";

async function buildTailwind() {
	const startTime = performance.now();

	try {
		const tailwindCSS = `/* Tailwind CSS - Theme & Utilities */\n@import "tailwindcss/theme";\n@import "tailwindcss/utilities";`;
		const processed = await postcss([
			tailwindcss,
			autoprefixer({
				cascade: false,
				grid: false,
			}),
		]).process(tailwindCSS, {
			from: path.join(config.assets.css, "style.scss"),
			to: path.join(config.assets.css, config.tailwind.outputFile),
			map: false,
		});

		await fs.writeFile(path.join(config.assets.css, config.tailwind.outputFile), processed.css);

		const totalTime = Math.round(performance.now() - startTime);
		console.log(`✓ Tailwind build completed (${totalTime}ms)`);
	} catch (error) {
		console.error("Tailwind build failed:", error);
		process.exit(1);
	}
}

buildTailwind();
