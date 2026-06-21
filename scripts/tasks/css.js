import { promises as fs } from "node:fs";
import path from "node:path";
import * as sass from "sass";

/** SCSS → CSS（sass + postcss/autoprefixer）。生成パーシャルは依存タスクが出力済みの前提 */
export default {
	name: "css",
	deps: ["tokens", "tailwind", "svg-sprite", "sass-glob"],
	// dev: 生成パーシャル(_index/_tailwind/_icons/_breakpoints)は ignore して二重ビルドを防ぐ
	watch: (ctx) => ({
		paths: [ctx.paths.assets.css],
		match: /\.(scss|sass)$/,
		ignore: /\/(_index|_tailwind|_icons|_breakpoints)\.scss$/,
	}),

	async run(ctx, opts) {
		const isProd = opts?.prod === true;
		const startTime = performance.now();
		const srcDir = ctx.paths.assets.css;
		const outputDir = ctx.paths.output.css;
		const loadPaths = [srcDir, path.join(ctx.root, "node_modules")];

		await fs.mkdir(outputDir, { recursive: true });

		const files = await fs.readdir(srcDir);
		const scssFiles = files.filter((f) => f.endsWith(".scss") && !f.startsWith("_")).sort();
		if (scssFiles.length === 0) {
			ctx.log.info("No SCSS files found");
			return;
		}

		const processor = ctx.engines.cssProcessor();

		for (const scssFile of scssFiles) {
			const inputPath = path.join(srcDir, scssFile);
			const outputPath = path.join(outputDir, scssFile.replace(".scss", ".css"));

			const result = sass.compile(inputPath, {
				style: isProd ? "compressed" : "expanded",
				sourceMap: !isProd,
				loadPaths,
			});

			const processed = await processor.process(result.css, {
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
		const fileList = scssFiles.map((f) => f.replace(".scss", ".css")).join(", ");
		ctx.log.success(`CSS: Compiled ${fileList} (${totalTime}ms)`);
	},
};
