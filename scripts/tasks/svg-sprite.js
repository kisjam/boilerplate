import { promises as fs } from "node:fs";
import path from "node:path";
import { glob } from "glob";

/** SVG をスプライト化し、個別 SVG のコピーと smart-svg 用 SCSS 変数を生成 */
export default {
	name: "svg-sprite",
	deps: [],
	watch: (ctx) => ({ paths: [ctx.paths.assets.icons], match: /\.svg$/ }),

	async run(ctx) {
		const startTime = performance.now();
		const iconsDir = ctx.paths.assets.icons;
		const outputDir = ctx.paths.output.icons;

		const svgFiles = await glob(path.join(iconsDir, ctx.config.svgSprite.globPattern));
		if (svgFiles.length === 0) {
			ctx.log.info("No SVG files found");
			return;
		}

		let sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">`;
		const iconNames = [];

		for (const file of svgFiles) {
			const content = await fs.readFile(file, "utf8");
			const fileName = path.basename(file, ".svg");
			iconNames.push(fileName);

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

		await fs.mkdir(outputDir, { recursive: true });
		await fs.writeFile(path.join(outputDir, "sprite.svg"), sprite);

		for (const file of svgFiles) {
			const content = await fs.readFile(file, "utf8");
			await fs.writeFile(path.join(outputDir, path.basename(file)), content);
		}

		let sassContent = "// [AUTO-GENERATED] This file is managed by build-svg-sprite.js\n";
		sassContent += "// Individual SVG file paths for smart-svg\n";
		for (const name of iconNames) {
			const varValue = `${ctx.config.basePath || ""}/${ctx.config.output.icons}/${name}.svg`;
			sassContent += `$icon-${name}: "${varValue}";\n`;
		}
		const sassVarPath = path.join(ctx.paths.assets.css, "global/variable-sass/_icons.scss");
		await fs.writeFile(sassVarPath, sassContent);

		const totalTime = Math.round(performance.now() - startTime);
		ctx.log.success(`SVG sprite generated (${totalTime}ms) - ${svgFiles.length} icons`);
	},
};
