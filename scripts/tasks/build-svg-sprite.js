#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import { glob } from "glob";
import config from "../../build.config.js";
import { logger } from "../utils.js";

async function buildSVGSprite() {
	const startTime = performance.now();

	try {
		const svgFiles = await glob(path.join(config.assets.icons, config.svgSprite.globPattern));

		if (svgFiles.length === 0) {
			logger.info("No SVG files found");
			return;
		}

		let sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">`;

		for (const file of svgFiles) {
			const content = await fs.readFile(file, "utf8");
			const fileName = path.basename(file, ".svg");

			const svgMatch = content.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
			if (svgMatch) {
				const viewBoxMatch = content.match(/viewBox="([^"]*)"/);
				const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 24 24";

				sprite += `
	<symbol id="icon-${fileName}" viewBox="${viewBox}">
		${svgMatch[1].trim()}
	</symbol>`;
			}
		}

		sprite += "\n</svg>";

		const outputDir = path.join(config.dist, config.basePath || "", config.output.icons);
		await fs.mkdir(outputDir, { recursive: true });

		await fs.writeFile(path.join(outputDir, "sprite.svg"), sprite);

		for (const file of svgFiles) {
			const content = await fs.readFile(file, "utf8");
			const fileName = path.basename(file);
			await fs.writeFile(path.join(outputDir, fileName), content);
		}

		const iconNames = [];
		for (const file of svgFiles) {
			const fileName = path.basename(file, ".svg");
			iconNames.push(fileName);
		}

		let sassContent = "// [AUTO-GENERATED] This file is managed by build-svg-sprite.js\n";
		sassContent += "// Individual SVG file paths for smart-svg\n";
		for (const name of iconNames) {
			const varName = `$icon-${name}`;
			const varValue = `${config.basePath || ""}/${config.output.icons}/${name}.svg`;
			sassContent += `${varName}: "${varValue}";\n`;
		}

		const sassVarPath = path.join(config.assets.css, "global/variable-sass/_icons.scss");
		await fs.writeFile(sassVarPath, sassContent);

		const totalTime = Math.round(performance.now() - startTime);
		logger.success(`SVG sprite generated (${totalTime}ms) - ${svgFiles.length} icons`);
	} catch (error) {
		logger.error(`SVG sprite generation failed: ${error}`);
		process.exit(1);
	}
}

buildSVGSprite();
